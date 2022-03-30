import Initializer from "./modules/initializer";
import Listener from "../modules/listener";
import Messenger from "../modules/messenger";
import {versionHandler} from "./modules/handlers/versionHandler";
import {curTabListHandler} from "./modules/handlers/curTabListHandler";
import {hideTabHandler} from "./modules/handlers/hideTabHandler";
import {focusTabHandler} from "./modules/handlers/focusTabHandler";
import {switchWorkspaceHandler} from "./modules/handlers/switchWorkspaceHandler";
import {dumpInfoHandler} from "./modules/handlers/dumpInfoHandler";
import UpdateTabsInitializer from "./modules/updateTabsInitializer";

const initializer = new Initializer();
initializer.initContentScript();
initializer.initWindow();

const updateTabInitializer = new UpdateTabsInitializer()

const listener = new Listener((connection) => {
    const messenger = new Messenger(connection, (port) => {
        console.log('Background', '连接断开', port.name)
    })

    messenger.registerHandlers("CMD_VERSION", versionHandler)
    messenger.registerHandlers("CMD_CUR_TAB_LIST", curTabListHandler)
    messenger.registerHandlers("CMD_HIDE_TAB", hideTabHandler)
    messenger.registerHandlers("CMD_FOCUS_TAB", focusTabHandler)
    messenger.registerHandlers("CMD_SWITCH_WORKSPACE", switchWorkspaceHandler)
    messenger.registerHandlers("CMD_DUMP_INFO", dumpInfoHandler)

    initializer.initCommandListener(messenger);

    updateTabInitializer.setMessenger(messenger)
})

listener.listen()