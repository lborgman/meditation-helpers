// @ts-check
const USER_IMAGES_VER = "0.0.5";
// @ts-ignore
window["logConsoleHereIs"](`here is user-images.js, module, ${USER_IMAGES_VER}`);
if (document.currentScript) { throw "user-images.js is not loaded as module"; }

// @ts-ignore
const mkElt = window["mkElt"];
// const errorHandlerAsyncEvent = window["errorHandlerAsyncEvent"];
// @ts-ignore
const importFc4i = window["importFc4i"];

const modBasicUI = await importFc4i("basic-ui");
const modLocalFileReader = await importFc4i("local-file-reader");
// debugger;
const keyBackground = "background-image-or-video";

// javascript module for linking external images.
// The user provides the links which I guess will avoid copyright problems.

///////////////////////////////////////////////////////////////////////
//////////////////////// Images ///////////////////////////////////////

/////// Google Photos
//// labnol only works for photos, not videos. Use only in private browser tab!
// https://www.labnol.org/embed/google/photos/ (embed iframe, direct link)
//// Simple instructions to get a link. Not useful here.
// https://www.picbackman.com/tips-tricks/how-to-get-a-direct-link-to-an-image-in-google-photos/



///////////////////////////////////////////////////////////////////////
//////////////////////// Videos ///////////////////////////////////////

// https://github.com/cjpdesign/extract-video-poster/blob/master/js/main.js


/////// YouTube (can't be used since it can only be used in an iframe.)
// https://developers.google.com/youtube/player_parameters
// https://developers.google.com/youtube/iframe_api_reference


////// Videos that can be used (but may be hard to find...)
//
//// https://www.pexels.com/
// https://www.pexels.com/video/a-tiger-inside-a-cage-5495322/
// https://videos.pexels.com/video-files/5495322/5495322-hd_1920_1080_30fps.mp4
//
// https://www.foleon.com/blog/12-sites-for-free-stock-videos
// 
//// https://freenaturestock.com/videos/
// Seems to be completely free to use, beatiful videos
//
// https://freenaturestock.com/wp-content/uploads/freenaturestock-rugged-ocean-coast.mp4

// https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image

const modTools = await importFc4i("toolsJs");
// const oldmodMdc = await importFc4i("util-mdc");
const modIcons = await importFc4i("google-icons");

// https://stackoverflow.com/questions/5845238/javascript-generate-transparent-1x1-pixel-in-dataurl-format
/**
 * 
 * @param {number} w 
 * @param {number} h 
 * @returns {string}
 */
const createPlaceholderSrc = (w, h) => {
    // var img = document.createElement('img');
    // img.setAttribute('style', 'width:'+w+'px;height:'+h+'px;border:none;display:block');
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    // return img;
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
}

export function dialogReason() {
    const iconCopyright = modIcons.mkGIcon("copyright");
    const bdy = mkElt("div", { class: "extimg-copyright" }, [
        mkElt("h2", { style: "color:blue" }, [iconCopyright, " Copyright and images"]),
        mkElt("p", undefined,
            `
            There are many wonderful images on the Internet.
            Some (but not all!) of these images can technically be used
            by any website.
            But this may not be legally possible because of copyright.
        `),
        mkElt("p", undefined,
            `
            However you may personally without legal problems
            use these images on your own computer.
        `),
        mkElt("p", undefined,
            `
            I do not provide links to any of these wonderful images.
            Instead I added some of my own photos as default.
            If you want other images you can add links to them yourself.
        `),
        mkElt("h3", { style: "color:blue" }, "Choose your own images"),
        mkElt("p", undefined,
            `
            If you want other images you can add links to them yourself.
        `),
        mkElt("p", undefined,
            `
            However you can not upload images from your PC/mobile.
            The reason is technical. Uploaded images will take a lot of space in your
            web browser. And it can create problems.
            (If you have a wondoerful image that you think should be in this app
            you are welcome to give it to me!)
        `),
    ]);
    // oldmodMdc.mkMDCdialogAlert(bdy);
    modBasicUI.showDialog(bdy);
}
const KEY = "external-images";

/** @type {string} */
let storingPrefix;
/**
 * 
 * @param {string} prefix 
 */
