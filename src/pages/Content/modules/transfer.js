import Messenger from "../../modules/messenger";
import {log} from "../../modules/logger";

// 必须用全局变量，否则messageListener里取不到
let messenger = null;

/**
 * 消息透传
 */
class Transfer {
    constructor() {
        log('Transfer', 'constructor')
        messenger = new Messenger(null, null)
    }

    messageListener(event) {
        if (event.source !== window) {
            return;
        }

        if (event.data.type && (event.data.type === "PAGE_TO_EVER_TABS")) {
            // 把消息转发给background
            if (messenger.isConnected()) {
                messenger.sendMessage(event.data.msg)
            }
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
                    log('Transfer 连接建立', port.name)
                    window.addEventListener("message", that.messageListener, false);
                }, (port) => {
                    log('Transfer 断开连接', port.name)
                    // 下面一句会导致当port长期不用自动断开后重连收不到页面的postMessage
                    // 但注释掉会导致当插件更新后消息收两份，不过sendMessage的时候会出错，忽略掉就行了
                    // window.removeEventListener("message", that.messageListener, false)
                    log('Transfer', '尝试重连')
                    that.startListenMessage();
                });
            } catch (e) {
                if (e.message === 'Extension context invalidated.') {
                    log('Transfer', '尝试连接失败，扩展上下文变了')
                } else {
                    throw e;
                }
            }
        } else {
            log('Transfer 无需重复建立连接', messenger)
        }
    }
}

export default Transfer;