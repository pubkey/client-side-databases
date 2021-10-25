import { logPageLoadTime } from '../../../src/shared/util-browser';
logPageLoadTime();

/**
 * needed for aws amplify
 * @link https://aws-amplify.github.io/docs/js/angular#angular-6-support
 */
(window as any).global = window;
(window as any).process = {
    env: { DEBUG: undefined },
};
global.Buffer = global.Buffer || require('buffer').Buffer;


/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
