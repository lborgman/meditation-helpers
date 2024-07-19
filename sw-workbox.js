// See pwa.js for documentation
const SW_VERSION = "0.0.001";

const logStyle = "background:blue; color:white; padding:2px; border-radius:2px;";
const logStrongStyle = logStyle + " font-size:18px;";
let swName = "PWA service worker";
function logConsole(...msg) {
    // console.log(`%c${swName}`, logStyle, ...msg);
}
function logStrongConsole(...msg) { console.log(`%c${swName}`, logStrongStyle, ...msg); }


logStrongConsole(`Service worker SW_VERSION=${SW_VERSION}`);



// https://www.npmjs.com/package/workbox-sw
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([{"revision":"25a84b3f790150257c54e24a6dcc0da2","url":"br-timer/external-images.js"},{"revision":"0f4cfefe19f0062675123ade72ea9626","url":"br-timer/img/ml.svg"},{"revision":"f3220dd9d1b4803b2ae1834aa938864c","url":"br-timer/manifest-ml.json"},{"revision":"4ee6453b83bf9255d19e2fc9f6175ae3","url":"br-timer/moving-lines-1.js"},{"revision":"d7ee57d51deec2acc60214748ba869b3","url":"br-timer/moving-lines.html"},{"revision":"e75236207c3c443e5e4856d455117e2d","url":"br-timer/vk.html"},{"revision":"6e6a7e579d05b6b97b7b832e99f9b989","url":"ext/mdc/material-components-web.js"},{"revision":"616a81ae1e04e0fdffcbd987158b677a","url":"ext/qr/qrjs2.js"},{"revision":"df3434519d3434bbdf2d7091d3616a38","url":"ext/tonejs/tone-test0.js"},{"revision":"be5e3897e27f65a185b45126354b437e","url":"index-temp.html"},{"revision":"1f2bb322d49c8bda3fab653ba90a23f2","url":"index.html"},{"revision":"db31796039a76a0dadb16b244e2348c9","url":"make-abs.js"},{"revision":"5a0df1aff3adcff3cfd7b5549231d56d","url":"md-timer/css/caped.css"},{"revision":"1f8974d9390daf0dbe2cdf14d5bfe89f","url":"md-timer/css/color.css"},{"revision":"a0fb612a67a875d2ea809d11011e38e9","url":"md-timer/css/fontawesome/css/brands.css"},{"revision":"3521713345487b06dee24894dca69f89","url":"md-timer/css/fontawesome/css/fontawesome.css"},{"revision":"41c227b985f4d8ce98f706d0bea979ec","url":"md-timer/css/fontawesome/css/solid.css"},{"revision":"073c2f3ce60eaf69cc2767ef3d989078","url":"md-timer/css/fontawesome/webfonts/fa-brands-400.svg"},{"revision":"b557f56e367e59344ca95f9d1fb44352","url":"md-timer/css/fontawesome/webfonts/fa-solid-900.svg"},{"revision":"356e36aaf422bf63ea9640a76e4f8213","url":"md-timer/css/menu.css"},{"revision":"ec246d6f369856ec50a9de401b074715","url":"md-timer/css/popup.css"},{"revision":"267d18bf0eea33f94a8e5537be7c3a75","url":"md-timer/css/timer.css"},{"revision":"0b88741febaa2ce2f24923b6f73e2d0f","url":"md-timer/css/videos.css"},{"revision":"a9f7a33adc9de2d545d92193b5b3d1b4","url":"md-timer/img/meditation-timer.svg"},{"revision":"049df5d4f7d9872e6600da0acf1a67be","url":"md-timer/img/wikimedia/Curious_Meditating_Cartoon_Man.svg"},{"revision":"7b7626ce8e2535171888f7f75b29a49b","url":"md-timer/img/wikimedia/Spiritually_Happy_Cartoon_Man_In_Meditation.svg"},{"revision":"4b8fd8bb6148598b535d3fd2f147e6be","url":"md-timer/js/meditimer.js"},{"revision":"ce9478b6203328b54208a75025c1a029","url":"md-timer/medi-timer.html"},{"revision":"c6ff31ef482033c9697d7515051fb3be","url":"pwa-not-cached.js"},{"revision":"c544f3d24940fddc4455fa0f16d1c6f6","url":"pwa.js"},{"revision":"d79302aa14563d63b0c3c46e8020f542","url":"src/js/error.js"},{"revision":"2427dbcbde25fe37b52e06e637d24969","url":"src/js/mod/gen-sounds.js"},{"revision":"a0f0c5a52d083ec8d60be0af7eb9f25c","url":"src/js/mod/local-settings.js"},{"revision":"4b5bba82ec363e55f58ace340455eb37","url":"src/js/mod/log2screen.js"},{"revision":"d0074f3df9dfd71339db03dadcc9b360","url":"src/js/mod/qr-url.js"},{"revision":"28ec9dcc11add462a6a83d43422a867f","url":"src/js/mod/refresh-rate.js"},{"revision":"bcb932f5dc7fdcbdb3940ae1ca88da63","url":"src/js/mod/svg-things.js"},{"revision":"fab990e765d3f25c8d156c92029835ba","url":"src/js/mod/util-mdc.js"},{"revision":"c1aff9761bc92eb3b71fed7236744519","url":"src/js/mod/virt-keyboard.js"},{"revision":"b626ab2bb0c8ad34ba3be2276e0e450e","url":"test-jsdoc.html"},{"revision":"82da6b132c130465609468e9e1e7e194","url":"test-jsdoc.js"},{"revision":"4f6767b267c436b57de149c934e2e175","url":"workbox-config.js"}]);




self.addEventListener("message", errorHandlerAsyncEvent(async evt => {
    // FIX-ME: Do something when ping/keyChanged during login???
    // https://github.com/firebase/firebase-js-sdk/issues/1164
    if (evt.data?.eventType == "ping") return;
    if (evt.data?.eventType == "keyChanged") return;

    let msgType = "(NO TYPE)";
    if (evt.data) { msgType = evt.data.type; }
    logConsole("Message", { evt, msgType });
    if (evt.data) {
        switch (msgType) {
            case 'TELL_SW_NAME':
                swName = evt.data.SW_NAME;
                logStrongConsole(`got my file name "${swName}"`)
                break;
            case 'GET_VERSION':
                logStrongConsole(`GET_VERSION: ${SW_VERSION}`);
                // https://web.dev/two-way-communication-guide/
                evt.ports[0].postMessage(SW_VERSION);
                break;
            case 'SKIP_WAITING':
                // https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
                self.skipWaiting();
                break;
            default:
                console.error("Unknown message data.type", { evt });
        }
    }
}));

function errorHandlerAsyncEvent(asyncFun) {
    // console.warn("typeof asyncFun", typeof asyncFun);
    return function (evt) {
        asyncFun(evt).catch(err => {
            console.log("handler", err);
            // debugger;
            throw err;
        })
    }
}
