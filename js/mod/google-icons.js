// @ts-check

const GOOGLE_ICONS_VER = "0.0.01";
// @ts-ignore
logConsoleHereIs(`here is google-icons.js, module,${GOOGLE_ICONS_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

// @ts-ignore
const mkElt = window["mkElt"];

const mdcIconStyle = "Outlined";
// const mdcIconStyle = "Rounded";
// const mdcIconStyle = "Sharp";

const { urlIcons, urlAppName, linkSymbolCss } = await (async () => {
    // debugger;
    const arrSymbolsCss = [...document.querySelectorAll("link[rel=stylesheet]")].filter(l => {
        // @ts-ignore
        return l.href.endsWith("-symbols.css")
    });
    if (arrSymbolsCss.length != 1) {
        // There should be exactly one symbols.css:
        // <link rel="stylesheet" href="../ext/mdc-fonts/symbols.css" />
        debugger;
    }
    console.log({ arrSymbolsCss });
    const linkSymbolCss = /** @type {HTMLLinkElement} */ (arrSymbolsCss[0]);
    // const hrefSymbolsCss = arrSymbolsCss[0].href;
    const hrefSymbolsCss = linkSymbolCss.href;
    console.log({ hrefSymbolsCss });
    const respSymbolsCss = await fetch(hrefSymbolsCss);
    if (!respSymbolsCss.ok) {
        // Seems like the file is not there?
        debugger;
        throw Error(`Could not fetch "${hrefSymbolsCss}"`);
    }
    const css = await respSymbolsCss.text();
    console.log({ css });
    function extractFontUrl(css) {
        // Match url(...) inside src, supporting single/double quotes and no quotes
        const urlRegex = /src:\s*url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/i;
        const match = css.match(urlRegex);

        return match ? match[1] : null;
    }
    const urlWoff = extractFontUrl(css);
    // debugger;
    const n = urlWoff.slice(0, -14);
    const l = n.lastIndexOf("/");
    const cssAppName = n.slice(l + 1);

    const urlIcons = new URL("..", hrefSymbolsCss);
    // debugger;
    const p = hrefSymbolsCss.split("/")
    const last = p[p.length - 1];
    const urlAppName = last.slice(0, - 12);

    if (urlAppName != cssAppName) {
        // This is just to keep you sane...
        debugger;
        throw Error(`urlAppName != cssAppName`);
    }
    return { urlIcons, urlAppName, linkSymbolCss };
})();
console.log({ urlIcons, urlAppName });


{
    // Check the hrefIcons dir
    // debugger;
    // const hrefSymbolsCss = 
    // const urlCodepoints = new URL("symbols.css", urlIcons)
    // const respSymbolsCss = await fetch(hrefSymbolsCss);

}

let tmrSaveIconsUsed;
let iconsForApp = "BAD";
const idBtnSym = "button-mdc-symbols"
if (location.hostname == "localhost") {
    const iconMap = await getIconMap();
    // debugger;
    // @ts-ignore
    if (!iconMap["e0a0"]) {
        debugger;
    }
    const btnSymbols = mkElt("button", { id: idBtnSym }, "Get Woff2");
    btnSymbols.style = `
        position: fixed;
        top: 5px;
        right: 5px;
        background-color: red;
        padding: 20px;
        border-radius: 5px;
        display: none;
        z-index: 9999;
    `;
    document.body.appendChild(btnSymbols);
    btnSymbols.addEventListener("click", evt => {
        evt.stopPropagation();
        checkWoff2icons("dialog");
    });
}


// const urlWoff2File = "../ext/mdc-fonts/my-symbols.woff2";
// let urlWoff2File = "";
// export function setWoff2File(url) { urlWoff2File = url; }
// export function getWoff2File() { return urlWoff2File; }
let urlWoff2File = "";

export function setup() {
    // debugger;
    setIconsFor(urlAppName);
    const u = new URL(`${urlAppName}-symbols.woff2`, urlIcons);
    // debugger;
    urlWoff2File = u.href;
    init();
}
let materialIconsClass = "material-symbols-outlined";
export function getMaterialIconClass() { return materialIconsClass; }
/** @param {string} className */
export function setMaterialIconClass(className) {
    if (
        !className.startsWith("material-icons")
        &&
        !className.startsWith("material-symbols-")
    ) throw Error(`Must be a Google Material Icons/Symbols class name: ${className}`);
    materialIconsClass = className;
}

const setIconsUsed = new Set();
let setIconsInWoffFile;

// https://developers.google.com/fonts/docs/material_icons
/**
 * @param {string} iconMaterialName 
 * @returns {HTMLSpanElement}
 */
export function mkIcon(iconMaterialName) {
    addToUsedSymbols(iconMaterialName);
    return mkElt("span", { class: materialIconsClass }, iconMaterialName);
}

async function init() {
    setIconsInWoffFile = await getIconsInWoffFile();
    // addToUsedSymbols("edit");
    // addToUsedSymbols("edit_off");
}

export function addToUsedSymbols(sym) {
    if (location.hostname != "localhost") return;
    if (!setIconsInWoffFile) return; // We did not get fontKit
    const tofSym = typeof sym;
    if (tofSym != "string") { throw Error(`typeof sym is not "string", but "${tofSym}"`); }
    // if (setIconsUsed.has(sym)) return;
    setIconsUsed.add(sym);
    if (setIconsInWoffFile.has(sym)) return;

    clearTimeout(tmrSaveIconsUsed);
    tmrSaveIconsUsed = setTimeout(async () => {
        debugger;
        saveStoredIconsUsed();
        const numMissing = await checkWoff2icons("justCheck");
        if (numMissing > 0) {
            const btn = document.getElementById(idBtnSym);
            btn.style.display = "block";
            btn.textContent = `New Download missing in Woff2: ${numMissing}`;
        }
    }, 1000);
}


/**
 * @returns {Promise<Set<string>|undefined>}
 */
async function getIconsInWoffFile() {
    if (urlWoff2File.length == 0) { debugger; }
    const woffIconsList = await getMdcSymbolsInWoff2File(urlWoff2File);
    const hasWoffIcons = woffIconsList != undefined;
    // return new Set(hasWoffIcons ? woffIconsList.split(",") : undefined);
    // return hasWoffIcons? new Set(woffIconsList.split(",")) : undefined;
    const list = hasWoffIcons ? woffIconsList.split(",") : undefined;
    return new Set(list);
}

/**
 * 
 * @param {string} action 
 */
async function checkWoff2icons(action) {
    if (!["justCheck", "dialog"].includes(action)) throw Error(`Unknown action parameter: "${action}"`);
    const woffIconsList = await getMdcSymbolsInWoff2File(urlWoff2File);
    const hasWoffIcons = woffIconsList != undefined;

    // const setIconsWoff2 = new Set(hasWoffIcons ? woffIconsList.split(",") : undefined);
    const setIconsWoff2 = setIconsInWoffFile;
    // setIconsWoff2.add("edit"); // FIX-ME: mapping codepoints problem
    // setIconsWoff2.add("favorite"); // FIX-ME: mapping codepoints problem

    const setIconsMissing = new Set();
    setIconsUsed.forEach(sym => {
        if (!setIconsWoff2.has(sym)) { setIconsMissing.add(sym); }
    });

    // FIX-ME: codepoint problems:
    // setIconsMissing.delete("add");
    setIconsMissing.delete("bookmark");
    // setIconsMissing.delete("delete_forever");
    setIconsMissing.delete("help");
    setIconsMissing.delete("history");
    // setIconsMissing.delete("smart_toy");

    if (action == "justCheck") return setIconsMissing.size;

    const linkWOFF2 = await mkWOFF2downloadLink();
    const missing = [...setIconsMissing].sort().join(", ");
    const used = [...setIconsUsed].sort().join(", ");
    const woff2 = [...setIconsWoff2].sort().join(", ");
    window.console.log(`Missing in woff file: "${missing}",\nsee console for .woff download link`);

    // alert(`Missing in woff file: "${missing}",\nsee console for .woff download link`);
    const makeGroupLabel = (txt) => {
        const elt = mkElt("span", undefined, txt);
        elt.style.fontWeight = "bold";
        elt.style.fontSize = "1.3rem";
        return elt;
    }
    const woff2FileName = `${iconsForApp}-symbols.woff2`;
    const eltDownload = mkElt("div", { class: "mdc-card" }, [
        mkElt("a", { href: linkWOFF2, style: "opacity:0.3; display:none;" }, "OLD, DON'T USE: Download new WOFF2"),
        mkElt("p", { style: "opacity:0.5; display:none;" }, [
            `Replace the file `,
            mkElt("div", undefined, `./ext/mdc-fonts/${iconsForApp}-symbols.woff2`),
            ` with the new file.`
        ]),
        mkElt("p", undefined, [
            `The downloaded file will be named `,
            mkElt("b", undefined, woff2FileName), ". ",
            `Place it in the same directory as the href here:`
        ]),
        mkElt("p", undefined, [
            linkSymbolCss.outerHTML
        ])
    ]);
    eltDownload.style = `
        padding: 10px;
        margin-top: 20px;
        background-color: yellowgreen;
    `;
    const btnDownload = mkElt("button", undefined, "Download");
    btnDownload.addEventListener("click", evt => {
        evt.stopPropagation();
        // debugger;
        customDownload(linkWOFF2, woff2FileName);
    });
    eltDownload.appendChild(btnDownload);
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Missing Material Symbols"),
        mkElt("div", undefined, [makeGroupLabel(`Used (${setIconsUsed.size}): `), `${used}`]),
        mkElt("div", undefined, [makeGroupLabel(`WOFF2 (${setIconsWoff2.size}): `), `${woff2}`]),
        mkElt("div", undefined, [makeGroupLabel(`Missing (${setIconsMissing.size}): `), `${missing}`]),
        eltDownload,
        // btnDownload
    ]);
    mkDialogAlert(body, "Close");
}

async function getMdcSymbolsInWoff2File(woffUrl) {
    const modWoffCodepoints = await importFc4i("woff-codepoints");
    const codepoints = await modWoffCodepoints.getCodepoints(woffUrl);
    if (!codepoints) return;


    const modWoff2MdcSymbols = await importFc4i("woff2-mdc-symbols");
    const codepointToName = await modWoff2MdcSymbols.fetchGoogleSymbolNameMap(mdcIconStyle);
    if (!codepointToName) return;

    // Now you can look up names:
    const names = codepoints.map(cp => codepointToName[cp]);
    const cleanedNames = names.filter(name => { if (typeof name == "string") return name; });
    const strNames = cleanedNames.sort().join(",");
    return strNames;
}

async function getIconMap() {
    /*
      Can fetch it from GitHub from localhost
      https://gemini.google.com/share/357e057fe42b
      mdcIconStyle is not needed here!
      2. The Codepoint "Address" vs. the "Look"
         The most important thing to remember: The Codepoint is the "Street Address" of the icon.
         The home icon is always at address e88a.
         Whether the house at that address is "Outlined," "Rounded," "Bold," or "Filled" doesn't change the address.
    */
    const iconMapUrl =
        "https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsOutlined%5BFILL,GRAD,opsz,wght%5D.codepoints";

    let response;
    // debugger;
    try {
        response = await fetch(iconMapUrl);
    } catch (error) {
        console.error("Failed to fetch codepoints:", error);
        debugger;
    }
    if (response == undefined || !response.ok) {
        debugger;
        throw Error("Could not fetch codepoints");
    }
    const text = await response.text();

    // Split by lines and reduce into an object
    const iconMap = text.split('\n').reduce((acc, line) => {
        const [name, codepoint] = line.trim().split(' ');
        if (name && codepoint) {
            // Mapping Codepoint -> Name
            acc[codepoint] = name;
        }
        return acc;
    }, {});

    return iconMap;
}

const keyIcons = () => `used-mdc-symbols-${iconsForApp}`;
function getStoredIconsUsed() {
    // const storedIconsUsed = localStorage.getItem("used-mdc-symbols")
    // const storedIconsUsed = localStorage.getItem(keyIcons());
    const keyIconsUsed = keyIcons();
    const storedIconsUsed = localStorage.getItem(keyIconsUsed);
    if (storedIconsUsed != null) {
        const arrUsed = storedIconsUsed.split(",");
        arrUsed.forEach(sym => {
            if (sym.length == 0) throw Error("sym is empty string");
            setIconsUsed.add(sym);
        });
    }
}
function saveStoredIconsUsed() {
    if (location.hostname != "localhost") return;
    if (!iconsForApp) return;
    getStoredIconsUsed();
    if (setIconsUsed.size == 0) return;
    // localStorage.setItem("used-mdc-symbols", [...setIconsUsed].sort().join(","));
    localStorage.setItem(keyIcons(), [...setIconsUsed].sort().join(","));
}

/**
 * @param {string} whichApp 
 */
function setIconsFor(whichApp) {
    iconsForApp = whichApp;
    saveStoredIconsUsed();
}

async function mkWOFF2downloadLink() {
    // if (!navigator.onLine) return;
    const ourIcons = getOurIconList();
    const linkWOFF2css = `https://fonts.googleapis.com/css2?family=Material+Symbols+${mdcIconStyle}:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${ourIcons}`;
    // const old = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${ourIcons}`;
    // if (old != linkWOFF2css) { debugger; }
    console.log(linkWOFF2css.slice(8));
    // return linkWOFF2css;
    let cssResponse;
    // https://web.dev/articles/fetch-api-error-handling
    try {
        cssResponse = await fetch(linkWOFF2css);
    } catch (err) {
        console.error(linkWOFF2css, err);
        throw Error(err);
    }
    const txtCss = await cssResponse.text();
    const m = txtCss.match(/url\((.*?)\)/m);
    const linkWOFF2 = m[1];
    // debugger;
    return linkWOFF2;
}

