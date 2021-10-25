/**
 * Generates a markdown table from the feature map.
 * This is a .mjs file because I could not make
 * ts-node run with the 'markdown-table' npm module.
 */
import * as path from 'path';
import {
    readFileSync
} from 'fs';
import { markdownTable } from 'markdown-table';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line
const __dirname = dirname(__filename);

const featureTablePath = path.join(
    __dirname,
    '../feature-table.json'
);

const content = readFileSync(
    featureTablePath,
    'utf-8'
);
const featureTable = JSON.parse(content);

const table = markdownTable(featureTable);
console.log(table);
