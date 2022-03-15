import {vars, managerUrl} from "./const";

// 在某些事件发生时要触发标签刷新到数据库
let needUpdateTabs = false;
chrome.tabs.onCreated.addListener((tab) => {
    console.log(new Date().toLocaleString(), 'tab onCreated:', tab);
    needUpdateTabs = true;
})
chrome.tabs.onMoved.addListener((tabId) => {
    console.log(new Date().toLocaleString(), 'tab onMoved:', tabId);
    needUpdateTabs = true;
})
chrome.tabs.onUpdated.addListener((tabId) => {
    console.log(new Date().toLocaleString(), 'tab onUpdated:', tabId);
    needUpdateTabs = true;
})
chrome.tabs.onRemoved.addListener(tabId => {
    console.log(new Date().toLocaleString(), 'tab onRemoved:', tabId);
    needUpdateTabs = true;
})

export const tryUpdateTabs = () => {
    try {
        if (needUpdateTabs && vars.curPort) {
            console.log(new Date().toLocaleString(), 'updateTabs currentWindowId:', vars.currentWindowId);
            if (vars.currentWindowId) {
                chrome.tabs.query({windowId: vars.currentWindowId}, tabs => {
                    tabs = tabs.filter(tab => {
                        return tab.url.indexOf(managerUrl) !== 0
                    })
                    vars.curPort.postMessage({cmd: 'CMD_NEED_UPDATE_TABS', data: tabs})
                })
            }
            needUpdateTabs = false;
        }

        if (needUpdateTabs && !vars.curPort) {
            console.log(new Date().toLocaleString(), 'tryUpdateTabs but curPort error', vars.curPort)
        }
    } catch (e) {
        console.log(new Date().toLocaleString(), 'tryUpdateTabs exception', e);
    }
    setTimeout(tryUpdateTabs, 1000)
}