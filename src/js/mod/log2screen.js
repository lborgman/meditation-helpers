// @ts-check
console.log("This is log2screen.js");

/*
    Created to trace down problems with Android virtual keyboard and MD2 dialogs.

    Related:
    https://stackoverflow.com/questions/77795626/virtual-keyboard-api-hide-isnt-working
    https://issues.chromium.org/issues/40912131

    I filed an issue:
    https://issues.chromium.org/issues/347967487
    
*/


/** @type {HTMLDivElement} */
const divLog = document.createElement("div");
divLog.id = "div-log2screen";
divLog.textContent = "This is divLog";

// @ts-ignore style
divLog.style = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 4px;
`;

/**
 * 
 * @returns {boolean}
 */
function hasLogDiv() {
    return divLog.parentElement != null;
}

/**
 * 
 * @returns {boolean}
 */
export function addLogDiv() {
    if (hasLogDiv()) return false;
    document.body.appendChild(divLog);
    return true;
}

let logTimeout;
let msLogTime = Date.now();
const idClearButton = "log2screen-clear-button";

/**
 * 
 * @param {string} msg 
 */
export function log(msg) {
    if (!hasLogDiv()) return;
    if (divLog.classList.contains("old")) {
        divLog.textContent = "";
        divLog.classList.remove("old");
    }
    clearTimeout(logTimeout);
    logTimeout = setTimeout(() => {
        divLog.classList.add("old");
    }, 5000);
    const useButton = idClearButton != undefined;
    if (useButton) {
        if (!document.getElementById(idClearButton)) {
            const btn = document.createElement("button");
            btn.id = idClearButton;
            btn.textContent = "Clear";
            btn.addEventListener("click", evt => {
                setTimeout(() => divLog.textContent = "", 100);
            });
            divLog.textContent = "";
            divLog.appendChild(btn);
            const btnOff = document.createElement("button");
            btnOff.textContent = "Off";
            btnOff.style.marginLeft = "30px";
            btnOff.addEventListener("click", evt => {
                setTimeout(() => divLog.remove(), 500);
            });
            divLog.appendChild(btnOff);
        }
    } else {
        clearTimeout(logTimeout);
        logTimeout = setTimeout(() => divLog.textContent = "", 9000);
    }
    /** @type {HTMLDivElement} */
    const eltMsg = document.createElement("div");
    // eltMsg.textContent = msg;
    eltMsg.append(msg);
    divLog.appendChild(eltMsg);
}



/** @type {HTMLDivElement} */
const divFlashClient = document.createElement("div");
const flashClientSize = 15;
// @ts-ignore style
divFlashClient.style = `
    position: fixed;
    z-index: 1001;
    background-color: red;
    width: ${flashClientSize}px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    pointer-events: none;
`;

/** @type {boolean} */
let addedFlashPoint = false;


// https://stackoverflow.com/questions/32558514/javascript-es6-export-const-vs-export-let
// https://github.com/oxc-project/oxc/issues/3733
// export let secFlashPoint;

let secFlashPoint = 9;
/**
 * 
 * @param {number} sec 
 */
export function setSecFlashPoint(sec) {
    secFlashPoint = sec;
}
/**
 * 
 * @returns {number}
 */
export function getSecFlashPoint() {
    return secFlashPoint;
}
export function addFlashPoint() {
    if (addedFlashPoint) { return; }
    addedFlashPoint = true;
    // const nameEvt = "click";
    const nameEvt = "pointerdown";
    document.body.addEventListener(nameEvt, evt => {
        log(`pointer ${nameEvt}`);
        console.log("%cpointerdown", "background:white; color:red;", evt);
        const targ = evt.target;
        // @ts-ignore style
        if (targ) { targ.style.outline = "4px dotted red"; }
        setTimeout(doThePoint, 200);
        function doThePoint() {
            document.body.appendChild(divFlashClient);
            const cX = evt.clientX - flashClientSize / 2
            const cY = evt.clientY - flashClientSize / 2
            divFlashClient.style.left = `${cX}px`;
            divFlashClient.style.top = `${cY}px`;
            setTimeout(() => {
                divFlashClient.remove();
                // @ts-ignore style
                if (targ) { targ.style.outline = null; }
            }, 1000 * secFlashPoint);
        }
    });
}