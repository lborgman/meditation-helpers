// @ts-check
export { }

console.log("This is gen-sounds.js");

// Note: modTone is empty

// const modTone = await import("https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js");

const linkJsdelivr = "https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js";
// await import(linkJsdelivr);

// const modTone = await import("tone-test0");
// @ts-ignore import
await import("tone-test0");

// @ts-ignore tonejs
await Tone.start();

// debugger;