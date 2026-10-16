/**
 * this script calculates the gzip-size
 * of the bundles of each project
 */

import {
    fileSync
} from 'gzip-size';
import { readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as fs from 'fs';
import { BuildSizeMap } from '../src/shared/types';

const metricsFolder = path.join(
    __dirname,
    '../metrics'
);
if (!fs.existsSync(metricsFolder)) {
    fs.mkdirSync(metricsFolder);
}

async function run() {
    const distPath = path.join(
        __dirname,
        '..',
        'dist'
    );
    const projectDistFolders = readdirSync(distPath);

    const sizeMap: BuildSizeMap = projectDistFolders.map(folderName => {
        const projectPath = path.join(
            distPath,
            folderName
        );
        const useFilesPrefix = [
            'main',
            'polyfills',
            'runtime'
        ];
        const files: string[] = readdirSync(projectPath)
            // only use es2015 es files
            .filter(fileName => {
                const start = fileName.split('.')[0];
                // named WebWorker chunks like 'sqlite-worker' are also loaded on page load
                return useFilesPrefix.includes(start) || start.endsWith('-worker');
            })
            // get the full path
            .map(fileName => path.join(
                projectPath,
                fileName
            ));

        const sizePlainInBytes = files
            // get gzip-size of each file
            .map(filePath => statSync(filePath))
            // fileSizeInBytes
            .map(stats => stats.size)
            // calculate sum
            .reduce((a, b) => a + b, 0);

        // the gzip size also includes the WebAssembly files (pglite, sqlite-wasm)
        // and the data bundle that PGlite loads together with its wasm
        const wasmFiles: string[] = readdirSync(projectPath)
            .filter(fileName => fileName.endsWith('.wasm') || fileName.endsWith('.data'))
            .map(fileName => path.join(
                projectPath,
                fileName
            ));

        const sizeGzipInBytes = files.concat(wasmFiles)
            // get gzip-size of each file
            .map(filePath => fileSync(filePath))
            // calculate sum
            .reduce((a, b) => a + b, 0);

        return {
            project: folderName,
            sizePlainInKiloByte: sizePlainInBytes / 1000.0,
            sizeGzipInKiloByte: sizeGzipInBytes / 1000.0
        };
    });

    fs.writeFileSync(
        path.join(
            metricsFolder,
            'bundle-size.json'
        ),
        JSON.stringify(sizeMap, null, 4)
    );

    console.log(JSON.stringify(sizeMap, null, 2));
}

run();
