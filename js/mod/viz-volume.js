// @ts-check
const VIZ_VOLUME_VER = "0.0.0";
window["logConsoleHereIs"](`here is viz-volume.js, module, ${VIZ_VOLUME_VER}`);
if (document.currentScript) { throw "viz-volume.js is not loaded as module"; }

// Originally from deepseek

// @ts-ignore
const mkElt = window["mkElt"];
// @ts-ignore
const importFc4i = window["importFc4i"];
const modCanvasFontSize = await importFc4i("canvas-fontsize");
console.log({ modCanvasFontSize });

loadMyCss();
function loadMyCss() {
    // Inside your ES module (e.g., myModule.js)
    const loadCSS = (href, id) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.id = id;
        document.head.appendChild(link);
    };

    // Extract the module filename (e.g., "myModule.js" -> "myModule")
    const moduleName = import.meta.url.split('/').pop().replace('.js', '');
    const id = `${moduleName}-styles`;
    if (document.getElementById(id)) return;  // Already loaded

    // Load the CSS file with the same name as the module
    const href = new URL(`./${moduleName}.css`, import.meta.url).href;
    loadCSS(href, id);
}

// Audio state
let audioContext = null;
let cachedAudioBuffer = null;
let sourceNode = null;
let analyserNode = null;
let gainNode = null;
/** @type {number | undefined} */ let animationId;
let isPlaying = false;
let currentPlaybackTime = 0;
let startTime = 0;
let waveformImageData = null;

// DOM Elements
const elements = {};

/**
 * Format time as MM:SS.ms
 * @param {number} seconds
 * @param {number|null} [distMarkers=null]
 */
function formatTime(seconds, distMarkers = null) {
    if (isNaN(seconds) || seconds === undefined) return '0:00.00';
    const mins = Math.floor(seconds / 60);
    let decimals = 1;
    let padLen = 4;
    if (typeof distMarkers == "number") {
        decimals = 0;
        padLen = 2;
    }
    let secs = (seconds % 60).toFixed(decimals);
    if (mins == 0) {
        return `${secs.padStart(padLen, '0')}`;
    }
    return `${mins}:${secs.padStart(padLen, '0')}`;
}

/**
 * Update time displays and UI elements
 */
function updateTimeDisplay(currentTime) {
    if (elements.currentTimeSpan) {
        elements.currentTimeSpan.textContent = formatTime(currentTime);
    }
    if (cachedAudioBuffer) {
        if (elements.totalDurationSpan) {
            elements.totalDurationSpan.textContent = formatTime(cachedAudioBuffer.duration);
        }
        if (elements.seekSlider) {
            const percent = (currentTime / cachedAudioBuffer.duration) * 100;
            elements.seekSlider.value = percent;
        }
    }
}

/**
 * Draw time markers on the time axis
 */
function drawTimeMarkers() {
    // if (!cachedAudioBuffer || !elements.timeAxisDiv) return;
    if (!cachedAudioBuffer) throw Error("cachedAudioBuffer not set up");
    if (!(elements.timeAxisDiv instanceof HTMLDivElement)) throw Error("timeAxisDiv is not <div>");

    elements.timeAxisDiv.innerHTML = '';
    const duration = cachedAudioBuffer.duration;
    const numMarkers = Math.min(10, Math.floor(duration));
    const arrMarkers = calculateNiceMarkers(duration);
    const distMarker = arrMarkers[1];

    // for (let i = 0; i <= numMarkers; i++)
    //   const time = (i / numMarkers) * duration;
    arrMarkers.forEach(time => {

        const percent = (time / duration) * 100;

        const line = document.createElement('div');
        line.className = 'time-marker-line';
        line.style.left = `${percent}%`;

        const label = document.createElement('div');
        label.className = 'time-marker';
        label.style.left = `${percent}%`;
        label.textContent = formatTime(time, distMarker);

        elements.timeAxisDiv.appendChild(line);
        elements.timeAxisDiv.appendChild(label);
    });
}

