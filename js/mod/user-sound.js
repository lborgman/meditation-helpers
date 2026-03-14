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
    const expectedNames = "inhale,exhale";
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
        objJson = { inhale: "BELL[0]", exhale: "BELL[0]" }
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
    // alert("not ready");
    const modMdc = await importFc4i("util-mdc");
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Bell Sound"),
    ]);
    modMdc.mkMDCdialogAlert(body, "close");
}