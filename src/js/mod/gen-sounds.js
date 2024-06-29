// @ts-nocheck

console.log("This is gen-sounds.js");

/** @typedef {number} frequency */
/** @typedef {number} gain */
/** @typedef {{frequency: frequency, gain: gain }} oscTemplate */

/**
 * 
 * @param {frequency} freqBase 
 * @param {number} toneSteps 
 * @returns {frequency}
 */
function mkTempered12Tone(freqBase, toneSteps) {
    return freqBase * Math.pow(2, toneSteps / 12);
}

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
    const divAddedTones = TSmkElt("div");
    updateDivAddedtones();
    function updateDivAddedtones() {
        divAddedTones.textContent = "";
        const recs = settingOvertonesWA1.value;
        if (recs.lengt == 0) { return; }
        let ourType = recs[0]?.type || "tempered12";
        const freqBase = settingFreqBase.value;
        for (let i = 0, len = recs.length; i < len; i++) {
            const rec = recs[i];
            let addedTone;
            let spanToneInfo;
            switch (ourType) {
                case "tempered12":
                    addedTone = mkTempered12Tone(freqBase, rec.diffTones);
                    const strAddedTone = addedTone.toFixed(1);
                    spanToneInfo = TSmkElt("span", undefined, `Steps (of 12): ${rec.diffTones} (${strAddedTone} Hz)`);
                    break;
                case "bell":
                    addedTone = freqBase * rec.diffTones;
                    spanToneInfo = TSmkElt("span", undefined, `Overtone: ${rec.diffTones} (${addedTone} Hz)`);
                    break;
                default:
                    throw Error(`Unknown tone type: ${ourType}`);
            }
            const spanAddedTone = TSmkElt("span", undefined, [
                spanToneInfo,
                `Diff dB: ${rec.diffDB}`
            ]);
            // @ts-ignore style
            spanAddedTone.style = `
                display: flex;
                flex-direction: column;
            `;
            const iRec = i;
            const iconDelete = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCiconButton(iconDelete, "Remove added tone");
            btnDelete.addEventListener("click", evt => {
                recs.splice(iRec, 1);
                settingOvertonesWA1.value = recs;
                updateDivAddedtones();
            });
            const divAddedTone = TSmkElt("div", undefined, [
                spanAddedTone, btnDelete
            ]);
            divAddedTone.classList.add("mdc-card");
            // @ts-ignore style
            divAddedTone.style = `
                display: grid;
                grid-template-columns: 1fr 50px;
                padding: 10px;
                width: 100%;
            `
            divAddedTones.appendChild(divAddedTone);
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
        const maxRedraw = 120 * 60;
        const secDuration = settingDuration.value;
        if (oscWA1.length > 0) { stop(); } else { start(); }
        function start() {
            msStart = Date.now();
            msDuration = secDuration * 1000;
            msEnd = msStart + msDuration;
            console.log("START", { secDuration });
            setTimeout(() => {
                console.log("STOPPING, setTimeout", secDuration);
                stop();
            }, secDuration * 1000);
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
            clearCanvasWA();
            numRedraw = maxRedraw + 1;
        }
        function drawNextPie() {
            const ms = Date.now();
            const msLeft = msEnd - ms;
            if (msLeft < 0) {
                console.log("STOPPING pie", { ms, msEnd, msLeft });
                stopPie();
                return;
            }
            const part = 1 - (msLeft / msDuration);
            clearCanvasWA();
            drawPie(part);
            requestAnimationFrame(
                () => {
                    if (numRedraw++ > maxRedraw) {
                        console.log("stopping pie check", { maxRedraw, numRedraw });
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
            const arrOscTemplates = [];
            const freqBase = settingFreqBase.value;
            arrOscTemplates.push(mkOscWAtemplate(freqBase, 1));
            // FIX-ME: add the overtones!
            console.log(settingOvertonesWA1.value);
            const arrOvertones = settingOvertonesWA1.value;
            arrOvertones.forEach(recOver => {
                const { diffTones, diffDB } = recOver;
                console.log({ recOver, diffTones, diffDB });
                const freqAdded = ourToneType == "bell" ?
                    freqBase * diffTones
                    :
                    mkTempered12Tone(freqBase, diffTones);
                const overGain = dB2ratio(diffDB);
                arrOscTemplates.push(mkOscWAtemplate(freqAdded, overGain));
            })

            // FIX-ME: what is this??? Tone gliding...
            // const toneSteps = settingToneStepsDuration.value
            const toneSteps = 0;
            startOscillators(oscWA1, arrOscTemplates, secDuration, toneSteps);
            // @ts-ignore style
            btnWA1.style.backgroundColor = "green";
            btnWA1.style.color = "yellow";
            const eltLabel = btnWA1.querySelector(".mdc-button__label");
            eltLabel.textContent = "Stop sound";

        }
        console.log("done WA1", oscWA1);
    });


    let ourToneType;

    // http://projects.itn.pt/VibroImpacts/Ref_A.pdf
    const btnAddTone = modMdc.mkMDCbutton("Add");
    btnAddTone.addEventListener("click", TSDEFerrorHandlerAsyncEvent(async evt => {
        const toneType = ourToneType || await dialogTemperedOrBell();
        console.log({ toneType });
        switch (toneType) {
            case "tempered12":
                dialogAddTemperedTone();
                break;
            case "bell":
                dialogAddBellTone();
                break;
            case undefined:
                break;
            default:
                throw Error(`Unrecognized ans: ${toneType}`);
        }
    }));

    const spanTellType = TSmkElt("span", undefined, "(Tempered or bell)");
    spanTellType.style.marginLeft = "20px";
    const divAddTone = TSmkElt("div", undefined, [
        btnAddTone,
        spanTellType
    ]);
    const recs = settingOvertonesWA1.value;
    if (recs[0]) {
        const r0 = recs[0];
        // const ourType = r0?.type || "tempered12";
        setType(r0?.type);
    }
    function setType(tempOrBell) {
        switch (tempOrBell) {
            case undefined:
                spanTellType.textContent = "";
                break;
            case "tempered12":
                spanTellType.textContent = "(Tempered 12 steps)";
                break;
            case "bell":
                spanTellType.textContent = "(Bell)";
                break;
            default:
                throw Error(`Unknown tone type: ${tempOrBell}`);
        }
        ourToneType = tempOrBell;
    }

    async function dialogTemperedOrBell() {
        // https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7819493/
        // 
        // https://solacely.co/blogs/singing-bowl/singing-bowl-frequencies-chart
        // https://en.wikipedia.org/wiki/Strike_tone
        // https://wellness-space.net/frequencies-of-a-singing-bowl/
        // https://www.hibberts.co.uk/building-a-bell-sound/
        //
        // https://en.wikipedia.org/wiki/Chord_(music)
        // https://www.math.uwaterloo.ca/~mrubinst/tuning/12.html
        // https://www.rcmusic.com/about-us/news/why-does-a-major-scale-have-seven-notes
        // https://www.musictheory.net/lessons/31 
        // https://www.schoolofcomposition.com/technical-names-in-music/

        const linkEqTemp = "https://en.wikipedia.org/wiki/Equal_temperament";
        // https://en.wikipedia.org/wiki/Cent_(music)
        const aTempered = TSmkElt("a", { href: linkEqTemp }, "Equal tempered notes");

        const linkStrikeTone = "https://en.wikipedia.org/wiki/Strike_tone";
        const aStrikeTone = TSmkElt("a", { href: linkStrikeTone }, "Strike tone");

        const divExplain = TSmkElt("div", undefined, [
            TSmkElt("p", undefined, [
                `In `,
                TSmkElt("b", undefined, "music"),
                ` tempered not scales are use (`,
                aTempered,
                `). This makes it easy to transpose a tune or chord.`
            ]),
            TSmkElt("p", undefined, [
                "On the other hand, the sound that you hear from a ",
                TSmkElt("b", undefined, "bell/bowl"),
                ` are composed of frequencies that physically fit the bell/bowl.
                These are frequencies that are the "hum" freqency multiplied by an integer. 
                (See `,
                aStrikeTone,
                `)`
            ]),
            TSmkElt("p", { style: "font-style:italic;" }, `
                You can't mixe those tone scales here.
                Which one do you want now?
            `),
        ]);
        const btnTempered = modMdc.mkMDCbutton("Tempered", "raised");
        const btnBell = modMdc.mkMDCbutton("Bell", "raised");
        const btnCancel = modMdc.mkMDCbutton("Cancel", "outlined");
        const divButtons = TSmkElt("p", undefined, [btnTempered, btnBell, btnCancel]);
        divButtons.style = `
            display: flex;
            gap: 20px;
        `;
        const bdy = TSmkElt("div", undefined, [
            divExplain,
            divButtons
        ]);
        const dlg = await modMdc.mkMDCdialog(bdy);
        return await new Promise((resolve, reject) => {
            btnTempered.addEventListener("click", evt => {
                dlg.mdc.close();
                resolve("tempered12");
            });
            btnBell.addEventListener("click", evt => {
                dlg.mdc.close();
                resolve("bell");
            });
            btnCancel.addEventListener("click", evt => {
                dlg.mdc.close();
                resolve();
            });
            dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
                resolve();
            }));
        });
    }

    async function dialogBellGetTemplate() {
        /** @typedef {{octave:number, dB:number} overtone */
        /** @typedef {overtone[]} overtones */
        /** @typedef {{name:string, overTones:overtones, link:string}} bellTemplate */


        // FIX-ME: JsDoc does not catch the missing overTones???
        /** @type {bellTemplate} */
        const tibetanBowl = {
            name: "Tibetan meditation bowl",
            link: "https://wellness-space.net/frequencies-of-a-singing-bowl/",
            overTones: [
                // FIX-ME:
                { octate: 1, dB: 0 }, // 78.5
                { octate: 3, dB: -1 }, // 240
                { octave: 6, db: -20 }, // 480
                // 4, // 761
                // 5, // 1471
            ]
        }

        /** @type {bellTemplate[]}*/
        const arrTemplates = [
            tibetanBowl,
        ];

        const arrOptions = arrTemplates.map(template => {
            const bellName = template.name;
            return TSmkElt("option", undefined, bellName);
        });
        const eltSelect = TSmkElt("select", undefined, arrOptions);

        const bdy = TSmkElt("div", undefined, [
            TSmkElt("p", { style: "color:red; background:yellow;" }, "Not ready"),
            eltSelect,
        ]);
        const ans = await modMdc.mkMDCdialogConfirm(bdy, "Select", "Cancel");
        console.log({ ans });
        if (ans) {
            const txt = eltSelect.options[eltSelect.selectedIndex].text;
            const hits = arrTemplates.filter(rec => rec.name == txt);
            const numHits = hits.length ;
            if (numHits != 1) {
                console.error({hits});
                throw Error(`Should be exactly 1 hit: ${numHits}`);
            }
            // return txt;
            return hits[0];
        }
    }
    async function dialogAddBellTone() {
        const inpSteps = document.createElement("input");
        inpSteps.type = "number";
        const divToneHeader = TSmkElt("div", undefined, "Overtone (relative hum)");
        const lblSteps = TSmkElt("label", undefined, ["Number:", inpSteps]);

        const spanTone = TSmkElt("span");
        const divToneResult = TSmkElt("div", undefined, [spanTone, " Hz"]);
        divToneResult.style.marginLeft = "80px";
        divToneResult.style.marginTop = "-10px";
        inpSteps.addEventListener("input", evt => {
            const toneSteps = inpSteps.value;
            if (toneSteps == "") {
                spanTone.textContent = "";
                return;
            }
            const freqBase = settingFreqBase.value;
            const freqOvertone = freqBase * toneSteps;
            spanTone.textContent = freqOvertone.toFixed(1);
        });

        const inpDb = document.createElement("input");
        inpDb.type = "number";
        const lblDb = TSmkElt("label", undefined, ["Diff dB:", inpDb]);

        const btnTemplates = modMdc.mkMDCbutton("Templates", "outlined");
        btnTemplates.style.marginLeft = "10px";
        btnTemplates.addEventListener("click", TSDEFerrorHandlerAsyncEvent(async evt => {
            const bellTemplate = await dialogBellGetTemplate();
            const tplName = bellTemplate.name;
            console.log({ bellTemplate, tplName });

            const bdy = TSmkElt("div", undefined, [
                TSmkElt("h2", undefined, `Apply bell template`),
                TSmkElt("p", undefined, [
                    `Make this sound a "${tplName}"?`
                ]),
            ]);
            const ans = await modMdc.mkMDCdialogConfirm(bdy);
            console.log({ans});
        }));
        const bdy = TSmkElt("div", undefined, [
            TSmkElt("p", { style: "color:red; background:yellow;" }, "Not ready!"),
            TSmkElt("h2", undefined, [
                "Add bell tone",
                btnTemplates
            ]),
            divToneHeader,
            lblSteps,
            divToneResult,
            lblDb
        ]);
        let saveButton;
        bdy.addEventListener("input", evt => {
            // FIX-ME: Check can be saved...
            const dbOk = isStringNumber(inpDb.value);
            const stepsOk = /^[2,3,4,5]$/.test(inpSteps.value.trim());
            const canSave = dbOk && stepsOk;
            console.log("overtone bdy input", { evt }, inpDb.value, dbOk, inpSteps.value, stepsOk, canSave);
            saveButton.disabled = !canSave;
        });
        bdy.id = "div-dialog-overtone";
        bdy.style.touchAction = "none";
        bdy.style.background = "yellowgreen";
        const funResult = () => {
            return "this is the result";
        };
        const funOkButton = (btn) => {
            saveButton = btn;
            saveButton.disabled = true;
        };

        const ans = await modMdc.mkMDCdialogConfirm(bdy, "Save", true, funResult, funOkButton);
        console.log({ ans });
        if (ans) {
            const oldVal = settingOvertonesWA1.value;
            oldVal.push({
                type: "bell",
                diffTones: inpSteps.value,
                diffDB: inpDb.value
            });
            settingOvertonesWA1.value = oldVal;
            updateDivAddedtones();
        }
    }

    async function dialogAddTemperedTone() {
        /** @type {HTMLInputElement} */
        const inpSteps = document.createElement("input");
        inpSteps.type = "number";
        const divToneHeader = TSmkElt("div", undefined, "Tone");
        const lblSteps = TSmkElt("label", undefined, ["steps:", inpSteps]);

        // https://www.musictheory.net/lessons/31
        const musicTones = TSmkElt("select", { name: "tone-name", id: "tone-name" }, [
            TSmkElt("option", { value: "-12" }, "Hum"),
            TSmkElt("option", { value: "0" }, "Prime"),
            TSmkElt("option", { value: "1" }, "Minor second"),
            TSmkElt("option", { value: "2" }, "Major second"),
            TSmkElt("option", { value: "3" }, "Minor third/tierce"),
            TSmkElt("option", { value: "4" }, "Major third"),
            TSmkElt("option", { value: "5" }, "Perfect fourth"),
            TSmkElt("option", { value: "6" }, "Augmented fourth"),
            TSmkElt("option", { value: "7" }, "Perfect fifth/quint"),
            // TSmkElt("option", {value:"7"}, "Diminished sixth"),
            TSmkElt("option", { value: "8" }, "Minor sixth"),
            TSmkElt("option", { value: "9" }, "Major sixth"),
            // TSmkElt("option", {value:"9"}, "Diminished seventh"),
            // TSmkElt("option", {value:"10"}, "Augmented sixth"),
            TSmkElt("option", { value: "10" }, "Minor seventh"),
            TSmkElt("option", { value: "11" }, "Major seventh"),
            TSmkElt("option", { value: "12" }, "Octave"),
        ]);

        const spanTone = TSmkElt("span");
        const divTones = TSmkElt("div", undefined, [spanTone, " Hz"]);
        divTones.style.marginLeft = "80px";
        divTones.style.marginTop = "-10px";
        inpSteps.addEventListener("input", evt => {
            const toneSteps = inpSteps.value;
            if (toneSteps == "") {
                spanTone.textContent = "";
                return;
            }
            const freqBase = settingFreqBase.value;
            // const freqOvertone = freqBase * Math.pow(2, toneSteps / 12);
            const freqOvertone = mkTempered12Tone(freqBase, toneSteps);
            // spanTone.textContent = inpSteps.value;
            spanTone.textContent = freqOvertone.toFixed(1);
        });

        /** @type {HTMLInputElement} */
        const inpDb = document.createElement("input");
        inpDb.type = "number";
        const lblDb = TSmkElt("label", undefined, ["Diff dB:", inpDb]);
        const bdy = TSmkElt("div", undefined, [
            TSmkElt("h2", undefined, "Add tempered tone"),
            divToneHeader,
            lblSteps,
            divTones,
            lblDb
        ]);
        let saveButton;
        bdy.addEventListener("input", evt => {
            // FIX-ME: Check can be saved...
            const dbOk = isStringNumber(inpDb.value);
            const stepsOk = isStringPositiveInteger(inpSteps.value);
            const canSave = dbOk && stepsOk;
            console.log("overtone bdy input", { evt }, inpDb.value, dbOk, inpSteps.value, stepsOk, canSave);
            saveButton.disabled = !canSave;
        });
        bdy.id = "div-dialog-overtone";
        bdy.style.touchAction = "none";
        bdy.style.background = "yellowgreen";
        const funResult = () => {
            return "this si the result";
        };
        const funOkButton = (btn) => {
            saveButton = btn;
            saveButton.disabled = true;
        };

        const ans = await modMdc.mkMDCdialogConfirm(bdy, "Save", true, funResult, funOkButton);
        console.log({ ans });
        if (ans) {
            const oldVal = settingOvertonesWA1.value;
            oldVal.push({
                type: "tempered12",
                diffTones: inpSteps.value,
                diffDB: inpDb.value
            });
            settingOvertonesWA1.value = oldVal;
            updateDivAddedtones();
        }
    }

    const sumWAsubs = TSmkElt("summary", undefined, "Additional tones");
    const detWAsubs = TSmkElt("details", undefined, [
        sumWAsubs,
        divAddTone,
        divAddedTones,
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

    // drawPie(0.25);
    function clearCanvasWA() { ctxCanvasWA.clearRect(0, 0, 30, 30); }
    function drawPie(part) { modSvgPie.drawPie(ctxCanvasWA, 15, 15, 10, "green", part); }

    const divSec = TSmkElt("span", undefined, `${settingDuration.value} s`);
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
        TSmkElt("p", { style: "background:yellow; color:red; padding:4px;" },
            `
            Struggling to understand tempered tone scales vs those fit for a bell sound.
            `),
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
    console.warn({ arrOsc, arrOscTemplates, duration, toneSteps })
    toneSteps = toneSteps || 0;
    let highestGain = 0;
    arrOscTemplates.forEach(rec => {
        console.log("rec.gain", rec.gain);
        highestGain = Math.max(highestGain, rec.gain);
    });
    console.log({ highestGain });
    arrOscTemplates.forEach(rec => {
        const freqBase = rec.frequency;
        // FIX-ME: remove this tone glide???
        const freqGoal = mkTempered12Tone(freqBase, toneSteps);
        const gain = rec.gain;
        arrOsc.push(startStopOscWA(freqBase, freqGoal, duration, gain / highestGain));
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



function isStringNumber(value) {
    return /^[+-]{0,1}[0-9]+[.]{0,1}[0-9]*$/.test(value.trim());
}
function isStringInteger(value) {
    return /^[+-]{0,1}[0-9]+$/.test(value.trim());
}
function isStringPositiveInteger(value) {
    return /^[+]{0,1}[0-9]+$/.test(value.trim());
}
