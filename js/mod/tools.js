// @ts-check
const TOOLS_VER = "0.0.7";
window["logConsoleHereIs"](`here is tools.js, module, ${TOOLS_VER}`);
if (document.currentScript) { throw "tools.js is not loaded as module"; }

const mkElt = window["mkElt"];
// const errorHandlerAsyncEvent = window["errorHandlerAsyncEvent"];
const importFc4i = window["importFc4i"];

const NCBI_TOOL_NAME = 'MM4I';
const NCBI_EMAIL_ADDRESS = 'lennart.borgman@gmail.com';

// https://firebase.google.com/docs/reference/js/firebase.auth.Error

let theSWcacheVersion = "Fix this! (not known yet)";


/** @type { import('../../js/mod/local-settings.js') } */
const modLocalSettings = await importFc4i("local-settings");
/** @extends modLocalSettings.LocalSetting */
class SettingsMm4iFetchIt extends modLocalSettings.LocalSetting {
    /**
     * 
     * @param {string} key 
     * @param {string|number|boolean} defaultValue 
     */
    constructor(key, defaultValue) { super("mm4i-settings-fetch-it-", key, defaultValue); }
}
const settingFetchItSerpKey = new SettingsMm4iFetchIt("serp-key", "");

// https://dev.to/somedood/promises-and-events-some-pitfalls-and-workarounds-elp
/** When awaited, this function blocks until the `event` fires once. */
// function blockUntilEvent(target: EventTarget, event: string)
/*
function blockUntilEvent(target, event, msTimeout) {
    return new Promise(resolve => {
        let tmr = setTimeout(() => {
            if (!tmr) return;
            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
            target.removeEventListener(event, funResolve);
        }, msTimeout);
        function funResolve() {
            if (tmr) {
                clearTimeout(tmr);
                tmr = undefined;
            }
            console.log("blockUntilEvent, resolve: ", event);
            resolve();
        }
        target.addEventListener(
            event,
            funResolve,
            {
                // For simplicity, we will assume passive listeners.
                // Feel free to expose this as a configuration option.
                passive: true,
                // It is important to only trigger this listener once
                // so that we don't leak too many listeners.
                once: true,
            },
        );
    }
    );
}
*/

const thePromiseDOMready = new Promise(function (resolve) {
    const rs = document.readyState;
    if (!["loading", "interactive", "complete"].includes(rs)) throw Error(`Unknown readystate: ${rs}`);
    if (document.readyState === "complete") return resolve(true);
    if (document.readyState === "interactive") return resolve(true);
    document.addEventListener("DOMContentLoaded", resolve);
});
export async function promiseDOMready() { return thePromiseDOMready; }

// FIXME: This pattern is a potential source of errors because 
// obj.val === undefined is maybe not expected.
// Test for equality === instead!
// if \(!?[a-z0-9_]+\.([a-z0-9_]+\.?)+\)



// https://stackoverflow.com/questions/41802259/javascript-deep-check-objects-have-same-keys
/*
const deepSameKeys = (o1, o2) => {
    let retNotSame;
    if (deepSameInner(o1, o2)) {
        // if (retNotSame) throw Error("deepSameKey err 1")
    } else {
        // if (!retNotSame) throw Error("deepSameKey err 2")
    }
    if (retNotSame) return retNotSame;
    return true;

    function deepSameInner(o1, o2) {
        // Get the keys of each object
        const o1keys = Object.keys(o1).sort();
        const o2keys = Object.keys(o2).sort();
        // Make sure they match
        // If you don't want a string check, you could do
        if (o1keys.join() !== o2keys.join()) {
            // This level doesn't have the same keys
            return o1keys.every(key => {
                if (!o2.hasOwnProperty(key)) {
                    retNotSame = { notSame: key };
                    return false;
                }
            })
            // throw Error("Internal error in deepSameKeys");
        }
        // Check any objects
        return o1keys.every(key => {
            const v1 = o1[key];
            const v2 = o2[key];
            const t1 = typeof v1;
            const t2 = typeof v2;
            if (t1 !== t2) {
                if (t1 === "boolean" && t2 === "object") return true; // for object type returns;
                if (t1 !== "object" && t2 !== "object") return true;
                retNotSame = { notSame: key };
                return false;
            }
            return t1 === "object" ? deepSameInner(v1, v2) : true;
        });
    }
};
*/

/*
function getLocalISOtime(dateTime) {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const atTime = dateTime ? new Date(dateTime) : Date.now();
    const localISOTime = (new Date(atTime - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
}
*/

// Quick fix for waiting for mkElt etc is really ready!
// javascript - Performance of MutationObserver to detect nodes in entire DOM - Stack Overflow
// https://stackoverflow.com/questions/31659567/performance-of-mutationobserver-to-detect-nodes-in-entire-dom/39332340
// FIX-ME: Is not this just a version of debounce?
/**
 * 
 * @param {HTMLElement} elt 
 * @param {number=} ms 
 * @param {Object=} observeWhat 
 * @param {number=} msMaxWait 
 * @returns 
 */
export function wait4mutations(elt, ms, observeWhat, msMaxWait) {
    const msTimer = ms || 10;
    observeWhat = observeWhat || { attributes: true, characterData: true, childList: true, subtree: true, };
    return new Promise(resolve => {
        let tmr;
        let mu;
        let nMu = 0;
        const now = Date.now();
        function fin(val) { resolve(val); mu?.disconnect(); }
        function restartTimer() {
            clearTimeout(tmr);
            nMu++;
            const newNow = Date.now();
            // console.log({ nMu }, mu == undefined, newNow - now);
            if (msMaxWait && (newNow - now > msMaxWait)) {
                fin("max wait");
                return;
            }
            if (mu) {
                mu.disconnect();
                mu = undefined;
            } else {
                mu = new MutationObserver(_mutations => {
                    // console.log("mutations!");
                    restartTimer();
                });
            }
            tmr = setTimeout(fin, msTimer);
            mu?.observe(elt, observeWhat);
        }
        // const mu = new MutationObserver(mutations => { restartTimer(); });
        restartTimer();
        // mu.observe(elt, observeWhat);
        // { attributes: true, characterData: true, childList: true, subtree: true, }
    });
}

/**
 * 
 * @param {HTMLElement} elt 
 * @param {number} msMaxWait 
 * @param {number|undefined} msInterval
 * @returns 
 */
export async function wait4connected(elt, msMaxWait, msInterval) {
    if (elt.isConnected) {
        console.log(`wait4connected, was already connected`);
        return;
    }
    // .isConnected is cheap, so check in short intervals
    msInterval = msInterval || 40;
    const msStartWait = Date.now();
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const msElapsed = Date.now() - msStartWait;
            if (elt.isConnected) {
                // console.log(`wait4connected, connected after ${msElapsed} ms`);
                clearInterval(intervalId);
                // console.log
                resolve(true);
            }
            if (msElapsed > msMaxWait) {
                clearInterval(intervalId);
                const msg = `wait4connected: not connected after ${msMaxWait}ms`;
                console.error(msg, elt);
                // throw Error(msg);
            }
        }, msInterval);
    });
}



async function getWebBrowserInfo() {

    function getRealBrands() {
        const userAgentData = navigator["userAgentData"];
        if (!userAgentData || !userAgentData?.brands) return [];
        return userAgentData.brands.filter(brand =>
            !/[^a-zA-Z0-9]/.test(brand.brand)
        );
    }

    function isChromiumBased() {
        const brands = getRealBrands();
        return brands.some(brand =>
            /Chromium|Chrome|GoogleChrome|MicrosoftEdge|Opera|Brave/i.test(brand.brand)
        ) ||
            // !!window.chrome;
            !!window["chrome"];
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // PWA
    function getDisplayMode() {
        const modes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
        for (const mode of modes) {
            if (window.matchMedia(`(display-mode: ${mode})`).matches) {
                return mode;
            }
        }
        return 'browser'; // fallback
    }
    function getIsPWA() { return "browser" != getDisplayMode(); }

    function checkForSyntaxNx() {
        try {
            new Function('n?.x');
            return true;
        } catch (err) {
            console.log(err);
            console.error("Syntax n?.x not recognized");
            debugger; // eslint-disable-line no-debugger
            // missingFeatures.push("Syntax n?.x not recognized");
        }
        return false;
    }

    function getAndroidApp() {
        const referrer = document.referrer;
        if (referrer.startsWith('android-app://')) return referrer;
    }
    async function getHasSW() {
        const arrRegistrations = await navigator.serviceWorker.getRegistrations();
        if (!arrRegistrations) return false;
        if (arrRegistrations.length == 0) return false;
        return true;
    }


    async function detectEnvironment() {
        let modInappSpy;
        try {
            // @ts-ignore - the module link is ok
            modInappSpy = await import('https://cdn.jsdelivr.net/npm/inapp-spy@latest/dist/index.mjs');
        } catch (err) {
            console.log("detectEnvironment", err);
            return;
        }
        const { isInApp, appKey, appName } = modInappSpy.default();
        const isAndroidApp = getAndroidApp();
        const isChromium = isChromiumBased();
        const isPWA = getIsPWA();
        const hasSW = await getHasSW();
        const isMobile = isMobileDevice();
        const isAndroidWView = isAndroidWebView();
        const canSyntaxNx = checkForSyntaxNx();
        const url = location.href;
        return {
            isChromium,
            isMobile,
            isAndroidWView,
            isPWA,
            hasSW,
            isAndroidApp,
            isInApp,
            inAppBrowserName: appName || null,
            inAppBrowserKey: appKey || null,
            url,
            canSyntaxNx,
        };
    }

    const env = await detectEnvironment();
    console.log("env", env);
    return env;
}
export const promWebBrowserInfo = getWebBrowserInfo();


// https://developers.google.com/web/fundamentals/performance/rail

// console.log("?????????? adding error event listener!"); // Just because things behave a bit strange sometimes.

/////// FIX-ME: urls must be per pwa
// Put external URL:s here since we need them for error reporting.
// const theGitHubIssuesURL = "https://github.com/lborgman/easy-cap-ed/issues";
// const theGitHubIssuesURL = undefined; // "";
// const theGitHubIssuesURL = "dummy"; // "";
const theGitHubIssuesURL = "https://github.com/lborgman/remember10min1h/issues";

// const theFacebookGroupURL = undefined;
const theFacebookGroupURL = "https://www.facebook.com/groups/flashcards4internet";
const theFacebookGroupName = "Flashcards 4 Internet (web app)";

// There could be an enormous amount of error messages sometimes so
// turn off the alert popup after we have got one.
var theAlertErrorCount = 0;
const theErrorPopupId = "error-popup";
const theStartTime = new Date();


function isAndroidWebView() {
    // https://developer.chrome.com/multidevice/user-agent
    return (navigator.userAgent.indexOf(" wv") !== -1);
}

// let thisIsNetworkTrouble;
window["alertError"] = alertError;
function alertError(msg, e) {
    console.log("alertError", msg, e);
    console.log("e.thisIsNetWorkTrouble", e.thisIsNetworkTrouble);
    if (e.reason) console.log("e.reason.thisIsNetWorkTrouble", e.reason.thisIsNetworkTrouble);

    const isRejection = e instanceof PromiseRejectionEvent;
    if (isRejection) {
        if (!e.reason) {
            debugger; // eslint-disable-line no-debugger
        }
    }
    const errObj = isRejection ? e.reason : e;
    if (errObj.thisIsNetworkTrouble) {
        alertNetworkTrouble(msg, errObj);
    } else {
        alertRealError(msg, errObj);
    }
}
function alertNetworkTrouble(msg, e) {
    const id = "the-alert-network-trouble";
    if (document.getElementById(id)) return;
    console.log(`%c Network trouble: ${msg}`, "font-size:1.5rem;", msg, e);
    const title = "Network Problem";
    const body = mkElt("div");
    body.id = id;
    if (e) {
        body.appendChild(mkElt("p", { class: "colorError", style: "padding:1rem;" }, e.message));
    }
    if (navigator.onLine) {
        body.appendChild(mkElt("p", undefined, `
            It looks like your device is connected to the internet.
            However there are trouble reaching the computers we
            use for storing data etc. 
            `));
        body.appendChild(mkElt("p", undefined, `
            There is probably nothing you can do about it.
            Just wait until it works again.
            (If you are not using the EasyCapEd cloud you will not be
            affected at all.)
            `));
    } else {
        body.appendChild(mkElt("p", undefined, `
            Did you just switch your device offline?
            `));
    }
    // new Popup(title, body, undefined, true, id).show();
    popupDialog(title, body);
}

function alertRealError(msg, e) {
    window.onbeforeunload = () => false;
    addTraceError("alertError", msg, e);
    // If webview just give up.
    if (isAndroidWebView()) return;
    if (theAlertErrorCount++ > 1) return;
    if (theAlertErrorCount > 0) {
        setTimeout(function () {
            theAlertErrorCount = 0;
        }, 2 * 60 * 1000); // turn on again after 2 minutes
    }
    let currentErrorPopup = document.getElementById(theErrorPopupId);
    if (currentErrorPopup) return;

    console.error("alertError, e", e);


    // FIX-ME:
    // Just exit here if Chrome devtools is opened.
    // https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open
    // var devtools = /./;
    // devtools.toString = function() { this.opened = true; }
    // console.log(devtools); if (devtools) { debugger; return; }


    /*
        Here is the explanation of .reason, seems standard!
        https://javascript.info/promise-error-handling

    window.addEventListener('unhandledrejection', function (event) {
        // the event object has two special properties:
        alert(event.promise); // [object Promise] - the promise that generated the error
        alert(event.reason); // Error: Whoops! - the unhandled error object
    });

    new Promise(function () {
        throw new Error("Whoops!");
    }); // no catch to handle the error
    */

    let error = e;
    if (e.error) error = e.error;
    if (e.reason) error = e.reason;


    let errMsg;
    errMsg = "In URL: " + "\n* " + location.href + "\n\n";

    // FIXME: npm serialize-error
    if (error.serializedError) {
        if (error.localVer) errMsg += "Function local ver: " + error.localVer + "\n";
        let se = error.serializedError;
        if (se.name) errMsg += se.name + "\n";
        if (se.message) errMsg += se.message + "\n";
        if (se.stack) errMsg += se.stack;
    } else {
        let errStack = error.stack;
        if (errStack) {
            errMsg += errStack;
        } else {
            if (error.message) {
                errMsg += error.message;
            } else {
                errMsg += error;
            }
        }
    }


    let errorStr = "\n\nError source:";
    errorStr += "\n* ";
    if (typeof error.easyCapEd !== "undefined") {
        switch (error.easyCapEd) {
            case "throwFetchError":
                errorStr += "Server Error";
                errorStr += error.errResp;
                break;
            default:
                errorStr += "(unnamed error source in EasyCapEd)";
        }
    } else {
        errorStr += msg;
    }

    let timeNow = new Date();

    let contextStr = "\n\nContext:";
    // contextStr += "\n* Version: " + theEasyCapEdVersion;
    contextStr += "\n* Version: " + theSWcacheVersion;
    // contextStr += "\n* Started: " + theStartTime.toISOString().substr(0, 16);
    contextStr += "\n* Started: " + theStartTime.toISOString().slice(0, 16);
    // contextStr += "\n* Now:     " + (timeNow.toISOString().substr(0, 16));
    contextStr += "\n* Now:     " + (timeNow.toISOString().slice(0, 16));
    contextStr += "\n* Elapsed: " + ((timeNow.valueOf() - theStartTime.valueOf()) / 1000) + " sec";
    contextStr += "\n* Browser: " + navigator.userAgent;
    contextStr += "\n* Online: " + navigator.onLine;
    // contextStr += "\n* "+location.href;
    // if (typeof theCapLoadType != "undefined") { contextStr += "\n* " + theCapLoadType.toString(); }
    // if (typeof theEditor !== "undefined") { contextStr += "\n* Captions"; }
    try {
        // @ts-ignore
        if ((typeof theFirstAuthStateChangedDone == "boolean") && theFirstAuthStateChangedDone) {
            let user = theFirebaseCurrentUser;
            if (user) {
                contextStr += "\n* Logged in";
            } else {
                contextStr += "\n* Not logged in";
            }
        }
    } catch (e) {
        const errMsg = e instanceof Error ? e.message : e.toString();
        contextStr += "\n* Error checking logged in: " + errMsg;
    }

    const title = "Error";
    const fullErrorTxt = errMsg + errorStr + contextStr;
    const divSubmit = (() => {
        if (theGitHubIssuesURL) {
            const styleBtn = [
                "background:orange",
                "color:black",
                "border-radius: 4px",
                "border: none; padding: 8px",
                "text-decoration:none",
                "text-transform:uppercase",
                "display: inline-block"
            ];
            const style = styleBtn.join("; ");
            const btnSubmit = mkElt("a", {
                style,
                target: "_blank",
                href: submitGetURL4IssueToGitHub("** Please give the error a title! ***", fullErrorTxt),
                class: "popup-button",
            }, "Submit to GitHub");
            const ret = mkElt("div", undefined, [
                mkElt("p", undefined,
                    ["There was an error. Please submit it: ",
                        btnSubmit,
                    ]),

                mkElt("p", undefined,
                    [
                        "You can also go ",
                        mkElt("a", {
                            href: theGitHubIssuesURL,
                            target: "_blank"
                        },
                            "the GitHub Issues page)"),
                        " and post the text below.",
                    ]),
            ]);
            if (theFacebookGroupURL) {
                ret.appendChild(mkElt("p", undefined,
                    [
                        "If you do not want to register at GitHub" +
                        " (which in my opinion is very safe and easy" +
                        " with your Google or Facebook account) you may instead go to ",
                        mkElt("a", {
                            href: theFacebookGroupURL,
                            target: "_blank"
                        },
                            `the Facebook group ${theFacebookGroupName}`),
                        " and post the text below.",
                    ])
                )
            }
            return ret;
        } else {
            // FIX-ME: has facebook url? theFacebookGroupName theFacebookGroupURL 
            if (theFacebookGroupURL) {
                return mkElt("div", undefined, [
                    mkElt("p", undefined,
                        [
                            "Please go to ",
                            mkElt("a", {
                                href: theFacebookGroupURL,
                                target: "_blank"
                            },
                                `the Facebook group ${theFacebookGroupName}`),
                            " and post the text below.",
                        ]),

                ])
            } else {
                return mkElt("p", undefined,
                    `Please contact the web page owner and tell them about the error below.`
                );
            }
        }
    })();
    // const gitHubBugHelp = "javascript:alert('You must choose the desktop version when you come to GitHub!')";
    const style = [
        "overflow:auto",
        "white-space:pre-wrap",
        "user-select:all",
        "background:#fffc",
        "padding: 4px",
        "overflow-wrap: anywhere",
    ].join("; ");

    const body = mkElt("div", undefined,
        [
            divSubmit,
            // mkElt("div", undefined, [
            // ]),
            mkElt("pre", {
                id: "error-text",
                // class: "copy-all",
                style
            },
                // errMsg + errorStr + contextStr
                fullErrorTxt
            ),
        ]);

    popupDialog(title, body, "error");

}

function alertForError(e) {
    console.warn("alertForError", e);
    alertError("error", e);
}
window.addEventListener('NOerror', alertForError);

/*
function goSilently(url) {
    window.removeEventListener('error', alertForError);
    location.href = url;
    throw Error("");
}
*/

// https://stackoverflow.com/questions/47926040/catching-errors-the-onerror-event/
// https://stackoverflow.com/questions/31472439/catch-all-unhandled-javascript-promise-rejections

// FIXME: I have no idea what is happening to errors in keyboard initated events.
// Sometimes I get just "Scrip Error." and sometimes a trace.
// Do I need the function below, or???

/*
window.addEventListener("error", (e) => {
    console.log("e", e);
})
*/

/*
window.addEventListener('NOunhandledrejection', function (e) {
    console.warn("2 entering event listener for unhandledrejection");
    alertError("unhandledrejection", e);
});
*/
// console.log("-------- Added unhandledrejection");
/*
window.addEventListener("rejectionhandled", function (e) {
    alertError("rejectionhandled", e);
});
*/

// FIXME: This doesn't pop up if too early. What is happening? All the listeners are set up and it is logged in the console???
// console.log("CREATING TEST ERROR in 4 seconds"); setTimeout(function() {justAnErrorTest()}, 8000);



/*
var theLittleLogger;

function addLittleLogger() {
    theLittleLogger = mkElt("div", {
        id: "the-little-logger"
    },
        [
            mkElt("div"),
        ]);
}
*/



///////////////////////////////////////
/// Also encode parenthesis. There seem to be a bug in Android 7 that requires this.
function alsoEncodeParenthesis(urlEncoded) {
    let str = urlEncoded.replace(/\(/g, "%28");
    str = str.replace(/\)/g, "%29");
    // str = str.replace(/</g, "&lt;");
    return str;
}

////////////////////////////////////////
//// Automatic issue creation
function submitGetURL4IssueToGitHub(title, msg) {
    let url = "https://github.com/lborgman/easy-cap-ed/issues/new?";
    title = title || "title";
    let body = "";
    // Pulling in the template doesn't seem to work here so add
    // similar code instead.
    body += "### Expected Behavior (if any)" +
        "\n\n### Actual Behavior (if any)" +
        "\n\n### Steps to Reproduce (if any)" +
        "\n\n### Error Popup Message in EasyCapEd (automatically copied)\n";
    body += msg || "actual body";

    let params = {
        // template: "ISSUE_TEMPLATE",
        body: body,
        title: title,
        labels: "bug",
    }

    function addParams() {
        let ret = [];
        for (let param in params) {
            let v = params[param];
            v = v.replace(/</g, "&lt;");
            ret.push(encodeURIComponent(param) + '=' +
                // alsoEncodeParenthesis(encodeURIComponent(params[param])));
                alsoEncodeParenthesis(encodeURIComponent(v)));
        }
        return ret.join("&");
    }
    url += addParams();
    // console.log(url);
    return url;
}

/*
function mkWarningPopup(title, body) {
    let warningInfo = mkElt("p", { "class": "warning-info" },
        ["We do not think this is an error. ",
            "If you do then please go here and try to explain why: ",
            mkElt("a", { "href": theGitHubIssuesURL, "target": "_blank" }, "Issue tracker")
        ]);
    let bodyFull = mkElt("div", undefined,
        [mkElt("p", undefined, body), warningInfo]);
    popupDialog(title, bodyFull, "warning");
}
*/

/**
 * Shorten long parameter values to make the url viewable.
 * Value limit is 40 chars.
 * The main purpose is to shorten tokens (which can be very, very long).
 * 
 * @param {string} url 
 * @returns {string}
 */
export function makeDisplayableUrl(url) {
    // console.warn("makeDisplayableUrl", typeof url, url);
    const parts = url.split("?");
    if (parts.length === 1) return url;
    const hostPart = parts[0];
    const params = parts[1]
    const urlParams = new URLSearchParams(params);
    const keys = urlParams.keys();
    for (const key of keys) {
        const val = urlParams.get(key);
        if (val != null) {
            if (val.length > 40) urlParams.set(key, "...");
        }
    }
    return hostPart + "?" + urlParams.toString();
}

export function removeTokensFromObject(obj) {
    const keys = Object.keys(obj)
    for (const key of keys) {
        const val = obj[key];
        if (val) continue;
        try {
            if (typeof val === "string") {
                if (val.indexOf("\n") === -1) {
                    if (val.length > 140) obj[key] = "...";
                }
            } else if (typeof val === "object") {
                removeTokensFromObject(val);
            }
        } catch (err) {
            console.error(err);
            debugger; // eslint-disable-line no-debugger
        }
    }
}



// function getStack() { try { throw Error(); } catch (e) { return e.stack; } }

// setTimeout(() => { throw Error('Hello world'); }, 1000);

// https://googlechrome.github.io/samples/promise-rejection-events/
//
//
// What does this mean? (This is for the handled rejection case.)
//
// Answer: It actually seems to mean you have to leave the rejection
// unhandled first to trigger rejectionhandled.
//
// We need to handle the rejection "after the fact" in order to trigger a
// unhandledrejection followed by rejectionhandled. Here we simulate that
// via a setTimeout(), but in a real-world system this might take place due
// to, e.g., fetch()ing resources at startup and then handling any rejected
// requests at some point later on.

// window.addEventListener('unhandledrejection', event => {
//   console.log('unhandledrejection fired: ' + event.reason);
//   // Keep track of rejected promises by adding them to the Map.
//   // unhandledRejections.set(event.promise, event.reason);
// });
// window.addEventListener('rejectionhandled', event => {
//   console.log('rejectionhandled fired: ' + event.reason);
//   // If a previously rejected promise is handled, remove it from the Map.
//   // unhandledRejections.delete(event.promise);
// });

// throw Error("testing error...");
var theFirebaseCurrentUser = null;
// var theFirebaseCurrentUserEmail;

/*
*/
const traceHelper = [];
const traceStart = Date.now();
const addTraceDoIt = function (isError, trace) {
    const ms = Date.now() - traceStart;
    trace.unshift(ms);
    traceHelper.push(trace);
    if (isError) {
        console.error("addTrace", trace);
    } else {
        // console.log("addTrace", trace);
        console.warn("addTrace", trace);
    }
}
/*
function addTrace(...trace) {
addTraceDoIt(false, trace);
}
*/
function addTraceError(...trace) {
    const errTrace = ["** ERROR **"].concat(trace);
    addTraceDoIt(true, errTrace);
}
/*
// addTrace("Starting");
// addTraceError("Testing addTraceError");

function popupTrace() {
    popupDialog("Trace",
        mkElt("pre", undefined, JSON.stringify(traceHelper, undefined, 2)),
        "info");
}
*/

/*
function mkJsonType(obj) {
    const jObj = {}
    for (let k in obj) {
        const v = obj[k];
        if (typeof v !== "function") jObj[k] = v;
    }
    return jObj;
}
*/

async function popupDialog(title, body, severity) {
    // const hasDialog = Object.getOwnPropertyNames(window).includes("HTMLDialogElement");
    // Use dialog as fallback
    const useDialog = true; // typeof Popup !== "function";
    let styleDia = "max-width:90vw; max-height:80vh; overflow:auto; color:black; ";
    switch (severity) {
        case "error":
            /*
            // No longer used, PWA runs separated
            {
                (async () => {
                    try {
                        const btnUpdate = mkElt("button", undefined, "Update now");
                        const styleUpdate = "background:black; color:white; padding:10px; display: none;";
                        const divUpdate = mkElt("div", { style: styleUpdate }, ["Update available ", btnUpdate]);
                        body.insertBefore(divUpdate, body.firstElementChild)
                        btnUpdate.addEventListener("click", errorHandlerAsyncEvent(async () => {
                            modPwa.updateNow();
                        }));
                        // if (modPwa.hasUpdate())
                        if (modPwa.isShowingUpdatePrompt()) {
                            console.log("?????? isShowingUpdatePrompt");
                            window.onbeforeunload = null;
                            setTimeout(() => divUpdate.style.display = "block", 100);
                        } else {
                            window.addEventListener("pwa-update-available", () => {
                                console.log("?????? pwa-update-available");
                                window.onbeforeunload = null;
                                divUpdate.style.display = "block";
                            });
                        }
                    } catch (err) {
                        console.error(err);
                        debugger; // eslint-disable-line no-debugger
                    }
                })();
            }
            */
            styleDia += "background:yellow; border:2px solid red;";
            break;
        case "warning":
            styleDia += "background:yellow; border:2px solid green;";
            break;
        case "info":
            styleDia += "background:white; border:2px solid blue;";
            break;
        default:
            styleDia += "background:red; border:2px solid yellow;";
    }
    if (!useDialog) {
        styleDia += " position:fixed; left:10px; top:10px; padding:1rem; ";
    }
    const styleArt = "";
    const styleBtn = "background:orange; color:black; border-radius: 4px; border: none; padding: 8px;";
    await thePromiseDOMready;
    if (useDialog) {
        const closeBtn = mkElt("button", { style: styleBtn }, "CLOSE");
        // FIXME: the native dialog is broken 2020-07-15
        closeBtn.addEventListener("click", () => {
            // dialog.close();
            document.body.removeChild(dialog);
            window.onbeforeunload = null;
        });
        const dialogTag = useDialog ? "dialog" : "section";
        const dialog = mkElt(dialogTag, { style: styleDia },
            mkElt("div", { style: styleArt }, [
                mkElt("h1", undefined, title),
                // mkElt("div", undefined, body),
                body,
                mkElt("div", undefined, ["", closeBtn]),
            ]));
        dialog.classList.add("error-popup");
        document.body.appendChild(dialog);
        // @ts-ignore
        dialog.showModal();
    } else {
        throw Error("useDialog should be true");
        // body.style = styleDia;
        // body.style.position = "static";
        // new Popup(title, body, undefined, true, undefined, "max-width: min(90vw, 800px);").show();
    }
}

// const a = 1 / b; console.log("a", a)




////////////////////////////////////////////
// For PWAs, prevent drop of files etc.
// const allowDropOnList = [];
export function allowDropOn(elt) {
    elt.classList.add("allow-drop")
}
function dropAllowed(elt) {
    return elt.classList.contains("allow-drop");
}
function startDropShield() {
    // console.log("Started shield to prevent file drop on page!");
    window.addEventListener("drop", evt => {
        // console.log("drop", evt.target)
        if (dropAllowed(evt.target)) return;
        evt.preventDefault();
    });
    window.addEventListener("dragover", evt => {
        if (dropAllowed(evt.target)) return;
        evt.preventDefault();
        evt.stopPropagation();
        if (!evt.dataTransfer) return;
        evt.dataTransfer.dropEffect = "none";
    });
}
startDropShield();

/*
function loadScriptError(oError) {
    console.log({ oError });
    const msg = `
    The script ${oError.target.src} could not be loaded currently.
    Please try again later.
    `;
    alert(msg);
}
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement#dynamically_importing_scripts
export function affixScriptToHead(url, onloadFunction) {
    const newScript = document.createElement("script");
    newScript.onerror = loadScriptError;
    if (onloadFunction) { newScript.onload = onloadFunction; }
    document.head.appendChild(newScript);
    newScript.src = url;
}
*/



////////////////////////////////////
////////////////////////////////////
///// Helper functions. Throttle, debounce, etc

// await new Promise(resolve => setTimeout(resolve, delay));
/** * @param {number} sec * @returns */
export function waitSeconds(sec) {
    // console.log("start wait", sec)
    return new Promise(resolve => {
        function ready() {
            // console.log("ready wait", sec)
            resolve(sec);
        }
        setTimeout(ready, sec * 1000);
    })
}

// Events
// https://stackoverflow.com/questions/45831911/is-there-any-eventemitter-in-browser-side-that-has-similar-logic-in-nodejs/53917410#53917410
// https://stackoverflow.com/questions/70392939/how-to-dispatch-event-from-a-function-instead-of-window
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy



// https://medium.com/codex/throttling-in-javascript-649375f6b9f
// https://garden.bradwoods.io/notes/javascript/performance/debounce-throttle
// https://css-tricks.com/debouncing-throttling-explained-examples/
// https://www.npmjs.com/package/throttle-debounce
/*
  debounce: Grouping a sudden burst of events (like keystrokes) into a single one.
  throttle: Guaranteeing a constant flow of executions every X milliseconds.
          Like checking every 200ms your scroll position to trigger a CSS animation.

  * If the function is debounced, the bouncer will make everyone that turns up to wait in line.
  Then, after 5 minutes, everyone in line can come in at once.
  * If the function is throttled, the bouncer will let the 1st person who shows up in.
  If anyone else shows up in the next 5 minutes, they will be turned away.

  FIX-ME: I think I mixed them up.
    debounce() with execute at the end is what I want here.
    My change to throttleTO() seems to convert it to a debounce()-version.
    But why the different callback function handling???
*/
export function throttleTO(fn, msDelay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            // return; // original
            clearTimeout(timeoutId); // my own
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            // console.log("throttleTO(fn, delay)");
            timeoutId = null;
        }, msDelay);
    }
}
/*
function throttleRA(fn) {
    let requestId;
    return function (...args) {
        if (requestId) {
            return;
        }
        requestId = requestAnimationFrame(() => {
            fn(...args);
            requestId = null;
        });
    }
}
*/


