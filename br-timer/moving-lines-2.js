setupThings();

/*
function redraw() {
    const myPatt = getPatternByName(settingPattern.value);
    drawPattern(myPatt, settingNumPatts.value);
}
*/

let progressElement;
let progressWidth;
function checkRedraw() {
    if (!progressElement) {
        progressElement = document.getElementById("current-progress");
        // @ts-ignore
        const bcr = progressElement.parentElement.getBoundingClientRect();
        progressWidth = bcr.width;
    }
    /** @type {TSmilliSeconds} */
    // @ts-ignore
    const ms = document.timeline.currentTime - (msStart + msFocusLength);
    const partDone = ms / (secondsDuration * 1000);
    progressElement.style.width = `${partDone * progressWidth}px`;
    if (ms > secondsDuration * 1000) {
        console.log("stopping time...");
        clearTopText();
        tellState("Finished");
        drawCurrentPoint("gray");
        setStateRunning(false);
        topText("Finished");
        // isRunning = false;
        stopRedraw = true;
        return false;
    }
    if (numChecks > 100) {
        console.log("stopping num...");
        stopRedraw = true;
        return false;
    }
    redraw();
    return true;
}


function animateLines() {
    if (!isRunning) return;
    const ok = checkRedraw();
    if (!ok) return;
    requestAnimationFrame(() => {
        if (numRedraw++ > maxRedraw) {
            console.log("stopping sec check", { numRedraw });
            return;
        }
        animateLines();
    });
}

