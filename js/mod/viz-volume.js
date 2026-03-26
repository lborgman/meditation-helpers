// @ts-check
const VIZ_VOLUME_VER = "0.0.0";
window["logConsoleHereIs"](`here is viz-volume.js, module, ${VIZ_VOLUME_VER}`);
if (document.currentScript) { throw "viz-volume.js is not loaded as module"; }

// Originally from deepseek

// Audio state
let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let analyserNode = null;
let gainNode = null;
let animationId = null;
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
    if (!elements.currentTimeSpan) return;

    elements.currentTimeSpan.textContent = formatTime(currentTime);
    if (audioBuffer && elements.totalDurationSpan) {
        elements.totalDurationSpan.textContent = formatTime(audioBuffer.duration);
    }

    if (audioBuffer && !isNaN(currentTime) && elements.seekSlider) {
        const percent = (currentTime / audioBuffer.duration) * 100;
        elements.seekSlider.value = percent;

        if (elements.playhead && elements.canvas) {
            const x = (currentTime / audioBuffer.duration) * elements.canvas.width;
            elements.playhead.style.left = `${x}px`;
        }
    }
}

/**
 * Draw time markers on the time axis
 */
function drawTimeMarkers() {
    if (!audioBuffer || !elements.timeAxisDiv) return;

    elements.timeAxisDiv.innerHTML = '';
    const duration = audioBuffer.duration;
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

/**
 * Draw static waveform (the original picture of the sound)
 */
function drawStaticWaveform() {
    if (!audioBuffer || !elements.ctx || !elements.canvas) return;

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / elements.canvas.width);

    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    elements.ctx.beginPath();
    elements.ctx.strokeStyle = '#4CAF50';
    elements.ctx.lineWidth = 2;

    for (let i = 0; i < elements.canvas.width; i++) {
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

        const y1 = ((min + 1) / 2) * elements.canvas.height;
        const y2 = ((max + 1) / 2) * elements.canvas.height;

        elements.ctx.beginPath();
        elements.ctx.moveTo(i, y1);
        elements.ctx.lineTo(i, y2);
        elements.ctx.stroke();
    }

    // Store the static waveform as image data
    waveformImageData = elements.ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
}

/**
 * Draw playhead on canvas
 */
function drawPlayheadOnCanvas() {
    if (!audioBuffer || !elements.ctx || !elements.canvas) return;

    const x = (currentPlaybackTime / audioBuffer.duration) * elements.canvas.width;

    elements.ctx.beginPath();
    elements.ctx.strokeStyle = '#ff6b6b';
    elements.ctx.lineWidth = 3;
    elements.ctx.moveTo(x, 0);
    elements.ctx.lineTo(x, elements.canvas.height);
    elements.ctx.stroke();

    elements.ctx.font = 'bold 12px monospace';
    elements.ctx.fillStyle = '#ff6b6b';
    elements.ctx.fillText(formatTime(currentPlaybackTime), x + 5, 20);
}

/**
 * Full redraw for non-playing state
 */
function redrawStaticWithPosition() {
    drawStaticWaveform();
    drawPlayheadOnCanvas();
    drawTimeMarkers();
}

/**
 * Real-time visualization (keeps static waveform + adds amplitude overlay)
 */
