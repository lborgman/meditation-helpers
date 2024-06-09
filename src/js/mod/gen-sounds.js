// @ts-check

console.log("This is gen-sounds.js");

///////////////////////////////////////
///////// ToneJs
export async function importTone() {
    if (window["Tone"] != undefined) return;
    // @ts-ignore import
    await import("https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js");
    // @ts-ignore tonejs
    await Tone.start();
}
export async function mkDivToneExamples() {
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

    const settingFreqInit = new ourLocalSetting("test-freqInit", 110);
    const inpFreqInit = TSmkElt("input", { type: "number" });
    settingFreqInit.bindToInput(inpFreqInit);
    const lblFreqInit = TSmkElt("label", undefined, ["freqInit:", inpFreqInit]);

    const settingToneSteps = new ourLocalSetting("test-tone-steps", 3);
    const inpToneSteps = TSmkElt("input", { type: "number" });
    settingToneSteps.bindToInput(inpToneSteps);
    const lblFreqGoal = TSmkElt("label", undefined, ["toneSteps:", inpToneSteps]);

    const settingDuration = new ourLocalSetting("test-sound-duration", 2.1);
    const inpDuration = TSmkElt("input", { type: "number" });
    settingDuration.bindToInput(inpDuration);
    const lblDuration = TSmkElt("label", undefined, ["duration:", inpDuration]);

    const oscWA1 = [];
    // const btnWA1 = TSmkElt("button", undefined, "Test sound");
    const btnWA1 = modMdc.mkMDCbutton("Test sound");
    btnWA1.id = "button-wa1";
    btnWA1.addEventListener("click", evt => {
        if (oscWA1.length > 0) { stop(); } else { start(); }
        function stop() {
            oscWA1.forEach(osc => { osc.stop(); });
            oscWA1.length = 0;
            // @ts-ignore style
            btnWA1.style.backgroundColor = null;
        }
        function start() {
            /**
             * 
             * @param {number} freqInit 
             * @param {number} freqGoal 
             * @param {number} secToGoal 
             * @param {number} gain 
             */
            const mkAudioOsc = (freqInit, freqGoal, secToGoal, gain) => {
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
                setTimeout(stop, secToGoal * 1000);
                return osc;
            }
            const baseFreq = settingFreqInit.value;
            const toneSteps = settingToneSteps.value;
            const duration = settingDuration.value;
            const goalFreq = baseFreq * Math.pow(2, toneSteps / 12);

            oscWA1.push(mkAudioOsc(baseFreq, goalFreq, duration, 1));
            oscWA1.push(mkAudioOsc(baseFreq * 2, goalFreq * 2, duration, 1 / 2));
            oscWA1.forEach(osc => { osc.start(); });
            btnWA1.style.backgroundColor = "red";
        }
        console.log("done WA1", oscWA1);
    });



    const divWA = TSmkElt("div", undefined, [
        TSmkElt("div", undefined, btnWA1),
        lblFreqInit,
        lblFreqGoal,
        lblDuration,
    ]);
    divWA.id = "div-test-webaudio";
    /*
    // @ts-ignore style
    divWA.style = `
                padding: 10px;
                background: yellow;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
    */

    const body = TSmkElt("div", undefined, [
        divWA,
    ]);
    /*
    // @ts-ignore style
    body.style = `
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
    */
    modMdc.mkMDCdialogAlert(body, "Close");

}

/**
 * 
 * @param {number} dB 
 * @returns  {number}
 */
function dB2ratio(dB) { return Math.pow(10, dB/10); }