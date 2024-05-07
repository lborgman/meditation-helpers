// @ts-check

/*
 https://stackoverflow.com/questions/78424788/milliseconds-vs-seconds-can-jsdoc-tell-me-when-i-mix-things-up/78424849#78424849
 https://stackoverflow.com/questions/77622612/defining-tagged-types-aka-branded-types-in-jsdoc
 https://github.com/microsoft/TypeScript/issues/43576
 https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/
*/


/** @typedef {number&{_tag: 'TSTESTmilliSeconds'}} TSTESTmilliSeconds */
/** @typedef {number&{_tag: 'TSTESTseconds'}} TSTESTseconds */

/** @param {number} value */
const toMilliSeconds = (value) => /** @type TSTESTmilliSeconds */(value);
/** @param {number} value */
const toSeconds = (value) => /** @type TSTESTseconds */(value);

/** @type {TSTESTmilliSeconds} */
let ms = toMilliSeconds(1);

/** @type {TSTESTseconds} */
let sec = toSeconds(2);


ms = toMilliSeconds(sec);

/**
 * 
 * @param {TSTESTseconds} secVal 
 * @returns {TSTESTmilliSeconds}
 */
function sec2ms(secVal) {
    console.log("sec2ms", secVal);
    return toMilliSeconds(1000 * secVal);
}

/** @type {TSTESTmilliSeconds} */
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