//#region /////// Nice axis markers intervals
// https://chat.deepseek.com/share/7mlvpu8o3dphl6q0yo
function calculateNiceMarkers(max) {
    if (max <= 0) throw Error(`max == ${max} < 0`);

    // Calculate raw interval (4 intervals for 5 markers)
    const rawInterval = max / 4;

    // Find the nice interval (1, 2, or 5 × 10^k)
    const niceInterval = getNiceInterval(rawInterval);

    // Calculate markers starting from 0
    const markers = [];
    for (let i = 0; i < 5; i++) {
        markers.push(i * niceInterval);
    }

    return markers;
}
function getNiceInterval(rawInterval) {
    // Get the order of magnitude (power of 10)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));

    // Calculate normalized value (1-10 range)
    const normalized = rawInterval / magnitude;

    // Choose the closest nice number: 1, 2, or 5
    let niceNormalized;
    if (normalized <= 1.5) {
        niceNormalized = 1;
    } else if (normalized <= 3.5) {
        niceNormalized = 2;
    } else {
        niceNormalized = 5;
    }

    // Return the nice interval
    return niceNormalized * magnitude;
}
////////////////////////////////
//#endregion

function syncCanvasSize() {
    const container = document.getElementById("canvasContainer");
    if (!container) {
        throw Error("Did not find canvasContainer");
    }
    const rect = container.getBoundingClientRect();

    container.querySelectorAll("canvas").forEach(canvas => {
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
    })

    // Note: Resizing a canvas automatically wipes its contents.
    // Re-draw your elements here if this runs after initialization!
}
/**
 * Draw static waveform (the original picture of the sound)
 */
function drawStaticWaveform() {
    if (!cachedAudioBuffer || !elements.ctxBg || !elements.canvasBg) return;

    const channelData = cachedAudioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / elements.canvasBg.width);

    // elements.ctxBg.clearRect(0, 0, elements.canvasBg.width, elements.canvasBg.height);
    elements.ctxBg.reset();
    elements.ctxBg.beginPath();
    elements.ctxBg.strokeStyle = '#4CAF50';
    elements.ctxBg.lineWidth = 2;

    for (let i = 0; i < elements.canvasBg.width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
            const index = i * step + j;
            if (index < channelData.length) {
                const value = channelData[index];
                if (value < min) min = value;
                if (value > max) max = value;
            }
        }

        const y1 = ((min + 1) / 2) * elements.canvasBg.height;
        const y2 = ((max + 1) / 2) * elements.canvasBg.height;

        elements.ctxBg.beginPath();
        elements.ctxBg.moveTo(i, y1);
        elements.ctxBg.lineTo(i, y2);
        elements.ctxBg.stroke();
    }

    // Store the static waveform as image data
    waveformImageData = elements.ctxBg.getImageData(0, 0, elements.canvasBg.width, elements.canvasBg.height);
}

/**
 * Draw playhead on canvas
 */
function drawNoPlayheadOnCanvas() {
    return;
    if (!cachedAudioBuffer || !elements.ctxBg || !elements.canvasBg) return;

    const x = (currentPlaybackTime / cachedAudioBuffer.duration) * elements.canvasBg.width;

    elements.ctxBg.beginPath();
    elements.ctxBg.strokeStyle = '#ff6b6b';
    elements.ctxBg.lineWidth = 3;
    elements.ctxBg.moveTo(x, 0);
    elements.ctxBg.lineTo(x, elements.canvasBg.height);
    elements.ctxBg.stroke();

    // elements.ctxBg.font = 'bold 12px monospace';
    elements.ctxBg.font = cssFont('bold 2rem monospace');
    elements.ctxBg.fillStyle = '#ff6b6b';
    elements.ctxBg.fillText(formatTime(currentPlaybackTime), x + 5, 20);
}

/**
 * Full redraw for non-playing state
 */
