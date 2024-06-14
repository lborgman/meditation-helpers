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

export function addLogDiv() {
    document.body.appendChild(divLog);
}

let logTimeout;
const idClearButton = "log2screen-clear-button";
export function log(msg) {
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
