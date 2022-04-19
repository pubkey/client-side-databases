/**
 * Aggregates the files from the metrics folder
 * into human readable formats.
 * This is a .mjs file because I could not make
 * ts-node run with the 'markdown-table' npm module.
 */
import * as path from 'path';
import {
    readdirSync,
    existsSync,
    readFileSync
} from 'fs';
import { markdownTable } from 'markdown-table';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as assert from 'assert';

// eslint-disable-next-line
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line
const __dirname = dirname(__filename);

const metricsFolder = path.join(
    __dirname,
    '../metrics'
);


const METRIC_TITLES = {
    FIRST_ANGULAR_COMPONENT_RENDER: 'First angular component render',
    PAGE_LOAD_TIME: 'Page load time',
    FIRST_FULL_RENDER: 'First full render',
    INSERT_1_MESSAGE: 'Insert one message',
    INSERT_20_MESSAGES_SERIAL: 'Inserting 20 messages one after another',
    INSERT_20_MESSAGES_PARALLEL: 'Inserting 20 messages in parallel',
    MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE: 'Message insert to message list change',
    USER_PAIR_CHANGED_TO_MESSAGE_LIST: 'User change to message list change',
    SEARCH_RESULT_TIME: 'Message search query time',
    FIRST_FULL_RENDER_MANY_MESSAGES: 'First full render with many messages',
    STORAGE_SIZE: 'Storage usage',
    BUNDLE_SIZE_PLAIN: 'Bundle size, plain JavaScript',
    BUNDLE_SIZE_GZIP: 'Bundle size, minified+gzip'
};

if (!existsSync(metricsFolder)) {
    throw new Error('metrics folder does not exists. You first have to generate via the measure-metrics.sh');
}
async function run() {
    const metricsFiles = readdirSync(metricsFolder);
    console.dir(metricsFiles);

    const bundleSizeContent = readJsonFile(
        path.join(metricsFolder, 'bundle-size.json')
    );
    console.log('bundleSizeContent:');
    console.log(JSON.stringify(bundleSizeContent, null, 4));

    const projectMetrics = {};
    metricsFiles
        .filter(fileName => fileName.endsWith('.project.json'))
        .forEach(fileName => {
            const projectKey = fileName.split('.')[0];
            const filePath = path.join(metricsFolder, fileName);
            const metricByKey = readJsonFile(filePath);

            // add the bundle size
            const bundleSize = bundleSizeContent.find(r => r.project === projectKey);
            if (!bundleSize) {
                throw new Error('got no bundle size for project ' + projectKey);
            }
            metricByKey['BUNDLE_SIZE_PLAIN'] = {
                flag: 'metric',
                key: 'BUNDLE_SIZE_PLAIN',
                unit: "kb",
                value: Math.ceil(bundleSize.sizePlainInKiloByte)
            };
            metricByKey['BUNDLE_SIZE_GZIP'] = {
                flag: 'metric',
                key: 'BUNDLE_SIZE_GZIP',
                unit: "kb",
                value: Math.ceil(bundleSize.sizeGzipInKiloByte)
            };

            projectMetrics[projectKey] = metricByKey;
        });

    console.log('projectMetrics:');
    console.log(JSON.stringify(projectMetrics, null, 4));

    // ensure all projects have the same metrics
    const metricsOfFirstProject = Object.values(projectMetrics)[0];
    Object.entries(projectMetrics).forEach(([projectKey, metrics]) => {
        const firstProjectName = Object.keys(projectMetrics)[0];

        const mustBeKeys = Object.keys(projectMetrics[firstProjectName]).sort();
        const isKeys = Object.keys(metrics).sort();

        try {
            assert.deepStrictEqual(mustBeKeys, isKeys);
        } catch (err) {
            console.log('Metric is missing: ' + projectKey);
            console.dir(mustBeKeys);
            console.dir(isKeys);
            throw err;
        }
    });


    // show a markdown table that can be copy-pasted into the readme
    const rowByMetric = {};
    Object.entries(metricsOfFirstProject).forEach(([metricKey, metric]) => {
        const title = METRIC_TITLES[metricKey];
        if (!title) {
            throw new Error('no metric title for metric ' + metricKey);
        }
        rowByMetric[metricKey] = [title];
    });
    const firstLine = ['Metric \\ Project'];

    Object.entries(projectMetrics).forEach(([projectKey, metricsByKey]) => {
        firstLine.push(projectKey);
        Object.entries(metricsByKey).forEach(([metricKey, metric]) => {
            // do not put a whitespace between value and unit, it will cause ugly linebreaks
            rowByMetric[metricKey].push(metric.value + metric.unit);
        });
    });


    const tableRows = Object.values(rowByMetric).slice();
    tableRows.unshift(firstLine);

    const table = markdownTable(tableRows);
    console.log(table);


}

run();


export function readJsonFile(filePath) {
    const content = readFileSync(
        filePath,
        'utf-8'
    );
    return JSON.parse(content);
}
