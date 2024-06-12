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
let hasVK = false;

/**
 * 
 * @returns {boolean}
 */
export function hasVirtualKeyboard() {
    return hasVK;
}

/**
 * 
 * @param {function} callBack 
 */
export function detectVirtualKeyboard(callBack) {
    // Just ignore if no touch screen
    if (!hasTouchEvents()) return;
    window.addEventListener("resize", () => debounceAfterSize());
}