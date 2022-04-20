import Connection from "./connection";
import {log} from "./logger";

class Messenger {
    
    #connection;

    constructor(connection, onDisconnectHandler) {
        this.#connection = connection
        if (this.#connection) {
            this.#connection.setMsgHandler((message) => {this.onMessage(this, message)})
            this.#connection.setOnDisconnectHandler(onDisconnectHandler)
        }
        // 消息处理句柄（分cmd的）
        this.handlers = {}
        // 消息处理句柄（不分cmd，整体透传）
        this.globalHandler = null;
    }

    connect(onConnectedCallback, onDisconnectHandler) {
        let port = chrome.runtime.connect({name: '' + Math.random().toString(16).substring(2)});
        this.#connection = new Connection(port);
        this.#connection.setMsgHandler((message) => {this.onMessage(this, message)})
        this.#connection.setOnDisconnectHandler(onDisconnectHandler)
        if (onConnectedCallback) {
            onConnectedCallback(port)
        }
    }

    /**
     * @param message {cmd: "***", data: {***}}
     * @param port
     */
    onMessage(that, message) {
        log('Messenger 收到消息', message);
        if (that.handlers) {
            if (message.cmd in that.handlers) {
                that.handlers[message.cmd](this, message.data);
            }
        }

        if (that.globalHandler) {
            that.globalHandler(message);
        }
    }

    trySendMessage(data, retry) {
        if (retry > 0) {
            if (this.#connection.isConnected()) {
                log('Messenger 发送消息 ' + this.#connection.getName(), data);
                this.#connection.sendMessage(data);
            } else {
                // console.log('Messenger', '发送消息失败，待重试', data);
                setTimeout(() => this.trySendMessage(data, retry - 1), 200)
            }
        }
    }

    sendMessage(data) {
        this.trySendMessage(data, 3)
    }

    setGlobalHandler(handler) {
        this.globalHandler = handler;
    }

    registerHandlers(cmd, handler) {
        this.handlers[cmd] = handler;
    }

    isConnected() {
        return this.#connection && this.#connection.isConnected()
    }
}

export default Messenger;