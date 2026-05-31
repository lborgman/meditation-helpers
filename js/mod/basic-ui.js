// @ts-check

const BASIC_UI_VER = "0.0.01";
// @ts-ignore
logConsoleHereIs(`here is basic-ui.js, module,${BASIC_UI_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

// @ts-ignore
const mkElt = window["mkElt"];

/**
 * @param {function} [funClose]
 * @returns {HTMLButtonElement}
 */
export function mkXclose(funClose) {
    const xClose = mkElt("button", { class: "x-close" }, "✖");
    xClose.addEventListener("click", evt => {
        evt.stopPropagation();
        // debugger;
        if (funClose) {
            funClose();
            return;
        }
        (xClose.closest("dialog"))?.close();
    });
    return xClose;
}
export function addXclose(dialog) {
    const btnClose = dialog.querySelector("button[class=x-close]");
    if (btnClose) { return; }
    dialog.appendChild(mkXclose());
}

document.documentElement.addEventListener("click", evt => {
    // evt.stopPropagation();
    // evt.preventDefault();
    // debugger;
    // NOTE: first child element must covers the whole <dialog>
    const dialog = evt.target;
    // if (dialog?.tagName == "DIALOG") {
    if (dialog instanceof HTMLDialogElement) {

        const rect = dialog.getBoundingClientRect();
        const scrollbarWidth = dialog.offsetWidth - dialog.clientWidth;
        const xFromRight = rect.right - evt.clientX;

        // Ignore if click is in scrollbar area
        if (xFromRight <= scrollbarWidth && xFromRight > 0) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();
        closeDialog(dialog);
    }
    // const currentTarget = evt.currentTarget;
    // const onDialog = dialog == currentTarget;
    // if (onDialog) dialog.close();
});

/**
 * 
 * @param {HTMLDialogElement} dialog 
 */
function closeDialog(dialog) {
    console.log("closeDialog", dialog);
    dialog.close();
    if (!dialog.classList.contains("html-dialog")) {
        console.log("closeDialog remove");
        dialog.remove();
    }
}


/**
 * @param {any} icon 
 * @param {string} title 
 * @param {boolean} small 
 * @returns {HTMLButtonElement}
 */
export function mkFabButton(icon, title, small) {
    const btn = mkElt("button", undefined, icon);
    btn.classList.add("fab-button");
    btn.title = title;
    if (small) {
        btn.classList.add("fab-button-small");
    }
    return btn;
}

/**
 * 
 * @param {any} icon 
 * @param {string} title 
 * @returns {HTMLButtonElement}
 */
export function mkIconButton(icon, title) {
    const btn = mkElt("button", undefined, icon);
    btn.classList.add("icon-button");
    btn.title = title;
    return btn;
}

/**
 * 
 * @param {HTMLDivElement} bdy 
 * @param {function|undefined} [retValFun]
 * @param {undefined|HTMLButtonElement[]} [buttons]
 * @returns {Promise<any>}
 */
export async function showDialog(bdy, valFun, buttons) {
    if (valFun != undefined) {
        if (typeof valFun !== 'function') {
            debugger;
            throw new Error('Parameter "valFun" must be a function');
        }
        if (valFun.constructor.name !== 'AsyncFunction') {
            debugger;
            throw new Error('Function "valFun" must be async');
        }
        if (valFun.length !== 0) {
            debugger;
            throw new Error('Async function "valFun" must take 0 parameters');
        }
    }
    const dlg = mkElt("dialog", undefined, bdy);
    if (buttons) {
        let myButtons = buttons;
        if (!Array.isArray(myButtons)) { myButtons = [buttons]; }
        const eltButtons = mkElt("div", { class: "dialog-buttons" });
        myButtons.forEach(b => {
            if (!(b instanceof HTMLButtonElement)) {
                debugger;
                throw Error("showDialog: buttons must only contain <button>");
            }
            eltButtons.appendChild(b);
        });
        dlg.appendChild(eltButtons);
    }
    addXclose(dlg);
    document.documentElement.appendChild(dlg);
    dlg.showModal();

    if (!valFun) return;
    const ans = await valFun();
    const tofAns = typeof ans;
    if (tofAns != "boolean") {
        debugger;
    }
    return ans;
}
/**
 * 
 * @param {HTMLDivElement} bdy 
 * @param {string} [ok]
 * @param {string} [cancel]
 */
export async function showDialogConfirm(bdy, ok, cancel) {
    ok = ok || "OK";
    cancel = cancel || "Cancel";
    const btnTrue = mkElt("button", undefined, ok);
    const btnFalse = mkElt("button", undefined, cancel);
    const fun = async () => {
        return await new Promise(resolve => {
            btnTrue.addEventListener("click", evt => {
                resolve(true);
                closeMyDialog(btnTrue);
            });
            btnFalse.addEventListener("click", evt => {
                resolve(false);
                closeMyDialog(btnFalse);
            });
        });
    }
    const ans = await showDialog(bdy, fun, [btnTrue, btnFalse]);
    const tofAns = typeof ans;
    if (tofAns != "boolean") {
        const msg = `showDialogConfirm: typeof ans == "${tofAns}`;
        console.error(msg);
        debugger;
        throw Error(msg);
    }
    return ans;
}
export function closeMyDialog(elt) {
    const dlg = elt.closest("dialog");
    dlg.close();
}


