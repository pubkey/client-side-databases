let queue = Promise.resolve();
const accessHandlePromise = (async () => {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle('Draft' + new Date().getTime() + '.txt', { create: true });
    // Create FileSystemSyncAccessHandle on the file.
    const accessHandle = await fileHandle.createSyncAccessHandle();
    console.dir(accessHandle);
    return accessHandle;
})();

self.onmessage = function (e) {
    queue = queue.then(async () => {
        self.postMessage("started");
        const data = e.data;
        const writeData = JSON.stringify(data.doc);

        const accessHandle = await accessHandlePromise;
        // Get size of the file.
        const fileSize = accessHandle.getSize();

        // Read file content to a buffer.
        const readBuffer = new Uint8Array(fileSize);
        const readSize = accessHandle.read(readBuffer, { "at": 0 });
        // const decoder = new TextDecoder();
        // const file = await fileHandle.getFile();
        // console.dir(readBuffer);
        // console.dir(decoder.decode(readBuffer));
        // console.dir(readBuffer.toString());

        // Write a sentence to the end of the file.
        const encoder = new TextEncoder();
        const writeBuffer = encoder.encode(writeData + ',');
        const writeSize = accessHandle.write(writeBuffer, { "at": readSize });
        // Truncate file to 1 byte.
        // accessHandle.truncate(1);
        // Persist changes to disk.
        accessHandle.flush();
        // Always close FileSystemSyncAccessHandle if done.
        //       accessHandle.close();

        self.postMessage({ counter: data.counter });
    });
};
