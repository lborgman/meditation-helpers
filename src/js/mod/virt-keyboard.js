console.log("This is virt-keyboard.js");

/*
    This is a module for detecting virtual (screen) keyboard.
*/

// https://stackoverflow.com/questions/77795626/virtual-keyboard-api-hide-isnt-working

/**
 * 
 * @returns {boolean}
 */
export function hasTouchEvents() {
    let hasTouch = false;
    try {
        document.createEvent("TouchEvent");
        hasTouch = true;
    } catch (e) { }
    // console.warn({ hasTouch })
    return hasTouch;
}

/** @type {boolean} */
let hasVK;

/**
 * 
 * @returns {boolean | undefined}
 */
export function detectedVirtualKeyboard() {
    return hasVK;
}

function logResize(msg) {
    console.log(`%c ${msg} `, "background:yellow; color:black; ");
}
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;
logResize("BEFORE afterResize");

/**
 * 
 * @param {function} callBack 
 */
function afterResize(callBack) {
    if (hasVK != undefined) { return; }
    if (winWidth == window.innerWidth && winHeight == window.innerHeight) {
        document.documentElement.style.backgroundColor = "white";
        logResize("afterResize white");
        return;
    }
    if (window.innerWidth != winWidth) {
        document.documentElement.style.backgroundColor = "red";
        logResize("afterResize red");
        hasVK = false;
        return;
    }
    if (window.innerHeight > winHeight) {
        document.documentElement.style.backgroundColor = "orange";
        logResize("afterResize orange");
        hasVK = false;
        return;
    }
    document.documentElement.style.backgroundColor = "green";
    logResize("afterResize green");
    hasVK = true;
    callBack();
}
const debounceAfterResize = TSDEFdebounce(afterResize);

/**
 * 
 * @param {function} callBack 
 */
export function detectVirtualKeyboard(callBack) {
    logResize("detectVirtualKeyboard", callBack);
    // Just ignore if no touch screen
    // if (!hasTouchEvents()) return;
    // window.addEventListener("resize", () => debounceAfterResize(callBack));
    window.addEventListener("resize", () => afterResize(callBack));
}