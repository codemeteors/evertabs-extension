import {managerWorkspaceUrl, vars} from "./const";

class UpdateTabsInitializer {

    #messenger;

    constructor() {
        this.init();
    }

    init() {
        chrome.tabs.onCreated.addListener((tab) => {
            console.log(new Date().toLocaleString(), 'tab onCreated:', tab);
            if (!tab.openerTabId) {
                vars.foreignCreatedTab = tab;
            }
            vars.needUpdateTabs = true;
        })
        chrome.tabs.onMoved.addListener((tabId) => {
            console.log(new Date().toLocaleString(), 'tab onMoved:', tabId);
            vars.needUpdateTabs = true;
        })
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (changeInfo.status && changeInfo.status === 'complete') {
                console.log(new Date().toLocaleString(), 'tab onUpdated:', tabId);
                vars.needUpdateTabs = true;
            }
        })
        chrome.tabs.onRemoved.addListener(tabId => {
            console.log(new Date().toLocaleString(), 'tab onRemoved:', tabId);
            vars.needUpdateTabs = true;
        })

        setTimeout(() => this.tryUpdateTabs(), 200)
    }

    setMessenger(messenger) {
        this.#messenger = messenger
    }

    tryUpdateTabs() {
        try {
            if (vars.needUpdateTabs && this.#messenger) {
                console.log(new Date().toLocaleString(), 'updateTabs currentWindowId:', vars.currentWindowId);
                if (vars.currentWindowId) {
                    chrome.tabs.query({windowId: vars.currentWindowId}, tabs => {
                        tabs = tabs.filter(tab => {
                            return tab.url.indexOf(managerWorkspaceUrl) !== 0
                        })
                        if (this.#messenger) {
                            this.#messenger.sendMessage({cmd: 'CMD_NEED_UPDATE_TABS', data: {tabs: tabs, foreignCreatedTab: vars.foreignCreatedTab}})
                            vars.foreignCreatedTab = undefined;
                        }
                    })
                }
                vars.needUpdateTabs = false;
            }

            if (vars.needUpdateTabs && !this.#messenger) {
                console.log(new Date().toLocaleString(), 'tryUpdateTabs but messenger error', this.#messenger)
            }
        } catch (e) {
            console.log(new Date().toLocaleString(), 'tryUpdateTabs exception', e);
        }
        setTimeout(() => this.tryUpdateTabs(), 200)
    }
}

export default UpdateTabsInitializer;