import {
    Selector
} from 'testcafe';
import AsyncTestUtil, { wait, randomString, waitUntil } from 'async-test-util';
import {
    Message,
    Metric,
    MetricByKey,
    User
} from '../src/shared/types';
import * as path from 'path';
import * as fs from 'fs';

const FRONTEND_PORT = 3000;
const ADD_EXAMPLE_DATA_FLAG = 'add-example-data';
const REPLICATION_FLAG = 'replication';
const FRONTEND_URL = 'http://localhost:' + FRONTEND_PORT + '/';

const projectKey: string = process.env.PROJECT_KEY as any;
console.log('Project key: ' + projectKey);
if (!projectKey) {
    throw new Error('project key missing');
}

let DO_REPLICATION = false;
switch (projectKey) {
    /**
     * These projects do not work without replication
     */
    case 'aws':
    case 'firebase':
        DO_REPLICATION = true;
}


const window: any = {};
const exampleData: {
    users: User[];
    messages: Message[];
} = require('../example-data.json');
fixture`Example page`.page(FRONTEND_URL);

async function insertMessageToFirstUser(t: TestController, messageText: string) {
    // click on the first user
    const firstUserDiv = Selector('.user-with-last-message').nth(0);
    await t.click(firstUserDiv);
    // click on message input
    const messageInput = Selector('.message-input').nth(0);
    await t.click(messageInput);
    await t
        .typeText(messageInput, messageText);
    // submit the message
    await t.click(Selector('.message-submit-button').nth(0));
}

/**
 * Waits until a given metric appears in the logs
 */
async function waitForMetric(t: TestController, metricKey: string, runIdentifier?: string) {
    await wait(100);
    console.log('# waitForMetric ' + metricKey + ' runIdentifier: ' + runIdentifier);
    await waitUntil(async () => {
        const innerLogs = await t.getBrowserConsoleMessages();

        let matchingLogs = innerLogs.log
            .filter(log => log.startsWith('{') && log.endsWith('}'))
            .map(log => JSON.parse(log))
            .filter((metric: Metric) => metric.key === metricKey);
        if (runIdentifier) {
            matchingLogs = matchingLogs.filter((metric: Metric) => metric.runIdentifier === runIdentifier);
        }

        return matchingLogs.length > 0;
    }, 1000 * 200, 100);
}


test
    .timeouts({
        pageLoadTimeout: 2000,
        pageRequestTimeout: 60000,
        ajaxRequestTimeout: 60000
    })
    .page(FRONTEND_URL + '?' + REPLICATION_FLAG + '=true&' + ADD_EXAMPLE_DATA_FLAG + '=true')
    ('Basic functions', async t => {
        console.log('# set own username');
        await t.click('#own-name-submit');

        // ensure the storageSize handler works
        try {
            await t.eval(() => window.storageSizeMetric());
        } catch (err) {
            const consoleLogs = await t.getBrowserConsoleMessages();
            console.dir(consoleLogs);
            throw err;
        }

        console.log('# wait until all users are replicated');
        await AsyncTestUtil.waitUntil(async () => {
            const userDivs = Selector('.user-with-last-message');
            const amount = await userDivs.count;

            const usersNotOwnAmount = exampleData.users.length - 1;

            if (amount > usersNotOwnAmount) {
                console.log('got too many users (' + amount + '), something is wrong ' + usersNotOwnAmount);
                throw new Error('got too many users, something is wrong');
            }
            if (amount === usersNotOwnAmount) {
                return true;
            } else {
                console.log('got users: ' + amount + ' of ' + usersNotOwnAmount);
                const consoleLogs = await t.getBrowserConsoleMessages();
                if (consoleLogs.error.length > 0) {
                    console.log('got console errors:');
                    console.log(consoleLogs.error);
                    console.log('normal console log:');
                    console.dir(consoleLogs.log);
                    throw new Error(consoleLogs.error[0]);
                }
                return false;

            }
        }, 1000 * 100, 500);

        const testMessageText = randomString(10).toLowerCase();
        await insertMessageToFirstUser(t, testMessageText);

        console.log('# ensure message is there');
        await AsyncTestUtil.waitUntil(async () => {
            const lastMessageText = Selector('.message .text').nth(-1);
            const innerText = await lastMessageText.innerText;
            return innerText === testMessageText;
        });

        console.log('# insert search');
        const searchInput = Selector('.search-input').nth(0);
        await t.click(searchInput);
        await t
            .typeText(searchInput, testMessageText);

        console.log('# ensure new message is in search results');
        await AsyncTestUtil.waitUntil(async () => {
            const firstSearchResult = Selector('.search-results .user-with-last-message .last-message').nth(0);
            const innerText = await firstSearchResult.innerText;
            return innerText === testMessageText;
        });

        console.log('# wait a bit to ensure replication is done');
        await wait(1000 * 4);
    });


