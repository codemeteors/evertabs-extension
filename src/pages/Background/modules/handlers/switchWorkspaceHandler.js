import {managerBackgroundUrl, managerWorkspaceUrl, vars} from "../const";

// 重新加载这个tab页
const recreateTab = (messenger, tab, active) => {
    chrome.tabs.create({
        active: active,
        url: tab.url,
        windowId: vars.currentWindowId
    }, (newTab) => {
        // 尽快把id对应关系存起来，有用
        vars.idMap[newTab.id] = tab.pkId
        console.log(new Date().toLocaleString(), 'recreate tab ', tab, ' newid=', newTab.id, ' in currentWindowId:', vars.currentWindowId);
        messenger.sendMessage({
            cmd: 'CMD_UPDATE_TAB',
            data: {
                tab: tab,
                newTab: newTab
            }
        })
    });
}

export function switchWorkspaceHandler(messenger, data) {
    console.log('switchWorkspaceHandler', data);
    // 把当前窗口标签隐藏
    chrome.tabs.query({windowId: vars.currentWindowId}, curWinTabs => {
        curWinTabs = curWinTabs.filter(tab => {
            return tab.url.indexOf(managerWorkspaceUrl) !== 0
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

    // 把新workspace的tab移到当前窗口，everTabs相关的链接除外
    if (data.tabs) {
        data.tabs.map((tab, index) => {
            if (tab.url.indexOf(managerWorkspaceUrl) !== 0 && tab.url.indexOf(managerBackgroundUrl) !== 0) {
                chrome.tabs.get(tab.id, (res) => {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError.message);
                        // tab不存在，重新加载
                        recreateTab(messenger, tab, data.activeTabId === tab.id);
                    } else {
                        if (res && res.url === tab.url) {
                            chrome.tabs.move(tab.id, {
                                windowId: vars.currentWindowId,
                                index: -1,
                            }, (tab) => {
                                console.log(new Date().toLocaleString(), 'move tab ', tab, ' to currentWindowId:', vars.currentWindowId);
                                if (data.activeTabId === tab.id) {
                                    chrome.tabs.update(tab.id, {active: true}).then()
                                }
                            });
                        } else {
                            // 如果url变了，就重新加载tab
                            recreateTab(messenger, tab, data.activeTabId === tab.id);
                        }
                    }
                })
            }
        })
    }

    messenger.sendMessage({
        cmd: 'CMD_SWITCH_WORKSPACE',
        data: {
            workspaceId: data.workspaceId,
        }
    })
}