function redrawStaticWithPosition() {
    // drawStaticWaveform();
    // drawNoPlayheadOnCanvas();
    // drawTimeMarkers();
}
let metricsPlayhead;
function drawPlayheadTime(currentPlaybackTime) {
    const playheadX = (currentPlaybackTime / cachedAudioBuffer.duration) * elements.canvasBg.width;
    drawPlayheadX(playheadX);
}
function drawPlayheadX(playheadX) {
    // const color = '#ff6b6b';
    // const color = "red";
    const color = "yellow";
    // const color = "white";
    const ctxFg = elements.ctxFg;
    ctxFg.clearRect(0, 0, elements.canvasFg.width, elements.canvasFg.height);
    ctxFg.beginPath();
    ctxFg.strokeStyle = color;
    const lw = 3;
    ctxFg.lineWidth = lw;
    ctxFg.moveTo(playheadX + lw / 2, 0);
    ctxFg.lineTo(playheadX + lw / 2, elements.canvasBg.height);
    ctxFg.stroke();

    ctxFg.font = cssFont('bold 1.2rem "Courier New", monospace');
    ctxFg.fillStyle = color;
    const text = formatTime(currentPlaybackTime);
    if (!metricsPlayhead) {
        metricsPlayhead = ctxFg.measureText(text)
    }
    // const playheadWidth = metricsPlayhead.actualBoundingBoxLeft + metricsPlayhead.actualBoundingBoxRight;
    const playheadHeight = metricsPlayhead.actualBoundingBoxAscent + metricsPlayhead.actualBoundingBoxDescent;
    ctxFg.clearRect(playheadX - 5, 0, 10, playheadHeight + 8);
    ctxFg.fillText(text, playheadX - lw / 2, playheadHeight);
}


/**
 * Real-time visualization (keeps static waveform + adds amplitude overlay)
 */
function drawRealTimeVisualization() {
    // if (!analyserNode || !isPlaying || !elements.ctxBg || !elements.canvasBg) return;
    if (!elements.ctxBg || !elements.canvasBg) return;

    // Draw static waveform + amplitude overlay + playhead
    // if (waveformImageData) { elements.ctxBg.putImageData(waveformImageData, 0, 0); }

    // Draw real-time amplitude overlay
    // const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    // analyserNode.getByteTimeDomainData(dataArray);

    /*
    let showDisturbingWave = false;
    if (showDisturbingWave) {
        elements.ctxBg.beginPath();
        elements.ctxBg.strokeStyle = '#ffaa44';
        elements.ctxBg.strokeStyle = 'red';
        elements.ctxBg.lineWidth = 2;
        // elements.ctxBg.globalAlpha = 0.8;

        const sliceWidth = elements.canvasBg.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0 - 1.0;
            const y = (v * 0.5 + 0.5) * elements.canvasBg.height;

            if (i === 0) {
                elements.ctxBg.moveTo(x, y);
            } else {
                elements.ctxBg.lineTo(x, y);
            }

            x += sliceWidth;
        }

        elements.ctxBg.stroke();
    }
    */

    // elements.ctxBg.globalAlpha = 1.0;

    // Update current time
    if (sourceNode && audioContext && cachedAudioBuffer) {
        currentPlaybackTime = audioContext.currentTime - startTime;
        if (currentPlaybackTime >= 0 && currentPlaybackTime <= cachedAudioBuffer.duration) {
            updateTimeDisplay(currentPlaybackTime);
            drawPlayheadTime(currentPlaybackTime);
        }
    }

    animationId = requestAnimationFrame(drawRealTimeVisualization);
}

/**
 * Setup audio nodes
 */
function setupAudioNodes() {
    // if (!audioContext || !cachedAudioBuffer || !elements.volumeSlider) return;
    if (!cachedAudioBuffer) throw Error("setupAudioNodes: cachedAudioBuffer has not been created");

    // analyserNode = audioContext.createAnalyser();
    // analyserNode.fftSize = 2048;
    // analyserNode.smoothingTimeConstant = 0.8;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = cachedAudioBuffer;
    // sourceNode.connect(analyserNode);
    // analyserNode.connect(audioContext.destination);
    sourceNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        handlePlaybackEnded();
    };
}

/**
 * Play audio
 */