// Module-level variable to track the active timer
let tmrSnackbar = null;

export function snackbar(bdy, sec) {
    // Default to 10 seconds if not provided or if 0 is passed mistakenly
    sec = sec === undefined ? 10 : sec;

    /** @type {HTMLDialogElement|null} */
    let dlg = document.getElementById("snackbar");

    if (dlg) {
        if (!(dlg instanceof HTMLDialogElement)) {
            const msg = "!(dlg instanceof HTMLDialogElement)";
            console.error(msg, dlg);
            throw Error(msg);
        }
        // Close it immediately if it's already open from a previous call
        if (dlg.open) {
            dlg.close();
        }
    }

    // 1. Clear any existing active timer to prevent premature closing
    if (tmrSnackbar) {
        clearTimeout(tmrSnackbar);
    }

    // 2. Create the element if it doesn't exist
    if (!dlg) {
        dlg = /** @type {HTMLDialogElement} */ (mkElt("dialog", undefined, bdy));
        dlg.id = "snackbar";
        document.body.appendChild(dlg); // Typically better to append to body than documentElement
    }

    // 3. Update content safely
    dlg.textContent = "";
    if (typeof bdy === "string") {
        dlg.textContent = bdy;
    } else {
        dlg.append(bdy);
    }

    // 4. Show the dialog (Use showModal() if you want backdrop/centering, otherwise show())
    if (!dlg.open) {
        dlg.show();
    }

    // 5. Save the timeout reference to our module-level variable!
    tmrSnackbar = setTimeout(() => {
        console.log("Timer fired, closing dialog...", { sec, dlg });
        try {
            if (dlg && dlg.open) {
                dlg.close();
            }
        } catch (err) {
            console.error("Error closing dialog:", err);
        }
        tmrSnackbar = null; // Reset tracker after running
    }, sec * 1000);
}

setTimeout(() => { snackbar("Hi, welcome!", 3) }, 500);



class MdcInput extends HTMLElement {
    #internalValue = '';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.renderShell();
    }

    static get observedAttributes() {
        return ['label', 'type', 'value'];
    }

    get inputElement() {
        return this.shadowRoot.querySelector('.mdc-text-field__input');
    }

    set label( /** @type {string} */ val) {
        this.setAttribute('label', val);
    }

    get value() {
        return this.inputElement ? this.inputElement.value : this.#internalValue;
    }

    set value(val) {
        this.#internalValue = val;
        const input = this.inputElement;
        if (input) {
            input.value = val;
            this.toggleValueClass(input);
        }
    }

    connectedCallback() {
        if (this.hasAttribute('value')) {
            this.value = this.getAttribute('value');
        }
        this.setupListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'value') {
            this.value = newValue;
            return;
        }

        const input = this.inputElement;
        const labelText = this.shadowRoot.querySelector('.mdc-floating-label');

        if (name === 'label' && labelText) labelText.textContent = newValue;
        if (name === 'type' && input) input.type = newValue;
    }

    toggleValueClass(input) {
        if (input && input.value && input.value.trim() !== "") {
            input.classList.add('has-value');
        } else if (input) {
            input.classList.remove('has-value');
        }
    }

    setupListeners() {
        const input = this.inputElement;
        if (!input) return;

        input.addEventListener('blur', () => this.toggleValueClass(input));
        input.addEventListener('input', () => {
            this.#internalValue = input.value;
            this.toggleValueClass(input);
            this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        });
    }

    renderShell() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
          max-width: 300px;
          --primary-color: #6200ee;
          --text-color: #333;
          --bg-color: #f5f5f5;
          --border-color: rgba(0, 0, 0, 0.42);
        }

        .mdc-text-field {
          position: relative;
          display: flex;
          width: 100%;
          height: 56px;
          background-color: var(--bg-color);
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          box-sizing: border-box;
          cursor: text;
        }

        .mdc-text-field__input {
          width: 100%;
          border: none;
          border-bottom: 1px solid var(--border-color);
          background: transparent;
          padding: 20px 16px 6px;
          font-size: 16px;
          color: var(--text-color);
          outline: none;
          box-sizing: border-box;
        }

        .mdc-floating-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(0, 0, 0, 0.6);
          font-size: 16px;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          transform-origin: left top;
        }

        .mdc-line-ripple {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary-color);
          transform: scaleX(0);
          transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Modern Parent Selection Logic via :has() */
        .mdc-text-field:has(.mdc-text-field__input:focus) .mdc-floating-label,
        .mdc-text-field:has(.mdc-text-field__input.has-value) .mdc-floating-label {
          transform: translateY(-100%) scale(0.75);
          color: var(--primary-color);
        }

        .mdc-text-field:has(.mdc-text-field__input.has-value):not(:has(.mdc-text-field__input:focus)) .mdc-floating-label {
          color: rgba(0, 0, 0, 0.6);
        }

        .mdc-text-field:has(.mdc-text-field__input:focus) .mdc-line-ripple {
          transform: scaleX(1);
        }
      </style>

      <label class="mdc-text-field">
        <input type="text" class="mdc-text-field__input">
        <span class="mdc-floating-label"></span>
        <div class="mdc-line-ripple"></div>
      </label>
    `;
    }
}

customElements.define('mdc-input', MdcInput);