export function setStoringPrefix(prefix) {
    const tofPrefix = typeof prefix;
    if (tofPrefix != "string") throw Error(`setStoringPrefix, arg not string: ${tofPrefix}`);
    if (storingPrefix != undefined) {
        if (storingPrefix != prefix) {
            throw Error(`setStoringPrefix new: ${prefix}, old: ${storingPrefix}`);
        }
    }
    storingPrefix = prefix;
}
function checkStoringPrefix() {
    if (typeof storingPrefix != "string") throw Error(`storingPrefix not set`);
}

/**
 * @typedef {Object} ImagesRec
 * @property {string[]} arr
 * @property {string} choice
 * 
 */
/**
 * @param {ImagesRec} objJson 
 * @throws
 */
function checkImagesRec(objJson) {
    const keys = Object.keys(objJson);
    const keyNames = keys.sort().join(",");
    const expectedNames = "arr,choice";
    if (keyNames != expectedNames) {
        console.error({ keyNames });
        debugger;
        throw Error(`Expected "${expectedNames}", found "${keyNames}"`);
    }
}
/**
 * 
 * @returns {ImagesRec}
 */
function getImagesRec() {
    checkStoringPrefix();
    const strJson = localStorage.getItem(storingPrefix + KEY);
    let objJson;
    if (!strJson) {
        objJson = { choice: "random", arr: [] };
    } else {
        objJson = JSON.parse(strJson);
    }
    checkImagesRec(objJson);
    return objJson;
}
/**
 * @param {ImagesRec} objJson 
 * @throws
 */
function setImagesRec(objJson) {
    checkImagesRec(objJson);
    checkStoringPrefix();
    const strJson = JSON.stringify(objJson);
    localStorage.setItem(storingPrefix + KEY, strJson);
}


/**
 * 
 * @param {string[]} arrBuiltin 
 * @returns {string}
 */
export async function getCurrentImageUrl(arrBuiltin) {
    const { choice, arr } = getImagesRec();
    if (choice == "random") {
        // Don't include videos:
        const arrChoices = [...arrBuiltin, ...arr].filter(entry => {
            // console.log({ entry });
            return !entry.startsWith("V");
        });
        // const idxGP = Math.floor(Math.random() * arrBuiltin.length);
        const a = new Uint32Array(6);
        self.crypto.getRandomValues(a);
        const idx1 = a[0] % arrChoices.length;
        return arrChoices[idx1];
    }
    if (choice == "users") {
        console.log({ modLocalFileReader });
        const b = await modLocalFileReader.getSavedFileBlob(keyBackground)
        // debugger;
        // modLocalFileReader
        return b;
    }
    return choice;
}

/**
 * 
 * @param {string[]} arrBuiltin 
 * @param {Function} applyImage 
 */
