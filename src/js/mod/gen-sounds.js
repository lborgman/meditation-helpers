// @ts-nocheck

console.log("This is gen-sounds.js");

/** @typedef {number} frequency */
/** @typedef {number} gain */
/** @typedef {{frequency: frequency, gain: gain }} oscTemplate */

/**
 * 
 * @param {frequency} frequency 
 * @param {gain} gain 
 * @returns {oscTemplate}
 */
function mkOscWAtemplate(frequency, gain) {
    return { frequency, gain }
}

function hideTone() {
    ///////////////////////////////////////
    ///////// ToneJs
    async function importTone() {
        if (window["Tone"] != undefined) return;
        // @ts-ignore import
        await import("https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js");
        // @ts-ignore tonejs
        await Tone.start();
    }
    async function mkDivToneExamples() {
        await importTone();

        // the Tone examples:
        const linkExamples = "https://tonejs.github.io/";
        const aExamples = TSmkElt("a", { href: linkExamples }, linkExamples);
        const btnSynth = TSmkElt("button", undefined, "Synth");
        btnSynth.addEventListener("click", evt => {
            // @ts-ignore Tone
            const synth = new Tone.Synth().toDestination();
            // @ts-ignore Tone
            const now = Tone.now();
            // trigger the attack immediately
            synth.triggerAttack("C4", now);
            // wait one second before triggering the release
            synth.triggerRelease(now + 1);
            console.log("done example Synth");
        });
        const btnInstruments = TSmkElt("button", undefined, "Instruments");
        btnInstruments.addEventListener("click", evt => {
            // @ts-ignore Tone
            const synth = new Tone.PolySynth(Tone.Synth).toDestination();
            // @ts-ignore Tone
            const now = Tone.now();
            synth.triggerAttack("D4", now);
            synth.triggerAttack("F4", now + 0.5);
            synth.triggerAttack("A4", now + 1);
            synth.triggerAttack("C5", now + 1.5);
            synth.triggerAttack("E5", now + 2);
            synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 4);
            console.log("done example Instruments");
        });
        const btnTransport = TSmkElt("button", undefined, "Transport");
        btnTransport.addEventListener("click", evt => {
            // create two monophonic synths
            // @ts-ignore Tone
            const synthA = new Tone.FMSynth().toDestination();
            // @ts-ignore Tone
            const synthB = new Tone.AMSynth().toDestination();
            //play a note every quarter-note
            // @ts-ignore Tone
            const loopA = new Tone.Loop((time) => {
                synthA.triggerAttackRelease("C2", "8n", time);
            }, "4n").start(0);
            //play another note every off quarter-note, by starting it "8n"
            // @ts-ignore Tone
            const loopB = new Tone.Loop((time) => {
                synthB.triggerAttackRelease("C4", "8n", time);
            }, "4n").start("8n");
            // all loops start when the Transport is started
            // @ts-ignore Tone
            Tone.getTransport().start();
            // ramp up to 800 bpm over 10 seconds
            // @ts-ignore Tone
            Tone.getTransport().bpm.rampTo(800, 10);
            console.log("done example Transport");
        });
        const btnSignals = TSmkElt("button", undefined, "Signals");
        btnSignals.addEventListener("click", evt => {
            // @ts-ignore Tone
            const osc = new Tone.Oscillator().toDestination();
            // start at "C4"
            osc.frequency.value = "C4";
            // ramp to "C2" over 2 seconds
            osc.frequency.rampTo("C2", 2);
            // start the oscillator for 2 seconds
            osc.start().stop("+3");
            console.log("done example Signals");
        });

        return TSmkElt("div", undefined, [
            aExamples,
            btnSynth,
            btnInstruments,
            btnTransport,
            btnSignals,
        ]);
    }
}



///////////////////////////////////////
///////// WebAudio API

// https://api.pageplace.de/preview/DT0400.9781000569933_A42679351/preview-9781000569933_A42679351.pdf
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
// https://music.arts.uci.edu/dobrian/webaudio/tutorials/
// https://stackoverflow.com/questions/33006650/web-audio-api-and-real-current-time-when-playing-an-audio-file

const ctxAudio = new AudioContext();

