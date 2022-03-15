import {vars, managerBackgroundUrl, managerUrl} from "./const";
import {recreateTab} from "./common";

// 消息处理函数
export const handlers = [
    {
        name: 'CMD_VERSION',
        handler: function (port, msg) {
            port.postMessage({cmd: 'CMD_VERSION', data: '1.0'})
        }
    },
    {
        name: 'CMD_CUR_TAB_LIST',
        handler: function (port, msg) {
            chrome.tabs.query({windowId: vars.currentWindowId}, tabs => {
                console.log(new Date().toLocaleString(), 'current tabs', tabs);
                tabs = tabs.filter(tab => {return tab.url.indexOf(managerUrl) !== 0})
                port.postMessage({cmd: 'CMD_CUR_TAB_LIST', data: tabs})
            })
        }
    },
    {
        name: 'CMD_HIDE_TAB',
        handler: function (port, msg) {
            const tab = msg.msg.data;
            console.log(new Date().toLocaleString(), 'cmd hide tab', tab);
            chrome.tabs.move(tab.id, {
                windowId: vars.minimizedWindowId,
                index: -1
            }).then();
        }
    },
    {
        name: 'CMD_FOCUS_TAB',
        handler: function (port, msg) {
            const tab = msg.msg.data;
            console.log(new Date().toLocaleString(), 'cmd focus tab', tab);
            chrome.tabs.update(tab.id, {
                active: true
            }).then();
        }
    },
    {
        name: 'CMD_SWITCH_WORKSPACE',
        handler: function (port, msg) {
            // 把当前窗口标签隐藏
            chrome.tabs.query({windowId: vars.currentWindowId}, curWinTabs => {
                curWinTabs = curWinTabs.filter(tab => {
                    return tab.url.indexOf(managerUrl) !== 0
                })

                // 计算tabIds
                const tabIds = curWinTabs.map((tab, _) => {
                    return tab.id;
                })

                // 把tabIds移到隐藏窗口
                if (tabIds.length > 0) {
                    chrome.tabs.move(tabIds, {
                        windowId: vars.minimizedWindowId,
                        index: -1
                    }, (tabs) => {
                        console.log(new Date().toLocaleString(), 'move tabs ', tabIds, ' to minimizedWindowId:', vars.minimizedWindowId);
                        chrome.tabs.query({windowId: vars.minimizedWindowId}, miniWinTabs => {
                            console.log(new Date().toLocaleString(), 'minimizedWindow tabs length:', miniWinTabs.length)
                            // 限制隐藏窗口的tab数量不超过50个
                            miniWinTabs.map((tab, index) => {
                                if (index + 50 < miniWinTabs.length && tab.url !== managerBackgroundUrl) {
                                    chrome.tabs.remove(tab.id).then();
                                }
                            })
                        })
                    });
                }
            })

            // 把新workspace的tab移到当前窗口
            msg.msg.data.tabs.map((tab, index) => {
                try {
                    chrome.tabs.get(tab.id, (res) => {
                        if (res && res.url === tab.url) {
                            chrome.tabs.move(tab.id, {
                                windowId: vars.currentWindowId,
                                index: -1,
                            }, (tab) => {
                                console.log(new Date().toLocaleString(), 'move tab ', tab, ' to currentWindowId:', vars.currentWindowId);
                                if (msg.msg.data.activeTabId === tab.id) {
                                    chrome.tabs.update(tab.id, {active: true}).then()
                                }
                            });
                        } else {
                            // 如果url变了，就重新加载tab
                            recreateTab(port, tab, msg.msg.data.activeTabId === tab.id);
                        }
                    })
                } catch (e) {
                    // 如果找不到了隐藏的tab，就重新加载tab
                    recreateTab(port, tab, msg.msg.data.activeTabId === tab.id);
                }
            })

            port.postMessage({
                cmd: 'CMD_SWITCH_WORKSPACE',
                data: {
                }
            })
        }
    },
]