function getOurIconList() {
    // if (setIconsUsed.has("")) debugger;
    return [...setIconsUsed].sort().join(",");
}

function mkDialogAlert(body, strClose) {
    const btn = mkElt("button", undefined, strClose);
    const div = mkElt("div", undefined, [
        body,
        mkElt("p", { style: "display:flex; flex-wrap:wrap; justify-content:center;" }, btn)
    ]);
    const dlg = mkElt("dialog", undefined, div);
    document.documentElement.appendChild(dlg);
    btn.addEventListener("click", evt => {
        evt.stopPropagation();
        dlg.close();
    })
    dlg.showModal();
}

/*
Geimini version
NOTE: This is only used on localhost!

### Key Considerations for Your Script

*   **CORS:** Since you are fetching from `raw.githubusercontent.com`, it generally supports CORS, so you shouldn't run into issues fetching it directly from a browser-based app.
*   **Version Control:** The URL above points to the `master` branch. If you want to ensure your mapping never changes unexpectedly, you can point it to a specific **commit hash** instead.
*   **Format Handling:** Note that the file stores the hex *without* the `0x`, `\u`, or `&#x` prefix. If the data you are checking against contains those prefixes, you'll want to strip them before looking them up in your map:
    ```javascript
    const cleanHex = incomingHex.replace(/\\u|&#x|0x|;/g, '').toLowerCase();
    const iconName = iconMap[cleanHex];
    ```

### Which Font Style are you using?
The link in the code above is for the **Classic Material Icons**. If you have switched to the newer **Material Symbols** (the ones with variable weights and grades), you should use this URL instead:

`https://raw.githubusercontent.com/google/material-design-icons/master/That makes perfect sense. If you are building a custom icon component or a tool that needs to translate those hex codes back into human-readable names on the fly, fetching that file is the most efficient way to stay updated.

The `.codepoints` file is essentially a giant space-separated list. Each line follows the format `name codepoint`. 

Here is a clean way to fetch that file and transform it into a JavaScript Object (Map) where the **codepoint is the key** and the **name is the value**.

### JavaScript Implementation
```javascript
*/
/*
async function NEWgetIconMap() {
    const url = '[https://raw.githubusercontent.com/google/material-design-icons/master/font/MaterialIcons-Regular.codepoints](https://raw.githubusercontent.com/google/material-design-icons/master/font/MaterialIcons-Regular.codepoints)';

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Split by lines and reduce into an object
        const iconMap = text.split('\n').reduce((acc, line) => {
            const [name, codepoint] = line.trim().split(' ');
            if (name && codepoint) {
                // Mapping Codepoint -> Name
                acc[codepoint] = name;
            }
            return acc;
        }, {});

        return iconMap;
    } catch (error) {
        console.error("Failed to fetch codepoints:", error);
    }
}
*/

