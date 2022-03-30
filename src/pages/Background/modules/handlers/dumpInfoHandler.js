import {managerBackgroundUrl, managerWorkspaceUrl, vars} from "../const";

export function dumpInfoHandler(messenger, data) {
    console.log('currentWindowId: ', vars.currentWindowId);
    console.log('minimizedWindowId: ', vars.minimizedWindowId);
    chrome.tabs.query({windowId: vars.currentWindowId}, (tabs) => {
        tabs = tabs.filter(tab => {return tab.url.indexOf(managerWorkspaceUrl) !== 0})
        console.log('currentWindowTabs: ', tabs);
    })
    chrome.tabs.query({windowId: vars.minimizedWindowId}, (tabs) => {
        tabs = tabs.filter(tab => {return tab.url.indexOf(managerBackgroundUrl) !== 0})
        console.log('minimizedWindowTabs: ', tabs);
    })
}