// From https://garden.bradwoods.io/notes/javascript/performance/debounce-throttle
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} waitMS - The number of milliseconds to delay.
 *                                      (immediately), instead of the trailing edge.
 * @returns {Function} A new debounced function.
 *
 * @example
 * window.addEventListener('resize', debounce(handleResize, 250));
 */
export function debounce(func, waitMS = 200) {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timeoutId;
    /**
     * @this {any}
     * @param {...any} args
     */
    return function (...args) {
        const context = this
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            timeoutId = undefined;
            func.call(context, ...args)
        }, waitMS);
    };
};


/**
 * @typedef {Object} ObjDebounceOptions
 * @property {Function} callback
 * @property {number|undefined} msWait
 */

/** @type {WeakMap<ObjDebounceOptions, Function>} */
const mapForDebounced = new WeakMap();

/**
 * @param {ObjDebounceOptions} objCallback
 * @param {...any} args
 */
export function callDebounced(objCallback, ...args) {
    // console.warn("callDebounced", { args });
    const { callback, msWait = 200 } = objCallback;
    if (!mapForDebounced.has(objCallback)) {
        // console.log("createDebounced for ", objCallback);
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let timeoutId;
        const funDebounced = (...args2) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                // console.log("funDebounced", { args2 });
                callback(...args2); // ES6
            }, msWait);
        };
        mapForDebounced.set(objCallback, funDebounced);
    }
    const funDebounced = mapForDebounced.get(objCallback);
    if (funDebounced == undefined) throw Error("funDebounced == undefined");
    funDebounced(...args);
}

/** @type {WeakMap<Function, DebounceState>} */
const cache = new WeakMap();

/**
 * @typedef {Object} DebounceState
 * @property {ReturnType<typeof setTimeout> | undefined} timeoutId - The ID of the current timeout.
 * @property {((value: any) => void) | undefined} resolve - The resolve function of the *current* pending Promise.
 * @property {((reason?: any) => void) | undefined} reject - The reject function of the *current* pending Promise.
 * @property {Promise<any> | undefined} promise - The *current* pending Promise object.
 * @property {Function} debounced - The actual debounced function wrapper.
 */

// Gemini version:
/**
 * Calls a function after a delay, but cancels any pending calls if this function is called again before the delay expires.
 * Returns the *same* Promise instance for all calls that occur before the callback is executed.
 *
 * @export
 * @param {Function} callback The function to debounce.
 * @param {number} [waitMS=200] The number of milliseconds to wait.
 * @param {any[]} [args=[]] Arguments to be passed to the callback.
 * @returns {Promise<any>} A Promise that fulfills when the callback is called.
 */
export function callDebouncedGemini(callback, waitMS = 200, args = []) {
    let state;

    // --- 1. Get or Initialize State ---
    if (!cache.has(callback)) {
        // console.log("createDebounced for ", callback.name || 'anonymous');

        /** @type {DebounceState} */
        const initialState = {
            timeoutId: undefined,
            resolve: undefined,
            reject: undefined,
            promise: undefined,
            debounced: () => { } // Placeholder
        };

        /** @param {...any} currentArgs */
        const debounced = function (currentArgs) {

            // If a previous call is pending, clear its timer
            if (initialState.timeoutId) {
                clearTimeout(initialState.timeoutId);
            }

            // Set the new timeout
            initialState.timeoutId = setTimeout(() => {
                initialState.timeoutId = undefined; // Clear ID after execution

                let result;
                let error;

                try {
                    // Call the original function with the last received arguments
                    result = callback.apply(null, currentArgs);
                } catch (e) {
                    error = e;
                }

                // Resolve or Reject the stored promise
                if (initialState.resolve && initialState.reject) {
                    if (error) {
                        initialState.reject(error);
                    } else {
                        initialState.resolve(result);
                    }
                }

                // IMPORTANT: After the promise is settled, clear all promise-related state.
                initialState.resolve = undefined;
                initialState.reject = undefined;
                initialState.promise = undefined;

            }, waitMS);
        };

        initialState.debounced = debounced;
        cache.set(callback, initialState);
        state = initialState;

    } else {
        state = cache.get(callback);
    }

    if (!state) throw new Error("Debounce state not found.");

    // --- 2. Handle Promise Logic ---

    // If there is no pending Promise, create a new one
    if (!state.promise) {
        state.promise = new Promise((resolve, reject) => {
            // Store the handlers for this new Promise
            state.resolve = resolve;
            state.reject = reject;
        });
    }

    // --- 3. Execute Debounced Wrapper ---
    // This function:
    // 1. Clears any existing timer.
    // 2. Starts a new timer that will eventually run the callback and resolve/reject the stored Promise.
    state.debounced(args);

    // --- 4. Return the Promise ---
    // If a promise was already pending, this returns the same one.
    // If not, this returns the new one just created.
    return state.promise;
}



// Just to compare and be sure...
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} [immediate=false] - If `true`, trigger the function on the leading edge
 *                                      (immediately), instead of the trailing edge.
 * @returns {Function} A new debounced function.
 *
 * @example
 * window.addEventListener('resize', debounce(handleResize, 250));
 */
