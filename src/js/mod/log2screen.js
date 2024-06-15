// @ts-check
console.log("This is log2screen.js");

/** @type {HTMLDivElement} */
const divLog = document.createElement("div");
divLog.textContent = "This is divLog";

// @ts-ignore style
divLog.style = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 4px;
    background-color: lightskyblue;
    color: black;
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
const idClearButton = "log2screen-clear-button";

/**
 * 
 * @param {string} msg 
 */
export function log(msg) {
    if (!hasLogDiv()) return;
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
        }
    } else {
        clearTimeout(logTimeout);
        logTimeout = setTimeout(() => divLog.textContent = "", 9000);
    }
    /** @type {HTMLDivElement} */
    const eltMsg = document.createElement("div");
    eltMsg.textContent = msg;
    divLog.appendChild(eltMsg);
}



/** @type {HTMLDivElement} */
const divFlashClient = document.createElement("div");
const flashClientSize = 20;
// @ts-ignore style
divFlashClient.style = `
    position: fixed;
    z-index: 1001;
    background-color: red;
    width: ${flashClientSize}px;
    aspect-ratio: 1/1;
`;

export function flashPoint() {
    document.body.addEventListener("pointerdown", evt => {
        console.log("%cpointerdown", "background:white; color:red;", evt);
        document.body.appendChild(divFlashClient);
        const cX = evt.clientX - flashClientSize / 2
        const cY = evt.clientY - flashClientSize / 2
        divFlashClient.style.left = `${cX}px`;
        divFlashClient.style.top = `${cY}px`;
        setTimeout(() => { divFlashClient.remove(); }, 2200);
    });
}