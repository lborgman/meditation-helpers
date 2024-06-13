console.log("This is virt-keyboard.js");

/*
    This is a module for detecting virtual (screen) keyboard.
*/

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

let screenWidth = screen.width;
let screenHeight = screen.height;

/**
 * 
 * @param {function} callBack 
 */
function afterResize(callBack) {
    // console.log("afterResize", screenWidth, screen.width);
    if (hasVK != undefined) { return; }
    if (screenWidth == screen.width && screenHeight == screen.height) {
        document.documentElement.style.backgroundColor = "white";
        console.log("afterResize white");
        return;
    }
    if (screen.width != screenWidth) {
        document.documentElement.style.backgroundColor = "red";
        console.log("afterResize red");
        hasVK = false;
        return;
    }
    if (screen.height > screenHeight) {
        document.documentElement.style.backgroundColor = "orange";
        console.log("afterResize orange");
        hasVK = false;
        return;
    }
    document.documentElement.style.backgroundColor = "green";
    console.log("afterResize green");
    hasVK = true;
    callBack();
}
const debounceAfterResize = TSDEFdebounce(afterResize);

/**
 * 
 * @param {function} callBack 
 */
export function detectVirtualKeyboard(callBack) {
    console.log("detectVirtualKeyboard", callBack);
    // Just ignore if no touch screen
    // if (!hasTouchEvents()) return;
    // window.addEventListener("resize", () => debounceAfterResize(callBack));
    window.addEventListener("resize", () => afterResize(callBack));
}