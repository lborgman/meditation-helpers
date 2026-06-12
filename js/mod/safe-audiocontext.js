// Internal module registry to track active instances app-wide
const activeEngines = new Set();
const MAX_CONCURRENT_ENGINES = 5; // Safe buffer below browser hardware caps

export class SafeAudioEngine {
    constructor() {
        // 1. Guard against browser hardware limits
        if (activeEngines.size >= MAX_CONCURRENT_ENGINES) {
            throw new Error(`AudioEngine limit (${MAX_CONCURRENT_ENGINES}) exceeded. You must destroy an old instance before creating a new one.`);
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        this.trackedNodes = new Set();
        this.trackedTracks = new Set();

        // Register this instance globally within the module
        activeEngines.add(this);

        // Tab closure safety net
        this._unloadListener = () => this.destroy();
        window.addEventListener('beforeunload', this._unloadListener);
    }

    // Factory method to track and create standard nodes
    createNode(factoryMethodName, ...args) {
        if (!this.ctx) throw new Error("AudioEngine has been destroyed.");

        const node = this.ctx[factoryMethodName](...args);
        this.trackedNodes.add(node);
        return node;
    }

    // Special tracker for hardware inputs like Microphones/WebRTC
    trackMediaStream(stream) {
        stream.getTracks().forEach(track => this.trackedTracks.add(track));
    }

    // Complete, safe destruction
    async destroy() {
        // Remove the window listener to prevent memory leaks
        window.removeEventListener('beforeunload', this._unloadListener);

        // Stop hardware inputs so the recording indicator turns off
        for (const track of this.trackedTracks) {
            try { track.stop(); } catch (e) { }
        }
        this.trackedTracks.clear();

        // Stop and disconnect all standard nodes safely
        for (const node of this.trackedNodes) {
            if (typeof node.stop === 'function') {
                try { node.stop(); } catch (e) { }
            }
            if (typeof node.disconnect === 'function') {
                try { node.disconnect(); } catch (e) { }
            }
        }
        this.trackedNodes.clear();

        // Close the context hardware thread
        if (this.ctx && this.ctx.state !== 'closed') {
            try {
                await this.ctx.close();
            } catch (e) {
                console.error("Failed to close AudioContext:", e);
            }
        }

        this.ctx = null;

        // Remove from global registry so a new slot opens up
        activeEngines.delete(this);
        console.log("Audio Engine entirely destroyed and memory slot freed.");
    }
}

// Helper utility export to monitor engine health across your app
export function getActiveEngineCount() {
    return activeEngines.size;
}


export function patchAudioNodeLinks() {
    // Run this hook once at the very top of your audio module
    const nativeConnect = AudioNode.prototype.connect;
    const nativeDisconnect = AudioNode.prototype.disconnect;

    AudioNode.prototype.connect = function (destination, outputIndex, inputIndex) {
        // Initialize a hidden connections registry on the node
        this.__connections = this.__connections || new Set();
        this.__connections.add(destination);

        // Execute the browser's real connection logic
        return nativeConnect.apply(this, arguments);
    };

    AudioNode.prototype.disconnect = function () {
        // Clear out our tracking data when disconnected
        if (this.__connections) {
            this.__connections.clear();
        }

        // Execute the browser's real disconnection logic
        return nativeDisconnect.apply(this, arguments);
    };
}