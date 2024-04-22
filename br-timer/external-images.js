// javascript module for linking external images.
// The user provides the links which I guess will avoid copyright problems.
console.log("here is external-images.js");

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

const modMdc = await import("util-mdc");

// https://stackoverflow.com/questions/5845238/javascript-generate-transparent-1x1-pixel-in-dataurl-format
const createPlaceholderSrc = (w, h) => {
    // var img = document.createElement('img');
    // img.setAttribute('style', 'width:'+w+'px;height:'+h+'px;border:none;display:block');
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    // return img;
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
}

export function dialogReason() {
    const bdy = mkElt("div", { class: "extimg-colored-dialog" }, [
        mkElt("h2", undefined, "Copyright and images"),
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
            This is the reason I do not provide links to 
            any of these images.
            Since if I do I might impinge on the copyright.
            So I let you choose the images you want instead.
        `),
    ]);
    modMdc.mkMDCdialogAlert(bdy);
}
const KEY = "external-images";

let storingPrefix;
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


function getImagesRec() {
    checkStoringPrefix();
    const strJson = localStorage.getItem(storingPrefix + KEY);
    if (!strJson) return { choice: "random", arr: [] };
    const objJson = JSON.parse(strJson);
    return objJson;
}
function setImagesRec(objJson) {
    checkStoringPrefix();
    const strJson = JSON.stringify(objJson);
    localStorage.setItem(storingPrefix + KEY, strJson);
}

const debounceSetImagesRec = debounce(setImagesRec, 1000);

export function getCurrentImageUrl(arrBuiltin) {
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
    return choice;
}

export async function dialogImages(arrBuiltin) {
    const oldObj = getImagesRec();
    let okButton;
    const tellMeOkButton = (btn) => {
        okButton = btn;
    }

    // const btnCopyright = mkElt("button", undefined, "Explain");
    const iconCopyright = modMdc.mkMDCicon("copyright");
    // const btnCopyright = modMdc.mkMDCiconButton(iconCopyright, "Explain copyright issues");
    const btnCopyright = modMdc.mkMDCfab(iconCopyright, "Explain copyright issues", true);
    btnCopyright.addEventListener("click", evt => { dialogReason(); });

    // const inpUrlImage = mkElt("input", { type: "url" });
    // const lblUrlImage = mkElt("label", undefined, ["Image url:", inpUrlImage]);

    const videoNewPreview = mkElt("video");
    videoNewPreview.muted = true;
    // videoNewPreview.autoplay = true;
    videoNewPreview.controls = false;
    videoNewPreview.loop = true;
    videoNewPreview.style = `
        width: 100%;
        NOheight: 100%;
        NOaspect-ratio: 1.6 / 1;
        display: none;
    `;

    const imgNewPreview = mkElt("img");
    imgNewPreview.style = `
        width: 100%;
        NOheight: 100%;
        display: none;
    `;

    const eltFeedbackImage = mkElt("span", undefined, "Image?");
    const eltFeedbackVideo = mkElt("span", undefined, "Video?");
    const divTestFeedback = mkElt("div", undefined, [eltFeedbackImage, eltFeedbackVideo]);
    divTestFeedback.style = `
        position: absolute;
        top: 10px;
        left: 10px;
        display: inline-flex;
        gap: 5px;
    `;

    const eltNewContainer = mkElt("div", undefined, [divTestFeedback, imgNewPreview, videoNewPreview]);
    eltNewContainer.setAttribute("tabindex", "0");
    eltNewContainer.style = `
        position: relative;
        max-width: 150px;
        aspect-ratio: 1 / 1;
        outline: 1px dotted red;
        background-color: #80808060;
        overflow: hidden;
    `;

    const btnAddNew = modMdc.mkMDCbutton("Add", "raised");
    btnAddNew.style.display = "none";
    btnAddNew.addEventListener("click", evt => {
        const val = inpURL.value.trim();
        const isVideo = videoNewPreview.getBoundingClientRect().width > 0;
        let catMark = "";
        if (isVideo) catMark = "V";
        addImagesRec(val, catMark);
        const divRec = mkImgChoice(catMark + val, false);
        divOldUrls.appendChild(divRec);
        function addImagesRec(val, catMark) {
            if (!["V", ""].includes(catMark)) throw Error(`Unknown category: "${catMark}"`);
            const valRec = catMark + val;
            const obj = getImagesRec();
            obj.arr.push(valRec);
            debounceSetImagesRec(obj);
        }
    });

    const iconPlay = modMdc.mkMDCicon("play_circle");
    const btnPlay = modMdc.mkMDCiconButton(iconPlay);
    btnPlay.setAttribute("Xtabindex", 0);
    btnPlay.addEventListener("click", evt => {
        // evt.stopImmediatePropagation();
        // evt.stopPropagation();
        // evt.preventDefault();
        if (videoNewPreview.readyState == 0) return;
        if (videoNewPreview.getBoundingClientRect().width == 0) return;
        videoNewPreview.play();
        eltNewContainer.focus();
        btnPlay.style.display = "none";
        btnPause.style.display = null;
    });
    const iconPause = modMdc.mkMDCicon("pause_circle");
    const btnPause = modMdc.mkMDCiconButton(iconPause);
    btnPause.setAttribute("Xtabindex", 0);
    btnPause.style.display = "none";
    btnPause.addEventListener("click", evt => {
        // evt.stopImmediatePropagation();
        // evt.stopPropagation();
        // evt.preventDefault();
        videoNewPreview.pause();
        eltNewContainer.focus();
        btnPlay.style.display = null;
        btnPause.style.display = "none";
    });
    const divPlayButtons = mkElt("div", undefined, [btnPlay, btnPause,]);
    divPlayButtons.setAttribute("tabindex", 0);
    divPlayButtons.style.visibility = "hidden";
    const divPreviewButtons = mkElt("div", undefined, [
        divPlayButtons,
        btnAddNew,
    ]);
    divPreviewButtons.style = `
        display: grid;
        grid-template-rows: 1fr;
        width: 100%;
        background-color: red;
        outline: 1px dotted blue;
    `;
    const divNewPreview = mkElt("div", undefined, [
        eltNewContainer,
        divPreviewButtons
    ]);
    divNewPreview.id = "extimg-new-preview";
    divNewPreview.style = `
        NOdisplay: grid;
        grid-template-columns: 1fr min-content;
        gap: 10px;
        align-items: center;
    `;
    async function isImage(urlImage) {
        return new Promise((resolve, reject) => {
            imgNewPreview.onload = () => resolve(true);
            imgNewPreview.onerror = () => resolve(false);
            imgNewPreview.src = urlImage;
        });
    }
    async function isVideo(urlVideo) {
        return new Promise((resolve, reject) => {
            // https://stackoverflow.com/questions/57675008/onload-event-of-video-element-is-not-firing
            videoNewPreview.onloadeddata = () => resolve(true);
            videoNewPreview.onerror = (err) => { resolve(false); }
            videoNewPreview.src = urlVideo;
        });
    }

    const debounceCheckIsImage = debounce(checkInpUrl, 700);

    let stateInpUrl;

    const inpURL = modMdc.mkMDCtextFieldInput(undefined, "url");
    async function checkInpUrl(urlImage) {
        let newStateInpUrl = undefined;
        if (!inpURL.checkValidity()) return;

        divTestFeedback.style.visibility = "visible";
        imgNewPreview.style.display = "none";
        videoNewPreview.style.display = "none";
        btnAddNew.style.display = "none";

        eltFeedbackImage.style.fontSize = "1.3rem";
        eltFeedbackImage.style.color = "red";
        let res = await isImage(urlImage);
        eltFeedbackImage.style.fontSize = null;
        eltFeedbackImage.style.color = null;
        console.log({ res }, "image");
        if (res) {
            newStateInpUrl = "image";
            // imgNewPreview.style.display = null;
        } else {
            eltFeedbackVideo.style.fontSize = "1.3rem";
            eltFeedbackVideo.style.color = "red";
            res = await isVideo(urlImage);
            eltFeedbackVideo.style.fontSize = null;
            eltFeedbackVideo.style.color = null;
            console.log({ res }, "video");
            if (res) {
                newStateInpUrl = "video";
            }
        }

        divTestFeedback.style.visibility = "hidden";

        debounceTellUserAboutUrl(newStateInpUrl);
        return;
        if (!res) {
            btnAddNew.style.display = "none";
            inpURL.setCustomValidity("Is this an image/video? Does CORS prevent access to it?");
            inpURL.reportValidity();
        } else {
            btnAddNew.style.display = null;
            inpURL.setCustomValidity("");
        }
    }

    // inpURL.classList.add("remember-url");
    const reportInpURLvalidity = () => inpURL.reportValidity();
    // const debounceReportInpURLvalidity = debounce(reportInpURLvalidity, 3000);

    const tellUserAboutUrl = (state) => {
        reportInpURLvalidity();
        stateInpUrl = state;
        btnPlay.style.display = null;
        btnPause.style.display = "none";
        divPlayButtons.style.visibility = "hidden";
        imgNewPreview.style.display = "none";
        videoNewPreview.style.display = "none";
        switch (stateInpUrl) {
            case undefined:
                break;
            case "image":
                imgNewPreview.style.display = null
                btnAddNew.style.display = null;
                break;
            case "video":
                divPlayButtons.style.visibility = null;
                videoNewPreview.style.display = null;
                btnAddNew.style.display = null;
                break;
            default:
                throw Error(`Unknown stateInpUrl: ${stateInpUrl}`);
        }
    }
    const debounceTellUserAboutUrl = debounce(tellUserAboutUrl, 3000);

    inpURL.addEventListener("input", evt => {
        const val = inpURL.value.trim();
        if (val.length < 15) {
            imgNewPreview.src = createPlaceholderSrc(1, 1);
            inpURL.setCustomValidity("");
            return;
        }
        try {
            const u = new URL(val);
            // console.log(u);
            if (u.protocol != "https:") {
                console.log("start https:");
                inpURL.setCustomValidity("Link must start with https://");
                // inpURL.reportValidity();
                // debounceReportInpURLvalidity();
                debounceTellUserAboutUrl();
                return;
            }
            if (u.hostname.search("\\.") == -1) {
                console.log("top level");
                inpURL.setCustomValidity("Link must contain a top level domain");
                // inpURL.reportValidity();
                // debounceReportInpURLvalidity();
                debounceTellUserAboutUrl();
                return;
            }
        } catch (err) {
            console.log("not");
            inpURL.setCustomValidity("Not a valid URL");
            // inpURL.reportValidity();
            // debounceReportInpURLvalidity();
            debounceTellUserAboutUrl();
            return;
        }
        inpURL.setCustomValidity("");
        const valid = inpURL.checkValidity();
        if (!valid) {
            evt.stopImmediatePropagation();
            // debounceReportInpURLvalidity();
            debounceTellUserAboutUrl();
        }
        debounceCheckIsImage(val);
    });
    const tfURL = modMdc.mkMDCtextField("Add new image/video link", inpURL);
    tfURL.style = `
        width: 100%;
        margin-top: 10px;
    `;

    const styleUrlAlt = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    const divOldUrls = mkElt("div");
    divOldUrls.style = styleUrlAlt;
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
        const checked = url == oldObj.choice;
        if (checked) { radImg.checked = true; }
        let eltHandle;
        if (!isBuiltin) {
            const iconDelete = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCiconButton(iconDelete, "Delete");
            btnDelete.addEventListener("click", evt => {
                const div = btnDelete.closest("div");
                const bcrDiv = div.getBoundingClientRect();
                div.style.maxHeight = bcrDiv.height + "px";
                div.style.opacity = 1;
                div.style.transition = "opacity 1.2s 0s, scale 1.2s 0s";
                div.style.transformOrigin = "top left";
                div.style.opacity = 0;
                // div.style.maxHeight = "0px";
                div.style.scale = 0.1;
                const rad = div.querySelector("input");
                console.log(rad);
                const valUrl = rad.value;
                const objRec = getImagesRec();
                const arr = objRec.arr;
                const idx = arr.indexOf(valUrl);
                arr.splice(idx, 1);
                if (rad.checked) {
                    // FIX-ME: check random
                    // eslint-disable-next-line no-debugger
                    debugger;
                    const radRandom = divRandomUrl.querySelector("input[type=radio]");
                    radRandom.checked = true;
                    // radRandom.click();
                    objRec.choice = "random";
                    debounceSetImagesRec(objRec);
                }
                debounceSetImagesRec(objRec);
                setTimeout(() => div.remove(), 1.2 * 1000);
            });
            eltHandle = btnDelete;
        } else {
            eltHandle = mkElt("span", undefined, "Built in");
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

    const divNewUrl = mkElt("div", undefined, tfURL);

    const divRandomUrl = mkElt("div", undefined, mkImgChoice("random"));

    const bdy = mkElt("div", { class: "extimg-colored-dialog" }, [
        mkElt("h2", undefined, "Background Images"),
        btnCopyright,
        divRandomUrl,
        mkElt("h3", undefined, "Your own:"),
        divOldUrls,
        mkElt("div", { id: "extimg-add-new" }, [
            divNewUrl,
            divNewPreview,
        ]),
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

    const funHandleResult = () => {
        console.log({ oldObj });
        const newObj = getImagesRec();
        if (newObj.choice == oldObj.choice) return;
        return newObj.choice;
        // return "not ready";
    };
    return modMdc.mkMDCdialogConfirm(bdy, "Close",
        // undefined, true,
        false,

        funHandleResult,
        tellMeOkButton,
    );

}