export function GrokDebounce(func, wait, immediate = false) {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timeout;
    /**
     * @this {any} 
     * @param {...any} args 
     */
    return function executedFunction(...args) {
        const later = () => {
            timeout = undefined;
            if (!immediate) func.apply(this, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(this, args);
    };
}

// Usage
// window.addEventListener('resize', debounce(() => { console.log('Resized!', window.innerWidth); }, 250));




/*
function throttle(func, waitMS = 200) {
    let isWait = false;

    return function (...args) {
        if (!isWait) {
            func.call(this, ...args);
            isWait = true;

            setTimeout(() => {
                isWait = false;
            }, waitMS);
        }
    }
}
*/



////////// URLs
// https://www.freecodecamp.org/news/how-to-validate-urls-in-javascript/
// isValidURL
export function getUrllNotValidMsg(id) {
    switch (id) {
        case "NO-HTTPS": return "Link must begin with 'https://'";
        case "NO-DOMAIN": return "Link must have domain";
        case "CONTAINS-SPACE": return "Link must not contain spaces";
        case "UNKNOWN-TLD": return "Unknown top level domain";
        default:
            throw Error(`Unknown url not valid id: ${id}`);
    }
}

// To check top level domains async fetchReTLD() must be called first!
/**
 * 
 * @param {string} strUrl 
 * @param {string} protocol 
 * @param {boolean} [mustCheckTLD]
 * @returns {Promise<true|Object>} 
 */
export async function isValidUrlFormat(strUrl, protocol, mustCheckTLD = true) {
    /**
     * 
     * @param {string} reason 
     * @param {string|HTMLSpanElement} message
     * @returns {Object}
     */
    const makeInvalid = (reason, message) => {
        return { reason, message }
    }
    protocol = protocol || "https:";
    try {
        // new URL() only checks for well formatted so do some more checks first
        switch (protocol) {
            case "https:":
                if (strUrl.search(" ") != -1) return makeInvalid("CONTAINS-SPACE", "Can not contain spaces");

                const lenHttps = "https://".length;
                if (!"https://".startsWith(strUrl.slice(0, lenHttps))) {
                    // if (!strUrl.match(new RegExp("^https://[^/]?"))) {
                    return makeInvalid("NO-HTTPS",
                        mkElt("span", undefined, [
                            "Must begin with ",
                            mkElt("b", undefined, "https://")
                        ])

                    );
                }

                // Find domain part
                const strUrlHttpsRest = strUrl.slice(lenHttps);
                const posSlash = `${strUrlHttpsRest}/`.indexOf("/");
                const strDomain = strUrlHttpsRest.slice(0, posSlash);
                if (strDomain.length < 5) return makeInvalid("NO-DOMAIN", "");


                if (!strDomain.match(new RegExp("^[^/]{0,}[^.][.]([^/.]){2,63}($|/)"))) {
                    return makeInvalid("NO-TLD", "No top domain");
                }

                const tld = getTLD(strUrl);
                if (!tld) return makeInvalid("NO-TLD", "No top domain in url");

                if (hasReTLD() || mustCheckTLD) {
                    await fetchTLD();
                    const re = getReTLD();
                    if (!re.test(strUrl)) {
                        return makeInvalid("UNKNOWN-TLD", mkElt("span", undefined, [
                            "Unknown top domain: ",
                            mkElt("b", undefined, tld)
                        ]));
                    }
                }

                break;
            default:
                throw Error("Not implemented");
        }
        const newUrl = new URL(strUrl);
        return newUrl.protocol === protocol;
    } catch (err) {
        console.error("isValidUrlFormat", err);
        throw err;
    }
}
/*
This doesn't work because of CORS.
// https://stackoverflow.com/questions/42758604/check-if-online-resource-is-reachable-with-javascript-not-requiring-the-the-sam
async function isReachableUrl(url) {
    let reachable = false;
    try {
        const resp = await fetch(url, { method: "HEAD" });
        reachable = resp.ok;
    }
    finally {
        return reachable
    }
}
*/

// let reTLD;
/** @type {string[]} */
const arrTLD = [];
export function hasReTLD() {
    return arrTLD.length > 0;
}

/**
 * Get RegExp mathing top level domains.
 * 
 * @returns {RegExp}
 */
export function getReTLD() {
    if (arrTLD.length == 0) { throw Error("TLD has not been fetched"); }
    const reTLD = new RegExp("^https://[^/]{0,}[^.][.](" + arrTLD.join("|") + ")" + "($|/)");
    return reTLD;
}

/**
 * 
 * @param {string} url 
 * @return {string|undefined}
 */
export function getTLD(url) {
    // const reFindTLD = new RegExp("^https://[^/]{0,}[^.][.](.?)($|/)");
    const reFindTLD = new RegExp("^https://[^/]{0,}[^.][.]([^./]*)($|/)");
    const m = url.match(reFindTLD);
    if (!m) return;
    return m[1];
}

export async function fetchTLD() {
    if (arrTLD.length == 0) {
        const urlTLDlist = "https://publicsuffix.org/list/public_suffix_list.dat";
        const resp = await fetch(urlTLDlist);
        const text = await resp.text();
        const lines = text
            .split("\n")
            .map(t => t.trim())
            .filter(t => !t.startsWith("//"))
            .filter(t => t.length > 0)
            .filter(t => t.indexOf(".") == -1)
            ;
        lines.forEach(l => arrTLD.push(l));
        // console.log(lines)
        // lines.length = 4;
        // reTLD = new RegExp("^https://[^/]{0,}[^.][.](" + lines.join("|") + ")" + "($|/)");
    }
}
export async function fetchReTLD() {
    if (reTLD == undefined) {
        const urlTLDlist = "https://publicsuffix.org/list/public_suffix_list.dat";
        const resp = await fetch(urlTLDlist);
        const text = await resp.text();
        const lines = text
            .split("\n")
            .map(t => t.trim())
            .filter(t => !t.startsWith("//"))
            .filter(t => t.length > 0)
            .filter(t => t.indexOf(".") == -1)
            ;
        // console.log(lines)
        // lines.length = 4;
        reTLD = new RegExp("^https://[^/]{0,}[^.][.](" + lines.join("|") + ")" + "($|/)");
    }
    return reTLD;
}

/**
 * 
 * @param {string} txt 
 * @param {boolean} [noSnackbar]
 */
export async function copyTextToClipboard(txt, noSnackbar) {
    const addSnackbar = noSnackbar == undefined ? true : !noSnackbar;
    const modMdc = await importFc4i("util-mdc");
    try {
        await navigator.clipboard.writeText(txt);
        if (addSnackbar) modMdc.mkMDCsnackbar('Copied to clipboard');
        return true;
    } catch (error) {
        const errMsg = String(error);
        console.error('Error copying:', errMsg);
        debugger; // eslint-disable-line no-debugger
        alert('Error copying: ' + errMsg);
        return false;
    };
}
export async function getTextFromClipboard() {
    try {
        const txt = await navigator.clipboard.readText();
        return txt;
    } catch (error) {
        const errMsg = String(error);
        const msg = `Error reading text from clipboard: ${errMsg}`;
        console.error(msg, error);
        debugger; // eslint-disable-line no-debugger
        alert(msg);
    }
}

export function showInfoPermissionsClipboard() {
    showInfoPermissions("Can't read clipboard");
}
async function showInfoPermissions(txtWhich) {
    const hrefAndroid = "https://support.google.com/chrome/answer/114662?hl=en&co=GENIE.Platform%3DAndroid&oco=1";
    const hrefDesktop = "https://support.google.com/chrome/answer/114662?hl=en&co=GENIE.Platform%3DDesktop&oco=1";
    const aUnblockAndroid = mkElt("a", { target: "blank", href: hrefAndroid }, "Android");
    const aUnblockDesktop = mkElt("a", { target: "blank", href: hrefDesktop }, "Desktop");
    const pLink = mkElt("p", undefined, [aUnblockAndroid, " ", aUnblockDesktop]);
    pLink.style = `
        display: flex;
        gap: 20px;
        `;
    const body = mkElt("section", undefined, [
        mkElt("h1", undefined, txtWhich),
        mkElt("p", undefined, [
            "This can be fixed as explained here: ",
        ]),
        pLink
    ]);
    const modMdc = await importFc4i("util-mdc");
    modMdc.mkMDCdialogAlert(body);
}

export class TimeoutTimer {
    #debugging;
    constructor(msTimeout, funTimeout, debug) {
        this.msTimeout = msTimeout;
        this.funTimeout = funTimeout;
        this.tmr = undefined;
        this.#debugging = !!debug;
    }
    stop() {
        if (this.#debugging) console.log("to stop");
        clearTimeout(this.tmr);
        this.tmr = undefined;
    }
    restart() {
        this.stop();
        if (this.#debugging) console.log("to restart", this.funTimeout, this.msTimeout);
        const ourFun = () => {
            this.tmr = undefined;
            this.funTimeout();
        }
        this.tmr = setTimeout(ourFun, this.msTimeout);
    }
    get active() {
        return this.tmr !== undefined;
    }
}


////////////////////////////////////
//// Pos listeners

/*
    The callback function in
        elt.addEventListener("pointermove", ...)
    will be called very many times when the input device is moved.

    To be able to handle this the input device position is saved
    in the callback, but nothing else is done there.

    The saved position is later used by the callback function to
    requestAnimationFrame.
*/

const savedPointerPos = {
    clientX: -1,
    clientY: -1,
    startX: -1,
    startY: -1,
    // Needed by zoom-move:
    pageX: -1,
    pageY: -1,
    startPageX: -1,
    startPageY: -1,
};
Object.seal(savedPointerPos);

let aborter4HasSaved;
let promHasSaved;
setupWait4Saved();
function setupWait4Saved() {
    // if (aborter4HasSaved != undefined) throw Error("abort4HasSaved should be undefined here");
    if (promHasSaved != undefined) throw Error("promHasSaved should be undefined here");
    aborter4HasSaved = new AbortController();
    promHasSaved = new Promise((resolve, reject) => {
        aborter4HasSaved.signal.addEventListener("abort", () => {
            const reason = aborter4HasSaved.signal.reason;
            if (reason == "has saved pos") {
                // console.log(`promHasSaved: abort resolve: ${reason}`);
                resolve(reason);
            } else {
                console.log(`promHasSaved: abort reject: ${reason}`);
                reject(reason);
            }
        });
    });
}

/**
 * 
 * @param {number} clientX 
 * @param {number} clientY 
 * @param {string} color 
 * @param {number} sec 
 */
export function flashPos(clientX, clientY, color, sec) {
    const eltPoint = mkElt("div");
    const sizePx = "10";
    eltPoint.style = `
        z-index: 2147483647;
        position: fixed;
        left: ${clientX}px;
        top: ${clientY}px;
        width: ${sizePx}px;
        height: ${sizePx}px;
        background-color: ${color};
        border-radius: 50%;
        border: 1px solid white;
        outline: solid black 1px;
    `;
    document.body.appendChild(eltPoint);
    setTimeout(() => { eltPoint.remove(); }, sec * 1000);
}
/**
 * 
 * @param {PointerEvent} evt
 */
export function savePointerdownPos(evt) {
    if (evt.type != "pointerdown") {
        debugger; // eslint-disable-line no-debugger
        throw Error(`Expected event type "pointerdown", got "${evt.type}`);
    }
    savePointerPos(evt);
    flashPos(evt.clientX, evt.clientY, "green", 0.7);
}
/**
 * 
 * @param {PointerEvent} evt
 */
export function savePointerPos(evt) {
    // if (!(evt instanceof PointerEvent)) throw Error("Expected PointerEvent");
    const clientX = evt.clientX;
    const clientY = evt.clientY;
    const pageX = evt.pageX;
    const pageY = evt.pageY;
    let fail = isNaN(clientX) || isNaN(clientY) || isNaN(pageX) || isNaN(pageY);
    if (fail) {
        abortPosListeners.abort();
        debugger; // eslint-disable-line no-debugger
        throw Error(`savePointerPos: sXY:${clientX.toFixed(1)},${clientY.toFixed(1)}`);
    }

    savedPointerPos.clientX = clientX;
    savedPointerPos.clientY = clientY;
    savedPointerPos.pageX = pageX;
    savedPointerPos.pageY = pageY;
    switch (evt.type) {
        case "pointermove":
            break;
        case "pointerdown":
            // console.log("savePointerPos pointerDown", clientX, clientY, evt);
            // .signal AbortHandler
            savedPointerPos.startX = clientX;
            savedPointerPos.startY = clientY;
            savedPointerPos.startPageX = pageX;
            savedPointerPos.startPageY = pageY;
            aborter4HasSaved.abort("has saved pos");
            break;
        default:
            const msg = `savePointerPos, ${evt.type}`;
            throw Error(msg);
    }
}
export async function getAndClearStartPointerPos() {
    await promHasSaved;
    const startX = savedPointerPos.startX;
    const startY = savedPointerPos.startY;
    const startPageX = savedPointerPos.startPageX;
    const startPageY = savedPointerPos.startPageY;
    if (
        isNaN(startX)
        ||
        isNaN(startY)
        ||
        isNaN(startPageX)
        ||
        isNaN(startPageY)
    ) throw Error("Did not get all start values");
    savedPointerPos.startX = undefined;
    savedPointerPos.startY = undefined;
    promHasSaved = undefined;
    setupWait4Saved();
    return { startX, startY, startPageX, startPageY };
}
export function getSavedPointerPos() {
    // Don't check anyting here, just return.
    // Client should check in requestAnimationFrame
    return savedPointerPos;
}


// https://x.com/FreyaHolmer/status/1781420147711906284
// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
// https://www.quirksmode.org/m/tests/mouseprops.html
// https://jwood206.medium.com/positioning-with-mouse-events-offset-getboundingclientrect-and-getcomputedstyle-afe12bfcb5f
// https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
// https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
let abortPosListeners;
export function addPosListeners(eltFsm) {
    if (eltFsm) console.warn("eltFsm is not used", eltFsm);
    //// FIX-ME: This seems to have stopped working in Android Chrome (at least in Chrome dev tools)???
    // window.addEventListener("pointermove", savePointerPos);
    // window.addEventListener("pointerdown", savePointerPos);
    //// Try body instead (same problem)
    // document.body.addEventListener("pointermove", savePointerPos);
    // document.body.addEventListener("pointerdown", savePointerPos);
    //// Try getEltFsm (this works also in Android Chrome!)

    // removePosListeners();
    abortPosListeners = new AbortController();
    const opts = {
        signal: abortPosListeners.signal,
        passive: true
    };
    document.addEventListener("pointermove", savePointerPos, opts);
    document.addEventListener("pointerdown", savePointerPos, opts);
}

// https://kettanaito.com/blog/dont-sleep-on-abort-controller
export function removePosListeners() {
    abortPosListeners?.abort();
    abortPosListeners = undefined;
}
window["r"] = removePosListeners; // FIX-ME:





///////////////////////////////////////
/***************** Test cm size on screen */
///////////////////////////////////////

// testCmOnScreen();
window["testCmOnScreen"] = () => {

    ////////// In Google Chrome on Windows:

    // Known by Google Chrome dev tools
    // Width from https://GSMArena.com/
    const knownDevices = {

        //// Works for Pixel 7, devicePixelRatio==2.625, 1/r=0.381
        a: {
            name: "Pixel 7",
            screenMmWidth: 73.2 - 2.54 * 0.17,
            devUA: "(Linux; Android 13; Pixel 7)",
            devicePixelRatio: 2.625,
            corr: 0.670,
            measuredPixelRatio: 2.875,
            measuredCorr: 0.741
        },

        //// Works for Samsung Galaxy S8 Plus, 7.1cm, devicePixelRatio==4, 1/r=0.250
        b: {
            name: "Samsung Galaxy S8+",
            screenMmWidth: 73.4 - 2.54 * 0.08,
            devicePixelRatio: 4,
            devUA: "(Linux; Android 13; SM-G981B)",
            corr: 0.777
        },

        //// Works for Samsung Galaxy S20 Ultra, devicePixelRatio==3.5, 1/r=0.286
        c: {
            name: "Samsung Galaxy S20 Ultra",
            screenMmWidth: 76 - 2.54 * 0.33,
            devicePixelRatio: 3.5,
            devUA: "(Linux; Android 13; SM-G981B)",
            corr: 0.693
        }

    }


    let dev = "none";
    let corr = 1;

    function promptDev(parDev) {
        let txtPrompt = ``;
        for (const [k, v] of Object.entries(knownDevices)) {
            txtPrompt += `  ${k}: ${v.name}\n`;
        }
        return prompt(txtPrompt, parDev);
    }
    while (!Object.keys(knownDevices).includes(dev)) {
        const tmp = promptDev(dev)?.trim();
        if (!tmp) return;
        dev = tmp;
        console.log({ dev });
    }
    const devRec = knownDevices[dev];
    console.log(devRec);

    if (location.protocol == "http:") {
        // Emulating mobile device?
        const re = new RegExp("\\(.*?\\)");
        // @ts-ignore
        const devUA = re.exec(navigator.userAgent)[0];
        console.log({ devUA });
        if (!devRec.devUA) throw Error(`devRec.devUA is not set, should be "${devUA}"`);
        if (devRec.devUA && devRec.devUA != devUA) {
            throw Error(`devUA did not match: w"${devUA}"!=d"${devRec.devUA}"A`);
        }
    }
    if (devRec.devicePixelRatio) {
        const devRatio = devRec.devicePixelRatio;
        const winRatio = window.devicePixelRatio;
        if (devRatio != winRatio) {
            // throw Error(`devicePixelRatio, d${devRatio} != w${winRatio}`);
            alert(`devicePixelRatio, d${devRatio} != w${winRatio}`);
        }
    }


    corr = devRec.corr || corr;
    const devName = devRec.name;
    const devCmW = devRec.screenMmWidth / 10;
    const txtPromptCorr = `
        ${devName}
        Real Width: ${devCmW.toFixed(1)}cm
        devicePixelRatio==${window.devicePixelRatio},

        Correction:
    `;
    const corrTxt = prompt(txtPromptCorr, corr.toFixed(3));
    if (!corrTxt) return;
    corr = corrTxt ? parseFloat(corrTxt) : 0;

    function cm2screenPixels(cm) {
        const dpcm1 = estimateDpcm();
        console.log({ dpcm1 });
        const px = cm * dpcm1 / (window.devicePixelRatio * corr);
        console.log({ cm, px });
        return px;
    }
    function estimateDpcm() {
        let x = 10;
        while (x < 2000) {
            x *= 1.01;
            if (!window.matchMedia(`(min-resolution: ${x}dpcm)`).matches) break;
        }
        const dpcm = x;
        console.log({ dpcm });
        return dpcm;
    }

    function showCmTestGrid(cmGrid, comparePx, compareWhat) {
        const cmPx = cm2screenPixels(cmGrid);
        compareWhat = compareWhat || "Compare: ";
        const eltBg = document.createElement("div");
        // @ts-ignore
        eltBg.style = `
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            opacity: 0.5;
            background-color: red;
            background-image:
                linear-gradient(to right, black 1px, transparent 1px),
                linear-gradient(to bottom, black 1px, transparent 1px);
            background-size: ${cmPx}px ${cmPx}px;
            z-index: 9999;
        `;
        document.body.appendChild(eltBg);

        const dpcm2 = estimateDpcm();
        console.log({ dpcm2 });
        const screenPx = screen.width;
        const screenCm = screenPx / cm2screenPixels(1);
        const bestCorr = corr * devCmW / screenCm;
        let info = `
            ${devName}, Spec screen:${screenPx}px/${devCmW.toFixed(2)}cm
            - corr:${corr}(${bestCorr.toFixed(3)})/${screenCm.toFixed(2)}cm
            --- cm:${cmPx.toFixed(0)}px
            - dpcm:${dpcm2.toFixed(1)}`;
        if (comparePx) info += ` - ${compareWhat}: ${comparePx.toFixed(0)}px`;
        const eltInfo = document.createElement("span");
        eltInfo.textContent = info;
        // @ts-ignore
        eltInfo.style = `
        position: fixed;
        top: 0;
        left: 0;
        display: inline-block;
        padding: 4px;
        background-color: yellow;
        color: black;
        z-index: 9999;
    `;
        const btn = document.createElement("button");
        btn.textContent = "Close";
        btn.addEventListener("click", () => { eltBg.remove(); eltInfo.remove(); });
        btn.style.marginLeft = "20px";
        eltInfo.appendChild(btn);
        document.body.appendChild(eltInfo);
    }

    if (corr) {
        // showCmTestGrid(2);
        setTimeout(() => {
            showCmTestGrid(2);
            console.log({ knownDevices });
        }, 1000);
    }
}


/** 
 * @typedef {Object} searchTree
 * @param {string=} operator
 * @param {string[]} words
*/

// https://www.freecodecamp.org/news/how-to-match-parentheses-in-javascript-without-using-regex/

const string2SearchSym = {};
export const symAdd = Symbol("&");
const ADD = symAdd;
// string2SearchSym["&"] = symAdd;
string2SearchSym["and"] = symAdd;
export const symOr = Symbol("|");
const OR = symOr;
// string2SearchSym["|"] = symOr;
string2SearchSym["or"] = symOr;
export const symNot = Symbol("!");
const NOT = Symbol("!");
// string2SearchSym["!"] = symNot;
string2SearchSym["not"] = symNot;
export const symLpar = Symbol("(");
const LPAREN = symLpar;
// string2SearchSym["("] = symLpar;
string2SearchSym["lPar"] = symLpar;
export const symRpar = Symbol(")");
const RPAREN = symRpar;
// string2SearchSym[")"] = symRpar;
string2SearchSym["rPar"] = symRpar;

// const ourSearchOperators = new Set([symAdd, symOr, symNot]);


export function checkFsmActionAndApply(fsm, action, newData, errHandler) {
    const oldState = fsm.state();
    const allowedActions = fsm.actions(oldState);
    if (!allowedActions.includes(action)) {
        const msgErr = `No action "${action}" in "${oldState}"`;
        console.error(msgErr, "allowed: ", allowedActions, "fsm:", fsm);
        if (!errHandler) {
            // throw Error(`No action "${action}" in "${oldState}"`);
            // throw Error(msgErr);
            return false;
        }
        debugger; // eslint-disable-line no-debugger
        // FIX-ME: How to implement error handling???
        return errHandler(msgErr);
        return false;
    }
    const res = fsm.action(action, newData);
    const newState = fsm.state();
    console.log(`newData==${JSON.stringify(newData)}: ${oldState} '${action}' -> ${newState}`, res);
    return true;
}


/**
 * @typedef {Object} str2searchTree
 * @param {boolean} ok
 * @param {searchTree|undefined} tree
 * @param {string|undefined} errMsg
*/

let look4tokenProblems = false;
const strFsmSearch = `
machine_name   : "Search string lexer";
machine_license: MIT;
machine_comment: "For user given search string, handles (), &, | and !";

start_states: [Start];
end_states: [End];

Start 'space' -> Start;
Start 'chCite' -> InCite;
Start 'ch' -> InWord;

NeedWord 'chCite' -> InCite;

// NeedWord 'space' -> NeedWord;
// NeedWord '(' -> NeedWord;
NeedWord '[space lPar]' -> NeedWord;

// NeedWord '!' -> JustNeedWord;

NeedWord 'not' -> JustNeedWord;

JustNeedWord 'chCite' -> InCite;
JustNeedWord 'space' -> NeedWord;

BeforeWord 'chCite' -> InCite;
BeforeWord 'and' -> BeforeWord_add after 0 => NeedWord;
BeforeWord 'or' -> BeforeWord_or after 0 => NeedWord;
BeforeWord 'not' -> BeforeWord_not after 0 => NeedWord;

InCite 'ch' -> InCite;
InCite 'space' -> BeforeInCite after 0 => InCite;
InCite 'chCite' -> AfterWord;
// InCite 'end' -> End;

AfterWord 'space' -> AfterWord;
AfterWord '[and or not]' -> NeedWord;

AfterWord 'ch' -> InWord;
AfterWord 'chCite' -> InCite;
AfterWord 'end' -> End;

SpaceNeedWord 'space' -> SpaceNeedWord;

NeedWord 'ch' -> InWord;
BeforeWord 'ch' -> InWord;

InWord 'ch' -> InWord;
// InWord 'space' -> AfterWord;
// InWord 'rPar' -> AfterWord;
InWord '[space rPar]' -> AfterWord;
// InWord 'tab' -> AfterWord;
InWord 'end' -> End;
`;






/*
const modJssmTools = await (async () => {
    // debugger;
    // if (!navigator.onLine) return;
    try {
        return await importFc4i("jssm-tools");
    } catch (err) {
        console.log(err);
        // debugger;
    }
})();
*/



function getFsmSearchLexer() {
    // modJssmTools.getFsmMulti(objFsmSearchMulti);
    // const fsm = objFsmSearchMulti.fsm;
    // window["fsmSearch"] = fsm; // For my testing
    const funDummy = (args) => console.log("funDummy", args);
    const fslSearchMulti = new modJssmTools.FslWithArrActions(strFsmSearch, funDummy);
    return fslSearchMulti;
    const fsm = fslSearchMulti._fsm;
    return fsm;
}


/** @typedef {string|symbol} searchToken */

/**
 * Parse a string to a "search tree".
 * 
 * @param {string} str 
 * @returns {searchToken[]|string}
 */
export function string2searchTokens(str) {
    console.groupCollapsed("string2searchToken");
    // const fsmSearch = getFsmSearchLexer();
    const fslSearchMulti = getFsmSearchLexer();
    const fsmSearch = fslSearchMulti._fsm;
    // debugger;

    let word = "";
    const tokens = [];
    let ch;
    const tokensPush = (token, where) => {
        if (typeof token === "string") {
            if (token.length === 0) {
                const state = fsmSearch.state();
                console.warn(`token is "", str=[${str}], state=${state}, tokens:`, tokens);
                return;
            }
        }
        tokens.push(token);
        console.log(`%ctokensPush ${where}: `, "background-color:blue;color:white;padding:4px", token, tokens);
    }

    // fsmSearch.hook_entry("AfterWord", () => { tokensPush(word, "hook_e AfterWord"); word = ""; });
    // fsmSearch.hook_entry("End", () => { tokensPush(word, "hook_e End"); });
    // fsmSearch.hook("AfterWord", "InWord", () => { tokensPush(symAdd, "hook AfterWord InWord"); });
    fsmSearch.hook_any_action(hook_any_action_handler);
    function hook_any_action_handler(hookArgs) {
        // const next_data = hookArgs.next_data;
        const next_data_action = hookArgs.next_data?.action;
        const action = hookArgs.action;
        const from = hookArgs.from;
        const to = hookArgs.to;
        // console.log("%chook_any_action", "background:red;color:black", hookArgs);
        console.log(`%chook_any_action: ${from} ${action},${next_data_action} => ${to};`, "background:red;color:black");
        if (!hookArgs) debugger; // eslint-disable-line no-debugger
        const isTransition = from !== to;
        // const actionIsAfterTransition = isTransition && action == "lPar";
        const ourAction = modJssmTools.FslWithArrActions.getRealAction(hookArgs);
        const state = fsmSearch.state();
        // console.log(`hook_any_action, ${state} '${ourAction}' => ?, args:`, hookArgs);
        if (look4tokenProblems) debugger; // eslint-disable-line no-debugger
        switch (ourAction) {
            case "not":
                console.log("got !, state:", state);
                if (state == "AfterWord") { tokensPush(symAdd, "hook_aah AfterWord"); }
                tokensPush(symNot, "hook_aah AfterWord");
                break;
            case "and":
            case "or":
            case "lPar":
                // case "rPar":
                const sym = string2SearchSym[ourAction];
                if (sym == undefined) debugger; // eslint-disable-line no-debugger
                tokensPush(sym, "hook_aah");
                break;
            case ("ch"):
            case ("space"):
            case ("end"):
                break;
            case "rPar":
                // debugger;
                break;
            default:
                debugger; // eslint-disable-line no-debugger
        }
        if (isTransition) {
            /*
                I can't understand the order of execution of the different hooks.
                So put everyting here. I believe all info needed is here!
            */

            ////////// hook_entry()

            // fsmSearch.hook_entry("AfterWord", () => { tokensPush(word, "hook_e AfterWord"); word = ""; });
            if (to == "AfterWord") { tokensPush(word, "hook_entry AfterWord"); word = ""; };

            // fsmSearch.hook_entry("End", () => { tokensPush(word, "hook_e End"); });
            if (to == "End") { tokensPush(word, "hook_entry End"); };


            ////////// hook_exit()


            ////////// hook()
            // fsmSearch.hook("AfterWord", "InWord", () => { tokensPush(symAdd, "hook AfterWord InWord"); });
            if (to == "InWord" && from == "AfterWord") { tokensPush(symAdd, "hook AfterWord InWord"); };
        }
        switch (ourAction) {
            case "rPar":
                const sym = string2SearchSym[ourAction];
                tokensPush(sym, "hook_aah after transition");
        }
    }


    str = str.trim();
    let action;
    const iter = str[Symbol.iterator]();
    let next;
    while (!(next = iter.next(), next.done)) {
        ch = next.value;
        action = "ch";
        switch (ch) {
            case "&":
                action = "and";
                break;
            case "|":
                action = "or";
                break;
            case "!":
                action = "not";
                break;
            case "(":
                action = "lPar";
                break;
            case ")":
                action = "rPar";
                break;
            case '"':
                action = "chCite";
                break;
            case ' ':
                action = "space";
                const state = fsmSearch.state();
                if (state == "InCite") { action = "ch"; }
                break;
            default:
            // word = word + ch;
        }
        // const res = fslSearchMulti.applyMultiAction(action);
        fslSearchMulti.applyMultiAction(action);
        // console.log("fslSearchMulti", res);
        if (action == "ch") word = word + ch;
    }
    // const res = fslSearchMulti.applyMultiAction("end");
    fslSearchMulti.applyMultiAction("end");
    const finalState = fsmSearch.state();
    if (finalState != "End") {
        console.log("Unfinished search question");
        console.groupEnd();
        return "Unfinished search question";
    }
    console.groupEnd();
    return tokens;
}
// window["s2t"] = string2searchTokens;


/**
 * @callback stringSearchFunction 
 * @param {string} searchString
 * @returns {Set}
 */
/**
 * 
 * @param {searchToken[]} tokens 
 * @param {stringSearchFunction} funStringSearch 
 */
export function doSearch(tokens, funStringSearch) {
    const iter = tokens[Symbol.iterator]();
    let next;
    while (!(next = iter.next(), next.done)) {
        const nextValue = next.value;
        const tofNextValue = typeof nextValue;
        if ("string" == tofNextValue) {
            const str = /** @type {string} */ (nextValue);
            return funStringSearch(str);
        }
        if ("symbol" != tofNextValue) {
            const msg = `Expected typeof to be "symbol", got "${tofNextValue}"`;
            console.error(msg);
            throw Error(msg);
        }
        switch (nextValue) {
            case symAdd:
                break;
            case symOr:
            case symNot:
            case symLpar:
            case symRpar:
            default:
                const msg = `Unexpected symbol: "${String(nextValue)}"`;
                console.error(msg);
                throw Error(msg);
        }
    }
}


/**
 * Test if two arrays are equal
 *  
 * @param {*[]} arrA 
 * @param {*[]|string} arrB 
 * @returns {boolean}
 */
function ArraysAreEqual(arrA, arrB) {
    return (arrA.length === arrB.length) &&
        arrA.every((a, idx) => a === arrB[idx]);
}
async function testString2searchTokens() {
    return;
    function testSearchString(strTested, arrWanted) {
        if (typeof strTested !== "string") throw Error("first param should be string");
        console.log("%ctestSearchString", "background:yellow;color:black;font-size:20px;", `[${strTested}]`);
        const resTest = string2searchTokens(strTested)
        if (!resTest) {
            console.log("%cCould not get tokens", "background:red; color:yellow;");
            // debugger; // eslint-disable-line no-debugger
            return;
        }
        const arrTest = resTest;
        if (!ArraysAreEqual(arrWanted, arrTest)) {
            const msg = `%cbad tokens (${strTested}):\n`;
            console.log(msg, "background:red; color:yellow; font-size:18px;", arrTest, "\nwant:", arrWanted);
            debugger; // eslint-disable-line no-debugger
            return;
        }
        console.log(`%cOK [${strTested}]`, "background:green; color:black; font-size:18px;");
    }
    /*
    testSearchString("aa", ["aa"]);
    testSearchString(" aa ", ["aa"]);
    testSearchString('"aa b"', ["aa b"]);
    testSearchString(' "aa b" ', ["aa b"]);
    testSearchString("aa b", ["aa", symAdd, "b"]);

    testSearchString(' "aa" b ', ["aa", symAdd, "b"]);

    testSearchString("aa  b", ["aa", symAdd, "b"]);
    testSearchString("aa & b", ["aa", symAdd, "b"]);
    testSearchString("aa | b", ["aa", symOr, "b"]);

    testSearchString("aa & ! b", ["aa", symAdd, symNot, "b"]);
    testSearchString("aa !b", ["aa", symAdd, symNot, "b"]);
    testSearchString("aa ! b", ["aa", symAdd, symNot, "b"]);
    */

    testSearchString("aa & (b | c)", ["aa", symAdd, symLpar, "b", symOr, "c", symRpar]);
    // testSearchString("(aa b) | c", ["aa", symAdd, symNot, "b"]);

}

testString2searchTokens(); // debugger; // eslint-disable-line no-debugger



/** 
 * @callback funSearchString
 * @param {string} word
 * @returns {Set}
 * 
 */

/** @typedef {string|Symbol} token */



/*
This parser directly calls the `search` function based on the operator priorities:

1. ** parseExpression:** Starts with the highest - level expression parsing.
2. ** parseOr:** Handles OR operators.
3. ** parseAdd:** Handles ADD operators.
4. ** parseNot:** Handles NOT operators.
5. ** parsePrimary:** Handles string literals and parentheses.

This should provide a more simplified approach while respecting the operator priorities.Let me know if you need any further adjustments!
*/

/**
 * 
 * @param {string} str 
 * @param {funSearchString} funSearch1String
 */

export function searchByComplicatedString(str, funSearch1String) {
    console.log("searchByComplicatedString", str, funSearch1String);
    const tokens = string2searchTokens(str);
    if (typeof tokens == "string") return tokens;
    return searchByTokensStringsAndSymbols(tokens, funSearch1String);
}



// https://docs.google.com/document/d/1x1gJ2gQUdKLhclVt9irn7By5_OLx4Tc9tAT5Ms0b_U0/edit?tab=t.0
// From Microsoft Copilot
function searchByTokensStringsAndSymbols(tokens, funSearch1String) {
    console.warn("searchByTokensStringsAndSymbols", tokens);
    // if (typeof tokens == "string") { mark }
    // const search = funSearch1String;
    return parse(tokens, funSearch1String);

    // Define symbols for operators
    // const OR = Symbol('OR');
    // const ADD = Symbol('ADD');
    // const NOT = Symbol('NOT');
    // const LPAREN = Symbol('LPAREN');
    // const RPAREN = Symbol('RPAREN');

    /**
     * Parses an array of tokens and evaluates them using the search function.
     * @param {Array} tokens - An array of strings and symbols.
     * @returns {Set} - The resulting set after parsing and evaluating.
     */
    function parse(tokens, funSearch1) {
        let iterator = tokens[Symbol.iterator]();
        let current = iterator.next().value;

        /**
         * Advances the iterator to the next token.
         */
        function next() {
            current = iterator.next().value;
        }

        /**
         * Parses the highest-level expression.
         * @returns {Set} - The result of the expression.
         */
        function parseExpression() {
            return parseOr();
        }

        /**
         * Parses OR expressions.
         * @returns {Set} - The result of the OR expression.
         */
        function parseOr() {
            let left = parseAdd();

            while (current === OR) {
                next();
                let right = parseAdd();
                left = new Set([...left, ...right]);
            }

            return left;
        }

        /**
         * Parses ADD expressions.
         * @returns {Set} - The result of the ADD expression.
         */
        function parseAdd() {
            let left = parseNot();

            while (current === ADD) {
                next();
                let right = parseNot();
                left = new Set([...left].filter(x => right.has(x)));
            }

            return left;
        }

        /**
         * Parses NOT expressions.
         * @returns {Set} - The result of the NOT expression.
         */
        function parseNot() {
            if (current === NOT) {
                next();
                let operand = parsePrimary();
                let allItems = new Set(['a', 'b', 'c', 'd', 'e', 'f']); // Example set of all possible items
                return new Set([...allItems].filter(x => !operand.has(x)));
            }

            return parsePrimary();
        }

        /**
         * Parses primary expressions (string literals and parentheses).
         * @returns {Set} - The result of the primary expression.
         */
        function parsePrimary() {
            if (!current) {
                // FIX-ME: search hits are not cleared
                return new Set();
            }
            if (typeof current === 'string') {
                let value = current;
                next();
                return funSearch1(value);
            }

            if (current === LPAREN) {
                next();
                let expression = parseExpression();
                if (current === RPAREN) {
                    next();
                } else {
                    throw new Error('Expected closing parenthesis');
                }
                return expression;
            }

            throw new Error(`Unexpected token: ${JSON.stringify(current)}`);
        }

        return parseExpression();
    }

    function test() {
        // Example usage:
        const tokens = ['a', ADD, 'b', OR, 'c', NOT, 'd'];

        const result = parse(tokens, search);
        console.log(result);

        /**
         * Searches for a string and returns the search result as a Set.
         * @param {string} string - The string to search for.
         * @returns {Set} - The search result as a Set.
         */
        function search(string) {
            // Implement search logic and return a Set
            return new Set([string]); // Example implementation
        }
    }
    test();
}

// https://rosettacode.org/wiki/Binary_search binarySearchLeft
export function binarySearch(arr, value, funCompare, checkSorted = false) {
    if (checkSorted) {
        const arrSorted = arr.toSorted(funCompare);
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arrSorted[i] != arr[i]) throw Error("not sorted!");
        }
    }
    let low = 0;
    let high = arr.length - 1;
    let mid;
    let comp;
    while (low <= high) {
        // invariants: value > A[i] for all i < low value < A[i] for all i > high
        mid = Math.floor((low + high) / 2);
        comp = funCompare(arr[mid], value);
        // if (arr[mid] > value)
        if (comp > 0)
            high = mid - 1;
        // else if (arr[mid] < value)
        else if (comp < 0)
            low = mid + 1;
        else
            return { value, mid };
    }
    // return not_found // value would be inserted at index "low"
    const upperBound = low;
    const lowerBound = high;
    const outSide = lowerBound < 0 || upperBound >= arr.length;
    return { value, lowerBound, upperBound, outSide }; // value would be inserted at index "low"
}

test_binarySearch();
function test_binarySearch() {
    return;
    const arr = [5.5, 7.5, 8.5, 10.5];
    const prxArr = new Proxy(arr, {
        get(arrTarget, prop,) {
            // return 0;
            if (prop == "length") return arrTarget.length;
            return arrTarget[prop] * 1.01;
        }
        // get(arr, idx, ) { return arr[idx]; }
    });
    const stLog = "font-size:20px; background:lightskyblue; color:brown;";
    const at2 = arr[2];
    const prxAt2 = prxArr[2];
    console.log("%cprx", stLog, { at2, prxAt2 });
    const funCompare = (a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
    console.log("%ctest_binarySearch", stLog, arr);
    const res = []
    const arrUse = prxArr;

    res.push(binarySearch(arrUse, 4, funCompare));
    res.push(binarySearch(arrUse, 4.6, funCompare));
    res.push(binarySearch(arrUse, 5.5, funCompare));
    res.push(binarySearch(arrUse, 7.5, funCompare));
    res.push(binarySearch(arrUse, 7.6, funCompare));
    // res.push(binarySearchLeft(arr, 8.5, funCompare));
    res.push(binarySearch(arrUse, 10.5, funCompare));
    res.push(binarySearch(arrUse, 11, funCompare));
    res.push(binarySearch(arrUse, 11.6, funCompare));
    res.push(binarySearch(arrUse, 14.6, funCompare));
    console.log("%ctest_binarySearch", stLog, res);
}


/*
// This was originally from Gemini AI. Totally unusable!
export function mkCollapsibleDiv(divContent) {
    const divCollapsibleContent = mkElt("div", undefined, divContent);
    divCollapsibleContent.classList.add("collapsible-content");
    const divExpandible = mkElt("div", undefined, divCollapsibleContent);
    divExpandible.classList.add("collapsible");
    return divExpandible;
}
function checkCollapsibleDiv(divCollapsible) {
    if (!divCollapsible.classList.contains("collapsible")) {
        const msg = `divCollapsible.classList does not include "collapsible"`;
        console.error(msg, { divExpandible: divCollapsible });
        throw Error(msg);
    }
    const children = [...divCollapsible.children];
    if (children.length == 0) {
        const msg = "divCollapsible.children is empty";
        console.error(msg, { divExpandible: divCollapsible });
        throw Error(msg);
    }
    if (children.length > 1) {
        const msg = `divCollapsible should have just one element child, but has ${children.length}`;
        console.error(msg, { divExpandible: divCollapsible });
        throw Error(msg);
    }
    const divCollapsibleContent = children[0];
    if (!divCollapsibleContent.classList.contains("collapsible-content")) {
        const msg = `divCollapsibleContent.classList does not include "collapsible"`;
        console.error(msg, { divCollapsibleContent });
        throw Error(msg);
    }

}
export function expandCollapsibleDiv(divCollapsible) {
    checkCollapsibleDiv(divCollapsible);
    divCollapsible.classList.add("expanded");
}
export function collapseCollapsibleDiv(divCollapsible) {
    checkCollapsibleDiv(divCollapsible);
    divCollapsible.classList.remove("expanded");
}
export function toggleCollapsibleDiv(divExpandible) {
    checkCollapsibleDiv(divExpandible);
    divExpandible.classList.toggle("expanded");
}
*/

export function mkHeightExpander(eltContent) {
    const divExpanderContent = mkElt("div", { class: "height-expander-content" }, eltContent);
    const divExpander = mkElt("div", { class: "height-expander" }, divExpanderContent);
    return divExpander;
}
function checkIsHeightExpander(divExpander) {
    const tellError = (msg) => {
        console.error(msg);
        debugger; // eslint-disable-line no-debugger
        throw Error(msg)
    }
    if (!divExpander.classList.contains("height-expander")) {
        tellError('divExpander does not have class ".height-expander"');
    }
    const children = divExpander.children;
    const len = children.length;
    if (len != 1) {
        tellError(`divExpander should have 1 child, but have ${len}`);
    }
    const divExpanderContent = divExpander.firstElementChild;
    if (!divExpanderContent.classList.contains("height-expander-content")) {
        tellError('divExpanderContent does not have class ".height-expander-content"');
    }
}
export function isExpandedHeightExpander(divExpander) {
    checkIsHeightExpander(divExpander);
    return divExpander.classList.contains("expanded");
}
export function expandHeightExpander(divExpander) {
    checkIsHeightExpander(divExpander);
    divExpander.classList.add("expanded");
}
export function collapseHeightExpander(divExpander) {
    checkIsHeightExpander(divExpander);
    divExpander.classList.add("expanded");
}
export function toggleHeightExpander(divExpander) {
    checkIsHeightExpander(divExpander);
    divExpander.classList.toggle("expanded");
}


export function getCssTransforms(elt) {
    const style = getComputedStyle(elt);
    const transform = style.transform;
    let x = 0, y = 0, scale = 1;
    if (transform !== "none") {
        const matrix = new DOMMatrixReadOnly(transform);
        // console.log({ matrix });
        scale = matrix.m11;
        x = matrix.m41;
        y = matrix.m42;
    }
    return { scale, x, y }
}

/**
 * This function should just protect me from my worst mistakes.
 * It compares to variables and screens for equality.
 * It does not check for deep equality, but only for shallow equality.
 *  
 * @param {*} varA 
 * @param {*} varB 
 * @returns {boolean}
 */
export function canVarsBeEq(varA, varB) {
    if (varA === varB) return true;
    if (typeof varA !== typeof varB) return false;
    if (varA.constructor.name !== varB.constructor.name) return false;
    if (Object.prototype.toString.call(varA) !== Object.prototype.toString.call(varB)) return false;
    const keysA = Object.keys(varA);
    const keysB = Object.keys(varB);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (varA[key] !== varB[key]) return false;
    }
    if (JSON.stringify(varA) !== JSON.stringify(varB)) return false;
    return true;
}



export function checkIsISOtime(str) {
    const re = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/;
    if (!re.test(str)) {
        const msg = (`"${str}" in not in ISO format`);
        console.error(msg);
        throw Error(msg);
    }
}
export function leftISOtimeMoreRecent(leftTime, rightTime) {
    checkIsISOtime(leftTime);
    checkIsISOtime(rightTime);
    return leftTime > rightTime;
}
// if (!leftISOtimeMoreRecent( (new Date()).toISOString(), (new Date("2000")).toISOString())) { debugger; }
/**
 * 
 * @param {string|undefined} [when]
 * @returns {string}
 */
export function localISOtime(when = undefined) {
    const now = when ? new Date(when) : new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -8)
        .replace("T", " ");
    return localISO;
}

// console.log("localISOtime", localISOtime());


// From Grok. You can't currently link to a Grok chat. 
// The name of the chat is "CSS Transition: Zoom effect".
/**
 * Animates the CSS `zoom` property of an element using requestAnimationFrame,
 * with updates occurring only after a specified millisecond delay to reduce repaints.
 * The animation is stepped (non-smooth) due to the non-interpolatable nature of `zoom`
 * in Chromium-based browsers.
 *
 * @param {HTMLElement} element - The DOM element to animate.
 * @param {number} startZoom - The starting zoom value (e.g., 1 for 100%).
 * @param {number} endZoom - The ending zoom value (e.g., 1.2 for 120%).
 * @param {number} msDuration - The animation duration in milliseconds (e.g., 2000 for 2s).
 * @param {number} [msStep=200] - Milliseconds between repaints (e.g., 200 for ~10 steps over 2s).
 * @returns {{start: Function, cancel: Function}} An object with methods to start or cancel the animation.
 */
export function animateZoom(element, startZoom, endZoom, msDuration, msStep = 200) {
    let animationFrame;
    let lastRepaintTime = null;

    // Cancel any ongoing animation
    function cancel() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        lastRepaintTime = null;
    }

    // Animation logic
    function start() {
        cancel(); // Stop any existing animation
        let currentStep = 0;
        const totalSteps = Math.floor(msDuration / msStep); // Derive steps from msStep
        const stepIncrement = (endZoom - startZoom) / totalSteps;

        function step(currentTime) {
            if (!lastRepaintTime) lastRepaintTime = currentTime;

            const elapsedSinceLastRepaint = currentTime - lastRepaintTime;

            // Only repaint if enough time has passed
            if (elapsedSinceLastRepaint >= msStep) {
                currentStep++;
                const zoomValue = startZoom + stepIncrement * currentStep;
                element.style.zoom = `${zoomValue}`;
                lastRepaintTime = currentTime; // Update last repaint time

                if (currentStep >= totalSteps) {
                    cancel(); // Stop when done
                    return;
                }
            }

            animationFrame = requestAnimationFrame(step);
        }

        animationFrame = requestAnimationFrame(step);
    }

    // Return control methods
    return {
        start,
        cancel
    };
}