async function playAudio() {
    if (!cachedAudioBuffer) return;

    if (elements.playBtn) elements.playBtn.disabled = true;
    if (elements.pauseBtn) elements.pauseBtn.disabled = false;
    if (elements.rewindBtn) elements.rewindBtn.disabled = false;

    // if (audioContext && audioContext.state === 'suspended') {
    if (audioContext?.state === 'suspended') {
        await audioContext.resume();
        drawRealTimeVisualization();
        return;
    }

    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) { }
    }

    setupAudioNodes();

    startTime = audioContext.currentTime - currentPlaybackTime;
    sourceNode.start(0, currentPlaybackTime);
    isPlaying = true;

    // if (elements.playBtn) elements.playBtn.disabled = true;
    // if (elements.pauseBtn) elements.pauseBtn.disabled = false;
    // if (elements.rewindBtn) elements.rewindBtn.disabled = false;
    // if (elements.seekSlider) elements.seekSlider.disabled = false;
    // if (elements.playhead) elements.playhead.style.display = 'block';

    drawRealTimeVisualization();
}

/**
 * Pause audio
 */
function pauseAudio() {
    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    // if (!sourceNode || !isPlaying || !audioContext) return;
    cancelAnimationFrame(animationId);
    audioContext.suspend();
    return;

    currentPlaybackTime = audioContext.currentTime - startTime;
    sourceNode.stop();
    sourceNode.disconnect();

    isPlaying = false;

    if (animationId != undefined) {
        cancelAnimationFrame(animationId);
    }

    redrawStaticWithPosition();

    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;

    updateTimeDisplay(currentPlaybackTime);
    seekTo(currentPlaybackTime);
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `⏸ Paused at ${formatTime(currentPlaybackTime)}`;
    }
}

function rewindAudio() {
    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    if (elements.rewindBtn) elements.rewindBtn.disabled = false;
    if (elements.seekSlider) elements.seekSlider.value = 0;
    // debugger;
    seekTo(0);
}

/**
 * Stop audio
 */
function stopAudio() {
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
            sourceNode = undefined;
        } catch (e) { }
    }
    if (analyserNode) {
        try {
            analyserNode.disconnect();
            analyserNode = null;
        } catch (e) { }
    }
    return;

    isPlaying = false;
    // currentPlaybackTime = 0;
    seekTo(0);

    cancelAnimationFrame(animationId);
    // if (animationId) { cancelAnimationFrame(animationId); }

    redrawStaticWithPosition();

    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    if (elements.rewindBtn) elements.rewindBtn.disabled = false;
    if (elements.seekSlider) elements.seekSlider.value = 0;
    if (elements.playhead) elements.playhead.style.left = '0px';

    updateTimeDisplay(0);
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `⏹ Stopped`;
    }
}

/**
 * Handle playback completion
 */
function handlePlaybackEnded() {
    isPlaying = false;
    // currentPlaybackTime = 0;
    cancelAnimationFrame(animationId);
    // redrawStaticWithPosition();
    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    // if (elements.seekSlider) elements.seekSlider.value = 0;
    // if (elements.playhead) elements.playhead.style.left = '0px';
    updateTimeDisplay(0);
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `✅ Playback completed`;
    }
}

let seekedToPos;
/**
 * Seek to position
 * @param {number} secPosition - position in seconds
 */
function seekTo(secPosition) {
    cancelAnimationFrame(animationId);
    // pauseAudio();
    stopAudio();
    seekedToPos = Math.max(0, Math.min(secPosition, cachedAudioBuffer.duration));
    setTimeout(() =>
        requestAnimationFrame(() => {
            console.log("seekTo...", seekedToPos);
            drawPlayheadTime(seekedToPos);
            updateTimeDisplay(seekedToPos);
        }), 100);
    return;
    // if (!audioBuffer) return;
    // console.log("seekTo:", position);
    isPlaying = false;

    const wasPlaying = isPlaying;

    // if (wasPlaying) { pauseAudio(); }
    pauseAudio();
    // currentTime

    currentPlaybackTime = Math.max(0, Math.min(secPosition, cachedAudioBuffer.duration));
    console.log("seekTo:", currentPlaybackTime);
    updateTimeDisplay(currentPlaybackTime);
    drawPlayheadTime(currentPlaybackTime);

    redrawStaticWithPosition();

    // if (wasPlaying) { playAudio(); }
}

