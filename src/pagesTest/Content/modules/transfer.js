import Messenger from "../../modules/messenger";

// 必须用全局变量，否则messageListener里取不到
let messenger = null;

/**
 * 消息透传
 */
class Transfer {
    constructor() {
        messenger = new Messenger(null, null)
    }

    messageListener(event) {
        if (event.source !== window) {
            return;
        }

        if (event.data.type && (event.data.type === "PAGE_TO_EVER_TABS")) {
            // 把消息转发给background
            messenger.sendMessage(event.data.msg)
        }
    }

    startListenMessage() {
        // 设置消息句柄，用于把background发来的消息透传给网页
        messenger.setGlobalHandler((msg) => {
            const message = {
                type: 'EVER_TABS_TO_PAGE',
                msg: msg
            }
            postMessage(message);
        })

        const that = this;

        if (!messenger.isConnected()) {
            try {
                messenger.connect((port) => {
                    console.log('Transfer', '连接建立', port.name)
                    window.addEventListener("message", that.messageListener, false);
                }, (port) => {
                    console.log('Transfer', '断开连接', port.name)
                    window.removeEventListener("message", that.messageListener, false)
                    console.log('Transfer', '尝试重连')
                    setTimeout(this.startListenMessage, 500);
                });
            } catch (e) {
                if (e.message === 'Extension context invalidated.') {
                    console.log('Transfer', '尝试连接失败，扩展上下文变了')
                } else {
                    throw e;
                }
            }
        }
    }
}

export default Transfer;