/**
 * Compares two objects to check if they have the same keys, including nested objects,
 * recursing only as deep as the first object's structure.
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @param {string[]|undefined} arrMayMiss - array of keys that may be missing in obj2
 * @returns {boolean} True if the objects have the same keys up to the depth of obj1, false otherwise.
 * @example
 * const obj1 = { a: 1, b: { x: 10, y: 20 }, c: 3 };
 * const obj2 = { a: 4, b: { x: 30, y: 40, z: { deeper: 50 } }, c: 6 };
 * console.log(haveSameKeys(obj1, obj2)); // true
 */
export function haveSameKeys(obj1, obj2, arrMayMiss) {
    // Get keys of both objects
    const tellError = (...what) => {
        console.error(`haveSameKeys: `, ...what);
        // logConsole
        debugger; // eslint-disable-line no-debugger
    }
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    // Check if keys are identical
    if (!arrMayMiss) {
        if (keys1.length !== keys2.length || !keys1.every((key, i) => key === keys2[i])) {
            // if (keys1.length !== keys2.length) {
            tellError("Not same keys", keys1, keys2);
            return false;
        }
    } else {
        if (!keys1.every((key, _i) => {
            return arrMayMiss.includes(key) || keys2.includes(key);
        })) {
            tellError("Not same keys 2", keys1, keys2, arrMayMiss);
            return false;
        }
    }

    // Check nested objects recursively, only if obj1's value is an object
    for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        // Only recurse if val1 is an object (and not null)
        if (typeof val1 === 'object' && val1 !== null) {
            // Ensure val2 is an object (and not null) before recursing
            if (typeof val2 !== 'object' || val2 === null) {
                tellError("val2 is not object", val2);
                return false;
            }
            if (!haveSameKeys(val1, val2, undefined)) {
                return false;
            }
        }
    }

    return true;
}


/**
 * @async 
 * @param {string} strCssSpecifier 
 * @returns {Promise<string>}
 */
export async function cssSpecificity(strCssSpecifier) {
    const modSpec = await importFc4i("css-specificity");
    // debugger;
    const c = modSpec.default;
    const [qn] = c.calculate(strCssSpecifier);
    // debugger;
    return qn.toString();
}
window["cssSpecificity"] = cssSpecificity;



// export function logToArray(msg) {
const logQueue = [];

/**
 * A function to "log" your messages to a queue array
 *
 * Example: 
 *   logToQueue('Step 1 complete, value is:', myVariable);
 *   ...your critical, fast-running code here...
 *   logToQueue('Step 2 complete, value is:', myVariable);
 * 
 * @param  {...string} args 
 */
function logToQueue(...args) {
    logQueue.push(args);
}

/**
 * Get and clear the logged items from logToQueue.
 *  
 * @returns {string[]}
 */
function getLogQueue() {
    const arr = [...logQueue];
    logQueue.length = 0;
    return arr;
}

let toShow4bugLogs;
let skipLog4bug = true;
function turnLog4Bug(on) {
    const tofOn = typeof on;
    if (tofOn != "boolean") throw Error(`on is not boolean: ${on}`);
    logQueue.length = 0;
    skipLog4bug = !on;
}
function log4bug(msg, msDelay = 2000) {
    if (skipLog4bug) return;
    logToQueue(msg);
    clearTimeout(toShow4bugLogs);
    toShow4bugLogs = setTimeout(show4bugLogs, msDelay);
}
async function show4bugLogs() {
    toShow4bugLogs = undefined;
    const arr = getLogQueue();
    if (arr.length == 0) return;
    const divDebug = mkElt("div");
    arr.forEach(l => {
        // console.log(`%cLQ: ${l}`, "color:red;");
        const row = mkElt("div", undefined, l);
        divDebug.appendChild(row);
    });
    const h2 = mkElt("h2", undefined, "logQueue debugging");
    h2.style.color = "red";
    const body = mkElt("div", undefined, [
        h2,
        divDebug
    ]);
    const modMdc = await importFc4i("util-mdc");
    modMdc.mkMDCdialogAlert(body);
}

window["fastLog4bug"] = log4bug;
// window["showFastLog4bug"] = show4bugLogs;
window["fastLog4bugTurnOn"] = turnLog4Bug;


