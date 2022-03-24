class Connection {

    #connected;
    #port;
    #msgHandler = null;
    #onDisconnectHandler = null;

    constructor(port) {
        const that = this;
        this.#connected = true
        port.onDisconnect.addListener((port) => {
            that.onDisconnect(port);
        })

        port.onMessage.addListener(((message, port) => {
            if (that.#msgHandler) {
                that.#msgHandler(message)
            }
        }))

        this.#port = port
    }

    onDisconnect(port) {
        console.log('Connection', '连接断开', port.name)
        this.#connected = false;
        if (this.#onDisconnectHandler) {
            this.#onDisconnectHandler(port)
        }
    }

    isConnected() {
        return this.#connected
    }

    sendMessage(data) {
        if (this.#connected) {
            this.#port.postMessage(data)
        } else {
            console.log('Connection', '发送失败，连接已断开', data)
        }
    }

    setMsgHandler(handler) {
        this.#msgHandler = handler
    }

    setOnDisconnectHandler(handler) {
        this.#onDisconnectHandler = handler
    }
}

export default Connection