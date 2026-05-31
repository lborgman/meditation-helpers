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

const modIcons = await importFc4i("google-icons");
const modBasicUI = await importFc4i("basic-ui");

const modLocalFileReader = await importFc4i("local-file-reader");
const keyUserExhale = "user-exhale-sound";
const keyUserInhale = "user-inhale-sound";
async function getUserInhaleSound() {
    // FIX-ME: When to release the blob??
    const savedFileBlob = await modLocalFileReader.getSavedFileBlob(keyUserInhale);
    if (!savedFileBlob) return "";
    const url = URL.createObjectURL(savedFileBlob);
    // document.documentElement.style.backgroundImage = `url(${url})`;
    return url;
}

const modBells = await importFc4i("bell-engine");
// const syntBells = modBells.getBellNames();
// const fileBells = [ ];
const fileBellGroups = {
    "pixabay": {
        urlInternal: "pixabay",
        urlExternal: "https://pixabay.com/sound-effects/"
    }
};

async function getFirstBell() {
    const groups = Object.keys(fileBellGroups);
    const grpName = groups[0];
    const grp = fileBellGroups[grpName];
    const urlInternal = `../../ext/sounds/${grp.urlInternal}/out/index-files.mjs`;
    const mod = await import(urlInternal);
    console.log(mod);
    const files = mod.files();
    const file0 = files[0]
    // debugger;
    return mod.myUrl(file0);
}
try {
    const first = await getFirstBell();
    console.log({ first });
    // debugger;
} catch (err) {
    console.log({ err });
    debugger;
}

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
 * @returns {Promise<SoundRec>}
 */