export async function setupVirtualKeyboardDetection() {
    await promiseDOMready();
    const modMdc = await importFc4i("util-mdc");

    if ('virtualKeyboard' in navigator) {
        setTimeout(() => {
            // modMdc.mkMDCsnackbar("has virtualKeyboard API");
            // Listen for geometry changes
            // https://gomakethings.com/checking-for-focus-in-an-element-using-css-in-your-javascript/
            // @ts-ignore
            navigator.virtualKeyboard.ongeometrychange = async (event) => {
                // @ts-ignore
                const keyboardRect = navigator.virtualKeyboard.boundingRect;
                const height = keyboardRect.height;
                // const modMdc = await importFc4i("util-mdc");
                modMdc.mkMDCsnackbar(`vk height: ${height}`);
                if (height > 0) {
                    // You can now adjust your UI based on this height
                    vkActiveLocal(true);
                } else {
                    vkActiveLocal(false);
                }
            };
            // modMdc.mkMDCsnackbar("Added geometrychange listener");




            //// According to Google Gemini the Virtual Keyboard API is buggy in a PWA on Android.
            //// Here is a workaround.

            // FIX-ME: MDN says "the visual viewport for a given window, or null if current document is not fully active"
            //   Do they mean "loaded"????
            const vvp = window.visualViewport;
            if (!window.visualViewport) throw Error(`window.visualViewport is "${vvp}"`)
            let initialViewportHeight = window.visualViewport.height;

            // Function to handle layout adjustments based on keyboard visibility
            const handleResize = () => {
                // @ts-ignore
                const currentViewportHeight = window.visualViewport.height;

                // Use a small tolerance to avoid false positives from minor UI changes
                if (Math.abs(currentViewportHeight - initialViewportHeight) > 100) {
                    modMdc.mkMDCsnackbar("Virtual keyboard is likely active.");
                    // Adjust your PWA's layout here.
                    // For example, scroll an element into view or reposition it.
                    vkActiveLocal(true);
                } else {
                    modMdc.mkMDCsnackbar("Virtual keyboard is likely hidden.");
                    // Reset your layout adjustments.
                    vkActiveLocal(false);
                }
            };

            // Listen for viewport size changes
            window.visualViewport.addEventListener('resize', handleResize);

            // Listen for orientation changes to reset the baseline
            window.addEventListener('orientationchange', () => {
                // Reset the initial height after the rotation is complete
                // Use a timeout to ensure the browser has finished resizing the viewport
                setTimeout(() => {
                    // @ts-ignore
                    initialViewportHeight = window.visualViewport.height;
                    console.log("Orientation changed. New initial height:", initialViewportHeight);
                }, 500);
            });
        });

    }
}

window["vkActive"] = vkActiveLocal;
async function vkActiveLocal(active) {
    return;
    const tofActive = typeof active;
    if ("boolean" != tofActive) throw Error(`vkActive: typeof active == "${tofActive}"`);
    const modMdc = await importFc4i("util-mdc");
    if (active) {
        document.documentElement.classList.add("VK_ACTIVE");
        modMdc.mkMDCsnackbar("Virtual keyboard ON");
    } else {
        document.documentElement.classList.remove("VK_ACTIVE");
        modMdc.mkMDCsnackbar("Virtual keyboard OFF");
    }
}



export function getSharedToParams() {
    const parsedUrl = new URL(window.location.href);
    let title = parsedUrl.searchParams.get('title');
    let text = parsedUrl.searchParams.get('text');
    let url = parsedUrl.searchParams.get('url');
    if (!(title || text || url)) {
        console.log("getSharedToParams: not found");
        return;
    }



    //// Suggested workaround for the Chrome intent issue:
    // A simple regex to find URLs in a string
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    // If the `url` parameter is null or doesn't look like a URL...
    let extractedUrl;
    if (!url || !url.startsWith('http')) {
        // Check the `text` parameter for a URL
        const matches = text ? text.match(urlRegex) : null;
        if (matches && matches.length > 0) {
            extractedUrl = matches[0]; // Use the first URL found
            url = extractedUrl;
            text = text.replace(url, "").trim();
        }
    }

    // Fallback logic for missing title.
    if (!title) {
        if (text.length > 0) {
            const words = text.split(' ');
            title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
        }
        if (!title) {
            if (url) {
                title = url.split('/')[2] || receivedUrl; // Use the domain or full URL
            }
        }
        title = title || 'New Share (unkown title)';
    }




    // if (title || text || url) { window.sharedTo = { title, text, url }; }
    return { title, text, url };

}

/**
 * https://copilot.microsoft.com/shares/EFYNwKi2iEJTtMx6SzSXH
 *  
 * @param {string} errorMessage 
 * @param {string} strJson 
 * @returns {Object}
 */
export function extractJSONparseError(errorMessage, strJson) {
    const match = errorMessage.match(/position (\d+)/);
    if (!match) return { success: false, message: "Could not extract error position." };

    const pos = parseInt(match[1], 10);

    // Extract context
    const before = strJson.slice(Math.max(0, pos - 49), pos);
    const errorChar = strJson[pos] || '*END*';
    const after = strJson.slice(pos + 1, pos + 50);

    // Line and column
    const lines = strJson.slice(0, pos).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    return {
        success: false,
        errorPosition: pos,
        line,
        column,
        context: {
            before,
            errorChar,
            after
        }
    };
}


/**
 * Change line endings to line feed char.
 * 
 * @param {string} str 
 * @returns {string}
 */
export function normalizeLineEndings(str) {
    const lf = '\n';
    let strWithLf = str.replaceAll(/\r?\n/g, lf);
    return strWithLf.replaceAll(/\r/g, lf);
}


/**
 * Auto-grow textarea.
 * https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
 * 
 * @param {HTMLTextAreaElement} textarea 
 */
export function mkTextareaGrowWrap(textarea) {
    const parent = textarea.parentNode;
    if (!parent) throw Error("textarea.parentNode is null");
    if (!(parent instanceof HTMLDivElement)) throw Error("textarea.parentNode is not <DIV>");
    // Check parent has .grow-wrap etc
    if (!parent.classList.contains("grow-wrap")) throw Error("textarea parent does not have class .grow-wrap");
    textarea.setAttribute("rows", "1");
    // const replicate = () => { textarea.parentNode.dataset.replicatedValue = textarea.value; };
    const replicate = () => { parent.dataset.replicatedValue = textarea.value; };
    textarea.addEventListener("input", () => { replicate(); });
    if (textarea.value.length > 0) replicate();
}


/**
 * Return true if a popup message in the app will be visible to the user.
 *  
 * @returns {boolean}
 */
export function appCanShowNotificationItself() {
    // Check if document is visible and has focus
    const canShow = document.hasFocus() && document.visibilityState === 'visible';
    console.log("%cappCanShowNotificationItself", "color:red;", canShow);
    return canShow;
}
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
    }
    return true;
}

/**
 * Show notification
 * @param {string} title 
 * @param {string} body 
 */
export async function showNotification(title, body) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        alert('Notifications are disabled or not supported.');
        return;
    }

    console.warn("reg notification", { title, body });
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
        // Works only on desktop, not on Android:
        new Notification(title, {
            body: body,
            // @ts-ignore
            icon: makeAbsLink('./img/mm4i.svg'),
        });
        return;
    }
    const options = {
        body: body,
        // @ts-ignore
        icon: makeAbsLink('./img/mm4i.svg'),
    }
    reg.showNotification(title, options);
}

// _testNotification();
async function _testNotification() {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        alert('Notifications are disabled or not supported.');
        return;
    }

    console.log('Starting task...');
    // Simulate a time-consuming task (e.g., 5 seconds)
    setTimeout(() => {
        console.log('Task completed!');
        // Show client-side notification
        new Notification('Task Complete', {
            body: 'Test notification task has finished!',
            // icon: '/icon.png', // Optional: Path to an icon
            // icon: './mm4i/img/mm4i.svg', // Optional: Path to an icon
            // icon: '/mm4i/img/mm4i.svg', // Optional: Path to an icon
            // @ts-ignore
            icon: makeAbsLink('./img/mm4i.svg'), // Optional: Path to an icon
        });
    }, 10 * 1000);
}

// Example: Start task when a button is clicked
// document.getElementById('startTaskButton').addEventListener('click', startTask);



/**
 * Checks the element and all of its ancestors for an overflow value
 * that allows scrolling (auto | scroll).
 *
 * @param {Element} elt - The element to start from (must be in the DOM)
 * @returns {{
 *   hasScrollableAncestor: boolean,
 *   firstScrollableAncestor: Element|null,
 *   matchingStyle: string|null   // e.g. "auto", "scroll"
 * }}
 */
export function getScrollableAncestorInfo(elt) {
    // Guard – make sure we really have an element in the document
    if (!elt || !(elt instanceof Element) || !document.contains(elt)) {
        return { hasScrollableAncestor: false, firstScrollableAncestor: null, matchingStyle: null };
    }

    let current = elt;
    const overflowProps = ['overflow', 'overflow-y', 'overflow-x'];

    while (current && current !== document.documentElement) {
        const style = window.getComputedStyle(current);

        for (const prop of overflowProps) {
            const value = style.getPropertyValue(prop).trim();
            if (value === 'auto' || value === 'scroll') {
                return {
                    hasScrollableAncestor: true,
                    firstScrollableAncestor: current,
                    matchingStyle: value   // the exact value that matched
                };
            }
        }

        // Move up – skip shadow roots for now (they need special handling)
        current = current.parentNode;
        // `parentNode` can be a DocumentFragment in shadow DOM; stop there.
        if (!current || current.nodeType !== Node.ELEMENT_NODE) break;
    }

    // Finally check <html> (documentElement) – it can also be the scroller
    const htmlStyle = window.getComputedStyle(document.documentElement);
    for (const prop of overflowProps) {
        const value = htmlStyle.getPropertyValue(prop).trim();
        if (value === 'auto' || value === 'scroll') {
            return {
                hasScrollableAncestor: true,
                firstScrollableAncestor: document.documentElement,
                matchingStyle: value
            };
        }
    }

    return { hasScrollableAncestor: false, firstScrollableAncestor: null, matchingStyle: null };
}




/////////////////////////////////////////////////
// Below are some function suggestedd by Grok to
// get around the problem that AI:s now can't access
// web content.
// Some suggestions are bad, other good...

/**
 * (Grok's version)
 * Returns a URL with a unique nocache parameter (ms timestamp).
 * Works with any base URL (with or without existing query string).
 * 
 * @param {string} url 
 * @returns {string}
 */
export function addCacheBuster(url) {
    const ts = Date.now();                     // e.g. 1731671045123
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}nocache=${ts}`;
}

/**
 * Generate a URL-safe random parameter name: [a-zA-Z][a-zA-Z0-9_]{7,}
 * e.g., "xK9pM2qR", "var_7aBcDeF"
 * 
 * @returns {string}
 */
export function generateSafeParamName() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    let name = '';

    // First char: letter only
    name += chars.charAt(Math.floor(Math.random() * 52)); // a-z or A-Z

    // Next 7–12 chars: any safe char
    const length = 7 + Math.floor(Math.random() * 6); // 7 to 12
    for (let i = 0; i < length; i++) {
        name += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return name;
}


/**
 * Add cache-buster with safe random param name + timestamp
 * e.g., ?xK9pM2qR=1731671045123
 * 
 * @param {string} url 
 * @returns {string}
 */
export function addSafeCacheBuster(url) {
    const paramName = generateSafeParamName(url);
    const timestamp = Date.now();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramName}=${timestamp}`;
}
// Example usage:
// const safeUrl = addSafeCacheBuster('https://example.com/article');
//  console.log(safeUrl);
// → https://example.com/article?xK9pM2qR=1731671045123

/**
 * @typedef {Object<string, string>} ShallowJsonObject
 */

/**
 * @typedef {ShallowJsonObject} UrlProxies
 * property {string} allorigins
 * property {string} corsproxy
 * property {string} corssh
 */
/** @type {UrlProxies} */
const urlProxies = {
    // Working
    // corsproxy: 'https://corsproxy.io/?',

    // mm4i: "https://mm4i.vercel.app/api/proxy?url=",
    mm4i: "https://mm4i.vercel.app/api/proxy",


    // cors.sh needs an API key
    // corssh: 'https://cors.sh/', // rejected 2025-11-17

    // allorigins: 'https://api.allorigins.win/get?url=', // rejected 2025-11-17, sr.se
    // allorigins: 'https://api.allorigins.win/raw?url=',  // receted 2025-11-25, sr.se

    // temporary demo, key needed
    // CORS_Anywhere: "https://cors-anywhere.herokuapp.com/",


    // Codetabs: "https://api.codetabs.com/v1/proxy?quest=",
    // Corsfix: "https://corsproxy.io/?",
    // Thebugging: "https://thebugging.com/cors-proxy/",
    // Corsx2u: "https://corsx2u.in/",
};

const nameProxies = Object.keys(urlProxies);

/**
 * 
 * @param {string} url 
 * @param {Object} opts 
 * @returns {Promise<Response>}
 * @throws
 */
async function OLDfetchResponseViaCORSproxy(url, opts = {}) {
    const proxy = opts.proxyName || "mm4i";
    const signal = opts.signal;
    if (!nameProxies.includes(proxy)) throw new Error(`Unknown proxy: ${proxy}. Use: ${nameProxies.join(", ")}`);

    /** @type {HeadersInit} */
    const headers = {
        'Cache-Control': 'no-cache',
        cache: 'no-store',
    };
    /** @type {RequestInit} */
    const reqInit = {
        headers,
    }
    if (signal) reqInit.signal = signal;

    const proxyAtVercel = urlProxies[proxy];
    // const proxyToUse = isVercelDev() ? "http://localhost:8090/api/proxy?url=" : proxyAtVercel;
    const proxyToUse = proxyAtVercel;

    const encoded = encodeURIComponent(url);
    const urlProxied = proxyToUse + encoded;

    console.log(`%cFetching via ${proxy}: `, "background-color:blue;color:white;", url, urlProxied, headers);

    let res;
    try {
        res = await fetch(urlProxied, reqInit);
        // res = await fetch(urlProxy);
        if (!res.ok) {
            // We do not have to use "cause" here now, but it is better in case we refactor this code.
            throw new Error(`Proxy ${proxy} failed: ${res.status}`,
                {
                    cause: {
                        httpsStatus: res.status
                    }
                }
            );
        }
    } catch (err) {
        if (err instanceof Error) {
            const httpsStatus = err.cause?.httpsStatus;
            if (!httpsStatus) { throw err; }
            console.error(`%c${err.message} fetchResponseViaProxy`, "color:red;", urlProxied, reqInit);
        } else {
            throw err;
        }
    }
    return res;
}

// New version suggested by Claude:
export async function fetchResponseViaCORSproxy(url, opts = {}) {
    const proxy = opts.proxyName || "mm4i";
    const signal = opts.signal;
    if (!nameProxies.includes(proxy)) throw new Error(`Unknown proxy: ${proxy}. Use: ${nameProxies.join(", ")}`);

    /** @type {HeadersInit} */
    const headers = {
        'Cache-Control': 'no-cache',
        cache: 'no-store',
    };

    // Merge in any headers from opts
    if (opts.headers) {
        Object.assign(headers, opts.headers);
    }

    /** @type {RequestInit} */
    const reqInit = {
        headers,
    }
    if (signal) reqInit.signal = signal;

    const proxyAtVercel = urlProxies[proxy];
    const proxyToUse = proxyAtVercel;
    // const encoded = encodeURIComponent(url);
    // const urlProxied = proxyToUse + encoded;

    const u = new URL(proxyToUse);
    u.searchParams.set("url", url);
    const urlProxied = u.href;
    // console.log(`%cFetching via ${proxy}: `, "background-color:blue;color:white;", url, urlProxied, headers);

    let res;
    try {
        res = await fetch(urlProxied, reqInit);

        // Log the response for debugging
        console.log(`%cCORS Proxy Response:`, "color:magenta;", {
            status: res.status,
            ok: res.ok,
            statusText: res.statusText,
            url: res.url
        });

        // IMPORTANT: Return the response even if not OK
        // Let the calling function decide how to handle it
        return res;

    } catch (err) {
        // Only network errors should be caught here (connection refused, DNS failure, etc.)
        console.error(`%cCORS Proxy Network Error:`, "background:red;color:white;", err);
        throw new Error(`CORS Proxy ${proxy} network error: ${err.message}`, {
            cause: err
        });
    }
}




/**
 * Fetches URL via CORS proxy.
 * 
 * @param {string} url - The article URL to fetch
 * @param {Object} [opts]
 * @param {string} [opts.proxyName]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string>} HTML string
 */
export async function fetchFreshViaCORSproxy(url,
    opts = {}
) {
    const res = await fetchResponseViaCORSproxy(url, opts);

    // allorigins returns { contents: "HTML..." }
    /*
    if (proxy === 'allorigins') {
        const data = await res.json();
        return data.contents || '';
    }
    */

    // corsproxy.io and cors.sh return raw HTML
    return await res.text();
}
export async function testFetchCORSproxy(url = "https://sr.se") {
    const keys = nameProxies;
    console.log("%ctestFetchProxy", "font-size:24px", url, keys);
    /** @type {Record<string, Promise<string>>} */
    const prom = {};
    // Populate prom with promises for each proxy
    for (const k of keys) {
        const aborter = new AbortController();
        setTimeout(() => {
            // return;
            console.log("%cABORTING >>>", "color:red", k);
            aborter.abort("Testing .abort");
            console.log("%cABORTING done", "color:red", k);
        }, 100);
        const signal = aborter.signal;
        prom[k] = fetchFreshViaCORSproxy(url, { proxyName: k, signal });
    }
    // prom["DEFAULT"] = fetchFreshViaProxy(url);
    // Promise.allSettled expects an iterable (array) of promises
    const res = await Promise.allSettled(Object.values(prom));
    console.log({ res });
    for (let i = 0; i < res.length; i++) {
        const key = keys[i] || "DEFAULT";
        const result = res[i];
        console.log({ result });
        const status = result.status;
        const value = result.value;
        const reason = result.reason;
        console.log({ reason });
        // const html = "none yet"; // cleanHtml(value);
        const isRejected = status == "rejected";
        // const html = isRejected ? "REJECTED-html" : cleanHtml(value).slice(0, 1000);
        const html = isRejected ? "REJECTED-html" : value.slice(0, 300);
        const title = isRejected ? "REJECTED-title" : value.match(/<title[^>]*>([^<]+)<\/title>/)[1];

        console.log("---> ", key, status, `\n"${title}"\n`, html);
        console.log({ result });
    }
    return res;
}

/**
 *  @param {UnblockStatus} [unblockData]
 */
export async function dialogUnblockerAPIkey(unblockData) {
    console.log("dialogUnblockerAPIkey", unblockData);
    debugger;
    const modMdc = await importFc4i("util-mdc");
    let btnOK;
    const inp = settingFetchItSerpKey.getInputElement();
    inp.addEventListener("input", evt => {
        if (inp.value.length > 15) {
            btnOK.inert = false;
        } else {
            btnOK.inert = true;
        }
    });
    const aSerpGetKey = mkElt("a", {
        href: "https://www.scrapeunblocker.com/serp",
        target: "_blank"
    }, "get/see serp API key");
    const lblAPIkey = mkElt("label", undefined, [
        mkElt("span", undefined, [
            "Your serp key, (",
            aSerpGetKey,
            "):"
        ]),
        inp
    ]);
    lblAPIkey.style.display = "flex";
    lblAPIkey.style.flexDirection = "column";

    const eltPublisherInner =
        mkElt("div", undefined,
            `
            The publisher probably just wanted to block so called "scraper" programs
            that collects a lot of data from their web pages.
            The publisher had no way to recognize it was only you.
            (Technically there is no good way to handle that today.)
            `);
    eltPublisherInner.style = `
            background-color: blue;
            color: white;
            padding: 10px;
            border-radius: 8px;
            margin-left: 15px;
    `;

    const eltPublisherWhy = mkElt("span", undefined, "Why did they do that?");
    eltPublisherWhy.style = `
            background-color: blue;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
    `;
    const eltPublisherDilemma =
        mkElt("p", undefined,
            mkElt("details", undefined, [
                mkElt("summary", undefined, eltPublisherWhy),
                eltPublisherInner,
            ]));
    const errMsg = (() => {
        if (!unblockData) return;
        return (unblockData.errorMessage.replaceAll(/\n/g, " ")).trim();
    })();
    const errStatus = (() => {
        if (!unblockData) return;
        return unblockData.status;
    })();
    const eltUserInfo = (() => {
        if (!unblockData) {
            return mkElt("p", undefined,
                `
                    We try to get around this with an "unblocker" service.
                    MM4I supports the "serp" unblocker service but currently you have to
                    use your own API key for the service.
                `);
        }
        if (unblockData.unauthorized) {
            return mkElt("p", undefined, [
                `We called the serp unblocker, but got "${errMsg}", ${errStatus}. Your serp API key is invalid.`
            ]);
        }
        if (unblockData.quotaExceeded) {
            return mkElt("p", undefined, [
                `We called the serp unblocker, but got "${errMsg}", ${errStatus}. Your serp API key quota is exceeded. (Quota is reset monthly.)`
            ]);
        }
        return mkElt("p", undefined, `(There is something wrong here: "${errMsg}", ${errStatus}`);
    })();

    const btnClipboard = mkElt("button", undefined, "Click me when it is there!");
    btnClipboard.style = `
        padding: 4px;
        border-radius: 8px;
        background: greenyellow;
        cursor: pointer;
    `;
    const eltClipboard = mkElt("p", undefined, [
        mkElt("div", undefined, "As a workaround you can copy the web page to the clipboard:"),
        btnClipboard,
    ]);

    let dlgOuter;
    /** @type {string|undefined} */
    let clipboardText;
    btnClipboard.addEventListener("click", async evt => {
        console.log("btnClipboard click", { dlgOuter });
        evt.stopPropagation();
        const eltTextArea = mkElt("textarea");
        const btnGo = modMdc.mkMDCdialogButton("Call AI", "call-ai", true);
        const btnCancel = modMdc.mkMDCdialogButton("Cancel", "cancel", true);
        const arrBtns = [
            btnGo,
            btnCancel
        ];
        const eltActions = modMdc.mkMDCdialogActions(arrBtns);
        const body = mkElt("div", undefined, [
            mkElt("h2", undefined, "Paste web page from clipboard"),
            eltTextArea,
        ]);
        const dlg = await modMdc.mkMDCdialog(body, eltActions);
        const txt = await new Promise((resolve) => {
            /*
            dlg.dom.addEventListener("MDCDialog:closing", errorHandlerAsyncEvent(async (evt) => {
            }));
            */
            dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
                const action = evt.detail.action;
                switch (action) {
                    case "call-ai":
                        resolve(eltTextArea.value.trim());
                        break;
                    case "close":
                        resolve(null);
                        break;
                    default:
                        throw Error(`error in mdc dialog, action is ${action}`)
                }
            }));
        });

        clipboardText = txt;
        dlgOuter.mdc.close();
    });
    eltClipboard.style = `
        background-color: yellowgreen;
        padding: 15px;
        border-radius: 8px;
    `;

    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "NEW Publisher blocked access"),
        mkElt("p", undefined, [
            eltPublisherDilemma,
            eltUserInfo,
        ]),
        eltClipboard,
        mkElt("p", undefined, [
            lblAPIkey
        ]),
    ]);

    const btnClose = modMdc.mkMDCdialogButton("Close", "confirm", true);
    const arrBtns = [btnClose];
    const eltActions = modMdc.mkMDCdialogActions(arrBtns);
    dlgOuter = await modMdc.mkMDCdialog(body, eltActions);
    return await new Promise((resolve) => {
        /*
        dlg.dom.addEventListener("MDCDialog:closing", errorHandlerAsyncEvent(async (evt) => {
            // evt.stopPropagation();
            if (funCheckSave) console.warn("MDCDialog:closing", evt);
            if (funCheckSave) {
                if (funCheckSave(false)) {
                    const confirmed = await mkMDCdialogConfirm("You have made changes. Do you want to save them?", "save", "discard");
                    console.log({ confirmed });
                    funCheckSave(true);
                }
            }
        }));
        */
        dlgOuter.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            // if (funCheckSave) console.warn("MDCDialog:closed", evt);
            if (clipboardText) {
                console.log("BEFORE resolve cliboardText");
                resolve(clipboardText);
                // debugger;
                return;
            }
            const action = evt.detail.action;
            switch (action) {
                case "confirm":
                    resolve(true);
                    // resolve(funResolve());
                    break;
                case "close":
                    resolve(false);
                    break;
                default:
                    throw Error(`error in mkMDCdialogConfirm, action is ${action}`)
            }
        }));
    });

}

