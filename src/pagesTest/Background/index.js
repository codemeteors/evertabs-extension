import Initializer from "./modules/initializer";
import Listener from "../modules/listener";
import Messenger from "../modules/messenger";

const initializer = new Initializer();
initializer.initContentScript();

const listener = new Listener((connection) => {
    const messenger = new Messenger(connection, (port) => {
        console.log('Background', '连接断开', port.name)
    })
    messenger.registerHandlers("COUNT", (data) => {
        messenger.sendMessage({cmd: "COUNT", data: {count: data.count + 1}});
    })

    messenger.registerHandlers("TEST", (data) => {
        messenger.sendMessage({cmd: "TEST", data: {count: data.count + 1}});
    })
})

listener.listen()