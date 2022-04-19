import { Metric } from './types';

/**
 * returns the time since the page was loaded in ms
 * this works because window.pageLoadTime
 * is set on the html
 */
export function timeSincePageload(): number {
    if (typeof window === 'undefined') {
        throw new Error('no window');
    }
    const start: number = (window as any).pageLoadTime;
    const currentTime = new Date().getTime();
    return currentTime - start;
}

export function logTime(label: string) {
    const time = timeSincePageload();
    console.log('logTime: for ' + label + ': ' + time + 'ms since inital page load');
}

export function logMetricMeasurement(
    metricKey: string,
    value: number,
    unit: 'ms' | 's' | 'kb'
) {
    const runIdentifier = getRunIdentifier();
    /**
     * Be careful when changing the log format,
     * our test runner observes the console.log and parses
     * the strings.
     */
    const logObject: Metric = {
        runIdentifier: runIdentifier ? runIdentifier : undefined,
        flag: 'metric',
        key: metricKey,
        value,
        unit
    };
    console.log(JSON.stringify(logObject));
}


export function doReplication() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('replication');
    if (!myParam || myParam === 'true') {
        return true;
    } else {
        return false;
    }
}

export function addExampleData() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('add-example-data');
    if (myParam && myParam === 'true') {
        return true;
    } else {
        return false;
    }
}

export function getRunIdentifier(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('runIdentifier');
    return myParam;
}

/**
 * Measure the page load time.
 *
 * @link https://webmasters.stackexchange.com/a/87765
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API#calculate_the_total_page_load_time
 */
export function logPageLoadTime() {

    const windowLoadPromise = new Promise<void>(res => {
        window.addEventListener('load', () => {
            res();
        });
    });

    /**
     * The window.onload might be overwritten by some lib (like firebase),
     * so we have to ensure the metric is still logged in all cases.
     */
    Promise.race([
        windowLoadPromise,
        new Promise(res => setTimeout(res, 1000))
    ]).then(() => {
        /**
         * Must be done one tick after window.load emitted,
         * otherwise we get a negative value.
         */
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            logMetricMeasurement(
                'PAGE_LOAD_TIME',
                pageLoadTime,
                'ms'
            );
        }, 0);
    });
}


/**
 * Returns the current unix time in milliseconds
 * Because the accuracy of getTime() in javascript is bad,
 * and we cannot rely on performance.now() on all plattforms,
 * this method implements a way to never return the same value twice.
 * This ensures that when now() is called often, we do not loose the information
 * about which call came first and which came after.
 * Caution: Do not call this too often in a short timespan
 * because it might return 'the future'
 */
let lastNow = 0;
export function now(): number {
    let ret = new Date().getTime();
    if (ret <= lastNow) {
        ret = lastNow + 1;
    }
    lastNow = ret;
    return ret;
}