/** @type {UnblockStatus|undefined} */
let statusUnblock;

/**
 *
 *  @typedef {Object.<string, any>} UnblockStatus
 *  @property {number} status
 *  @property {string} errorMessage
 *  @property {boolean} quotaExceeded
 *  @property {boolean} unauthorized
 */

// This version lets the CORS proxy call serp
async function fetchResponseViaUnblocker(url, opts = {}) {
    console.log(`%cFetching via unblocker: `, "background-color:blue;color:white;", url);
    statusUnblock = undefined;


    let n = 0;
    while (n++ < 10) {
        const apiKey = settingFetchItSerpKey.valueS;
        if (!apiKey) {
            // throw new Error("ScrapeUnblocker API key not set");
            const ans = await dialogUnblockerAPIkey();
            // if (!ans) return;
            // continue;
            if (ans) return ans;
            continue;
        }

        console.log("%cAPI Key exists:", "color:purple;", !!apiKey);

        // Just pass the original URL with serpKey parameter - proxy handles the rest!
        const params = new URLSearchParams({
            url: url,
            // serpKey: apiKey
            serpKey: "BAD-KEY"
        });

        const proxyUrl = urlProxies["mm4i"]; // or whatever your proxy is
        const urlWithSerp = `${proxyUrl}?${params.toString()}`;

        console.log("%cCalling proxy with serpKey", "color:orange;");

        const reqInit = {
            headers: {
                'Cache-Control': 'no-cache',
                'cache': 'no-store',
            }
        };
        if (opts.signal) reqInit.signal = opts.signal;

        let resp;

        try {
            console.log("%cAttempting CORS proxy with serpKey", "color:green;font-weight:bold;");
            resp = await fetch(urlWithSerp, reqInit);
        } catch (err) {
            console.error("%cProxy failed:", "color:red;font-weight:bold;", err);
            debugger;
            throw err;
        }
        console.log("%cProxy response:", "color:green;", {
            status: resp.status,
            ok: resp.ok
        });
        if (resp.ok) return resp;
        const status = resp.status;
        const errorMessage = await resp.text();
        console.log({ errorMessage });
        const quotaExceeded = errorMessage.startsWith("Quota exceeded\n");
        const unauthorized = errorMessage.startsWith("Unauthorized\n")

        /** @type {UnblockStatus} */
        statusUnblock = {
            status,
            errorMessage,
            quotaExceeded,
            unauthorized,
        };
        console.log("BEFORE return fetchResponseViaUnblocker");
        return;
        // continue;

    }
    // ... rest of your error handling code

    return res;
}


export async function test_unblocker() {
    const urlNeedsUnblocker =
        "https://scitechdaily.com/challenging-long-held-theories-evolution-isnt-one-and-done-new-study-suggests/";
    // test_fetchIt(urlNeedsUnblocker);
    const txt = await fetchIt(urlNeedsUnblocker);
}



/**
 * Fetches https response via unblocker
 * 
 * @param {string} url - The article URL to fetch
 * @param {Object} [opts]
 * param {string} [opts.proxyName]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string|undefined>} HTML string
 */

async function fetchPageViaUnblocker(url, opts) {
    // return; // FIX-ME:
    try {
        const response = await fetchResponseViaUnblocker(url, opts);
        if (typeof response == "string") return response;
        // if (response == undefined) throw Error("respone == undefined (from fetchResponseViaProxy");
        console.log("AFTER fetchResponseViaUnblocker");
        if (response == undefined) return;
        // response.headers.forEach(h => console.log("unblocker h", h));
        if (!response.ok) {
            throw new FetchItError(`Unblocker failed, status ${response.status} `)
        }
        const content = await response.text();
        return content;
    } catch (err) {
        console.log({ err });
        debugger;
    }
}
// https://scitechdaily.com/challenging-long-held-theories-evolution-isnt-one-and-done-new-study-suggests/



/**
 * Get text from html.
 *  
 * @param {string} html 
 * @returns {string}
 */
export function cleanHtml(html) {
    const html1space = html.replace(/\s+/g, ' ');
    debugger;
    return html1space
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<link[\s\S]*?<\/link>/gi, '')
        .replace(/<link[\s\S]*?\/>/gi, '')

        // .replace(/<meta[\s\S]*?<\/meta>/gi, '')
        // .replace(/<meta[\s\S]*?\/>/gi, '')

        // It looks like a very bad suggestion to remove the tags
        // before giving the content to an AI.
        // There is structure in the HTML that can be used.
        // .replace(/<[^>]*>/g, ' ')  // Strip all tags
        .trim();
}

/**** START of Grok very bad suggestions for YouTube
 * 
 * None of those suggestions worked!
 * I believe they came from Grok reading and depending on old, outdated material.
 * I consider it a major flaw in the construction of Grok. Of course.


/**
 * Browser-only YouTube caption fetcher
 * Works on ANY website (cross-origin)
 * Uses corsproxy.io (supports POST)
 * /
export async function getYouTubeCaptionsBrowser1(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // === 1. Extract video ID ===
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
                videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
        } else {
            videoId = urlOrId;
        }
        if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
    } catch (e) {
        throw new Error('Parse error: ' + e.message);
    }

    console.log('Video ID:', videoId);

    // === 2. Innertube API via CORS proxy (supports POST) ===
    const endpoint = 'https://www.youtube.com/youtubei/v1/player';
    const apiKey = 'AIzaSyAO_FJ2SlqU8Q4STEKL512S2PIv4M9r8o0';
    const clientVersion = '2.20251115.00.00';

    const body = {
        context: { client: { clientName: 'WEB', clientVersion, hl: 'en' } },
        videoId
    };

    // Use corsproxy.io with POST support
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(`${endpoint}?key=${apiKey}`);

    const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://example.com'  // Required by some proxies
        },
        body: JSON.stringify(body),
        cache: 'no-store'
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API failed: ${res.status} — ${err}`);
    }

    const data = await res.json();
    const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (tracks.length === 0) {
        console.warn('No captions available');
        return { captions: [], selected: null, transcript: '' };
    }

    const captions = tracks.map(t => ({
        language: t.languageCode,
        name: t.name?.simpleText || t.languageCode,
        kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
        baseUrl: t.baseUrl
    }));

    // === 3. Select caption ===
    let selected = null;
    if (index !== null && index >= 0 && index < captions.length) {
        selected = captions[index];
    } else if (name) {
        selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
    } else {
        const matches = captions.filter(c => c.language === language);
        selected = matches.length > 0
            ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
            : captions[0];
    }

    // === 4. Fetch transcript via proxy ===
    let transcript = '';
    if (selected) {
        const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
        const tProxy = 'https://corsproxy.io/?' + encodeURIComponent(transcriptUrl);
        const tRes = await fetch(tProxy, { cache: 'no-store' });
        if (tRes.ok) {
            const tData = await tRes.json();
            transcript = tData.events
                ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
                .filter(Boolean)
                .join(' ') || '';
        }
    }

    return { captions, selected, transcript };
}
/**
 * Fixed browser YouTube caption fetcher (watch page method, CORS-safe)
 * Works on ANY website
 * /
export async function getYouTubeCaptionsBrowser2(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // Extract video ID
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
      videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
    } else {
      videoId = urlOrId;
    }
    if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
  } catch (e) {
    throw new Error('Parse error: ' + e.message);
  }

  console.log('Video ID:', videoId);

  // Fetch watch page (CORS-friendly)
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(watchUrl, {
    cache: 'no-store',
    headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,* /*;q=0.8' }
  });

  if (!res.ok) throw new Error(`Watch page failed: ${res.status} ${res.statusText}`);
  const html = await res.text();

  // Extract player config with regex (robust for HTML)
  const configMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (!configMatch) throw new Error('Player config not found in page HTML');
  let data;
  try {
    data = JSON.parse(configMatch[1]);
  } catch (e) {
    throw new Error('JSON parse failed: ' + e.message);
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // Select caption
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // Fetch transcript
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tRes = await fetch(transcriptUrl, { cache: 'no-store' });
    if (tRes.ok) {
      const tData = await tRes.json();
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    } else {
      console.warn('Transcript fetch failed:', tRes.status);
    }
  }

  return { captions, selected, transcript };
}

/**
 * QUIC-Proof YouTube caption fetcher (uses cors.sh proxy)
 * Works on ANY website, cross-origin
 * Tested in Sweden, 10:41 PM CET
 * /
export async function getYouTubeCaptionsBrowser3(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // Extract video ID (same)
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
      videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
    } else {
      videoId = urlOrId;
    }
    if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
  } catch (e) {
    throw new Error('Parse error: ' + e.message);
  }

  console.log('Video ID:', videoId);

  // Fetch watch page via cors.sh proxy (TCP-only, no QUIC)
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const proxyUrl = `https://cors.sh/${encodeURIComponent(watchUrl)}`;  // Simple prefix for cors.sh
  const res = await fetch(proxyUrl, {
    cache: 'no-store',
    headers: { 'Accept': 'text/html,* /*;q=0.8' }
  });

  if (!res.ok) throw new Error(`Proxy failed: ${res.status} ${res.statusText}`);
  const html = await res.text();  // cors.sh returns raw HTML

  // Extract player config
  const configMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (!configMatch) throw new Error('Player config not found');
  let data;
  try {
    data = JSON.parse(configMatch[1]);
  } catch (e) {
    throw new Error('JSON parse failed: ' + e.message);
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // Select caption
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // Fetch transcript via same proxy
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tProxyUrl = `https://cors.sh/${encodeURIComponent(transcriptUrl)}`;
    const tRes = await fetch(tProxyUrl, { cache: 'no-store' });
    if (tRes.ok) {
      const tText = await tRes.text();
      const tData = JSON.parse(tText);  // Raw JSON from proxy
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    }
  }

  return { captions, selected, transcript };
}

/**
 * Fetch YouTube video content (transcript + description) for summarization.
 * @param {string} ytUrl - YouTube URL or video ID
 * @returns {Promise<{title: string, description: string, transcript: string, fullText: string}>}
 * /
export async function fetchYouTubeContent(ytUrl) {
    // Extract video ID
    let videoId;
    if (ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be')) {
        const url = new URL(ytUrl.includes('youtu.be') ? `https://youtu.be/${ytUrl}` : ytUrl);
        videoId = url.searchParams.get('v') || ytUrl.split('/').pop();
    } else {
        videoId = ytUrl; // Assume it's already ID
    }
    if (!videoId) throw new Error('Invalid YouTube URL');

    console.log('Video ID:', videoId);

    try {
        // Step 1: Fetch metadata (title, description) via Innertube API
        const metadataUrl = `https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEKL512S2PIv4M9r8o0&prettyPrint=false`;
        const metadataBody = JSON.stringify({
            context: { client: { clientName: 'WEB', clientVersion: '2.20251115.00.00', hl: 'en' } },
            videoId: videoId,
            params: 'eW91dHViZV9pbnRlcm5hbF9wbGF5ZXJfdG9rZW4=' // Base64 for player config
        });

        const metadataRes = await fetch(metadataUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: metadataBody,
            cache: 'no-store'
        });

        if (!metadataRes.ok) throw new Error('Metadata fetch failed');
        const metadata = await metadataRes.json();

        const title = metadata.videoDetails?.title || 'No title';
        const description = metadata.videoDetails?.shortDescription || 'No description';

        // Step 2: Fetch transcript (if captions available)
        let transcript = '';
        const captionTracks = metadata.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        if (captionTracks.length > 0) {
            // Pick English or first available
            const track = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0];
            const transcriptUrl = track.baseUrl + '&fmt=json3'; // JSON format for easy parsing

            const transcriptRes = await fetch(transcriptUrl, { cache: 'no-store' });
            if (transcriptRes.ok) {
                const transcriptData = await transcriptRes.json();
                transcript = transcriptData.events
                    ?.map(event => event.segs?.map(seg => seg.utf8).join(' ') || '')
                    .filter(t => t)
                    .join(' ');
            }
        } else {
            console.warn('No captions available');
        }

        const fullText = `${title}\n\nDescription:\n${description}\n\nTranscript:\n${transcript}`;

        return { title, description, transcript, fullText };
    } catch (error) {
        throw new Error(`YouTube fetch failed: ${error.message}`);
    }
}

export async function getYouTubeCaptionListAndFetch(urlOrId, options = {}) {
    const { language = 'en', preferManual = true, name = null, index = null } = options;

    // Extract video ID (same)
    let videoId;
    try {
        if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
            const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
            videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
        } else {
            videoId = urlOrId;
        }
        if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
    } catch (e) {
        throw new Error('Could not parse URL: ' + e.message);
    }

    // Innertube setup
    const endpoint = 'https://www.youtube.com/youtubei/v1/player';
    const apiKey = 'AIzaSyAO_FJ2SlqU8Q4STEKL512S2PIv4M9r8o0';
    const clientVersion = '2.20251115.00.00';

    const body = {
        context: { client: { clientName: 'WEB', clientVersion, hl: 'en' } },
        videoId
    };

    // Proxy wrapper function
    async function proxyFetch(url, opts) {
        const proxy = 'https://api.allorigins.win/raw?url=';
        const proxyUrl = proxy + encodeURIComponent(url);
        return fetch(proxyUrl, { ...opts, method: 'GET' });  // Proxy turns POST to GET internally
    }

    // Use proxy for main API call (note: body needs to be query-param for proxy, but for simplicity, use raw GET if needed)
    // For POST, we approximate by encoding body as query (works for small payloads)
    const queryBody = new URLSearchParams(body).toString();
    const fullUrl = `${endpoint}?key=${apiKey}&${queryBody}`;
    const res = await proxyFetch(fullUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
    });

    if (!res.ok) throw new Error(`API failed: ${res.status}`);
    const dataTxt = await res.text();
    const data = JSON.parse(dataTxt);

    const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (tracks.length === 0) return { captions: [], selected: null, transcript: '' };

    const captions = tracks.map(track => ({
        language: track.languageCode,
        name: track.name?.simpleText || track.languageCode,
        kind: track.kind || (track.vssId?.includes('.asr') ? 'asr' : 'standard'),
        baseUrl: track.baseUrl
    }));

    // Selection (same as before)
    let selected = null;
    if (index !== null && index >= 0 && index < captions.length) {
        selected = captions[index];
    } else if (name) {
        selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
    } else {
        const langMatches = captions.filter(c => c.language === language);
        if (langMatches.length === 0) {
            selected = captions[0];
        } else if (preferManual) {
            selected = langMatches.find(c => c.kind === 'standard') || langMatches[0];
        } else {
            selected = langMatches[0];
        }
    }

    // Fetch transcript with proxy
    let transcript = '';
    if (selected) {
        const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
        const tRes = await proxyFetch(transcriptUrl, { cache: 'no-store' });
        if (tRes.ok) {
            const tData = await tRes.json();
            transcript = tData.events
                ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
                .filter(t => t)
                .join(' ') || '';
        }
    }

    return { captions, selected, transcript };
}



/**
 * Browser-only YouTube caption fetcher (GET-only, no proxy needed)
 * Works on ANY website, cross-origin
 * Uses /embed/ endpoint for player config
 * /
export async function getYouTubeCaptionsBrowser4(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // === 1. Extract video ID ===
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
      videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
    } else {
      videoId = urlOrId;
    }
    if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
  } catch (e) {
    throw new Error('Parse error: ' + e.message);
  }

  console.log('Video ID:', videoId);

  // === 2. GET player config from /embed/ ===
  const embedUrl = `https://www.youtube.com/embed/${videoId}?disable_polymer=1`;
  const res = await fetch(embedUrl, {
    cache: 'no-store'
  });

  if (!res.ok) throw new Error(`Embed fetch failed: ${res.status}`);

  const html = await res.text();
  const playerConfigMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  if (!playerConfigMatch) throw new Error('Player config not found in HTML');

  const playerConfig = JSON.parse(playerConfigMatch[1]);
  const data = playerConfig;

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // === 3. Select caption ===
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // === 4. Fetch transcript (GET, no proxy needed) ===
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tRes = await fetch(transcriptUrl, { cache: 'no-store' });
    if (tRes.ok) {
      const tData = await tRes.json();
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    } else {
      console.warn('Transcript fetch failed:', tRes.status);
    }
  }

  return { captions, selected, transcript };
}


/**
 * Fixed cors.sh YouTube caption fetcher (with API key)
 * Works on ANY website, cross-origin
 * Tested in Sweden, 10:50 PM CET
 * /
export async function getYouTubeCaptionsBrowser5(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;
  const CORS_SH_KEY = 'YOUR_CORS_SH_KEY';  // ← Replace with your key

  // Extract video ID (same)
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
      videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
    } else {
      videoId = urlOrId;
    }
    if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
  } catch (e) {
    throw new Error('Parse error: ' + e.message);
  }

  console.log('Video ID:', videoId);

  // Fetch watch page via cors.sh
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const proxyUrl = `https://proxy.cors.sh/${watchUrl}`;
  console.log('Proxy URL:', proxyUrl);

  const res = await fetch(proxyUrl, {
    cache: 'no-store',
    headers: {
      'Accept': 'text/html,* /*;q=0.8',
      'Origin': 'https://example.com',
      'x-requested-with': 'XMLHttpRequest',
      'x-cors-api-key': CORS_SH_KEY  // ← REQUIRED
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Proxy failed: ${res.status} — ${errText.substring(0, 200)}`);
  }

  const html = await res.text();

  // Extract player config
  const configMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (!configMatch) throw new Error('Player config not found');
  let data;
  try {
    data = JSON.parse(configMatch[1]);
  } catch (e) {
    throw new Error('JSON parse failed: ' + e.message);
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // Select caption
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // Fetch transcript via cors.sh
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tProxyUrl = `https://proxy.cors.sh/${transcriptUrl}`;
    const tRes = await fetch(tProxyUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json,* /*;q=0.8',
        'Origin': 'https://example.com',
        'x-requested-with': 'XMLHttpRequest',
        'x-cors-api-key': CORS_SH_KEY
      }
    });
    if (tRes.ok) {
      const tText = await tRes.text();
      const tData = JSON.parse(tText);
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    } else {
      console.warn('Transcript failed:', tRes.status);
    }
  }

  return { captions, selected, transcript };
}

/**
 * Fixed cors.sh YouTube caption fetcher (correct URL format, headers)
 * Works on ANY website, cross-origin
 * Tested in Sweden, 10:46 PM CET
 * /
export async function getYouTubeCaptionsBrowser6(urlOrId, options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // Extract video ID (same)
  let videoId;
  try {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const url = new URL(urlOrId.includes('youtu.be') ? `https://youtu.be/${urlOrId}` : urlOrId);
      videoId = url.searchParams.get('v') || urlOrId.split('/').pop().split('?')[0];
    } else {
      videoId = urlOrId;
    }
    if (!videoId || videoId.length < 11) throw new Error('Invalid video ID');
  } catch (e) {
    throw new Error('Parse error: ' + e.message);
  }

  console.log('Video ID:', videoId);

  // Fetch watch page via cors.sh (correct format)
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const proxyUrl = `https://proxy.cors.sh/${watchUrl}`;  // Direct path append—no encodeURIComponent for base
  console.log('Proxy URL:', proxyUrl);  // DEBUG: See the exact URL

  const res = await fetch(proxyUrl, {
    cache: 'no-store',
    headers: {
      'Accept': 'text/html,* /*;q=0.8',
      'Origin': 'https://example.com',  // Required for cors.sh
      'x-requested-with': 'XMLHttpRequest'  // Mimics AJAX, avoids blocks
      // Optional: 'x-cors-api-key': 'your-free-key-here' (get at cors.sh)
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Proxy failed: ${res.status} — ${errText.substring(0, 200)}`);
  }

  const html = await res.text();  // Raw HTML from cors.sh

  // Extract player config
  const configMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
  if (!configMatch) throw new Error('Player config not found');
  let data;
  try {
    data = JSON.parse(configMatch[1]);
  } catch (e) {
    throw new Error('JSON parse failed: ' + e.message);
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // Select caption
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // Fetch transcript via cors.sh
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tProxyUrl = `https://proxy.cors.sh/${transcriptUrl}`;
    console.log('Transcript Proxy URL:', tProxyUrl);  // DEBUG
    const tRes = await fetch(tProxyUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json,* /*;q=0.8',
        'Origin': 'https://example.com',
        'x-requested-with': 'XMLHttpRequest'
      }
    });
    if (tRes.ok) {
      const tText = await tRes.text();
      const tData = JSON.parse(tText);
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    } else {
      console.warn('Transcript failed:', tRes.status);
    }
  }

  return { captions, selected, transcript };
}

/**
 * Native YouTube caption fetcher (same-origin, no fetch, no proxy)
 * Run this in the console ON the YouTube video page
 * /
export async function getYouTubeCaptionsNative(options = {}) {
  const { language = 'en', preferManual = true, name = null, index = null } = options;

  // Get player config from page global (no fetch!)
  const playerResponse = window.ytInitialPlayerResponse;
  if (!playerResponse) {
    throw new Error('Player config not loaded—wait 2 seconds and retry');
  }

  const data = playerResponse;

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    console.warn('No captions available');
    return { captions: [], selected: null, transcript: '' };
  }

  const captions = tracks.map(t => ({
    language: t.languageCode,
    name: t.name?.simpleText || t.languageCode,
    kind: t.kind || (t.vssId?.includes('.asr') ? 'asr' : 'standard'),
    baseUrl: t.baseUrl
  }));

  // Select caption
  let selected = null;
  if (index !== null && index >= 0 && index < captions.length) {
    selected = captions[index];
  } else if (name) {
    selected = captions.find(c => c.name.toLowerCase() === name.toLowerCase());
  } else {
    const matches = captions.filter(c => c.language === language);
    selected = matches.length > 0
      ? (preferManual ? matches.find(c => c.kind === 'standard') || matches[0] : matches[0])
      : captions[0];
  }

  // Fetch transcript (same-origin, no CORS)
  let transcript = '';
  if (selected) {
    const transcriptUrl = `${selected.baseUrl}&fmt=json3`;
    const tRes = await fetch(transcriptUrl);
    if (tRes.ok) {
      const tData = await tRes.json();
      transcript = tData.events
        ?.map(e => e.segs?.map(s => s.utf8).join('') || '')
        .filter(Boolean)
        .join(' ') || '';
    } else {
      console.warn('Transcript fetch failed:', tRes.status);
    }
  }

  return { captions, selected, transcript };
}

// Run it
getYouTubeCaptionsNative({})
  .then(result => {
    console.log('Success! Captions:', result.captions.map(c => `${c.name} [${c.language}] (${c.kind})`));
    console.log('Transcript preview:', result.transcript.slice(0, 200) + '...');
  })
  .catch(e => console.error('Error:', e.message));

  // modTools = await importFc4i("toolsJs")
// modTools.getYouTubeCaptionsBrowser6("https://www.youtube.com/watch?v=DRObW9noiVk")
// modTools.getYouTubeCaptionsBrowser6("DRObW9noiVk")

**** END of Grok very bad suggestions for YouTube */