function drawRealTimeVisualization() {
    if (!analyserNode || !isPlaying || !elements.ctx || !elements.canvas) return;

    // Draw static waveform + amplitude overlay + playhead
    if (waveformImageData) {
        elements.ctx.putImageData(waveformImageData, 0, 0);
    }

    // Draw real-time amplitude overlay
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteTimeDomainData(dataArray);

    elements.ctx.beginPath();
    elements.ctx.strokeStyle = '#ffaa44';
    elements.ctx.lineWidth = 2;
    elements.ctx.globalAlpha = 0.8;

    const sliceWidth = elements.canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0 - 1.0;
        const y = (v * 0.5 + 0.5) * elements.canvas.height;

        if (i === 0) {
            elements.ctx.moveTo(x, y);
        } else {
            elements.ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    elements.ctx.stroke();
    elements.ctx.globalAlpha = 1.0;

    // Update current time
    if (sourceNode && audioContext && audioBuffer) {
        currentPlaybackTime = audioContext.currentTime - startTime;
        if (currentPlaybackTime >= 0 && currentPlaybackTime <= audioBuffer.duration) {
            updateTimeDisplay(currentPlaybackTime);

            // Draw playhead
            const playheadX = (currentPlaybackTime / audioBuffer.duration) * elements.canvas.width;
            elements.ctx.beginPath();
            elements.ctx.strokeStyle = '#ff6b6b';
            elements.ctx.lineWidth = 3;
            elements.ctx.moveTo(playheadX, 0);
            elements.ctx.lineTo(playheadX, elements.canvas.height);
            elements.ctx.stroke();

            elements.ctx.font = 'bold 12px monospace';
            elements.ctx.fillStyle = '#ff6b6b';
            elements.ctx.fillText(formatTime(currentPlaybackTime), playheadX + 5, 20);
        }
    }

    animationId = requestAnimationFrame(drawRealTimeVisualization);
}

/**
 * Setup audio nodes
 */
function setupAudioNodes() {
    if (!audioContext || !audioBuffer || !elements.volumeSlider) return;

    gainNode = audioContext.createGain();
    gainNode.gain.value = elements.volumeSlider.value / 100;

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    sourceNode.onended = () => {
        stopPlayback();
    };
}

/**
 * Play audio
 */
async function playAudio() {
    if (!audioBuffer) return;

    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    if (sourceNode && isPlaying) return;

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

    if (elements.playBtn) elements.playBtn.disabled = true;
    if (elements.pauseBtn) elements.pauseBtn.disabled = false;
    if (elements.stopBtn) elements.stopBtn.disabled = false;
    if (elements.seekSlider) elements.seekSlider.disabled = false;
    if (elements.playhead) elements.playhead.style.display = 'block';

    drawRealTimeVisualization();
}

/**
 * Pause audio
 */
function pauseAudio() {
    if (!sourceNode || !isPlaying || !audioContext) return;

    currentPlaybackTime = audioContext.currentTime - startTime;
    sourceNode.stop();
    sourceNode.disconnect();

    isPlaying = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    redrawStaticWithPosition();

    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;

    updateTimeDisplay(currentPlaybackTime);
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `⏸ Paused at ${formatTime(currentPlaybackTime)}`;
    }
}

/**
 * Stop audio
 */
function stopAudio() {
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) { }
    }

    isPlaying = false;
    currentPlaybackTime = 0;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    redrawStaticWithPosition();

    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    if (elements.stopBtn) elements.stopBtn.disabled = false;
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
function stopPlayback() {
    isPlaying = false;
    currentPlaybackTime = 0;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    redrawStaticWithPosition();
    if (elements.playBtn) elements.playBtn.disabled = false;
    if (elements.pauseBtn) elements.pauseBtn.disabled = true;
    if (elements.seekSlider) elements.seekSlider.value = 0;
    if (elements.playhead) elements.playhead.style.left = '0px';
    updateTimeDisplay(0);
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `✅ Playback completed`;
    }
}

/**
 * Seek to position
 */
function seekTo(position) {
    if (!audioBuffer) return;

    const wasPlaying = isPlaying;

    if (wasPlaying) {
        pauseAudio();
    }

    currentPlaybackTime = Math.max(0, Math.min(position, audioBuffer.duration));
    updateTimeDisplay(currentPlaybackTime);

    redrawStaticWithPosition();

    if (wasPlaying) {
        playAudio();
    }
}

/**
 * Handle canvas click for seeking
 */
function handleCanvasClick(event) {
    if (!audioBuffer || !elements.canvas) return;

    const rect = elements.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const seekTime = percent * audioBuffer.duration;

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

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (elements.sampleRateSpan) {
            elements.sampleRateSpan.textContent = `${audioBuffer.sampleRate} Hz`;
        }
        if (elements.totalDurationSpan) {
            elements.totalDurationSpan.textContent = formatTime(audioBuffer.duration);
        }
        currentPlaybackTime = 0;
        updateTimeDisplay(0);

        drawStaticWaveform();
        drawPlayheadOnCanvas();
        drawTimeMarkers();

        if (elements.playBtn) elements.playBtn.disabled = false;
        if (elements.stopBtn) elements.stopBtn.disabled = false;
        if (elements.seekSlider) elements.seekSlider.disabled = false;
        if (elements.playhead) elements.playhead.style.display = 'block';

        if (elements.infoDiv) {
            elements.infoDiv.textContent = `✅ Loaded: ${file.name} | Duration: ${formatTime(audioBuffer.duration)} | Sample Rate: ${audioBuffer.sampleRate} Hz | Click on waveform to seek`;
        }

    } catch (error) {
        console.error('Error loading audio:', error);
        if (elements.infoDiv) {
            elements.infoDiv.textContent = `❌ Error loading audio: ${error.message}`;
        }
    }
}