/*
// Usage:
getIconMap().then(map => {
  console.log(map['e8b6']); // Outputs: "search"
  console.log(map['e88a']); // Outputs: "home"
});
*/


async function getOriginalFilename(url) {
    // Method 1: Try parsing from URL
    const urlObj = new URL(url);
    let filename = urlObj.pathname.split('/').pop();

    if (filename && !filename.includes('.') && !filename.includes('?')) {
        // URL gives generic name like "font" - we need to fetch headers
        filename = null;
    }

    if (!filename) {
        // Method 2: Check Content-Disposition header
        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
            const contentDisposition = response.headers.get('Content-Disposition');

            if (contentDisposition) {
                // Look for filename in header
                const match = contentDisposition.match(/filename[^*]=["']?([^"';]+)["']?/);
                if (match) {
                    filename = match[1];
                }
            }
        } catch (e) {
            console.log("Couldn't fetch headers (CORS may be blocking)");
        }
    }

    return filename || 'unknown.woff2';
}

// Use it in your customDownload function
export async function customDownload(url, customFilename) {
    // originalName does not work, probably because of CORS
    const originalName = await getOriginalFilename(url);
    console.log(`Original filename: ${originalName}`);
    console.log(`Your custom name: ${customFilename}`);
    // debugger;

    // Ask user which to use
    // const useCustom = confirm(`Server suggests "${originalName}"\nUse "${customFilename}" instead?`);
    // const finalName = useCustom ? customFilename : originalName;

    // ... rest of your download logic
    // Download with chosen name
    const response = await fetch(url);
    if (!response.ok) {
        debugger;
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    // link.download = preferredName;
    // link.download = "test.name";
    link.download = customFilename;
    link.click();
    URL.revokeObjectURL(blobUrl);
}