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

const modBells = await importFc4i("bell-engine");
const syntBells = modBells.getBellNames();
const fileBells = [
    '../ext/bells/sbell2_10s.mp3',
];

/**
 *
 * @param {string} prefix
 */
export function setStoringPrefix(prefix) {
    if (typeof storingPrefix == "string") {
        debugger;
        throw Error(`storingPrefix already set, "${storingPrefix}", prefix: "${prefix}"`);
    }
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
    const checkVal = (val) => {
        if (!(val.startsWith("s:") || val.startsWith("f:"))) {
            debugger;
            throw Error(`val == "${val}, does not start with i: or f:`);
        }
    }
    const exVal = objJson.exhale;
    if (exVal != "same") checkVal(exVal);
    const inVal = objJson.inhale;
    checkVal(inVal);
}
/**
 * 
 * @returns {SoundRec}
 */
export function getSoundRec() {
    checkStoringPrefix();
    const strJson = localStorage.getItem(storingPrefix + KEY);
    let objJson;
    if (!strJson) {
        objJson = { inhale: `s:${syntBells[0]}`, exhale: "same" }
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

    /** @type {Object|undefined} */
    let lastBell;
    function stopLastBell() {
        if (!lastBell) throw ("lastBell is undefined");
        lastBell.stop();
        lastBell.btn.classList.remove("test-sound-playing");
        lastBell = undefined;
    }

    /**
     * 
     * @param {string|HTMLSpanElement} label
     * @param {string} bell
     * @param {boolean} isInhale
     * @param {string|undefined} currentBell
     * @returns {HTMLLabelElement}
     */
    const mkRadBell = (label, bell, isInhale, currentBell) => {
        const bellGroup = (isInhale ? "inhale" : "exhale");
        const rad = mkElt("input", { type: "radio", name: bellGroup, value: bell });
        if (bell == currentBell) rad.checked = true;
        const ico = modMdc.mkMDCicon("play_arrow");
        /*
        // Too much trouble using mdc here!
        const btn = modMdc.mkMDCfab(ico, "Play sound", true);
        btn.style = `
        --mdc-ripple-fg-size: 28;
    --mdc-ripple-fg-scale: 1.7140316281999861;
    --mdc-ripple-left: 10px;
    --mdc-ripple-top: 10px;
        `;
        */
        // const btn = mkElt("button", undefined, "Play sound");
        const icon = modMdc.mkMDCicon("play_arrow");
        const btn = mkElt("button", undefined, icon);
        btn.style = `
            border: none;
            border-radius: 8px;
            display: flex;
            background-color: red;
        `;
        btn.addEventListener("click", async evt => {
            evt.stopPropagation();
            if (lastBell) {
                const isLastBell = lastBell.btn == btn;
                stopLastBell();
                if (isLastBell) return;
            }
            const target = evt.target;
            const lbl = target.closest("label.label-bell");
            const rad = lbl.querySelector("input[type=radio]");
            let bellName = rad.value;
            if (bellName == "same") {
                const rec = getSoundRec();
                bellName = rec.inhale;
            }
            btn.classList.add("test-sound-playing");
            lastBell = await modBells.strikeBellById(bellName, !isInhale, { stopAtSec: 8 });
            lastBell.btn = btn;
            console.log({ lastBell });
            setTimeout(() => {
                if (!lastBell) return;
                const isLastBell = lastBell.btn == btn;
                if (!isLastBell) return;
                stopLastBell();
            }, 5 * 1000);
        });
        const lbl = mkElt("label", undefined, [rad, label, btn]);
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
    // const inhale = await modBells.createExternalBellFromFile('../ext/bells/sbell2_10s.mp3',
    // const addFileBell = (url) => { fileBells.push(url); }
    // addFileBell('../ext/bells/sbell2_10s.mp3');


    /**
     * 
     * @param {string} internalName 
     * @returns {string|HTMLSpanElement}
     */
    function bell2UI(internalName) {
        switch (internalName) {
            case "Bowl 1 · 432 Hz":
                return "Synt 1";
            case "Bowl 2 · 432 Hz":
                return "Synt 2";
            case "../ext/bells/sbell2_10s.mp3":
                return "Bell 1";
            default:
                return mkElt("span", { style: "color:red;" }, internalName);
        }
    }

    /**
     * @callback FunAddBell2UI
     * @param {HTMLDivElement} targetDiv 
     * @param {boolean} isInhale 
     * @param {string} currentBell 
     */

    /** @type {FunAddBell2UI} */
    const addSyntBells = (targetDiv, isInhale, currentBell) => {
        syntBells.forEach(bellName => {
            const name4UI = bell2UI(bellName);
            const lbl = mkRadBell(name4UI, `s:${bellName}`, isInhale, currentBell);
            lbl.classList.add("label-bell");
            targetDiv.appendChild(lbl);
        });
    }
    /** @type {FunAddBell2UI} */
    const addFileBells = (targetDiv, isInhale, currentBell) => {
        fileBells.forEach(bellName => {
            const name4UI = bell2UI(bellName);
            const lbl = mkRadBell(name4UI, `f:${bellName}`, isInhale, currentBell);
            lbl.classList.add("label-bell");
            targetDiv.appendChild(lbl);
        });
    }

    const styleDivBells = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const currentBells = getSoundRec();
    const divInhaleBells = mkElt("div");
    divInhaleBells.style = styleDivBells;
    const divInhale = mkElt("p", undefined, [
        mkGroupName("Inhale"),
        divInhaleBells,
    ]);
    addFileBells(divInhaleBells, true, currentBells.inhale);
    addSyntBells(divInhaleBells, true, currentBells.inhale);

    const lblSame = mkRadBell("Same as inhale", "same", false, currentBells.exhale);
    lblSame.classList.add("label-bell");
    const divExhaleBells = mkElt("div", undefined, lblSame);
    divExhaleBells.style = styleDivBells;
    const divExhale = mkElt("p", undefined, [
        mkGroupName("Exhale"),
        mkElt("div", { style: "font-style:italic; opacity:0.7; margin-bottom:9px;" }, "Exhale bells are shifted to a lower frequency"),
        divExhaleBells,
    ]);
    addFileBells(divExhaleBells, false, currentBells.exhale);
    addSyntBells(divExhaleBells, false, currentBells.exhale);
    const divBells = mkElt("div", undefined, [
        divInhale,
        divExhale,
    ]);
    divBells.addEventListener("change", _evt => {
        // debugger;
        const radInhale = divBells.querySelector("input[type=radio][name=inhale]:checked");
        const radExhale = divBells.querySelector("input[type=radio][name=exhale]:checked");
        const soundInhale = radInhale.value;
        const soundExhale = radExhale.value;
        setSoundRec({ inhale: soundInhale, exhale: soundExhale });
    })
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, ["Bell Sounds ", iconSound]),
        divBells,
    ]);
    body.classList.add("colored-dialog");
    modMdc.mkMDCdialogAlert(body, "close");
}

// audiocontent
export function startKeepAliveSound(){
    /** @type {AudioContext} */
    const audioCtx = modBells.getAudioContext();
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let source;
    // Fill with very low-level white noise (inaudible)
    for (let i = 0; i<bufferSize; i++) {
        data[i] = (Math.random()*2 -1) * 0.0001; // ^80dB
    }
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(audioCtx.destination);
    source.start();
    return source;
}