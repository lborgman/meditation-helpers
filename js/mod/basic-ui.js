// @ts-check

const BASIC_UI_VER = "0.0.01";
// @ts-ignore
logConsoleHereIs(`here is basic-ui.js, module,${BASIC_UI_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

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
    return valFun();
}
/**
 * 
 * @param {HTMLDivElement} bdy 
 * @param {string} [yes]
 * @param {string} [no]
 */
export async function showDialogConfirm(bdy, yes, no) {
    yes = yes || "OK";
    no = no || "Cancel";
    const btnYes = mkElt("button", undefined, yes);
    const btnNo = mkElt("button", undefined, no);
    const fun = async () => {
        await new Promise(resolve => {
            btnYes.addEventListener("click", evt => {
                resolve(true);
                closeDialog(btnYes);
            });
            btnNo.addEventListener("click", evt => {
                resolve(false);
                closeDialog(btnNo);
            });
        });
    }
    await showDialog(bdy, fun, [btnYes, btnNo]);
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