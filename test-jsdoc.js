// @ts-check

/*
 https://stackoverflow.com/questions/78424788/milliseconds-vs-seconds-can-jsdoc-tell-me-when-i-mix-things-up/78424849#78424849
 https://stackoverflow.com/questions/77622612/defining-tagged-types-aka-branded-types-in-jsdoc
*/

/* @typedef {number} TSseconds */
/* @typedef {number} TSmilliSeconds */

/** @typedef {number&{_tag: 'TSmilliSeconds'}} TSmilliSeconds */
/** @typedef {number&{_tag: 'TSseconds'}} TSseconds */

/** @param {number} value */
const toMilliSeconds = (value) => /** @type TSmilliSeconds */ (value);
/** @param {number} value */
const toSeconds = (value) => /** @type TSseconds */ (value);

/** @type {TSmilliSeconds} */
let ms = toMilliSeconds(1);

/** @type {TSseconds} */
let sec = toSeconds(2);


ms = toMilliSeconds(sec);

/**
 * 
 * @param {TSseconds} secVal 
 * @returns {TSmilliSeconds}
 */
function sec2ms(secVal) {
    console.log("sec2ms", secVal);
    return toMilliSeconds(1000 * secVal);
}

/** @type {TSmilliSeconds} */
let ms2;
// ms2 = sec2ms(ms);
ms2 = ms;

/** @type {TSseconds} */
let sec2;
// sec2 = sec2ms(ms);
