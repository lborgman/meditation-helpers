console.log("Here is refresh-rate.js");

// https://ourcodeworld.com/articles/read/1390/how-to-determine-the-screen-refresh-rate-in-hz-of-the-monitor-with-javascript-in-the-browser#google_vignette


/**
 * 
 * @param {function} callback (fps, timestamps)
 * @param {number} msTest Milliseconds to test, if <= run indefinitely.
 */
function getScreenRefreshRate(callback, msTest) {
    let requestId = null;
    let callbackTriggered = false;
    const runIndefinitely = msTest <= 0;

    const DOMHighResTimeStampCollection = [];

    const triggerAnimation = function (DOMHighResTimeStamp) {
        DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp);

        if (DOMHighResTimeStampCollection.length > 10) {
            const t0 = DOMHighResTimeStampCollection.pop();
            const fps = Math.floor(1000 * 10 / (DOMHighResTimeStamp - t0));

            if (!callbackTriggered) {
                callback.call(undefined, fps, DOMHighResTimeStampCollection);
            }

            if (runIndefinitely) {
                callbackTriggered = false;
            } else {
                callbackTriggered = true;
            }
        }

        requestId = window.requestAnimationFrame(triggerAnimation);
    };

    window.requestAnimationFrame(triggerAnimation);

    if (!runIndefinitely) {
        window.setTimeout(function () {
            window.cancelAnimationFrame(requestId);
            requestId = null;
        }, msTest);
    }
}

/**
 * 
 * @param {number} msTest 
 * @returns {number} fps
 */
export async function promScreenRefreshRate(msTest) {
    if (msTest <= 0) throw Error(`screeenRefreshRate, must be > 0 - msTest: ${msTest}`);

    return new Promise(resolve => {
        const callBack = (fps, timeStamps) => { resolve(fps); }
        getScreenRefreshRate(callBack, msTest);
    });
}