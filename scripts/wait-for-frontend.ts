/**
 * Waits until the frontend is reachable
 */

import { waitUntil, wait } from 'async-test-util';
import got from 'got';

const FRONTEND_PORT = 3000;
const FRONTEND_URL = 'http://localhost:' + FRONTEND_PORT + '/';

async function run() {
    await waitUntil(async () => {
        try {
            await got.get(FRONTEND_URL);
            return true;
        } catch (err) {
            console.log('# could not reach frontend at ' + FRONTEND_URL);
            await wait(200);
            return false;
        }
    });
}
run();
