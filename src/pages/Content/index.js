import './modules/sentry'
import {Sentry} from "./modules/sentry";
import {BrowserTracing} from "@sentry/tracing";

const createPort = () => {
    console.log(new Date().toLocaleString(), 'createPort')
    let port = chrome.runtime.connect({name: 'conn'});
    // 接受background发来的消息，并转发给前端
    port.onMessage.addListener(function (msg) {
        const message = {
            type: 'EVER_TABS_TO_PAGE',
            msg: msg
        }
        postMessage(message);
    })
    return port;
}

let port = createPort();
port.onDisconnect.addListener(() => {
    console.log(new Date().toLocaleString(), 'port onDisconnect')
    port = createPort();
})

// 从页面接受消息，并转发给background
window.addEventListener("message", (event) => {
    if (event.source !== window) {
        return;
    }

    if (event.data.type && (event.data.type === "PAGE_TO_EVER_TABS")) {
        // 断开重连
        if (!port) {
            console.log(new Date().toLocaleString(), 'can not post message, port is ', port);
            port = createPort();
            console.log(new Date().toLocaleString(), 'reconnect port', port)
        }

        // 接受页面消息，转发给background
        if (port) {
            try {
                port.postMessage(event.data)
            } catch (e) {
                // 异常重连
                console.log(new Date().toLocaleString(), 'port.postMessage exception', e)
                try {
                    port.disconnect();
                } catch (e2) {
                    console.log(new Date().toLocaleString(), 'port.disconnect exception', e2);
                }
                port = createPort();
                console.log(new Date().toLocaleString(), 'reconnect port', port)
                port.postMessage(event.data)
            }
        }
    }
}, false);



window.addEventListener("load", function () {
    Sentry.init({
        dsn: "https://f203e5a4a5a6436f875d2314b63a6ec9@sentry.codemeteors.com/3",
        integrations: [new BrowserTracing()],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
})