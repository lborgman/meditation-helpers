console.log("here is qr-url.js");

/**
 * 
 * @param {string | undefined} urlParam 
 * @param {string | undefined} titleParam 
 */
export async function popupShare(titleParam, urlParam, zIndex) {
    const title = titleParam || "Share this page";
    const url = urlParam ? new URL(urlParam) : new URL(location);

    const modQR = await import("qrjs2");
    const QRcode = modQR.default;

    url.hash = "";
    const urlHref = url.href;
    const svg = QRcode.generateSVG(urlHref);

    const XMLS = new XMLSerializer();
    let dataSvg = XMLS.serializeToString(svg);
    dataSvg = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(dataSvg)));
    const dataUriSvgImage = mkElt("img");
    dataUriSvgImage.src = dataSvg;

    const modMdc = await import("util-mdc");
    const spanLoc = mkElt("span", undefined,
        mkElt("a", { "href": urlHref, "target": "_blank", "rel": "noreferrer" }, urlHref));
    spanLoc.style = `
        display: inline-block;
        overflow-wrap: anywhere;
    `;
    const locDiv = mkElt("div", null, [ spanLoc]);
    const body = mkElt("div", null,
        [
            mkElt("h2", undefined, title),
            mkElt("p", null, locDiv),
            dataUriSvgImage
        ]
    );

    modMdc.mkMDCdialogAlert(body, "Close", zIndex);
}