// Truly bullet-proof validator (2025 edition)
/**
 * @param {any} id 
 * @returns {boolean}
 */
export function isValidYouTubeID(id) {
    return typeof id === 'string' &&
        id.length >= 8 &&
        id.length <= 11 &&
        /^[A-Za-z0-9_-]+$/.test(id);
}

/**
 * From Grok.
 * Returns the YouTube video ID if `url` is a YouTube video URL,
 * otherwise returns `null`.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/v/VIDEO_ID
 *   (with or without extra query parameters)
 * 
 * @param {string} url 
 * @returns {string|null}
 */
export function getYouTubeVideoId(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        // ---------- youtu.be ----------
        if (host === 'youtu.be') {
            const id = parsed.pathname.slice(1).split('/')[0]; // strip possible trailing path
            // return id.length === 11 ? id : null;               // YouTube IDs are 11 chars
            return isValidYouTubeID(id) ? id : null;               // YouTube IDs are 11 chars
        }

        // ---------- youtube.com ----------
        if (!host.endsWith('youtube.com')) return null;

        const path = parsed.pathname.toLowerCase();

        // /watch?v=...
        if (path.startsWith('/watch') && parsed.searchParams.has('v')) {
            // return parsed.searchParams.get('v');
            const paramV = parsed.searchParams.get('v');
            return isValidYouTubeID(paramV) ? paramV : null;
        }

        // /embed/VIDEO_ID
        if (path.startsWith('/embed/')) {
            const parts = path.split('/');
            // return parts[2] || null;
            const p2 = parts[2];
            return isValidYouTubeID(p2) ? p2 : null;
        }

        // /v/VIDEO_ID
        if (path.startsWith('/v/')) {
            const parts = path.split('/');
            // return parts[2] || null;
            const p2 = parts[2];
            return isValidYouTubeID(p2) ? p2 : null;
        }

        return null;
    } catch (_) {
        return null;   // malformed URL
    }
}


// Grok. Saving test here:
export function splitHeadBody(html) {
    let pos = 0;
    const headTags = ['meta', 'link', 'style', 'title', 'script', 'base', 'template', 'noscript'];

    while (pos < html.length) {
        // Skip whitespace (including Windows \r\n)
        const ws = html.slice(pos).match(/^[\s\r\n]+/);
        if (ws) { pos += ws[0].length; continue; }

        // Skip comments
        const comm = html.slice(pos).match(/^<!--[\s\S]*?-->/);
        if (comm) { pos += comm[0].length; continue; }

        // Skip DOCTYPE
        const doc = html.slice(pos).match(/^<!DOCTYPE[^>]*>/i);
        if (doc) { pos += doc[0].length; continue; }

        // Look for opening tag
        const open = html.slice(pos).match(/^<([a-z0-9-]+)\b/i);
        if (!open) break;

        const tagName = open[1].toLowerCase();
        if (!headTags.includes(tagName)) break;

        // Find the end of the whole element
        const rest = html.slice(pos);
        let endIndex;

        if (['meta', 'link', 'base'].includes(tagName)) {
            const m = rest.match(/^<[^>]*>/i);
            endIndex = m ? m[0].length : 0;
        } else {
            const close = new RegExp(`</${tagName}\\s*>`, 'i');
            const m = close.exec(rest);
            endIndex = m ? m.index + m[0].length : 0;
        }

        if (!endIndex) break;
        pos += endIndex;
    }

    return { head: html.slice(0, pos), body: html.slice(pos), at: pos };
}


// _testSplitHeadBody();
export function _testSplitHeadBody() {
    console.log("===== _testSplitHeadBody()");
    // ——— YOUR TEST HTML ———
    const html = `<!DOCTYPE html>
<title>Hello Sweden</title>
<meta charset="utf-8">
<style>body{font-family:Arial}</style>
<!-- still head -->
<h1>Now we are in body</h1>
<p>Yes!</p>`;

    const result = splitHeadBody(html);

    // This line is the important one — it will ALWAYS print something
    console.log('RESULT →', result);
    console.log('Head length →', result.head.length);
    console.log('First 120 chars of head →', result.head.slice(0, 120));
    console.log('Body starts with →', result.body.slice(0, 50));

    // Also return it so you can inspect it by clicking the arrow
    return result;
}


/**
 * Asynchronously checks if a Promise is settled (fulfilled or rejected).
 * This function is non-blocking and fulfills within the current microtask tick 
 * if the Promise is already settled.
 *
 * @param {Promise<any>} p The promise to check.
 * @returns {Promise<boolean>} A Promise that resolves to true if 'p' is settled, false otherwise.
 */
export async function isPromiseSettled(p) {
    const unsettled = {}; // A unique object used as a sentinel value

    // We race the input promise 'p' against the 'unsettled' object.
    // 1. If 'p' is PENDING, the 'unsettled' object (a non-Promise value) wins the race immediately.
    // 2. If 'p' is ALREADY SETTLED (fulfilled or rejected), 'p' wins the race.
    const result = await Promise.race([p, unsettled]);

    // If the result of the race is our sentinel object, the promise 'p' was pending.
    return result !== unsettled;
}



////////////////////////////////////////////
// Proxy troubles handling

/** @param {string} url  @returns {boolean} */
function needsPMC(url) {
    throw Error("called needsPMC");
    const objUrl = new URL(url);
    switch (objUrl.hostname) {
        case "cell.com":
        case "www.cell.com":
            return true;
        default:
            return false;
    }
}
/** @param {string} url  @returns {Promise<string>} */
export async function getFetchableLink(url) {
    throw Error("called getFetchableLink");
    if (needsPMC(url)) {
        return await getPMCurl(url);
    }
    return url;
}


/** @param {string} url  @returns {Promise<string>} */
export async function OLDgetProxyFriendlyUrl(url) {
    const objUrl = new URL(url);
    switch (objUrl.hostname) {
        case "cell.com":
        case "www.cell.com":
            return getPMCurl(url);
        default:
            return url;
    }
}

/** * @param {string} cellUrl * @returns {string} * @throws */

/*
async function getPMCurl(cellUrl) {
    console.log("getPMCurl", cellUrl);
    try {
        // Step 1: Parse the partial DOI from the URL (after /fulltext/)
        const url = new URL(cellUrl);
        const pathParts = url.pathname.split('/');
        const partialDoiIndex = pathParts.indexOf('fulltext') + 1;
        if (partialDoiIndex === 0 || partialDoiIndex >= pathParts.length) {
            throw new Error('Invalid Cell.com URL: No /fulltext/ path found.');
        }
        const partialDoi = pathParts[partialDoiIndex];

        // Step 2: Resolve full DOI using PMC ID Converter API
        const resolveUrl = `https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/`;
        const resolveParams = new URLSearchParams({
            idtype: 'doi',
            ids: partialDoi,  // API auto-resolves partial DOIs for known publishers like Cell
            format: 'json',
            tool: 'cell-to-pmc-converter',  // Recommended: Identify your tool
            email: 'your-email@example.com'  // Recommended: Provide a valid email
        });
        const fullResolverUrl = `${resolveUrl}?${resolveParams}`;
        console.log({ fullResolverUrl })
        const resolveResponse = await fetch(`${resolveUrl}?${resolveParams}`);
        if (!resolveResponse.ok) {
            throw new Error(`API error resolving DOI: ${resolveResponse.status}`);
        }
        const resolveData = await resolveResponse.json();
        if (!resolveData.records || resolveData.records.length === 0) {
            throw new Error('No DOI resolved from partial identifier.');
        }
        const fullDoi = resolveData.records[0].doi;
        if (!fullDoi) {
            throw new Error('Full DOI not found in API response.');
        }

        // Step 3: Convert full DOI to PMCID using the same API
        const convertParams = new URLSearchParams({
            idtype: 'doi',
            ids: fullDoi,
            format: 'json',
            versions: 'no',  // Use 'yes' if you need version info
            tool: 'cell-to-pmc-converter',
            email: 'your-email@example.com'
        });
        const convertResponse = await fetch(`${resolveUrl}?${convertParams}`);
        if (!convertResponse.ok) {
            throw new Error(`API error converting DOI: ${convertResponse.status}`);
        }
        const convertData = await convertResponse.json();
        if (!convertData.records || convertData.records.length === 0) {
            throw new Error('No PMCID found for this DOI (may not be open access yet).');
        }
        const pmcid = convertData.records[0].pmcid;
        if (!pmcid) {
            throw new Error('PMCID not found in API response.');
        }

        // Step 4: Return the PMC URL
        return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
    } catch (error) {
        console.error('Error converting Cell URL to PMC:', error);
        throw Error('Error converting Cell URL to PMC:', error);
    }
}
*/


// New version from Grok:
// DOI prefix mapping for common Cell Press journals (expand as needed)
/**
 * @type {Object}
 * @property {string<string>}
 * */
const journalPrefixes = {
    'cell': '10.1016/j.cell',
    'neuron': '10.1016/j.neuron',
    'immunity': '10.1016/j.immuni',
    'cancer-cell': '10.1016/j.ccell',
    'cell-stem-cell': '10.1016/j.stem',
    'developmental-cell': '10.1016/j.devcel',
    'molecular-cell': '10.1016/j.molcel',
    'trends/cell-biology': '10.1016/j.tcb',
    'cell-metabolism': '10.1016/j.cmet',
    'cell-reports': '10.1016/j.celrep',
    'cell-reports-methods': '10.1016/j.crmeth',
    'cell-reports-medicine': '10.1016/j.xcrm',
    'cell-systems': '10.1016/j.cels',
    'iscience': '10.1016/j.isci',
    'patterns': '10.1016/j.patter',
    'star-protocols': '10.1016/j.xpro',
    'heliyon': '10.1016/j.heliyon',  // Your example journal
    // Add more: e.g., 'ajhg': '10.1016/j.ajhg'
};
/**
 * 
 * @param {string} url 
 * @returns {string}
 */
function getDOIprefix(url) {
    const u = new URL(url);
    const arrHostname = u.hostname.split(".").reverse();
    const name = arrHostname[1];
    if (!name) throw Error(`Could not find name in url: ${url}`);
    const prefix = journalPrefixes[name];
    const prefix10 = prefix.slice(0, prefix.indexOf("/"));
    return prefix10;
}

/**
 * @param {string} biomedUrl
 * @returns {Promise<string>}
 * @throws
 * */
export async function getPMCurl(biomedUrl) {
    try {
        const fullDoi = await getDoiFromCrossRef(biomedUrl);
        console.log("%cgetPMCUrlFromCellUrl", "font-size:28px;", biomedUrl, fullDoi);

        // Step 4: Convert full DOI to PMCID using PMC API
        // https://pmc.ncbi.nlm.nih.gov/tools/id-converter-api/
        const apiUrl = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?';
        const objParams = {
            idtype: 'doi',
            ids: fullDoi,
            format: 'json',
            // versions: 'no',  // Skip version details for simplicity
            versions: 'yes',
            tool: 'cell-to-pmc-converter',
            // email: 'your-email@example.com'  // Replace with a real email
            email: 'lennart.borgman@gmail.com'
        };
        const params = new URLSearchParams(objParams);
        const fullResolverUrl = `${apiUrl}${params}`;
        console.log("fullDoi:", fullDoi, "  fullResolverUrl:", fullResolverUrl, "  objParams:", objParams);
        // const response = await fetch(`${apiUrl}${params}`);
        // const response = await fetch(fullResolverUrl);
        const response = await fetchResponseViaCORSproxy(fullResolverUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.records || data.records.length === 0 || !data.records[0].pmcid) {
            throw new Error(`No PMCID found for DOI ${fullDoi} (article may not be in PMC yet).`);
        }
        const pmcid = data.records[0].pmcid;

        // Step 5: Return PMC URL
        return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
    } catch (error) {
        console.error('Error converting Cell URL to PMC:', error);
        // return null;  // Or re-throw for caller handling
        throw error;
    }
}

/**
 * Does not work. CrossRef actively prevents this.
 * 
 * @param {string} url 
 * @returns {Promise<string>}
 * @throws
 */
async function getDoiFromCrossRef(url) {
    throw Error("getDoiFromCrossRef");
    return OLDgetDoiFromCrossRefByPrefixFilter(url);
}
// Example usage (your test case):
// await _testDoiAndPMC();
async function _testDoiAndPMC() {
    // debugger;
    // doi: 10.1016/j.heliyon.2023.e23503
    // https://pubmed.ncbi.nlm.nih.gov/38170124/
    const urlCell = "https://www.cell.com/heliyon/fulltext/S2405-8440(23)10711-0";
    const doiCell = "10.1016/j.heliyon.2023.e23503";
    const pmidCell = "38170124";
    const pmcidCell = "PMC10758882";
    const titleCell = "A novel prognostic predictor of immune microenvironment and therapeutic response in clear cell renal cell carcinoma based on angiogenesis–immune-related gene signature"
    const linkPmcCell = `https://`

    const urlWikipedia = "https://en.wikipedia.org/wiki/Empathy";

    /** @param {string} title @param {string} expectedPMID @throws */
    async function testPMIDfrom(title, expectedPMID) {
        const ids = await getArticleIdsFromEuroPMC(inputString);
        console.log({ ids });
        debugger;
        const pmid = await getNbciIdfromTitle(title, "pubmed");
        if (pmid != expectedPMID) {
            throw Error(`Got wrong PMID, expected ${expectedPMID}, got ${pmid}`);
        }
    }
    /** @param {string} title @param {string} expectedPMCID @throws */
    async function test_getNcbiIdfromTitle(title, expectedPMCID) {
        const pmcid = await getNbciIdfromTitle(title, "pmc");
        if (pmcid != expectedPMCID) {
            throw Error(`Got wrong PMCID, expected ${expectedPMCID}, got ${pmcid}`);
        }
    }


    // This fails 2025-12-11
    /*
    async function _testDOI(url, expectDOI) {
        const gotDOI = await getDoiFromCrossRef(url);
        if (gotDOI != expectDOI) {
            // debugger;
            throw Error(`Got wrong DOI`)
        }

    }
    */

    const msStart = Date.now();
    try {
        // Test a link not blocked by CORS:
        const faWi = await getFetchableLink(urlWikipedia);
        if (faWi != urlWikipedia) throw Error("Bad faWi");

        await testPMIDfromTitle(titleCell, pmidCell);
        await test_getNcbiIdfromTitle(titleCell, pmcidCell);

        // Getting DOI from some URLs is impossible today:
        // https://gemini.google.com/share/6082cdc84b8c


        throw "testing error - test passed!";
    } catch (err1) {
        console.error('%cError testing', "font-size:30px;background:red;color:black;", err1);
        // debugger;
    }
}









/**
 * 
 * @param {string} pmid 
 * @return {Object}
 */