export async function getSoundRec() {
    checkStoringPrefix();
    const strJson = localStorage.getItem(storingPrefix + KEY);
    let objJson;
    if (!strJson) {
        const first = await getFirstBell();
        const [firstBell] = first.split(";;");
        debugger;
        objJson = { inhale: `f:${firstBell}`, exhale: "same" }
        // return null;
        // objJson = { inhale: `s:${syntBells[0]}`, exhale: "same" }
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
    const blobUserExhale = await modLocalFileReader.getSavedFileBlob(keyUserExhale);
    const blobUserInhale = await modLocalFileReader.getSavedFileBlob(keyUserInhale);
    let hasUserExhale = false;
    let hasUserInhale = false;
    setUserExhale(!!blobUserExhale);
    setUserInhale(!!blobUserInhale);
    /** @param {boolean} has */
    function setUserInhale(has) {
        console.log("setUserInhale", has);
        hasUserInhale = has;
    }
    /** @param {boolean} has */
    function setUserExhale(has) {
        console.log("setUserExhale", has);
        hasUserExhale = has;
    }

    // debugger;
    // dialogImages
    // const modMdc = await importFc4i("util-mdc");
    const iconSound = modIcons.mkGIcon("notification_sound");

    const soundRec = await getSoundRec();

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
        if (isInhale) {
            if (bell == soundRec?.inhale) rad.checked = true;
        } else {
            if (bell == soundRec?.exhale) rad.checked = true;
        }
        if (bell == currentBell) rad.checked = true;

        const icon = modIcons.mkGIcon("play_arrow");
        const btn = mkElt("button", undefined, icon);
        btn.style = `
            display: flex;
            flex-wrap: wrap;
            align-content: center;
            border: none;
            border-radius: 8px;
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
            // const lbl = target.closest("label.label-bell");
            const div = target.closest("div.label-bell");
            // const rad = lbl.querySelector("input[type=radio]");
            const rad = div.querySelector("input[type=radio]");
            const showName = lbl.firstElementChild.nextSibling.textContent;
            let bellName = rad.value;
            if (bellName == "same") {
                const rec = await getSoundRec();
                bellName = rec.inhale;
            }
            const modVizVol = await importFc4i("viz-volume")
            if (bellName.startsWith("f:")) {
                const urlBell = bellName.slice(2);
                modVizVol.showViz({
                    sound: {
                        soundName: showName,
                        soundSource: urlBell,
                    }
                });
                return;
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
        // const lbl = mkElt("label", undefined, [rad, label, btn]);
        const lbl = mkElt("label", undefined, [rad, label]);
        lbl.style = `
            display: inline-flex;
            align-items: center;
            gap: 5px;
        `;
        const div = mkElt("div", undefined, [lbl, btn]);
        div.style = `
            max-width: 280px;
            width: 100%;
            display: flex;
            justify-content: space-between;
        `;
        // return lbl;
        return div;
    }
    const mkGroupName = (grp) => mkElt("div", { style: "font-weight:bold; font-size:1.2em" }, grp);


    /**
     * @param {string} internalName 
     * @returns {string|HTMLSpanElement}
     */
    function sound2UI(internalName) {
        switch (internalName) {
            case "Bowl 1 · 432 Hz":
                return "Synt 1";
            case "Bowl 2 · 432 Hz":
                return "Synt 2";
            case "../ext/bells/sbell2_10s.mp3":
                return "Bell 1";
            case '../md-timer/sounds/freesound.org/cat-purr-full.mp3':
                return "Cat";
            case "pixabay:freesound_community-bell-bowl-g-ish-74001.mp3":
                return "Bowl bell g-ish";
            default:
                return mkElt("span",
                    { style: "color:red; user-select:all; line-break: anywhere;" },
                    `"${internalName}"`);
        }
    }

    /**
     * @param {string} internalName 
     * @returns {string}
     */
    function sound2sourceUI(internalName) {
        switch (internalName) {
            case "pixabay:freesound_community-bell-bowl-g-ish-74001.mp3":
                return "bell-bowl G-ish";
            default:
                return mkElt("span",
                    { style: "color:red; user-select:all; line-break: anywhere;" },
                    `"${internalName}"`);
        }
    }


    /**
     * @callback FunAddBell2UI
     * @param {HTMLDivElement} targetDiv 
     * @param {boolean} isInhale 
     * @param {string} currentBell 
     */


    /** @type {FunAddBell2UI} */
    const addFileBells = async (targetDiv, isInhale, currentBell) => {
        const proms = [];
        const groups = Object.keys(fileBellGroups);
        groups.forEach(async grpName => {
            const grp = fileBellGroups[grpName];
            const urlInternal = `../../ext/sounds/${grp.urlInternal}/out/index-files.mjs`;
            const urlExternal = grp.urlExternal;
            if (!urlExternal) {
                debugger;
            }
            const prom = import(urlInternal);
            proms.push(prom);
            const mod = await prom;
            console.warn({ grpName });
            const aGrp = mkElt("a", {
                href: urlExternal,
                target: "_blank"
            }, grpName);
            // const eltGrpName = mkElt("div", undefined, `${grpName}:`);
            const eltGrpName = mkElt("div", undefined, ["From ", aGrp, ":"]);
            targetDiv.appendChild(eltGrpName);
            try {
                const soundRows = mod.files();
                soundRows.forEach(soundRow => {
                    const [bellShort, _start, name4UI] = soundRow.split(";;");
                    const showName = name4UI ? name4UI : bellShort;
                    // const bellName = mod.myUrl(bellShort);
                    // const name4UI = sound2UI(`${grpName}:${bellShort}`);
                    const nameSourceUI = sound2sourceUI(`${grpName}:${bellShort}`);
                    const bellUrl = mod.myUrl(bellShort)
                    const lbl = mkRadBell(showName, `f:${bellUrl}`, isInhale, currentBell);
                    lbl.classList.add("label-bell");
                    lbl.title = nameSourceUI;
                    // debugger;
                    targetDiv.appendChild(lbl);
                })
            } catch (err) {
                console.error(grpName, urlInternal, err);
                debugger;
            }
        });
        await Promise.allSettled(proms);
    }

    const styleDivBells = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const currentBells = await getSoundRec();
    const divInhaleBells = mkElt("div");
    divInhaleBells.style = styleDivBells;
    const divInhale = mkElt("p", undefined, [
        mkGroupName("Inhale"),
        divInhaleBells,
    ]);
    await addFileBells(divInhaleBells, true, currentBells.inhale);
    const btnUserChoice = mkElt("button", undefined, "Select");
    btnUserChoice.addEventListener("click", evt => {
        evt.stopImmediatePropagation();
        // const xClose = mkXclose();
        const bdy = mkElt("div", undefined, [
            mkElt("h2", undefined, "Your sound: inhale"),
            "hej",
            // xClose
        ]);
        const dlg = mkElt("dialog", undefined, bdy);
        modBasicUI.addXclose(dlg);
        document.documentElement.appendChild(dlg);
        dlg.showModal();
    });
    // const eltUserChoice = mkElt("span", { style: "color:red" }, [ "Your choice", btnUserChoice ]);
    const eltUserBell2 = mkRadBell("Your sound", "user-inhale", true, undefined);
    // debugger;
    // eltUserBell2.insertBefore(btnUserChoice, eltUserBell2.lastElementChild);
    const btnTestUserInhale = eltUserBell2.lastElementChild;
    btnTestUserInhale.inert = true;
    const eltUserChoice = mkElt("div", undefined, [
        btnTestUserInhale,
        btnUserChoice,
    ]);
    eltUserChoice.style = `
        display: inline-flex;
        gap: 10px;
    `;

    // eltUserChoice.appendChild(btnTestUserInhale);
    eltUserBell2.appendChild(eltUserChoice);
    eltUserBell2.id = "div-user-inhale";

    eltUserBell2.firstElementChild.inert = true;

    divInhaleBells.appendChild(eltUserBell2);
    // addSyntBells(divInhaleBells, true, currentBells.inhale);


    const lblSame = mkRadBell("Same (lower freq)", "same", false, currentBells?.exhale);
    lblSame.classList.add("label-bell");
    const divExhaleBells = mkElt("div", undefined, lblSame);
    divExhaleBells.style = styleDivBells;
    const divExhale = mkElt("p", undefined, [
        mkGroupName("Exhale"),
        divExhaleBells,
    ]);
    // await addFileBells(divExhaleBells, false, currentBells.exhale);
    await addFileBells(divExhaleBells, false, currentBells.exhale);
    // addSyntBells(divExhaleBells, false, currentBells.exhale);
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
    // modMdc.mkMDCdialogAlert(body, "close");
    showDialog(body);
    function showDialog(body) {
        const dlg = mkElt("dialog", undefined, body);
        document.documentElement.appendChild(dlg);
        dlg.appendChild(modBasicUI.mkXclose());
        dlg.showModal();
    }
}

// audiocontent
export function startKeepAliveSound() {
    /** @type {AudioContext} */
    const audioCtx = modBells.getAudioContext();
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let source;
    // Fill with very low-level white noise (inaudible)
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.0001; // ^80dB
    }
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(audioCtx.destination);
    source.start();
    return source;
}



///// Maybe implement user selected sounds??
// https://pixabay.com/sound-effects/search/birds/
// https://pixabay.com/sound-effects/
