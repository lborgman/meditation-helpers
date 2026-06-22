///// Made by Claude AI (with some help from me)

// @ts-check
const SAFE_AUDIOCONTEXT_VER = "0.7.0";
console.log(`here is safe-audiocontext.js ${SAFE_AUDIOCONTEXT_VER}`);
if (document.currentScript) { throw new Error("safe-audiocontext.js must be loaded as a module"); }

/** @type {AudioContext|null} */
let _ctx = null;
const _groups = new Map(); // name -> group

/**
 * Returns the shared AudioContext, creating it if needed.
 * Created lazily to avoid autoplay policy issues on page load.
 * @returns {AudioContext}
 */
export function getContext() {
    if (!_ctx || _ctx.state === 'closed') {
        _ctx = new AudioContext();
        window.addEventListener('beforeunload', destroy, { once: true });
    }
    return _ctx;
}

/**
 * Resumes a suspended AudioContext.
 * Must be called inside a user gesture handler before audio will play.
 * @returns {Promise<void>}
 */
export async function resume() {
    const ctx = getContext();
    if (ctx.state === 'suspended') await ctx.resume();
}

/**
 * @typedef {Object & {[key: string]: any}} NodeGroup
 * @property {string} name - The unique name of this group.
 * @property {function(AudioNode): AudioNode} track - Track an externally created node. Returns the node for chaining.
 * @property {function(MediaStream): void} trackMediaStream - Track a MediaStream's hardware tracks. Stops them on destroy, clearing the recording indicator.
 * @property {function(): void} destroy - Disconnect all nodes, stop all media tracks, and remove this group from the registry.
 *
 * — Proxied AudioContext factory methods (all track the created node automatically) —
 * @property {function(): AnalyserNode} createAnalyser
 * @property {function(): BiquadFilterNode} createBiquadFilter
 * @property {function(number, number, number): AudioBuffer} createBuffer
 * @property {function(): AudioBufferSourceNode} createBufferSource
 * @property {function(number=): ChannelMergerNode} createChannelMerger
 * @property {function(number=): ChannelSplitterNode} createChannelSplitter
 * @property {function(): ConstantSourceNode} createConstantSource
 * @property {function(): ConvolverNode} createConvolver
 * @property {function(number=): DelayNode} createDelay
 * @property {function(): DynamicsCompressorNode} createDynamicsCompressor
 * @property {function(): GainNode} createGain
 * @property {function(number[], number[]): IIRFilterNode} createIIRFilter
 * @property {function(): OscillatorNode} createOscillator
 * @property {function(): PannerNode} createPanner
 * @property {function(Float32Array, Float32Array, PeriodicWaveConstraints=): PeriodicWave} createPeriodicWave
 * @property {function(): StereoPannerNode} createStereoPanner
 * @property {function(): WaveShaperNode} createWaveShaper
 * @property {function(HTMLMediaElement): MediaElementAudioSourceNode} createMediaElementSource
 * @property {function(): MediaStreamAudioDestinationNode} createMediaStreamDestination
 * @property {function(MediaStream): MediaStreamAudioSourceNode} createMediaStreamSource
 * @property {function(MediaStreamTrack): MediaStreamAudioSourceNode} createMediaStreamTrackSource
 * @property {function(number=, number=, number=): ScriptProcessorNode} createScriptProcessor - @deprecated Use AudioWorklet instead.
 */

/**
 * Returns the named NodeGroup, creating it if it doesn't exist yet.
 * Any file can call makeNodeGroup('same-name') to get the same group.
 * After group.destroy() or destroyGroup(name), calling makeNodeGroup(name)
 * again will create a fresh group.
 * @param {string} name - Unique name for this group.
 * @returns {NodeGroup}
 */
export function makeNodeGroup(name) {
    if (_groups.has(name)) return _groups.get(name);

    const nodes = new Set();
    const tracks = new Set();

    const group = /** @type {NodeGroup} */ ({
        name,

        track(node) {
            nodes.add(node);
            return node;
        },

        trackMediaStream(stream) {
            stream.getTracks().forEach(t => tracks.add(t));
        },

        destroy() {
            for (const track of tracks) {
                try { track.stop(); } catch (_) {}
            }
            tracks.clear();

            for (const node of nodes) {
                try { node.disconnect(); } catch (_) {}
            }
            nodes.clear();

            _groups.delete(name);
        }
    });

    // Proxy all ctx.createX() methods so callers never need to touch ctx directly.
    // Walks the full prototype chain since most factory methods live on
    // BaseAudioContext.prototype, not AudioContext.prototype itself.
    const ctx = getContext();
    let proto = AudioContext.prototype;
    while (proto && proto !== EventTarget.prototype) {
        for (const key of Object.getOwnPropertyNames(proto)) {
            const fn = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (ctx))[key];
            if (key.startsWith('create') && typeof fn === 'function' && !(key in group)) {
                group[key] = (...args) => group.track(/** @type {Function} */ (fn).apply(ctx, args));
            }
        }
        proto = Object.getPrototypeOf(proto);
    }

    _groups.set(name, group);
    return group;
}

/**
 * Destroys the named NodeGroup if it exists. No-op if the name is not found.
 * @param {string} name - The name of the group to destroy.
 */
export function destroyGroup(name) {
    const group = _groups.get(name);
    if (group) group.destroy();
}

/**
 * Destroys all groups, then closes the AudioContext.
 * Called automatically on beforeunload; can also be called manually.
 * @returns {Promise<void>}
 */
export async function destroy() {
    window.removeEventListener('beforeunload', destroy);

    for (const group of _groups.values()) {
        group.destroy();
    }
    _groups.clear();

    if (_ctx && _ctx.state !== 'closed') {
        try { await _ctx.close(); } catch (e) {
            console.error("safe-audiocontext: failed to close AudioContext:", e);
        }
    }
    _ctx = null;
}