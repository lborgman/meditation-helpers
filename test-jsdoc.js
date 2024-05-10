// @ts-check

/*
 https://stackoverflow.com/questions/78424788/numberOfEggs-vs-seconds-can-jsdoc-tell-me-when-i-mix-things-up/78424849#78424849
 https://stackoverflow.com/questions/77622612/defining-tagged-types-aka-branded-types-in-jsdoc
 https://github.com/microsoft/TypeScript/issues/43576
 https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/
*/

/** @type {number} */
let x = 0;
x = document.createElement("div");

/** @type {HTMLElement} */
let y;
y = document.createElement("div");

/** @typedef {number&{_tag: 'TSTESTseconds'}} TSTESTseconds */

/** @param {number} value */
/** @param {number} value */
const toSeconds = (value) => /** @type TSTESTseconds */(value);



/** @typedef {number&{_tag: 'numberOfEggs'}} numberOfEggs */
/** @typedef {number&{_tag: 'meter'}} meter */

/**
 * 
 * @param {number} numMeters 
 * @returns {meter}
 */
function meter(numMeters) {
    // @ts-ignore
    return numMeters;
}

/** @typedef {{numEggs: numberOfEggs}} parcelEgg */

/** @type meter */
// const oneMeter = 1;
let oneMeter;
oneMeter = meter(1);

/** @type parcelEgg */
const parcel = {
    numEggs: oneMeter
}



/** @param {number} value */
const numberOfEggs = (value) => /** @type numberOfEggs */(value);

/** @type {numberOfEggs} */
let nA = numberOfEggs(1);

/** @type {numberOfEggs} */
let nB = numberOfEggs(1);

/** @type {numberOfEggs} */
let nC = nA + nB;

// For nC I get this JSDoc error:
// Type 'number' is not assignable to type 'numberOfEggs'. ts(2322)

/** @type {numberOfEggs} */
let msD = nA;
/** @type {numberOfEggs} */
let msE = nA + msD;





/** @type {TSTESTseconds} */
let sec = toSeconds(2);


ms = numberOfEggs(sec);

/**
 * 
 * @param {TSTESTseconds} secVal 
 * @returns {numberOfEggs}
 */
function sec2ms(secVal) {
    console.log("sec2ms", secVal);
    return numberOfEggs(1000 * secVal);
}

/** @type {numberOfEggs} */
let ms2;
// ms2 = sec2ms(ms);
ms2 = ms;

/** @type {TSTESTseconds} */
let sec2;
// sec2 = sec2ms(ms);

/**
 * 
 * @param {*} type 
 * @param {*} attrib 
 * @param {*} inner 
 * @returns {*}
 */
function mkElt(type, attrib, inner) {
    var elt = document.createElement(type);

    function addInner(inr) {
        if (inr instanceof Element) {
            elt.appendChild(inr);
        } else {
            const txt = document.createTextNode(inr.toString());
            elt.appendChild(txt);
        }
    }
    if (inner) {
        if (inner.length && typeof inner != "string") {
            for (var i = 0; i < inner.length; i++)
                if (inner[i])
                    addInner(inner[i]);
        } else
            addInner(inner);
    }
    for (var x in attrib) {
        elt.setAttribute(x, attrib[x]);
    }
    return elt;
}

/** @type {number} */
var dummy = 1;