/**
 * Handle canvas click for seeking
 */
function handleCanvasClick(event) {
    event.stopPropagation();
    const canvas = event.target;
    if (!cachedAudioBuffer) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const seekTime = percent * cachedAudioBuffer.duration;

    seekTo(seekTime);
}

/**
 * Update volume
 */
function updateVolume() {
    if (gainNode && elements.volumeSlider) {
        gainNode.gain.value = elements.volumeSlider.value / 100;
        if (elements.infoDiv) {
            elements.infoDiv.textContent = `🔊 Volume set to ${elements.volumeSlider.value}%`;
        }
    }
}

/**
 * Load audio file
 */
async function loadAudioFile(file) {
    if (!file) return;

    if (elements.infoDiv) {
        elements.infoDiv.textContent = `📁 Loading: ${file.name}`;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        // if (!audioContext) { audioContext = new (window.AudioContext || window.webkitAudioContext)(); }
        audioContext = audioContext || new window.AudioContext();
        cachedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('Error loading audio:', error);
        if (elements.infoDiv) {
            elements.infoDiv.textContent = `❌ Error loading audio: ${error.message}`;
        }
    }
}
function loadAudioUI(file) {
    if (elements.sampleRateSpan) {
        elements.sampleRateSpan.textContent = `${cachedAudioBuffer.sampleRate} Hz`;
    }
    if (elements.totalDurationSpan) {
        elements.totalDurationSpan.textContent = formatTime(cachedAudioBuffer.duration);
    }
    currentPlaybackTime = 0;
    updateTimeDisplay(0);

    drawStaticWaveform();
    // drawNoPlayheadOnCanvas();
    drawTimeMarkers();

    updateFontSizeFactorsForOurCanvas();
    drawPlayheadTime(0);

    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.rewindBtn) elements.rewindBtn.disabled = false;
    if (elements.seekSlider) elements.seekSlider.disabled = false;
    if (elements.playhead) elements.playhead.style.display = 'block';

    if (elements.infoDiv) {
        elements.infoDiv.textContent = `✅ Loaded: ${file.name} | Duration: ${formatTime(cachedAudioBuffer.duration)} | Sample Rate: ${cachedAudioBuffer.sampleRate} Hz | Click on waveform to seek`;
    }

}

// From deepseek:
async function loadAudioFromUrl(url, filename = 'audio.mp3') {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });
        await loadAudioFile(file);
    } catch (error) {
        console.error('Error loading audio:', error);
    }
}

/**
 * Handle file input change
 */
function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        loadAudioFile(file);
    }
}

/**
 * Handle seek slider input
 */
function handleSeekInput(e) {
    if (!cachedAudioBuffer) return;
    const seekTime = (e.target.value / 100) * cachedAudioBuffer.duration;
    seekTo(seekTime);
}

/**
 * Resize canvas
 */
function resizeCanvas() {
    if (!elements.canvasBg || !elements.ctxBg) return;

    const w = elements.canvasBg.clientWidth;
    if (w == 0) return;
    // elements.canvasBg.width = elements.canvasBg.clientWidth;
    elements.canvasBg.width = w;
    elements.canvasBg.height = elements.canvasBg.clientHeight;
    if (cachedAudioBuffer) {
        drawStaticWaveform();
        drawNoPlayheadOnCanvas();
        drawTimeMarkers();
    }
}

/**
 * Initialize DOM elements and event listeners
 */