export async function dialogImages(arrBuiltin, applyImage) {
    /**
     * 
     * @param {ImagesRec} obj 
     */
    function setAndApplyImagesRec(obj) {
        setImagesRec(obj);
        applyImage();
    }
    // const debounceSetImagesRec = modTools.debounce(setImagesRec, 1000);
    const debounceSetImagesRec = modTools.debounce(setAndApplyImagesRec, 1000);
    const oldObj = getImagesRec();

    const iconCopyright = modIcons.mkGIcon("copyright");
    const btnInfoCopyright = modBasicUI.mkFabButton(iconCopyright, "Explain copyright issues", true);
    btnInfoCopyright.addEventListener("click", evt => {
        evt.stopPropagation();
        debugger;
        dialogReason();
    });
    const btnSelectBackground = mkElt("button", undefined, "Select");
    btnSelectBackground.addEventListener("click", async evt => {
        evt.stopPropagation();
        const eltBrowsePreview = mkElt("div");
        eltBrowsePreview.classList.add("image-preview");
        eltBrowsePreview.style = `
            border: 1px solid red;
            height: 100px;
            width: 100px;
        `;
        let blobPreview;
        let blobUrl;

        const btnBrowse = mkElt("button", undefined, "Browse");
        btnBrowse.addEventListener("click", async evt => {
            evt.stopPropagation();
            console.log({ modLocalFileReader });

            // await modLocalFileReader.selectAndSaveFile(keyBackground, "image,video");
            // const blob = await modLocalFileReader.getSavedFileBlob(keyBackground);
            blobPreview = await modLocalFileReader.selectFile("image,video");

            blobUrl = URL.createObjectURL(blobPreview);
            eltBrowsePreview.style.backgroundImage = `url("${blobUrl}")`;
        });
        const body = mkElt("div", undefined, [
            mkElt("h2", undefined, "Select background"),
            mkElt("p", undefined, `
                You can select an image or video from your device.
                `),
            btnBrowse,
            eltBrowsePreview
        ]);
        const ans = await modBasicUI.showDialogConfirm(body);
        if (!ans) return;
        // @ts-ignore
        eltOwnPreview.style.backgroundImage = `url("${blobUrl}")`;

        // const ourBlobUrl = eltBrowsePreview.style.back
        modLocalFileReader.saveFileHandle(keyBackground, blobUrl);
    })


    const styleUrlAlt = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const divBuiltinUrls = mkElt("div");
    divBuiltinUrls.style = styleUrlAlt;

    function mkImgChoice(url, isBuiltin) {
        let urlPreview = url;
        if (url.startsWith("https://lh3.googleusercontent.com")) {
            // eslint-disable-next-line no-debugger
            if (Array.from(url.matchAll("=")).length != 1) { debugger; }
            const lastEq = url.lastIndexOf("=");
            // Resize to max 200 w/h, works 2024-04-09
            urlPreview = url.slice(0, lastEq) + "=s200"; // 20 kB
        }
        let eltBg;
        const isVideoChoice = url.startsWith("V");
        if (isVideoChoice) {
            urlPreview = url.slice(1);
            const eltVideo = mkElt("video");
            eltVideo.loop = false;
            eltVideo.autoplay = false;
            eltVideo.controls = false;
            eltVideo.preload = "metadata";
            eltBg = eltVideo;
        } else {
            const eltImg = mkElt("img");
            eltBg = eltImg;
        }
        eltBg.src = urlPreview;
        eltBg.style.width = "100%";
        const eltImgContainer = mkElt("span", undefined, eltBg);
        eltImgContainer.style = `
            width: 30%;
            display: inline-block;
            NOaspect-ratio: 1 / 1;
            NObackground-image: url(${urlPreview});
            background-size: cover;
            background-repeat: no-repeat;
        `;
        const radImg = mkElt("input", { type: "radio", name: "img", value: url });
        if (url == "random") {
            const eltRandomInfo = "random";
            if (oldObj.choice == "random") radImg.checked = true;
            const lblRandom = mkElt("label", undefined, [radImg, eltRandomInfo]);
            return mkElt("div", undefined, [lblRandom]);
        }
        if (url == "users") {
            // 2 Your
            const eltOwnPreview = mkElt("div", { id: "own-preview" });
            eltOwnPreview.style = `
                width: 100px;
                height: 100px;
                border: 1px solid red;
                `;
            eltOwnPreview.classList.add("image-preview");
            (async () => {
                const blobSaved = await modLocalFileReader.getSavedFileBlob(keyBackground);
                eltOwnPreview.style.backgroundImage = `url("${blobSaved}")`;
            })();


            const btnSelectBackground = mkElt("button", undefined, "Select");
            btnSelectBackground.style.marginLeft = "30px";
            btnSelectBackground.addEventListener("click", async evt => {
                evt.stopPropagation();
                const eltBrowsePreview = mkElt("div");
                eltBrowsePreview.classList.add("image-preview");
                eltBrowsePreview.style = `
                    border: 1px solid red;
                    height: 100px;
                    width: 100px;
                    `;
                let blobPreview;
                let blobUrl;

                const btnBrowse = mkElt("button", undefined, "Browse");
                btnBrowse.addEventListener("click", async evt => {
                    evt.stopPropagation();
                    console.log({ modLocalFileReader });

                    // await modLocalFileReader.selectAndSaveFile(keyBackground, "image,video");
                    // const blob = await modLocalFileReader.getSavedFileBlob(keyBackground);
                    blobPreview = await modLocalFileReader.selectFile("image,video");

                    blobUrl = URL.createObjectURL(blobPreview);
                    eltBrowsePreview.style.backgroundImage = `url("${blobUrl}")`;
                });
                const body = mkElt("div", undefined, [
                    mkElt("h2", undefined, "Select background"),
                    mkElt("p", undefined, `
                You can select an image or video from your device.
                `),
                    btnBrowse,
                    eltBrowsePreview
                ]);
                const ans = await modBasicUI.showDialogConfirm(body);
                if (!ans) return;
                // @ts-ignore
                eltOwnPreview.style.backgroundImage = `url("${blobUrl}")`;

                // const ourBlobUrl = eltBrowsePreview.style.back
                modLocalFileReader.saveFileHandle(keyBackground, blobUrl);
            });


            const lblUsers = mkElt("label", undefined, [
                radImg,
                eltOwnPreview,
            ]);
            lblUsers.style = `
                display: flex;
                gap: 5px;
                margin-top: 10px;
            `;
            return mkElt("div", undefined, [
                btnSelectBackground,
                lblUsers,
            ]);

        }
        const checked = url == oldObj.choice;
        if (checked) { radImg.checked = true; }
        let eltHandle;
        if (!isBuiltin) {
            // 2 Your Own
            // const btnDelete = oldmodMdc.mkMDCiconButton(iconDelete, "Delete");
            debugger;
            // eltHandle = btnDelete;
            // eltHandle = mkElt("span", undefined, "Your image");
        } else {
            // eltHandle = mkElt("span", undefined, "Built in");
        }
        const tellVideo = isVideoChoice ? mkElt("span", undefined, "(⚠ video)") : "";
        if (tellVideo.tagName == "SPAN") {
            tellVideo.style = `
                color: darkred;
                font-size: 1.2rem;
            `;
        }
        const lblImg = mkElt("label", undefined, [radImg, eltImgContainer, eltHandle, tellVideo]);
        lblImg.style = `
                display: flex;
                gap: 10px;
            `;
        return mkElt("div", undefined, [lblImg]);
    }

    const recOld = getImagesRec();
    const numBuiltIn = arrBuiltin ? arrBuiltin.length : 0;
    if (recOld.length + numBuiltIn == 0) {
        divOldUrls.textContent = "No images.";
    } else {
        let checked = false;

        recOld.arr?.forEach(url => {
            const divRec = mkImgChoice(url, false);
            divOldUrls.appendChild(divRec);
        });
        arrBuiltin.forEach(url => {
            const divRec = mkImgChoice(url, true);
            divBuiltinUrls.appendChild(divRec);
            // divBuiltinUrls.style.background = "blue";
        });
    }

    // const divNewUrl = mkElt("div", undefined, tfURL);

    const divRandomUrl = mkElt("div", undefined, mkImgChoice("random"));

    const divYourBg = mkElt("div", undefined, mkImgChoice("users"));
    const bdy = mkElt("div", undefined, [
        mkElt("h2", undefined, "Background Images"),
        // btnCopyright,
        divRandomUrl,
        mkElt("div", undefined, [
            mkElt("h3", undefined, "2 Your own: "),
            divYourBg,
        ]),
        // eltOwnPreview,
        // btnSelectBackground

        mkElt("h3", undefined, "Built in:"),
        divBuiltinUrls,
    ]);
    bdy.addEventListener("change", evt => {
        const target = evt.target;
        const val = target.value;
        const obj = getImagesRec();
        console.log("bdy change", evt, target, val, obj);
        obj.choice = val;
        debounceSetImagesRec(obj);
    })

    /** * @param {boolean} doSave * @returns {string} */
    const funHandleResult = (doSave) => {
        console.log({ oldObj });
        const newObj = getImagesRec();
        const somethingToSave = newObj.choice == oldObj.choice;
        // if (newObj.choice == oldObj.choice) return;
        if (!doSave) return somethingToSave;
        if (!somethingToSave) return;
        return newObj.choice;
        // return "not ready";
    };
    // mkMDCdialogConfirm(body, titleOk, titleCancel, funCheckSave, tellMeOkButton) {
    // mkMDCdialogAlert(body, titleClose) {
    // oldmodMdc.mkMDCdialogAlert(bdy, "Close");

    modBasicUI.showDialog(bdy);
}