export async function dialogTestWAsound() {
    // @ts-ignore import
    const modMdc = await import("util-mdc");

    const settingFreqBase = new ourLocalSetting("test-freqInit", 110);
    const inpFreqBase = TSmkElt("input", { type: "number" });
    settingFreqBase.bindToInput(inpFreqBase);
    const lblFreqBase = TSmkElt("label", undefined, ["freqBase:", inpFreqBase]);


    const settingOvertonesWA1 = new ourLocalSetting("test-overtones-wa1", []);
    const divOverTones = TSmkElt("div");
    updateDivOvertones();
    function updateDivOvertones() {
        divOverTones.textContent = "";
        const recs = settingOvertonesWA1.value;
        for (let i = 0, len = recs.length; i < len; i++) {
            const rec = recs[i];
            const spanOvertone = TSmkElt("span", undefined, [
                TSmkElt("span", undefined, `Tone steps: ${rec.diffTones}`),
                `Diff dB: ${rec.diffDB}`
            ]);
            // @ts-ignore style
            spanOvertone.style = `
                display: flex;
                flex-direction: column;
            `;
            const iRec = i;
            const iconDelete = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCiconButton(iconDelete);
            btnDelete.addEventListener("click", evt => {
                recs.splice(iRec, 1);
                settingOvertonesWA1.value = recs;
                updateDivOvertones();
            });
            const divOverTone = TSmkElt("div", undefined, [
                spanOvertone, btnDelete
            ]);
            divOverTone.classList.add("mdc-card");
            // @ts-ignore style
            divOverTone.style = `
                display: grid;
                grid-template-columns: 1fr 50px;
                padding: 10px;
                width: 100%;
            `
            divOverTones.appendChild(divOverTone);
        }
    }

    const settingToneStepsDuration = new ourLocalSetting("test-toneStepsDuration", 3);
    const inpToneSteps = TSmkElt("input", { type: "number" });
    settingToneStepsDuration.bindToInput(inpToneSteps);
    const lblFreqGoal = TSmkElt("label", undefined, ["toneSteps:", inpToneSteps]);

    const settingDuration = new ourLocalSetting("test-soundDuration", 2.1);
    const inpDuration = TSmkElt("input", { type: "number" });
    settingDuration.bindToInput(inpDuration);
    const lblDuration = TSmkElt("label", undefined, ["duration:", inpDuration]);

    const oscWA1 = [];
    const oscTemplatesWA1 = settingOvertonesWA1.value;

    const btnWA1 = modMdc.mkMDCbutton("Play sound");
    btnWA1.id = "button-wa1";
    btnWA1.addEventListener("click", evt => {
        let msStart, msDuration, msEnd;
        let numRedraw;
        const maxRedraw = 1000;
        const secDuration = settingDuration.value;
        if (oscWA1.length > 0) { stop(); } else { start(); }
        function start() {
            msStart = Date.now();
            msDuration = secDuration * 1000;
            msEnd = msStart + msDuration;
            console.log("START", { secDuration });
            setTimeout(stop, secDuration * 1000);
            startOscWA1();
            startPie();
        }
        function stop() {
            console.log("STOP");
            stopOscWA1();
            stopPie();
        }
        function startPie() {
            numRedraw = 0;
            drawNextPie();
        }
        function stopPie() {
            numRedraw = maxRedraw + 1;
        }
        function drawNextPie() {
            const ms = Date.now();
            if (ms > msEnd) {
                stopPie();
                return;
            }
            const part = ms / msDuration;
            clearCanvasWA();
            drawPie(part);
            requestAnimationFrame(
                () => {
                    if (numRedraw++ > maxRedraw) {
                        console.log("stopping sec check", { numRedraw });
                        return;
                    }
                    drawNextPie();
                }
            )
        }
        function stopOscWA1() {
            stopOscillators(oscWA1);
            // @ts-ignore style
            btnWA1.style.backgroundColor = null;
            btnWA1.style.color = null;
            const eltLabel = btnWA1.querySelector(".mdc-button__label");
            eltLabel.textContent = "Play sound";
        }
        function startOscWA1() {
            const arrTemplates = [];
            arrTemplates.push(mkOscWAtemplate(settingFreqBase.value, 1));
            const toneSteps = settingToneStepsDuration.value
            startOscillators(oscWA1, arrTemplates, secDuration, toneSteps);
            // @ts-ignore style
            btnWA1.style.backgroundColor = "green";
            btnWA1.style.color = "yellow";
            const eltLabel = btnWA1.querySelector(".mdc-button__label");
            eltLabel.textContent = "Stop sound";

        }
        console.log("done WA1", oscWA1);
    });


    const btnAddOvertone = modMdc.mkMDCbutton("Add");
    btnAddOvertone.addEventListener("click", TSDEFerrorHandlerAsyncEvent(async evt => {
        /** @type {HTMLInputElement} */
        const inpSteps = document.createElement("input");
        inpSteps.type = "number";
        const lblSteps = TSmkElt("label", undefined, ["Diff tones:", inpSteps]);
        /** @type {HTMLInputElement} */
        const inpDb = document.createElement("input");
        inpDb.type = "number";
        const lblDb = TSmkElt("label", undefined, ["Diff dB:", inpDb]);
        const bdy = TSmkElt("div", undefined, [
            TSmkElt("h2", undefined, "Add overtone"),
            lblSteps,
            lblDb
        ]);
        bdy.addEventListener("input", evt => {
            console.log({ evt });
        });
        bdy.id = "div-dialog-overtone";
        bdy.style.touchAction = "none";
        bdy.style.background = "yellowgreen";
        const ans = await modMdc.mkMDCdialogConfirm(bdy);
        console.log({ ans });
        if (ans) {
            const oldVal = settingOvertonesWA1.value;
            oldVal.push({
                diffTones: inpSteps.value,
                diffDB: inpDb.value
            });
            settingOvertonesWA1.value = oldVal;
            updateDivOvertones();
        }
    }));
    const sumWAsubs = TSmkElt("summary", undefined, "overtones");
    const detWAsubs = TSmkElt("details", undefined, [
        sumWAsubs,
        btnAddOvertone,
        divOverTones,
    ]);

    const sumWAdyn = TSmkElt("summary", undefined, "dynamics");
    const detWAdyn = TSmkElt("details", undefined, [
        sumWAdyn,
        lblDuration,
        lblFreqGoal,
    ]);

    const eltCanvasWA = document.createElement("canvas");
    // @ts-ignore style
    eltCanvasWA.style = `
        height: 100%;
        aspect-ratio: 1 / 1;
        outline: 1px dotted green;
    `;
    eltCanvasWA.width = 30;
    eltCanvasWA.height = 30;
    const ctxCanvasWA = eltCanvasWA.getContext("2d");

    const modSvgPie = await import("svg-things");

    drawPie(0.25);
    function clearCanvasWA() { ctxCanvasWA.clearRect(0, 0, 30, 30); }
    function drawPie(part) { modSvgPie.drawPie(ctxCanvasWA, 15, 15, 10, "red", part); }

    const divSec = TSmkElt("span", undefined, `${settingDuration.value} sec`);
    const divBtnWA = TSmkElt("div", undefined, [btnWA1, eltCanvasWA, divSec]);
    divBtnWA.style = `
        display: flex;
        gap: 10px;
    `;
    const divWA = TSmkElt("div", undefined, [
        divBtnWA,
        lblFreqBase,
        detWAsubs,
        detWAdyn,
    ]);
    divWA.id = "div-test-webaudio";

    const body = TSmkElt("div", undefined, [
        TSmkElt("p", { style: "background:yellow; color:red; padding:4px;" }, "not working at the moment"),
        divWA,
    ]);
    body.addEventListener("NOclick", evt => {
        modMdc.mkMDCsnackbar("clicked body");
        body.style.backgroundColor = "red";
        // @ts-ignore style
        setTimeout(() => { body.style.backgroundColor = null; }, 500);
    });
    modMdc.mkMDCdialogAlert(body, "Close");
}

