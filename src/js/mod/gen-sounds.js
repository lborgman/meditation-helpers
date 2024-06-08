// @ts-check
export { }

console.log("This is gen-sounds.js");

// @ts-ignore import
// await import("tone-test0");
// const linkJsdelivr = "https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js";
// await import(linkJsdelivr);

async function loadTone() {
    // @ts-ignore import
    await import("https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js");
    // @ts-ignore tonejs
    await Tone.start();
}
await loadTone();

// debugger;