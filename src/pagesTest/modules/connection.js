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
            try {
                this.#port.postMessage(data)
            } catch (e) {
                if (e.message === 'Extension context invalidated.') {
                    console.log('Connection', '发送消息失败，扩展上下文变了')
                    this.onDisconnect(this.#port)
                } else {
                    throw e;
                }
            }
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

    getName() {
        if (this.#port) {
            return this.#port.name
        } else {
            return null;
        }
    }
}

export default Connection