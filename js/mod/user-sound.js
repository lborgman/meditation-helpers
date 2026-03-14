// @ts-check
const USER_SOUND_VER = "0.0.5";
// @ts-ignore
window["logConsoleHereIs"](`here is user-sound.js, module, ${USER_SOUND_VER}`);
if (document.currentScript) { throw "user-sound.js is not loaded as module"; }

// @ts-ignore
const mkElt = window["mkElt"];
// const errorHandlerAsyncEvent = window["errorHandlerAsyncEvent"];
// @ts-ignore
const importFc4i = window["importFc4i"];

/** @type {string} */
let storingPrefix;
const KEY = "user-sound";

/**
 *
 * @param {string} prefix
 */
export function setStoringPrefix(prefix) {
    const tofPrefix = typeof prefix;
    if (tofPrefix != "string") throw Error(`setStoringPrefix, arg not string: ${tofPrefix}`);
    if (storingPrefix != undefined) {
        if (storingPrefix != prefix) {
            throw Error(`setStoringPrefix new: ${prefix}, old: ${storingPrefix}`);
        }
    }
    storingPrefix = prefix;
}
function checkStoringPrefix() {
    if (typeof storingPrefix != "string") throw Error(`storingPrefix not set`);
}


/**
 * @typedef {Object} SoundRec
 * @property {string} inhale
 * @property {string} exhale
 * 
 */
/**
 * @param {SoundRec} objJson 
 * @throws
 */
function checkSoundRec(objJson) {
    const keys = Object.keys(objJson);
    const keyNames = keys.sort().join(",");
    const expectedNames = "exhale,inhale";
    if (keyNames != expectedNames) {
        console.error({ keyNames });
        debugger;
        throw Error(`Expected "${expectedNames}", found "${keyNames}"`);
    }
}
/**
 * 
 * @returns {SoundRec}
 */
function getSoundRec() {
    checkStoringPrefix();
    const strJson = localStorage.getItem(storingPrefix + KEY);
    let objJson;
    if (!strJson) {
        objJson = { inhale: "internal:1", exhale: "same" }
    } else {
        objJson = JSON.parse(strJson);
    }
    checkSoundRec(objJson);
    return objJson;
}
/**
 * @param {SoundRec} objJson 
 * @throws
 */
function setSoundRec(objJson) {
    checkSoundRec(objJson);
    checkStoringPrefix();
    const strJson = JSON.stringify(objJson);
    localStorage.setItem(storingPrefix + KEY, strJson);
}


export async function dialogSound() {
    // dialogImages
    const modMdc = await importFc4i("util-mdc");
    const iconSound = modMdc.mkMDCicon("notification_sound");

    const soundRec = getSoundRec();

    /**
     * 
     * @param {string} txt 
     * @param {string} name 
     * @param {boolean} isInhale 
     * @returns {HTMLLabelElement}
     */
    const mkRadBell = (txt, bell, isInhale) => {
        const bellGroup = (isInhale ? "inhale" : "exhale");
        const rad = mkElt("input", { type: "radio", name: bellGroup, value: bell });
        const ico = modMdc.mkMDCicon("play_arrow");
        const btn = modMdc.mkMDCfab(ico, "Play sound", true);
        btn.style = `
        --mdc-ripple-fg-size: 28;
    --mdc-ripple-fg-scale: 1.7140316281999861;
    --mdc-ripple-left: 10px;
    --mdc-ripple-top: 10px;
        `;
        btn.addEventListener("click", async evt => {
            evt.stopPropagation();
            debugger;
            // playInhale
            // const bell = modBells.createInternalSyntheticBell(modBells.BELLS[0], { pitchShift: 0.92 });
            // const bell = await modBells.createExternalBellFromFile('../ext/bells/sbell2_10s.mp3', { startOffset: 0.0, duration: 8 });
            const target = evt.target;
            const lbl = target.closest("label.label-bell");
            const rad = lbl.querySelector("input[type=radio]");
            const bellName = rad.value;
            // modBells.strikeBell(bell, { stopAtSec: 4 });
            modBells.strikeBellByName(bellName, { stopAtSec: 4 });
        });
        const lbl = mkElt("label", undefined, [rad, txt, btn]);
        if (isInhale) {
            if (bell == soundRec.inhale) rad.checked = true;
        } else {
            if (bell == soundRec.exhale) rad.checked = true;
        }
        lbl.style = `
            display: grid;
            align-items: center;
            width: 280px;
            grid-template-columns: max-content 1fr max-content;
            gap: 5px;
        `;
        return lbl;
    }
    const mkGroupName = (grp) => mkElt("div", { style: "font-weight:bold; font-size:1.2em" }, grp);
    const modBells = await importFc4i("bell-engine");
    const syntBells = modBells.getBellNames();
    // const inhale = await modBells.createExternalBellFromFile('../ext/bells/sbell2_10s.mp3',
    const fileBells = [];
    const addFileBell = (name, url) => {
        fileBells.push(name, url);
    }
    addFileBell("sBell2", '../ext/bells/sbell2_10s.mp3');
    debugger;
    /**
     * 
     * @param {HTMLDivElement} targetDiv 
     * @param {boolean} isInhale 
     */
    const addSyntBells = (targetDiv, isInhale) => {
        syntBells.forEach(bellName => {
            const lbl = mkRadBell(bellName, bellName, isInhale)
            lbl.classList.add("label-bell");
            targetDiv.appendChild(lbl);
        })
    }

    const styleDivBells = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const divInhaleBells = mkElt("div");
    divInhaleBells.style = styleDivBells;
    const divInhale = mkElt("p", undefined, [
        mkGroupName("Inhale"),
        divInhaleBells,
    ]);
    addSyntBells(divInhaleBells, true);

    const lblSame = mkRadBell("Same", "same", false);
    lblSame.classList.add("label-bell");
    const divExhaleBells = mkElt("div", undefined, lblSame);
    divExhaleBells.style = styleDivBells;
    const divExhale = mkElt("p", undefined, [
        mkGroupName("Exhale"),
        divExhaleBells,
    ]);
    addSyntBells(divExhaleBells, false);
    const divBells = mkElt("div", undefined, [
        divInhale,
        divExhale,
    ]);
    divBells.addEventListener("change", _evt => {
        debugger;
        const radInhale = divBells.querySelector("input[type=radio][name=inhale]:checked");
        const radExhale = divBells.querySelector("input[type=radio][name=exhale]:checked");
        const soundInhale = radInhale.value;
        const soundExhale = radExhale.value;
        debugger;
    })
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, ["Bell Sounds ", iconSound]),
        divBells,
    ]);
    body.classList.add("colored-dialog");
    modMdc.mkMDCdialogAlert(body, "close");
}