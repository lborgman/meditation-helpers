// @ts-check
const CANVAS_FONTSIZE_VER = "0.0.0";
// @ts-ignore
window["logConsoleHereIs"](`here is canvas-fontsize.js, module, ${CANVAS_FONTSIZE_VER}`);
if (document.currentScript) { throw "canvas-fontsize.js is not loaded as module"; }

/*
export function updateFontSizeFactors(eltCanvas) {
*/

// let canvasScaleFactorPx = 1;
// let canvasScaleFactorRem = 1;
const wmScaleFactors = new WeakMap();

/**
 * Use CSS font size in px/rem size:
 *     eltCanvas.ctx.font = cssFont('bold 2rem monospace');
 *
 * @param {string} fontString 
 * @param {HTMLCanvasElement} eltCanvas
 * @returns {string}
 */
export function cssFont(fontString, eltCanvas) {
    if (!wmScaleFactors.has(eltCanvas)) {
        const msg = "cssFont: updateFontSizeFactors(eltCanvas) has not been called";
        console.error(msg, { eltCanvas });
        debugger;
        throw Error(msg);
    }
    // Regular expression captures the number (Group 1) and the unit (Group 2)
    // It targets tokens ending explicitly with 'px' or 'rem'
    const sizeRegex = /([\d.]+)(px|rem)\b/;
    const { canvasScaleFactorPx, canvasScaleFactorRem } = wmScaleFactors.get(eltCanvas);

    return fontString.replace(sizeRegex, (match, value, unit) => {
        const numericSize = parseFloat(value);
        let finalSizePx = 0;

        if (unit === 'rem') {
            finalSizePx = numericSize * canvasScaleFactorRem;
        } else {
            finalSizePx = numericSize * canvasScaleFactorPx;
        }

        // Return the modified segment back to the shorthand string
        return `${Math.round(finalSizePx)}px`;
    });
}

/**
 * Call this before cssFont(...)
 *
 * @param {HTMLCanvasElement} eltCanvas 
 */
export function updateFontSizeFactors(eltCanvas) {
    // FIX-ME: It looks like we do not have to call this after resize?
    console.log("updateFontSizeFactors", eltCanvas);
    // const canvas = elements.canvas;
    const rect = eltCanvas.getBoundingClientRect();

    if (rect.width > 0) {
        const canvasScaleFactorPx = eltCanvas.width / rect.width;
        // Fetch the live document root font size (rem base value)
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        // Calculate the relative rem layout scaling multiplier
        const canvasScaleFactorRem = canvasScaleFactorPx * rootFontSize;
        wmScaleFactors.set(eltCanvas, { canvasScaleFactorPx, canvasScaleFactorRem });
    } else {
        logCanvasHiddenReason(eltCanvas, rect);
    }
}
function logCanvasHiddenReason(canvas, rect) {
    // Uses standard groupCollapsed to keep the main console view clean
    console.groupCollapsed("⚠️ Canvas Scale Calculation Skipped: Width is 0");

    const styles = window.getComputedStyle(canvas);

    // Comprehensive diagnostic payload object
    const diagnostics = {
        domStatus: {
            isConnected: canvas.isConnected,               // False if completely detached
            hasParent: !!canvas.parentElement,
            offsetParent: canvas.offsetParent              // Null if hidden or fixed
        },
        computedStyles: {
            display: styles.display,
            visibility: styles.visibility,
            widthStyle: styles.width,
            heightStyle: styles.height,
            boxSizing: styles.boxSizing
        },
        geometry: {
            rectWidth: rect.width,
            rectHeight: rect.height,
            internalWidth: canvas.width
        }
    };

    console.warn("Detailed Element Diagnostics:", diagnostics);

    // Provide actionable, logical conclusions
    if (!diagnostics.domStatus.isConnected) {
        console.error("Conclusion: The canvas element is not mounted in the active DOM tree.");
    } else if (diagnostics.computedStyles.display === 'none') {
        console.error("Conclusion: The canvas has 'display: none' active directly or via a parent.");
    } else if (diagnostics.computedStyles.visibility === 'hidden' || diagnostics.computedStyles.visibility === 'collapse') {
        console.error("Conclusion: The element is rendered but explicitly hidden via CSS visibility rules.");
    } else if (rect.width === 0 && canvas.isConnected) {
        console.error("Conclusion: The element is active but has collapsed to 0px (likely a flexbox, grid, or 0-height parent container issue).");
    }

    console.groupEnd(); // Correctly close the console group block

}