export function showViz(
    {
        eltParent = null,
        sound = null,
        ...rest
    } = {}
) { // Add style
    const arrRest = Object.keys(rest);
    if (arrRest.length > 0) {
        console.error(`Unknown parameters: ${arrRest}`);
        debugger;
        throw Error(`Unknown parameters: ${arrRest}`);
    }
    if (!sound) {
        console.error("Object parameter sound missing");
        throw Error("Object parameter sound missing");
    }
    const {
        soundName = "Unknown sound",
        soundSource = null
    } = sound;
    if (soundSource == null) {
        console.log({ soundSource });
        debugger;
        throw Error(`soundSource == null`);
    }

    // const { soundSource, soundName } = sound;
    // debugger;

    // Setup DOM elements
    const divOuterContainer = document.createElement("div");
    divOuterContainer.innerHTML = `
    <div class="viz-vol">
        <!--
        <div id="div-close"><button id="close-button">X</button></div>
        <button class="x-close">✖</button>
        <h2 style="display:none;">🎵 Sound Amplitude Visualization with Time Display</h2>
        -->
        <h2>🎵 ${soundName}</h2>

        <div class="controls">
            <input type="file" id="audioFile" accept="audio/*">
            <button id="playBtn" disabled>▶</button>
            <button id="pauseBtn" disabled>⏸</button>
            <!-- <button id="rewindBtn" disabled>⏹</button>️ -->
            <button id="rewindBtn" disabled>️⟲</button>
            <div class="seek-bar" style="display:none;">
                <input type="range" id="seekSlider" min="0" max="100" value="0" disabled>
            </div>
            <div class="volume-control" style="display:none;">
                <span>🔊</span>
                <input type="range" id="volumeSlider" min="0" max="100" value="80">
            </div>
        </div>

        <div class="visualization-container">

            <div id="canvasContainer">
            <canvas id="waveformCanvas"></canvas>
            <canvas id="playheadCanvas"></canvas>
            </div>

            <div class="time-axis" id="timeAxis"></div>
            <div class="playhead" id="playhead" style="display: none;"></div>
        </div>

        <div class="time-display" style="display:none;">
            <span>⏱ Current Time: <strong id="currentTime">0:00.00</strong></span>
            <span>📅 Total Duration: <strong id="totalDuration">0:00.00</strong></span>
            <span>📊 Sample Rate: <strong id="sampleRate">-</strong></span>
        </div>

        <div class="info" id="info" style="display:none;">
            💡 Ready to load audio file. Click on the waveform to seek to any position.
        </div>
    </div>

    `;
    if (sound) {
        const inpAudio = /** @type {HTMLInputElement} */ (divOuterContainer.querySelector("#audioFile"));
        if (!inpAudio) throw Error(`Could not find #audioFile`);
        inpAudio.style.display = "none";
        // debugger;
        if (typeof soundSource == "string") {
            // loadAudioFromUrl(soundSource);
        } else {
            debugger;
        }
    }

    const useDialog = !!!eltParent;
    console.log({ useDialog });
    const btnClose = mkElt("button", { class: "x-close" }, "✖")
    // document.body.appendChild(divOuterContainer);
    if (!useDialog) {
        eltParent.appendChild(divOuterContainer);
    } else {
        const eltDialog = document.createElement("dialog");
        eltDialog.id = "dialog-viz-volume";

        eltDialog.appendChild(divOuterContainer);
        eltDialog.appendChild(btnClose);
        document.body.appendChild(eltDialog);
        setTimeout(async () => {
            updateFontSizeFactorsForOurCanvas();
            syncCanvasSize();
            await loadAudioFromUrl(soundSource);
            loadAudioUI(soundSource);
        }, 500);
        eltDialog.showModal();
    }


    // Get DOM elements
    // const btnClose = document.getElementById("close-button");
    // const btnClose = /** @type {HTMLButtonElement} */ (divOuterContainer.querySelector("#close-button"));
    // const btnClose = /** @type {HTMLButtonElement} */ (divOuterContainer.querySelector("button.x-close"));
    btnClose.addEventListener("click", evt => {
        evt.stopImmediatePropagation();
        // alert("close");
        stopAudio();
        const eltDialog = /** @type {HTMLDialogElement} */ (btnClose.closest("dialog"));
        eltDialog.close();
    })

    // elements.canvasBg = document.getElementById('waveformCanvas');
    elements.canvasBg = divOuterContainer.querySelector("#waveformCanvas");
    if (!elements.canvasBg) {
        console.error('Canvas element not found');
        return;
    }
    elements.ctxBg = elements.canvasBg.getContext('2d');
    // elements.ctxBg.globalAlpha = 0.8;

    elements.canvasFg = divOuterContainer.querySelector("#playheadCanvas");
    if (!elements.canvasFg) {
        console.error('Canvas element not found');
        return;
    }
    elements.ctxFg = elements.canvasFg.getContext('2d');


    /*
      Note that divOuterContainer.querySelector("#id") is not
      strictly correct because the ids might be doubles.
      But I believe it will work in practice since this is only
      used in the dialog (or div container).
    */
    elements.playBtn = divOuterContainer.querySelector("#playBtn");
    elements.pauseBtn = divOuterContainer.querySelector("#pauseBtn");
    elements.rewindBtn = divOuterContainer.querySelector("#rewindBtn");
    elements.seekSlider = divOuterContainer.querySelector("#seekSlider");
    elements.volumeSlider = divOuterContainer.querySelector("#volumeSlider");
    elements.audioFileInput = divOuterContainer.querySelector("#audioFile");
    elements.infoDiv = divOuterContainer.querySelector("#info");
    elements.currentTimeSpan = divOuterContainer.querySelector("#currentTime");
    elements.totalDurationSpan = divOuterContainer.querySelector("#totalDuration");
    elements.sampleRateSpan = divOuterContainer.querySelector("#sampleRate");
    elements.timeAxisDiv = divOuterContainer.querySelector("#timeAxis");

    // FIX-ME:
    // elements.playhead = divOuterContainer.querySelector("#playhead");


    // Add event listeners
    if (elements.audioFileInput) {
        elements.audioFileInput.addEventListener('change', handleFileChange);
    }
    // if (elements.playBtn) {
    elements.playBtn?.addEventListener('click', evt => {
        evt.stopPropagation();
        playAudio();
    });
    // }
    // if (elements.pauseBtn) {
    elements.pauseBtn?.addEventListener('click', evt => {
        evt.stopPropagation();
        pauseAudio();
    });
    // }
    // if (elements.rewindBtn) {
    elements.rewindBtn?.addEventListener('click', evt => {
        evt.stopPropagation();
        rewindAudio();
    });
    // }
    if (elements.seekSlider) {
        elements.seekSlider.addEventListener('input', handleSeekInput);
    }
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', updateVolume);
    }
    if (elements.canvasFg) {
        elements.canvasFg.addEventListener('click', handleCanvasClick);
    }

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Initialize canvas
    resizeCanvas();

    // Initialize time axis
    // drawTimeMarkers();

    if (elements.infoDiv) {
        // debugger;
        elements.infoDiv.textContent = '💡 Ready! Load an audio file. Click on the waveform to seek.';
    }

    console.log('Audio Visualizer initialized successfully');
}

