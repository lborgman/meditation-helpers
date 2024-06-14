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
export function log(msg) {
    /** @type {HTMLDivElement} */
    const eltMsg = document.createElement("div");
    eltMsg.textContent = msg;
    divLog.appendChild(eltMsg);
    clearTimeout(logTimeout);
    logTimeout = setTimeout(() => divLog.textContent = "", 9000);
}
