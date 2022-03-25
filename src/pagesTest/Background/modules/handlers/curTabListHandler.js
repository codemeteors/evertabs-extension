import {managerWorkspaceUrl, vars} from "../const";

export function curTabListHandler(messenger, data) {
    chrome.tabs.query({windowId: vars.currentWindowId}, tabs => {
        console.log(new Date().toLocaleString(), 'current tabs', tabs);
        tabs = tabs.filter(tab => {return tab.url.indexOf(managerWorkspaceUrl) !== 0})
        messenger.sendMessage({cmd: 'CMD_CUR_TAB_LIST', data: tabs})
    })
}