async function getIdsFromPMID(pmid) {
    const idConvURL = new URL("https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/");
    const idConvParams = new URLSearchParams({
        ids: pmid, // The PMID you just found
        idtype: "pmid",
        format: "json",
        tool: NCBI_TOOL_NAME,
        email: NCBI_EMAIL_ADDRESS
    });
    idConvURL.search = idConvParams.toString();

    try {
        const fetched = await fetchFreshViaCORSproxy(idConvURL.href);
        const data = JSON.parse(fetched);
        debugger;

        const record = data.records && data.records.length > 0 ? data.records[0] : null;
        return record;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
// _testIdsFromPMID();
async function _testIdsFromPMID() {
    console.log("%c_testIdsFromPMID", "font-size:30px;");
    const pmidCell = "38170124";
    debugger;
    const r = await getIdsFromPMID(pmidCell);
    console.log("ids:", r);
}



/**
 * Uses the Europe PMC Search API to find the PMCID from an article title in a single request.
 * Europe PMC's index is comprehensive and includes PMCID for articles in PMC.
 * * @param {string} title - The article title to search.
 * @returns {Promise<string|null>} The PMCID (e.g., "PMC10758882") or null.
 */
export async function getPMCIDfromTitleEuropePMC(title) {
    if (!title) return null;

    // Use the TITLE field tag and quotes for high precision phrase matching.
    const europePmcQuery = `TITLE:"${title}"`;

    const europePmcURL = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
    const searchParams = new URLSearchParams({
        query: europePmcQuery,
        resulttype: "core", // Request core fields, which includes IDs
        format: "json",
        pageSize: "1" // Only need the top-ranked result
    });

    europePmcURL.search = searchParams.toString();
    const europePmcUrl = europePmcURL.href;

    console.log('Europe PMC Search URL:', europePmcUrl);

    try {
        // Use standard fetch or your custom fetch function
        const response = await fetch(europePmcUrl);

        if (!response.ok) {
            console.error(`Error fetching from Europe PMC. Status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Check for search results
        if (data.hitCount > 0 && data.resultList.result.length > 0) {
            const result = data.resultList.result[0];

            // The PMCID is returned in the 'pmcid' field
            if (result.pmcid) {
                // The PMCID is usually returned as "PMC#######"
                return result.pmcid;
            } else {
                // This means the article was found (has a PMID) but is not in PMC.
                console.log(`Article found (PMID: ${result.pmid}) but no PMCID available.`);
                return null;
            }
        } else {
            console.log(`No record found for title: "${title}" in Europe PMC.`);
            return null;
        }
    } catch (error) {
        console.error('Error during Europe PMC Search:', error);
        return null;
    }
}



/**
 * @typedef {Object} ArticleInfo
 * @property {string|null} pmid
 * @property {string|null} pmcid
 * @property {string|null} doi
 * @property {string|null} title
 * @property {boolean|null} isOpenAccess
 * @property {string|null} firstPublicationDate
 * @property {string|null} dateOfPublicationInPMC
 */
/**
 * Uses the Europe PMC API to find article IDs (PMID and PMCID) from any input string.
 * It follows the priority: URL (extract segment) > DOI > PMCID > PMID > Generic Phrase Search.
 * 
 * Note: The Europe PMC search API is more modern and much better for searching.
 * And it displays much more useful data.
 * 
 * * @param {string} inputString - The input (URL, DOI, PMID, PMCID, or Title/PII).
 * @returns {Promise<ArticleInfo>} 
 * An object containing the article identifiers and title. Identifiers may be null if not found.
 * @throws {Error} Throws specific errors for invalid input, network issues, or no results found.
 */
export async function getArticleIdsFromEuroPMC(inputString) {
    if (!inputString || typeof inputString !== 'string') {
        throw new Error("Invalid Input: The input must be a non-empty string.");
    }

    let query = null; // Initialize query to null
    let inputType;
    let searchTerm = inputString.trim();
    let result = {
        pmid: null,
        pmcid: null,
        inEPMC: null,
        doi: null,
        title: null,
        isOpenAccess: null,
        firstPublicationDate: null,
        dateOfPublicationInPMC: null
    };

    // --- 1. Attempt URL Extraction (Highest Priority) ---
    try {
        const url = new URL(searchTerm);

        const pathSegments = url.pathname.split('/').filter(s => s.length > 0);

        if (pathSegments.length > 0) {
            searchTerm = pathSegments[pathSegments.length - 1]; // Use extracted segment
            inputType = 'URL Path Segment';
        } else {
            // Valid URL but no useful path (search full URL as a generic string)
            inputType = 'URL (Full Search)';
        }

        // Build the query here. If successful, 'query' is set and subsequent checks are skipped.
        query = `"${searchTerm}"`;

    } catch (e) {
        // Not a valid URL, 'query' remains null, execution proceeds to ID checks.
    }

    // --- 2. Standard ID Checks (Only run if the query hasn't been set by URL logic) ---
    if (query === null) {
        const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
        const pmcidRegex = /^PMC\d{6,}$/i;
        const pmidRegex = /^\d{6,}$/;

        if (doiRegex.test(searchTerm)) {
            query = `DOI:"${searchTerm}"`;
            inputType = 'DOI';
        } else if (pmcidRegex.test(searchTerm)) {
            query = `PMCID:"${searchTerm}"`;
            inputType = 'PMCID';
        } else if (pmidRegex.test(searchTerm)) {
            query = `EXT_ID:"${searchTerm}"`;
            inputType = 'PMID';
        } else {
            // --- 3. FINAL FALLBACK: Generic Unique Phrase Search ---
            query = `"${searchTerm}"`;
            inputType = 'Generic Phrase';
        }
    }

    // Safety check (shouldn't happen if logic is correct)
    if (query === null) {
        throw new Error("Internal Logic Error: Query could not be constructed.");
    }

    console.log(`Searching Europe PMC for ${inputType} with query: ${query}`);

    // --- 4. Execute the API Call and Error Handling ---
    const europePmcURL = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
    const searchParams = new URLSearchParams({
        query: query,
        resulttype: "core",
        format: "json",
        pageSize: "1"
    });

    europePmcURL.search = searchParams.toString();
    const europePmcUrl = europePmcURL.href;

    try {
        const response = await fetch(europePmcUrl);

        if (!response.ok) {
            throw new Error(`Europe PMC API request failed with HTTP status: ${response.status} (${response.statusText})`);
        }

        const data = await response.json();

        if (data.hitCount > 0 && data.resultList.result.length > 0) {
            const resultRecord = data.resultList.result[0];

            result.pmid = resultRecord.pmid || null;
            result.pmcid = resultRecord.pmcid || null;
            result.doi = resultRecord.doi || null;
            result.title = resultRecord.title || null;
            result.isOpenAccess = resultRecord.isOpenAccess || null;
            result.firstPublicationDate = resultRecord.firstPublicationDate || null;
            result.dateOfPublicationInPMC = resultRecord.dateOfPublicationInPMC || null;
            result.inEPMC = resultRecord.inEPMC || null;

            return result;
        } else {
            console.warn(`No article found for ${inputType}: "${searchTerm}". (Hit Count: 0)`);
            return result;
        }

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch failed')) {
            throw new Error(`Network/Fetch Error connecting to Europe PMC: ${error.message}`);
        }
        throw error;
    }
}

// _testIdsFromString();
async function _testIdsFromString() {
    console.log("%c_testIdsFromString", "font-size:30px;");
    const pmidCell = "38170124";
    debugger;
    // const r = await getArticleIdsFromEuropePMC(pmidCell);
    const r = await getArticleIdsFromEuroPMC(pmidCell);
    console.log("ids:", r);
}

/**
 * Extracts a PMID or PMCID from a Europe/US PMC arcicle URL.
 * 
 * @param {string} urlString - The article URL.
 * @returns {string|null} PMID or PMCID. Returns null values if an ID can not be found.
 * @throws {Error}
 */
export function extractPmidPmcidFromUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
        throw Error("Argument must be a string");
    }

    let url;
    try {
        url = new URL(urlString);
    } catch (err) {
        return null;
    }

    // --- 1. Strict Domain Validation ---
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pmcHostnames = new Set([
        'ncbi.nlm.nih.gov',
        'europepmc.org',
        'pubmed.ncbi.nlm.nih.gov'
    ]);

    if (!pmcHostnames.has(hostname)) { return null; }

    // Get path segments and focus on the last one
    const pathSegments = url.pathname.split('/').filter(s => s.length > 0);
    const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;

    if (!lastSegment) { return null; }

    // --- 2. PMCID Extraction (Focus on Last Segment) ---
    const pmcidRegex = /^PMC\d{6,}$/;
    if (pmcidRegex.test(lastSegment)) { return lastSegment; }

    // --- 3. PMID Extraction (Focus on Last Segment, only if PMCID was not found) ---
    const pmidDigitRegex = /^\d{6,}$/;
    if (pmidDigitRegex.test(lastSegment)) { return lastSegment; }

    // --- 4. Final return ---
    return null;
}

/**
 * Some journals place the DOI in the url.
 * Wiley journals does this.
 *
 * @param {string} urlString
 * @return {string|null}
 * @throws {Error}
 */
export function getDOIfromUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
        throw Error("Argument must be a string");
    }
    let url;
    try {
        url = new URL(urlString);
    } catch (err) {
        throw Error(`Not an url, ${err}`);
    }
    const pathSegments = url.pathname.split('/').filter(s => s.length > 0);
    const len = pathSegments.length;
    for (let i = 0; i < len; i++) {
        const seg = pathSegments[i];
        if (seg.startsWith("10.")) {
            const segNext = pathSegments[i + 1];
            const doi = `${seg}/${segNext}`;
            return doi;
        }
    }
    return null;
}
_test_getDOIfromUrl();
/**
 * Test function for getDOIfromUrl
 * @returns {void}
 * @throws {Error} If test fails
 */
function _test_getDOIfromUrl() {
    const url = "https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202508383";
    const doi = "10.1002/advs.202508383";
    const res = getDOIfromUrl(url);
    if (res != doi) {
        throw Error(`res != doi`);
    }
}


/**
 * Returns true only if the string is a well-formed, plausible real-world DOI
 * - Allows '/' in suffix (per Crossref/DataCite guidelines)
 * - Rejects raw '%' (must be encoded as %25 if needed)
 *   (I did not implement that, % is simply not allowed now.)
 * - Rejects reserved/test prefixes like 10.0000–10.0999
 * - Rejects common wrappers like "doi:" or full URLs
 * - Trims whitespace; case-insensitive
 * 
 * @param {string} str
 * @return {boolean}
 * @throws {Error}
 */
export function isValidDOI(str) {
    const tofStr = typeof str;
    if (tofStr !== 'string') throw Error(`Parameter str should be string but is "${tofStr}"`)

    const s = str.trim();
    if (!s || s.length < 8 || s.length > 512) return false;  // Increased max for rare long DOIs

    const prefixMatch = s.match(/^10\.(\d+)/i);
    if (!prefixMatch || parseInt(prefixMatch[1]) < 1000) return false;

    const DOI_REGEX = /^10\.[1-9]\d{3,}(?:\.\d+)*\/[^\s"%<>]+$/i;
    return DOI_REGEX.test(s);
}

// fetchBlockType
const arrBlockNames = [
    "notBlocked",
    "corsBlock",
    "scrapingBlockWithWA",
    "unBlockerNeeded",
    "finalBlock",
];
Object.freeze(arrBlockNames)

/** @type {Object.<string, string} */
const knownUrlBlock = {
}
knownUrlBlock["wiley.com"] = 'scrapingBlockWithWA';
knownUrlBlock["cell.com"] = 'corsBlock';

// console.log("================ knownUrlBlock", knownUrlBlock);

export class FetchItError extends Error {
    // @ts-ignore
    constructor(message, options) {
        super(message, options);
    }
}

/**
 * 
 * @param {string} url 
 * @returns {Promise<string>}
 */
export async function fetchIt(url) {
    // throw new FetchItError("testing");
    const host = (new URL(url)).hostname.split(".").slice(-2).join(".")
    let corsStatus = "";
    /**
     * @param {string} blockType 
     * @returns {Promise<Object.<string, string>>}
     * @throws {Error}
     */
    const fetchBlockType = async (blockType) => {
        console.warn(`------------ trying "${blockType}"`);
        let content = "";
        switch (blockType) {
            case "notBlocked":
                try {
                    const response1 = await fetch(url);
                    content = await response1.text();
                    return { content, blockType, url }
                } catch (err) {
                    console.log(`%cnotBlocked ${err}`, "color:red;", url);
                    return { content, blockType, url }
                }
                break;
            case "corsBlock":
                {
                    const response = await fetchResponseViaCORSproxy(url);
                    if (response == undefined) throw Error("respone == undefined (from fetchResponseViaCORSproxy");
                    corsStatus = response.status.toString();
                    if (response.ok) {
                        content = await response.text();
                    }
                    return { content, blockType, url, corsStatus }
                }
                break;
            case "scrapingBlockWithWA":
                const ids2 = await getArticleIdsFromEuroPMC(url);
                // debugger;
                // Try PMC
                // const doi = getDOIfromUrl(url);
                const doi = ids2.doi;
                if (doi) {
                    const ids = await getArticleIdsFromEuroPMC(doi);
                    console.log({ ids });
                    // debugger;
                    if (!ids.pmcid) {
                        debugger;
                        return { content, blockType, url }
                    }
                    if (!ids.inEPMC) {
                        debugger;
                        return { content, blockType, url }
                    }
                    if (ids.pmcid) {
                        const urlXmlPmcid = `https://ebi.ac.uk/europepmc/webservices/rest/${ids.pmcid}/fullTextXML`;
                        console.log("urlXmlPmcid", urlXmlPmcid);
                        // debugger;
                        try {
                            // const response = await fetch(urlXmlPmcid);
                            const response = await fetchResponseViaCORSproxy(urlXmlPmcid);
                            const textXML = await response.text();
                            // debugger;

                            // JATS XML (ISO standard)
                            // https://www.xml.com/articles/2018/10/12/introduction-jats/
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(textXML, "text/xml");
                            /** @type {HTMLCollection} */
                            const listBody = xmlDoc.getElementsByTagName("body");
                            const arrBody = [...listBody];
                            const body = arrBody[0];

                            content = extractArticleText(body.outerHTML);
                            return { content, blockType, url }

                        } catch (err) {
                            console.log("%cEurope PMC XML not available", "color:red;");
                        }
                        /*
                        // US PMC has a JavaScript block
                        const urlUsPmcid = `https://pmc.ncbi.nlm.nih.gov/articles/${ids.pmcid}/`;
                        console.log("urlUsPmcid", urlUsPmcid);
                        debugger;
                        try {
                            const response = await fetchResponseViaProxy(urlUsPmcid);
                            const txt = await response?.text();
                            if (txt != undefined) {
                                content = txt;
                                return { content, blockType }
                            }
                        } catch (err) {
                            console.log("%cUS PMC page not available", "color:red;", "color:red", err);
                        }
                        debugger;
                        */
                    }
                }
                return { content, blockType, url }
                break;
            /*
            case "blocked":
                debugger;
                // throw new FetchItError(`Could not fetch: ${corsStatus}`);
                return { content, blockType, url, corsStatus }
                break;
            */
            case "unBlockerNeeded":
                content = await fetchPageViaUnblocker(url);
                console.log("AFTER fetchPageViaUnblocker");
                return { content, blockType, url, corsStatus }
                break;
            default:
                throw Error(`Bad block type: "${blockType}"`);
        }
    }

    /*
     * @param {string} blockType
    const logBlockType = (blockType) => {
        const s3 = `%cknownUrlBlock["${host}"]='${blockType};'`;
        console.log(s3, "color:white;background:darkblue;font-size:18px;padding:4px;");
    }
    */

    /*
     * @param {string} blockType 
     * @returns {Promise<string>} 
     * @throws {Error}
    const _fetchAndLogBlockType = async (blockType) => {
        try {
            const content = await fetchBlockType(blockType);
            logBlockType(blockType);
            return content;
        } catch (err) { throw err; }
    }
    */
    const knownBlock = knownUrlBlock[host];
    // let currentBlockName = knownBlock || "notBlocked";
    let currentBlockName = knownBlock || "corsBlock";
    // FIX-ME:
    let currentBlockIdx = arrBlockNames.indexOf(currentBlockName);
    // currentBlockIdx = arrBlockNames.length - 1;
    for (let i = currentBlockIdx; i < arrBlockNames.length; i++) {
        const blockName = arrBlockNames[i];
        if (blockName == "finalBlock") {
            const content = await dialogUnblockerAPIkey(statusUnblock);
            console.log({ content });
            console.log("AFTER dialogUnblockerAPIkey");
            debugger;
            return { content, blockName, url }
        }
        const result = await fetchBlockType(blockName);
        if (result.content) return result;
    }
    // "4"
    throw Error("You should have returned!");
}

const _doTestFetchIt = navigator.userAgentData?.platform == "Windows";
// if (_doTestFetchIt) { setTimeout(() => test_fetchIt(), 2000); }

/**
 * 
 * @param {string|null} oneUrl 
 */
export async function test_fetchIt(oneUrl) {
    /** @param {boolean} doIt @param {string} url * @returns */
    const testUrl = async (doIt, url) => {
        if (!doIt && !confirm(`testUrl ${url}`)) return;
        console.log("%c\ntestUrl", "font-size:18px;", url);
        try {
            const result = await fetchIt(url);
            const content = result.content;
            const blockType = result.blockType;
            if (content) {
                const startContent = content.slice(0, 200);
                console.log("%cfetchIt test success", "background:yellowgreen;color:black;", { url, blockType, startContent });
            } else {
                console.log("%cfetchIt test failed", "background:red", url);
            }
        } catch (err) {
            console.log("%ctest_fetchIt error", "background:red;font-size:18px;", err);
        }
    }
    if (oneUrl) {
        await testUrl(true, oneUrl);
        return;
    }
    if (!confirm("run test_fetchIt?")) return;

    const ask = false;

    //// CORS
    await testUrl(ask, "https://example.com");

    //// DOI
    // await testUrl(true, "https://en.wikipedia.org/wiki/Self-compassion");
    // await testUrl(true, "https://advanced.onlinelibrary.wiley.com/doi/10.1002/adtp.202500262");
    // await testUrl(true, "https://acamh.onlinelibrary.wiley.com/doi/10.1111/jcpp.12977");
    // await testUrl(false, "https://www.cell.com/heliyon/fulltext/S2405-8440(23)10711-0");

    //// Totally blocked?
    // await testUrl(false, "https://www.psypost.org/scientists-find-the-biological-footprint-of-social-anxiety-may-reside-partially-in-the-gut/");
    await testUrl(ask, "https://scitechdaily.com/challenging-long-held-theories-evolution-isnt-one-and-done-new-study-suggests/");
    // https://www.themarginalian.org/2026/02/19/traversal-blue/
    // https://phys.org/news/2026-02-class-strange-dimensional-particles.html#google_vignette
    // https://x.com/NobelPrize/status/2017434937779995019
    // https://www.sciencedirect.com/science/article/pii/S002231662400289X
}
export function isVercelDev() {
    const hostname = location.hostname;
    if (hostname != "localhost") return false;
    const port = location.port;
    if (port != "8090") return false;
    // console.log("isVercelDev!");
    return true;
}


export class ArticleTextError extends Error {
    // @ts-ignore
    constructor(message, options) {
        super(message, options);
    }
}
// console.log(new ArticleTextError("test", { cause: new Error("cause") }).cause);
// Error: cause

/**
 * 
 * @param {string} strHtml 
 * @returns {string}
 */
export function extractArticleText(strHtml) {
    // throw new ArticleTextError("test");
    const parser = new DOMParser();
    const doc = parser.parseFromString(strHtml, 'text/html');
    // FIX-ME: <meta>
    // const eltMetaDesc = /** @type {HTMLMetaElement} */ (doc.querySelector("meta[name=description]"));
    // const metaDescription = eltMetaDesc?.content || "";

    function eltSeemsOk(el) {
        if (!el) return false;
        const txtTrimmed = el.textContent.split("\n").map(l => l.trim()).join(" ").replaceAll(/\s+/g, " ");
        if (txtTrimmed.length < 1000) return false;
        return true;
    }
    const articleText = (() => {
        const selectors = [
            'article',
            'main', '[role="main"]',
            '.article-body', '.article-content', '.body',
            'body',
        ];
        let eltFound;
        for (let i = 0; i < selectors.length; i++) {
            const selector = selectors[i];
            console.log({ selector });
            const eltLoop = doc.querySelector(selector);
            if (eltSeemsOk(eltLoop)) {
                eltFound = eltLoop;
                console.log({ eltFound });
                break;
            }
        }
        /*
        // 1. Primary: <article> (precise for content)
        let el = doc.querySelector('article');
        if (eltSeemsOk(el)) {
            // 2. Fallback: <main> (broad coverage)
            el = doc.querySelector('main, [role="main"]');
        }
        if (eltSeemsOk(el)) {
            // 3. Science/news hybrids
            el = doc.querySelector('.article-body, .article-content, .body');
        }
        if (eltSeemsOk(el)) {
            // 4. PsyPost, etc
            el = doc.querySelector('body');
        }
        */

        if (eltFound) {
            // const clone = el.cloneNode(true);
            const clone = eltFound;
            // Clean up (tailored for science: refs, figs)
            clone.querySelectorAll(
                'meta, script, style, nav, header, footer, aside, .ad, .references, figure, .fig, .supplementary'
            ).forEach(x => x.remove());
            // let text = (clone.innerText || clone.textContent).trim();

            // let text = clone.textContent.trim();
            const text = clone.textContent.trim().split("\n").map(l => l.trim()).join(" ").replaceAll(/\s+/g, " ");

            // Not sure how to use this!
            /*
            // Science bonus: Grab abstract if separate
            const abs = doc.querySelector('.abstract, [id*="abstract"]');
            if (abs && text.length > 500 && !text.includes(abs.innerText.trim().substring(0, 100))) {
                text = abs.innerText.trim() + '\n\nMain Body:\n' + text;
            }
            */

            // return text.length > 1000 ? text.slice(0, 18000) : null;

            // Should not happen now:
            // if (text.length < 1000) throw new ArticleTextError("Article text less than 1000 chars");
            return text.slice(0, 18000);
        }

        throw new ArticleTextError("Could not find text in article");

        // Last resort
        // return doc.body.innerText.trim().slice(0, 18000);
    })();
    if (!articleText) {
        // throw Error(`articleText == "${articleText}"`);
        console.error(`articleText == "${articleText}"`);
        // debugger;
    }
    return articleText || "";
    // return `${metaDescription}\n\n${articleText}`;
}

/*
General Aggregators (Cross-Disciplinary)
These pull from multiple repositories and publishers, making them versatile for various scientific areas.

CORE API (Connecting Repositories):
This is a free API that aggregates open access content from thousands of repositories worldwide. It allows searching for articles by DOI and retrieving metadata, full-text (if available), or download URLs to PDFs.
Disciplines covered: All academic fields, including physics, engineering, social sciences, humanities, computer science, environmental studies, and more (not limited to biomedicine).
Relevant usage: Use the /search/works endpoint with a doi filter (e.g., GET https://api.core.ac.uk/v3/search/works?q=doi:10.1234/example). Responses include fields like fullText (plain text if harvested) or downloadUrl for the PDF. Free to use, no API key required for basic access.
More details in their documentation.
https://www.sciencedirect.com/science/article/pii/S2352711024002772
https://doi.org/10.1016/j.softx.2024.101907
https://core.ac.uk
https://core.ac.uk/services/api
https://bit.ly/core-api3§
Tested a bit. Seems pretty useless!


Unpaywall API:
A free service focused on finding legal open access versions of articles. It doesn't provide full-text directly but returns the best URL to an open access PDF or HTML version.
Disciplines covered: All scholarly fields, as it scans DOIs from any domain (e.g., physics journals, social science repositories, engineering proceedings).
Relevant usage: Simple GET request like https://api.unpaywall.org/<doi>?email=your@email.com (email required for courtesy/rate limiting). Response JSON includes is_oa and best_oa_location with a url_for_pdf. Handles millions of DOIs from repositories like arXiv, institutional archives, and publishers.
Great for quick links without CORS issues when fetching from the provided URL.
This too looks pretty useless!


Semantic Scholar API:
A free AI-powered academic search engine API from the Allen Institute for AI, providing metadata and open access PDF links.
Disciplines covered: Broad, including computer science, physics, chemistry, biology, materials science, geology, psychology, sociology, economics, engineering, environmental science, education, law, and linguistics (among others).
Relevant usage: Use GET /graph/v1/paper/DOI:<doi> (e.g., DOI:10.18653/v1/N18-3011) with optional fields=openAccessPdf,url. If open access, it returns an openAccessPdf object with a direct URL to the PDF. Also supports batch requests for multiple DOIs.
No direct full-text, but the links are reliable for downloading.
https://api.semanticscholar.org/api-docs
I don't think this is useful either!


Springer Nature Open Access API:
Provides metadata and full-text content for their open access articles.
Disciplines covered: Diverse, including engineering, physics, chemistry, social sciences, computer science, environmental science, and humanities (via SpringerOpen and BioMed Central journals, though the latter leans biomed).
Relevant usage: Supports queries by DOI, with endpoints for searching/filtering by parameters like title, author, or subject. Returns JSON/XML with full-text if available. Requires free registration for an API key.
Good for articles published by Springer.
https://datasolutions.springernature.com/products/open-access/
https://www.lib.ncsu.edu/text-and-data-mining/scholarly-apis-datasets



*/


/**
 * Scroll behavior suggested by Grok.
 * I added the class.
 */
export class ChatLikeScroll {

    /**
     * 
     * @param {HTMLDivElement} container 
     * @param {HTMLDivElement} target 
     * @param {number} tolerance - in px
     */
    constructor(container, target, tolerance) {
        this.container = container;
        this.target = target;
        this.tolerance = tolerance;
    }

    #isNearBottom() {
        return this.container.scrollHeight - this.container.scrollTop - this.container.clientHeight <= this.tolerance;
    }

    scrollToBottom(smooth = true) {
        // Option 1: scrollIntoView – very convenient
        this.target.scrollIntoView({
            block: "end",
            behavior: smooth ? "smooth" : "auto",
            inline: "nearest"
        });

        // Option 2: explicit scrollTo (sometimes more predictable)
        // container.scrollTo({
        //     top: container.scrollHeight - container.clientHeight,
        //     behavior: smooth ? "smooth" : "auto"
        // });
    }

    // Whenever you append content (message, row, etc.)
    onNewContentAdded() {
        if (this.#isNearBottom()) {
            this.scrollToBottom(true);
        }
        // If user has scrolled up → do NOT auto-scroll (classic chat behavior)
    }
}



////////////
// WakeLock
////////////

/**
 * Current active WakeLockSentinel or null if no wake lock is active.
 * @type {WakeLockSentinel|null}
 */
let wakeLock = null;

/**
 * Requests a screen wake lock to prevent the device from sleeping.
 *
 * @async
 * @returns {Promise<void>} Resolves when the wake lock is successfully acquired
 * @throws {Error} If the wake lock request fails
 */
export async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Wake Lock acquired");

    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock was released by the system");
      wakeLock = null;
    });
  } catch (err) {
    console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
    throw err;
  }
}

/**
 * Releases the currently held screen wake lock, if any.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the wake lock is released or if none was active
 */
export async function releaseWakeLock() {
  if (wakeLock === null) {
    console.log("No wake lock to release");
    return;
  }

  try {
    await wakeLock.release();
    console.log("Wake Lock released manually");
    wakeLock = null;
  } catch (err) {
    console.error("Error releasing wake lock:", err);
    throw err;
  }
}