// From deepseek:
async function loadAudioFromUrl(url, filename = 'audio.mp3') {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });
        loadAudioFile(file);
    } catch (error) {
        console.error('Error loading audio:', error);
    }
}
/**
 * Load demo audio (generate a sine wave for testing)
 */
async function loadDemoAudio() {
    if (elements.infoDiv) {
        elements.infoDiv.textContent = `🎵 Generating demo sine wave...`;
    }

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create a 3-second sine wave sweep from 220Hz to 880Hz
        const duration = 3;
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;

        // Create audio buffer
        audioBuffer = audioContext.createBuffer(2, numSamples, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = audioBuffer.getChannelData(channel);

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                // Frequency sweep from 220Hz to 880Hz
                const frequency = 220 + (t / duration) * 660;
                // Amplitude envelope (fade in and out)
                const envelope = Math.sin(Math.PI * t / duration);
                // Generate sine wave
                const value = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.5;
                channelData[i] = value;
            }
        }

        if (elements.sampleRateSpan) {
            elements.sampleRateSpan.textContent = `${audioBuffer.sampleRate} Hz`;
        }
        if (elements.totalDurationSpan) {
            elements.totalDurationSpan.textContent = formatTime(audioBuffer.duration);
        }
        currentPlaybackTime = 0;
        updateTimeDisplay(0);

        drawStaticWaveform();
        drawPlayheadOnCanvas();
        drawTimeMarkers();

        if (elements.playBtn) elements.playBtn.disabled = false;
        if (elements.stopBtn) elements.stopBtn.disabled = false;
        if (elements.seekSlider) elements.seekSlider.disabled = false;
        if (elements.playhead) elements.playhead.style.display = 'block';

        if (elements.infoDiv) {
            elements.infoDiv.textContent = `✅ Demo sine wave loaded (220Hz → 880Hz sweep, 3 seconds) | Click on waveform to seek`;
        }

    } catch (error) {
        console.error('Error creating demo audio:', error);
        if (elements.infoDiv) {
            elements.infoDiv.textContent = `❌ Error creating demo audio: ${error.message}`;
        }
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
    if (!audioBuffer) return;
    const seekTime = (e.target.value / 100) * audioBuffer.duration;
    seekTo(seekTime);
}

/**
 * Resize canvas
 */
function resizeCanvas() {
    if (!elements.canvas || !elements.ctx) return;

    const w = elements.canvas.clientWidth;
    if (w == 0) return;
    // elements.canvas.width = elements.canvas.clientWidth;
    elements.canvas.width = w;
    elements.canvas.height = elements.canvas.clientHeight;
    if (audioBuffer) {
        drawStaticWaveform();
        drawPlayheadOnCanvas();
        drawTimeMarkers();
    }
}

/**
 * Initialize DOM elements and event listeners
 */
