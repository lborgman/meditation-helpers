// @ts-check
export { }

console.log("This is gen-sounds.js");

// Note: modTone is empty

// const modTone = await import("https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js");

const linkJsdelivr = "https://cdn.jsdelivr.net/npm/tone@latest/build/Tone.js";
// const modTone = await import(linkJsdelivr);

// @ts-ignore
const linkToneTest0 = makeAbsLink("../../../ext/tonejs/tone-test0.js");
const modTone = await import(linkToneTest0);

debugger;