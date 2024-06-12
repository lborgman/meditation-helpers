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

const screenWidth = screen.width;
const screenHeight = screen.height;
console.log({screen, screenWidth, screenHeight});

/**
 * 
 * @param {function} callBack 
 */
function afterResize(callBack) {
    console.log("afterResize", callBack, screenWidth, screen.width);
    if (hasVK != undefined) { return; }
    if (screen.width != screenWidth) {
        document.documentElement.style.backgroundColor = "gray";
        hasVK = false;
        return;
    }
    if (screen.height > screenHeight) {
        hasVK = false;
        return;
    }
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
    window.addEventListener("resize", () => debounceAfterResize(callBack));
}