export function showViz(
    {
        eltParent = null,
        soundSource = null,
        ...rest
    } = {}
) { // Add style
    const arrRest = Object.keys(rest);
    if (arrRest.length > 0) {
        console.error(`Unknown parameters: ${arrRest}`);
        debugger;
        throw Error(`Unknown parameters: ${arrRest}`);
    }
    const idStyle = "viz-volume-style";
    const oldStyle = document.getElementById(idStyle);
    if (!oldStyle) {
        const eltStyle = document.createElement("style");
        eltStyle.textContent = `
        NObody {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
        }

        .viz-vol {
            max-width: 1400px;
            margin: 0 auto;
        }

        div.viz-vol .visualization-container {
            background: #000;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }

        div.viz-vol canvas#waveformCanvas {
            display: block;
            width: 100%;
            height: 300px;
            max-height: 60px;
            background: #000;
            cursor: pointer;
        }

        div.viz-vol .time-axis {
            position: relative;
            margin-top: 10px;
            height: 30px;
            background: #111;
            border-radius: 4px;
        }

        div.viz-vol .time-marker-line {
            position: absolute;
            bottom: 15px;
            width: 1px;
            height: 10px;
            background: #888;
            transform: translateX(-50%);
        }

        div.viz-vol .time-marker {
            position: absolute;
            bottom: 0;
            transform: translateX(-50%);
            font-size: 12px;
            color: #888;
            font-family: monospace;
        }

        div.viz-vol .playhead {
            position: absolute;
            top: 0;
            width: 2px;
            height: 100%;
            background: #ff6b6b;
            pointer-events: none;
            z-index: 10;
            box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
        }

        div.viz-vol .time-display {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-family: monospace;
            font-size: 14px;
            color: #4CAF50;
            background: #111;
            padding: 8px 12px;
            border-radius: 4px;
        }

        div.viz-vol .controls {
            margin: 20px 0;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }

        div.viz-vol button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            transition: all 0.2s;
        }

        div.viz-vol button:hover:not(:disabled) {
            background: #45a049;
            transform: translateY(-1px);
        }

        div.viz-vol button:disabled {
            background: #666;
            cursor: not-allowed;
            opacity: 0.6;
        }

        div.viz-vol input[type="file"] {
            padding: 10px;
            background: #333;
            color: white;
            border: 1px solid #666;
            border-radius: 5px;
            cursor: pointer;
        }

        div.viz-vol input[type="file"]:hover {
            background: #444;
        }

        div.viz-vol .info {
            margin: 10px 0;
            padding: 10px;
            background: #333;
            border-radius: 5px;
            font-family: monospace;
        }

        div.viz-vol .seek-bar {
            flex: 1;
            min-width: 200px;
        }

        div.viz-vol input[type="range"] {
            width: 100%;
            height: 6px;
            -webkit-appearance: none;
            background: #333;
            border-radius: 3px;
            outline: none;
        }

        div.viz-vol input[type="range"]:focus {
            outline: none;
        }

        div.viz-vol input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
        }

        div.viz-vol .volume-control {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #333;
            padding: 5px 15px;
            border-radius: 5px;
        }

        div.viz-vol .volume-control input {
            width: 100px;
        }

        div.viz-vol .demo-button {
            background: #2196F3;
        }

        div.viz-vol .demo-button:hover:not(:disabled) {
            background: #0b7dda;
        }


        dialog#dialog-viz-volume::backdrop {
            background-color: #000C;
        }

        div.viz-vol #div-close {
            display: flex;
            justify-content: flex-end;
            margin-bottom: -10px;
            margin-top: -15px;
            margin-right: -15px;
        }

        div.viz-vol #close-button {
            background-color: transparent;
            color: black;
        }
        div.viz-vol #close-button:hover {
            background-color: red;
        }

        `;
        document.head.appendChild(eltStyle);
    }
    // Setup DOM elements
    const divOuterContainer = document.createElement("div");
    divOuterContainer.innerHTML = `
    <div class="viz-vol">
        <div id="div-close"><button id="close-button">X</button></div>
        <h1 style="display:none;">🎵 Sound Amplitude Visualization with Time Display</h1>

        <div class="controls">
            <input type="file" id="audioFile" accept="audio/*">
            <button id="demoBtn" class="demo-button" style="display:none;">🎵 Load Demo Sound</button>
            <button id="playBtn" disabled>▶</button>
            <button id="pauseBtn" disabled>⏸</button>
            <button id="stopBtn" disabled>⏹</button>
            <div class="seek-bar" style="display:none;">
                <input type="range" id="seekSlider" min="0" max="100" value="0" disabled>
            </div>
            <div class="volume-control" style="display:none;">
                <span>🔊</span>
                <input type="range" id="volumeSlider" min="0" max="100" value="80">
            </div>
        </div>

        <div class="visualization-container">
            <canvas id="waveformCanvas"></canvas>
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
    if (soundSource) {
        const inpAudio = /** @type {HTMLInputElement} */ (divOuterContainer.querySelector("#audioFile"));
        if (!inpAudio) throw Error(`Could not find #audioFile`);
        inpAudio.style.display = "none";
        // debugger;
        if (typeof soundSource == "string") {
            // loadAudioFromUrl(url, filename = 'audio.mp3')
            loadAudioFromUrl(soundSource);
        } else {
            debugger;
        }
    }

    const useDialog = !!!eltParent;
    console.log({ useDialog });
    // document.body.appendChild(divOuterContainer);
    if (!useDialog) {
        eltParent.appendChild(divOuterContainer);
    } else {
        const eltDialog = document.createElement("dialog");
        eltDialog.id = "dialog-viz-volume";
        eltDialog.style = `
            aspect-ratio: 1.6 / 1;
            max-width: 80vw;
            max-height : 60vh;
            min-width: 300px;
            min-height: 250px;
            outline: 3px dotted red;
        `;
        eltDialog.appendChild(divOuterContainer);
        document.body.appendChild(eltDialog);
        eltDialog.showModal();
    }


    // Get DOM elements
    // const btnClose = document.getElementById("close-button");
    const btnClose = /** @type {HTMLButtonElement} */ (divOuterContainer.querySelector("#close-button"));
    btnClose?.addEventListener("click", evt => {
        evt.stopImmediatePropagation();
        // alert("close");
        stopAudio();
        const eltDialog = /** @type {HTMLDialogElement} */ (btnClose.closest("dialog"));
        eltDialog.close();
    })

    // elements.canvas = document.getElementById('waveformCanvas');
    elements.canvas = divOuterContainer.querySelector("#waveformCanvas");
    if (!elements.canvas) {
        console.error('Canvas element not found');
        return;
    }
    elements.ctx = elements.canvas.getContext('2d');

    /*
      Note that divOuterContainer.querySelector("#id") is not
      strictly correct because the ids might be doubles.
      But I believe it will work in practice since this is only
      used in the dialog (or div container).
    */
    // elements.playBtn = document.getElementById('playBtn');
    elements.playBtn = divOuterContainer.querySelector("#playBtn");

    // elements.pauseBtn = document.getElementById('pauseBtn');
    elements.pauseBtn = divOuterContainer.querySelector("#pauseBtn");

    // elements.stopBtn = document.getElementById('stopBtn');
    elements.stopBtn = divOuterContainer.querySelector("#stopBtn");

    // elements.seekSlider = document.getElementById('seekSlider');
    elements.seekSlider = divOuterContainer.querySelector("#seekSlider");

    // elements.volumeSlider = document.getElementById('volumeSlider');
    elements.volumeSlider = divOuterContainer.querySelector("#volumeSlider");

    // elements.audioFileInput = document.getElementById('audioFile');
    elements.audioFileInput = divOuterContainer.querySelector("#audioFile");

    // elements.demoBtn = document.getElementById('demoBtn');
    elements.demoBtn = divOuterContainer.querySelector("#demoBtn");

    // elements.infoDiv = document.getElementById('info');
    elements.infoDiv = divOuterContainer.querySelector("#info");

    // elements.currentTimeSpan = document.getElementById('currentTime');
    elements.currentTimeSpan = divOuterContainer.querySelector("#currentTime");

    // elements.totalDurationSpan = document.getElementById('totalDuration');
    elements.totalDurationSpan = divOuterContainer.querySelector("#totalDuration");

    // elements.sampleRateSpan = document.getElementById('sampleRate');
    elements.sampleRateSpan = divOuterContainer.querySelector("#sampleRate");

    // elements.timeAxisDiv = document.getElementById('timeAxis');
    elements.timeAxisDiv = divOuterContainer.querySelector("#timeAxis");

    // elements.playhead = document.getElementById('playhead');
    elements.playhead = divOuterContainer.querySelector("#playhead");


    // Add event listeners
    if (elements.audioFileInput) {
        elements.audioFileInput.addEventListener('change', handleFileChange);
    }
    if (elements.demoBtn) {
        elements.demoBtn.addEventListener('click', loadDemoAudio);
    }
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', playAudio);
    }
    if (elements.pauseBtn) {
        elements.pauseBtn.addEventListener('click', pauseAudio);
    }
    if (elements.stopBtn) {
        elements.stopBtn.addEventListener('click', stopAudio);
    }
    if (elements.seekSlider) {
        elements.seekSlider.addEventListener('input', handleSeekInput);
    }
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', updateVolume);
    }
    if (elements.canvas) {
        elements.canvas.addEventListener('click', handleCanvasClick);
    }

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Initialize canvas
    resizeCanvas();

    // Initialize time axis
    drawTimeMarkers();

    if (elements.infoDiv) {
        elements.infoDiv.textContent = '💡 Ready! Load an audio file or click "Load Demo Sound" to test. Click on the waveform to seek.';
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