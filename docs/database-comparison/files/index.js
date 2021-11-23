document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  var tester = createTester();
  var buttons = document.getElementsByTagName('button');
  var display = document.getElementById('display');
  var worker = new Worker('worker.js');

  function disableButtons(bool) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = bool;
    }
  }

  function getChoice(name) {
    var choices = document.getElementsByName(name);
    for (var i = 0; i < choices.length; i++) {
      var choice = choices[i];
      if (choice.checked) {
        var label = document.querySelector('label[for=' + choice.id + ']').innerHTML;
        return { value: choice.value, label: label };
      }
    }
  }

  var spinnerDivAngle = 0;
  setInterval(function () {
    var cpuSpinnerDiv = document.querySelector('#cpu-spinner');
    spinnerDivAngle = spinnerDivAngle + 1;
    spinnerDivAngle = spinnerDivAngle % 360;
    cpuSpinnerDiv.style.webkitTransform = 'rotate(' + spinnerDivAngle + 'deg)';
  }, 0);

  function waitForUI() {
    return new Promise(function (resolve) {
      display.getBoundingClientRect();
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });
  }

  function workerPromise(message) {
    return new Promise(function (resolve, reject) {

      function cleanup() {
        worker.removeEventListener('message', onSuccess);
        worker.removeEventListener('error', onError);
      }

      function onSuccess(e) {
        cleanup();
        if (e.data.error) {
          reject(e.data.error);
        } else {
          resolve(e);
        }
      }

      function onError(e) {
        cleanup();
        reject(e);
      }

      worker.addEventListener('message', onSuccess);
      worker.addEventListener('error', onError);
      worker.postMessage(message);
    });
  }


  document.getElementById('insertButton').addEventListener('click', function () {
    disableButtons(true);
    var dbTypeChoice = getChoice('db');
    var docSizeChoice = getChoice('docSize').value;
    var numDocsChoice = getChoice('numDocs');
    var numDocs = parseInt(numDocsChoice.value, 10);
    var useWorker = false;
    var cloneWorker = false;
    display.innerHTML = 'Inserting ' + numDocs + ' docs using ' +
      dbTypeChoice.label + (useWorker ? ' in a worker' : '') + '...';

    waitForUI().then(function () {
      var startTime = Date.now();
      if (useWorker) {
        return workerPromise({
          action: 'test',
          dbType: dbTypeChoice.value,
          numDocs: numDocs
        }).then(function (e) {
          if (!e.data.success) {
            throw new Error('did not work');
          }
          return Date.now() - startTime;
        });
      } else if (cloneWorker) {
        return workerPromise({
          action: 'test',
          dbType: dbTypeChoice.value,
          numDocs: tester.createDocs(numDocs, docSizeChoice)
        }).then(function (e) {
          if (!e.data.success) {
            throw new Error('did not work');
          }
          return Date.now() - startTime;
        });
      }
      var fun = tester.getTest(dbTypeChoice.value, docSizeChoice);

      return Promise.resolve().then(function () {
        return fun(numDocs);
      }).then(function () {
        return Date.now() - startTime;
      });
    }).then(function (timeSpent) {
      display.innerHTML += "\nTook " + timeSpent + "ms";
      disableButtons(false);
    }).catch(function (e) {
      disableButtons(false);
      display.innerHTML += "\nError: " + e;
      console.error(e);
    });
  });

  document.getElementById('deleteButton').addEventListener('click', function () {
    display.innerHTML = 'Deleting...';
    disableButtons(true);
    var useWorker = getChoice('worker').value === 'true';

    waitForUI().then(function () {
      if (useWorker) {
        return workerPromise({ action: 'cleanup' });
      }
      return tester.cleanup();
    }).then(function () {
      disableButtons(false);
      display.innerHTML += '\nDone.';
    }).catch(function (e) {
      disableButtons(false);
      display.innerHTML += "\nError: " + e;
      console.error(e);
    });
  });
});