const metricsRuns = 6;
let metricRunsDone = 0;


const doReplicationString = DO_REPLICATION ? 'true' : 'false';
const metricsTestUrl = FRONTEND_URL + '?' + REPLICATION_FLAG + '=' + doReplicationString + '&' + ADD_EXAMPLE_DATA_FLAG + '=true';

test
    .page(metricsTestUrl)
    ('Measure metrics', async t => {
        // set own username
        await t.click('#own-name-submit');

        /**
         * Testcafe will reset the IndexedDB state on a new test run,
         * so instead of using new tests, we navigate to the url again each time.
         */
        while (metricRunsDone < metricsRuns) {
            // wait until all users are shown
            await AsyncTestUtil.waitUntil(async () => {
                const userDivs = Selector('.user-with-last-message');
                const amount = await userDivs.count;
                if (amount > exampleData.users.length) {
                    throw new Error('got too many users, something is wrong');
                }
                return amount === 9;
            });
            await wait(1000 * 2); // wait a bit to ensure nothing is running anymore

            /**
             * Run metric 'INSERT_1_MESSAGE'
             */
            await insertMessageToFirstUser(t, 'INSERT_1_MESSAGE');
            await wait(1000 * 2); // can take some time
            await waitForMetric(t, 'INSERT_1_MESSAGE');

            /**
             * Run metric 'INSERT_20_MESSAGES_SERIAL'
             */
            await insertMessageToFirstUser(t, 'INSERT_20_MESSAGES_SERIAL');
            await wait(1000 * 10); // can take some time
            await waitForMetric(t, 'INSERT_20_MESSAGES_SERIAL');

            /**
             * Run metric 'INSERT_20_MESSAGES_PARALLEL'
             */
            await insertMessageToFirstUser(t, 'INSERT_20_MESSAGES_PARALLEL');
            await wait(1000 * 10); // can take some time
            await waitForMetric(t, 'INSERT_20_MESSAGES_PARALLEL');

            /**
             * Run metric 'MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE'
             */
            await insertMessageToFirstUser(t, 'MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE');
            await wait(1000 * 5); // can take some time
            await waitForMetric(t, 'MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE');

            /**
             * Run metric 'USER_PAIR_CHANGED_TO_MESSAGE_LIST'
             * measured by opening the chat with the user 'millie'
             */
            const millieUserDiv = Selector('.user-with-last-message[userid=millie]').nth(0);
            await t.click(millieUserDiv);
            await wait(1000 * 5); // can take some time

            /**
             * Run metric 'SEARCH_RESULT_TIME'
             */
            const searchInput = Selector('.search-input').nth(0);
            await t.click(searchInput);
            await t
                .typeText(
                    searchInput,
                    'message',
                    // paste so we fire exact one event that triggers the search query
                    { paste: true }
                );
            await wait(1000 * 5); // can take some time
            await waitForMetric(t, 'SEARCH_RESULT_TIME');

            metricRunsDone = metricRunsDone + 1;

            // after the first run, set runIdentifier to non-first
            // do not measure metrics on the first run
            // because this will include the initial server side sync times
            // which would be an unfair comparison with subprojects that do not have a server sync atm.
            if ((metricRunsDone < metricsRuns)) {
                await t.navigateTo(metricsTestUrl + '&runIdentifier=non-first');
            }
        }


        /**
         * Parse metrics
         */

        const allMetricsByKey: { [metricKey: string]: Metric[] } = {};
        const allMetrics: MetricByKey = {};
        const consoleLogs = await t.getBrowserConsoleMessages();

        // show all browser logs for easier debug
        console.dir(consoleLogs.log);

        // parse all console logs and filter for the metrics
        consoleLogs.log
            .filter(log => log.startsWith('{'))
            .filter(log => log.endsWith('}'))
            .map(log => JSON.parse(log))
            .filter((metric: Metric) => metric.runIdentifier === 'non-first')
            .forEach((metric: Metric) => {
                if (metric.flag === 'metric') {
                    if (!allMetricsByKey[metric.key]) {
                        allMetricsByKey[metric.key] = [];
                    }
                    allMetricsByKey[metric.key].push(metric);
                }
            });
        Object.values(allMetricsByKey)
            .forEach((metrics) => {
                const firstMetric = metrics[0];
                let total = 0;
                metrics.forEach(m => total = total + m.value);
                const avgValue = Math.ceil(total / metrics.length);

                allMetrics[firstMetric.key] = {
                    flag: firstMetric.flag,
                    key: firstMetric.key,
                    unit: firstMetric.unit,
                    value: avgValue
                };
            });

        await t.eval(() => console.log('##### base metrics measurement done!'));
        await t.navigateTo(metricsTestUrl);

        // insert many messages
        await insertMessageToFirstUser(t, 'INSERT_MANY_MESSAGES');
        console.log('Wait until INSERT_MANY_MESSAGES is done');
        await waitForMetric(t, 'INSERT_MANY_MESSAGES');
        await wait(1000 * 2); // wait a bit more to be sure

        console.log('# load the page again to measure the initial load time');
        await t.navigateTo(metricsTestUrl + '&runIdentifier=after-many-messages');
        await waitForMetric(t, 'FIRST_FULL_RENDER', 'after-many-messages');
        const consoleLogsAfterMany = await t.getBrowserConsoleMessages();
        console.dir(consoleLogsAfterMany);
        consoleLogsAfterMany.log
            .filter(log => log.startsWith('{'))
            .filter(log => log.endsWith('}'))
            .map(log => JSON.parse(log))
            .filter((metric: Metric) => metric.runIdentifier === 'after-many-messages')
            .filter((metric: Metric) => metric.key === 'FIRST_FULL_RENDER')
            .forEach((metric: Metric) => {
                metric.value = Math.ceil(metric.value);
                metric.key = 'FIRST_FULL_RENDER_MANY_MESSAGES';
                allMetrics[metric.key] = metric;
            });

        // measure used storage size
        await t.eval(() => window.storageSizeMetric());
        await wait(500);
        await waitForMetric(t, 'STORAGE_SIZE');
        const consoleLogsAfterStorageSize = await t.getBrowserConsoleMessages();
        const storageSizeMetric: Metric = consoleLogsAfterStorageSize.log
            .filter(log => log.startsWith('{'))
            .filter(log => log.endsWith('}'))
            .map(log => JSON.parse(log))
            .find((metric: Metric) => metric.key === 'STORAGE_SIZE');
        if (!storageSizeMetric) {
            throw new Error('storageSizeMetric missing');
        }
        storageSizeMetric.value = Math.ceil(storageSizeMetric.value);
        allMetrics[storageSizeMetric.key] = storageSizeMetric;

        console.log('# allMetricsByKey:');
        console.dir(allMetricsByKey);
        console.log('# allMetrics:');
        console.dir(allMetrics);

        const metricsFolder = path.join(
            __dirname,
            '../metrics'
        );

        if (!fs.existsSync(metricsFolder)) {
            fs.mkdirSync(metricsFolder);
        }
        fs.writeFileSync(
            path.join(
                metricsFolder,
                projectKey + '.project.json'
            ),
            JSON.stringify(allMetrics, null, 4)
        );
    });

