/**
 * Checks if there where errors on the browser console.
 * If yes, this will kill the process
 */
export async function assertNoErrors(t: any) {
    const logs = await t.getBrowserConsoleMessages();
    console.log('logs:');
    console.dir(logs);
    if (logs.error.length > 0) {
        console.log('assertNoErrors got ' + logs.error.length + ' errors:');
        console.dir(logs.error);
        process.kill(process.pid);
    }
}