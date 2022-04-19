import {managerBackgroundUrl, managerWorkspaceUrl, vars} from "./const";

/**
 * 不要这种更新，因为可能和selectedWorkspaceId不一致，导致错乱
 */
class UpdateTabsInitializer {

    #messenger;

    constructor() {
        this.init();
    }

    init() {
        chrome.tabs.onCreated.addListener((tab) => {
            console.log(new Date().toLocaleString(), 'tab onCreated:', tab);
            // 有create一定会触发一个update
            // if (this.#messenger) {
            //     this.#messenger.sendMessage({cmd: 'CMD_TAB_CHANGED',
            //         data: {'action': 'create', tab: tab}})
            // }
        })
        chrome.tabs.onMoved.addListener((tabId) => {
            console.log(new Date().toLocaleString(), 'tab onMoved:', tabId);
            chrome.tabs.get(tabId, (tab) => {
                if (this.#messenger
                    && (tab.windowId === vars.currentWindowId)) {
                    this.#messenger.sendMessage({cmd: 'CMD_TAB_CHANGED',
                        data: {'action': 'move', tab: tab}})
                }
            })
        })
        chrome.tabs.onUpdated.addListener((tabId, info) => {
            if (info.status && info.status === 'complete') {
                console.log(new Date().toLocaleString(), 'tab onUpdated:', tabId, vars.idMap);
                chrome.tabs.get(tabId, (tab) => {
                    if (this.#messenger
                        && (tab.windowId === vars.currentWindowId || tab.windowId === vars.minimizedWindowId)
                        && (tab.url !== managerWorkspaceUrl && tab.url !== managerBackgroundUrl)
                    ) {
                        if (vars.idMap.hasOwnProperty(tab.id)) {
                            tab.pkId = vars.idMap[tab.id]
                        }
                        this.#messenger.sendMessage({cmd: 'CMD_TAB_CHANGED',
                            data: {'action': 'update', tab: tab}})
                    }
                })
            }
        })
        chrome.tabs.onRemoved.addListener((tabId, info) => {
            console.log(new Date().toLocaleString(), 'tab onRemoved:', tabId);
            if (this.#messenger) {
                this.#messenger.sendMessage({cmd: 'CMD_TAB_CHANGED',
                    data: {'action': 'remove', tabId: tabId, info: info}})
            }
        })

        // chrome.tabs.onActivated.addListener((tabInfo) => {
        //     if (this.#messenger) {
        //         this.#messenger.sendMessage({cmd: 'CMD_TAB_ACTIVATED', data: tabInfo})
        //     }
        // })

        // setTimeout(() => this.tryUpdateTabs(), 200)
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