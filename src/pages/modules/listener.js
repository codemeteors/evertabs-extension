import Connection from "./connection";

/**
 * 用法：
 * const listener = new Listener((conn) => {...});
 * listener.listen()
 */
class Listener {

    /**
     * 每当有连接进来会回调
     * @param onAcceptCallback: (conn: Connection) => void
     */
    constructor(onAcceptCallback) {
        this.onAcceptCallback = onAcceptCallback;
    }

    listen() {
        console.log('Listener', '开始监听')
        const that = this;
        chrome.runtime.onConnect.addListener(function (port) {
            console.log('Listener', '连接建立', port.name)
            if (that.onAcceptCallback) {
                const connection = new Connection(port);
                that.onAcceptCallback(connection)
            }
        })
    }
}

export default Listener;