/*
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
*/


/*
// From Claude AI:
async function captureFirstNSeconds(audioContext, sourceNode, nSeconds) {
    // 1. Create an offline context with the same sample rate
    const offlineCtx = new OfflineAudioContext(
        2,                                      // channels (stereo)
        audioContext.sampleRate * nSeconds,     // total frames to render
        audioContext.sampleRate
    );

    // 2. Re-create / clone your source in the offline context.
    //    Here we assume mySound is an AudioBufferSourceNode:
    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = sourceNode.buffer;   // re-use the same AudioBuffer
    offlineSource.connect(offlineCtx.destination);
    offlineSource.start(0);

    // 3. Render — returns an AudioBuffer containing exactly nSeconds of audio
    const renderedBuffer = await offlineCtx.startRendering();
    return renderedBuffer;   // this IS the buffer with the first nSeconds
}
async function playFirstNSeconds(audioContext, mySound, nSeconds) {
    const buffer = await captureFirstNSeconds(audioContext, mySound, nSeconds);

    // Play the captured buffer via a new source node
    const player = audioContext.createBufferSource();
    player.buffer = buffer;
    player.connect(audioContext.destination);
    player.start();
}
*/




function updateFontSizeFactorsForOurCanvas() {
    modCanvasFontSize.updateFontSizeFactors(elements.canvasBg);
}
/**
 * @param {string} fontString 
 * @returns {string}
 */
function cssFont(fontString) {
    return modCanvasFontSize.cssFont(fontString, elements.canvasBg);
}