/**
 * 
 * @param {number} dB 
 * @returns  {number}
 */
function dB2ratio(dB) { return Math.pow(10, dB / 10); }

function stopOscillators(arrOsc) {
    arrOsc.forEach(osc => { osc.stop(); });
    arrOsc.length = 0;
}


function startOscillators(arrOsc, arrOscTemplates, duration, toneSteps) {
    toneSteps = toneSteps || 0;
    /*
    const freqBase = settingFreqBase.value;
    const toneSteps2 = settingToneSteps2.value;
    const freq2 = freqBase * Math.pow(2, toneSteps2 / 12);
    const toneStepsDuration = settingToneStepsDuration.value;
    const duration = settingDuration.value;
    const freqBaseGoal = freqBase * Math.pow(2, toneStepsDuration / 12);
    const freq2Goal = freq2 * Math.pow(2, toneStepsDuration / 12);
    const gain2 = dB2ratio(settingGainDb2.value);

    arrOsc.push(startStopOscWA(freqBase, freqBaseGoal, duration, 1));
    arrOsc.push(startStopOscWA(freq2, freq2Goal, duration, gain2));
    */
    arrOscTemplates.forEach(rec => {
        const freq = rec.frequency;
        const freqGoal = freq * Math.pow(2, toneSteps / 12);
        const gain = rec.gain;
        arrOsc.push(startStopOscWA(freq, freqGoal, duration, gain));
    }
    )
    arrOsc.forEach(osc => { osc.start(); });
}

/**
 * 
 * @param {number} freqInit 
 * @param {number} freqGoal 
 * @param {number} secToGoal 
 * @param {number} gain 
 */
function startStopOscWA(freqInit, freqGoal, secToGoal, gain) {
    // https://music.arts.uci.edu/dobrian/webaudio/tutorials/WebAudioAPI/simpleoscillator.html
    const osc = ctxAudio.createOscillator();
    const startTime = ctxAudio.currentTime; // FIX-ME: startTime
    osc.frequency.setValueAtTime(freqInit, startTime)
    osc.frequency.linearRampToValueAtTime(freqGoal, startTime + secToGoal);
    const amp = ctxAudio.createGain();
    amp.gain.setValueAtTime(gain, startTime);
    // osc.connect(ctxAudio.destination);
    osc.connect(amp);
    amp.connect(ctxAudio.destination);
    if (!isNaN(secToGoal)) {
        if (secToGoal > 0) {
            setTimeout(() => {
                stop();
            }, secToGoal * 1000);
        }
    }
    return osc;
}

// https://wellness-space.net/frequencies-of-a-singing-bowl/
// https://www.hibberts.co.uk/building-a-bell-sound/