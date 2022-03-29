import {
    managerWorkspaceUrlRegex,
    vars,
    managerBackgroundUrl,
    managerWorkspaceUrl
} from "./const";

// 清理掉当前窗口的managerBackgroundUrl
const removeCurrentWindowManagerBackgroundUrl = (windowId, why) => {
    chrome.tabs.query({windowId: windowId, url: managerBackgroundUrl}, (tabs) => {
        if (tabs.length > 0) {
            console.log(new Date().toLocaleString(), 'removeCurrentWindowManagerBackgroundUrl reason: ', why, 'windowId:', tabs[0].windowId);
            tabs.map((tab) => {
                chrome.tabs.remove(tab.id).then();
            })
        }
    })
}

const removeAllTabsExceptFirst = (tabs) => {
    if (tabs.length > 1) {
        for (let i = 1; i < tabs.length; i = i + 1) {
            const tab = tabs[i];
            chrome.tabs.remove(tab.id).then();
        }
    }
}

const tryPinTab = (tab) => {
    if (!tab.pinned) {
        chrome.tabs.update(tab.id, {pinned: true}).then();
        chrome.tabs.move(tab.id, {index: 0}).then();
    }
}

// 检查管理页面是否存在
export const checkHomePageExistsOnce = () => {
    // 当前窗口有managerWorkspaceUrl，则关掉其他的managerWorkspaceUrl
    chrome.tabs.query({currentWindow: true, url: managerWorkspaceUrlRegex}, (tabs) => {
        if (tabs.length > 0) {
            // 多个的,把多余的都干掉
            removeAllTabsExceptFirst(tabs);
            // 没固定的先固定
            tryPinTab(tabs[0]);

            // 清理掉其他多余的managerWorkspaceUrl
            chrome.tabs.query({currentWindow: false, url: managerWorkspaceUrlRegex}, (tabs) => {
                tabs.map((tab) => {
                    chrome.tabs.remove(tab.id).then();
                })
            })

            // 清理掉当前窗口的managerBackgroundUrl
            removeCurrentWindowManagerBackgroundUrl(tabs[0].windowId, 'reason1')

            console.log(new Date().toLocaleString(), 'update1 vars.currentWindowId:', tabs[0].windowId);
            vars.currentWindowId = tabs[0].windowId
        }
    })

    chrome.tabs.query({url: managerWorkspaceUrlRegex}, (tabs) => {
        if (tabs.length === 0) {
            // 所有窗口都没有managerWorkspaceUrl，则在当前窗口起一个managerWorkspaceUrl
            chrome.windows.getCurrent((window) => {
                chrome.tabs.create({windowId: window.id, url: managerWorkspaceUrl}, (tab) => {
                    console.log(new Date().toLocaleString(), 'update2 vars.currentWindowId:', window.id);
                    vars.currentWindowId = window.id;

                    // 清理掉当前窗口的managerBackgroundUrl
                    removeCurrentWindowManagerBackgroundUrl(window.id, 'reason2')

                    tryPinTab(tab);
                });
            })
        } else {
            // 如果有多个，那不正常，一般出现在在当前窗口生效插件情况下，那就干掉重建
            if (tabs.length > 1) {
                tabs.map((tab) => {
                    chrome.tabs.remove(tab.id).then();
                })
            } else if (tabs.length === 1) {
                // 如果有一个，那就是它
                if (vars.currentWindowId !== tabs[0].windowId) {
                    console.log(new Date().toLocaleString(), 'update3 vars.currentWindowId:', tabs[0].windowId);
                    vars.currentWindowId = tabs[0].windowId
                }
            }
        }
    })

    // 检查有没有隐藏窗口
    chrome.tabs.query({url: managerBackgroundUrl}, (tabs) => {
        if (tabs.length > 0) {
            // 多个的,把多余的都干掉
            removeAllTabsExceptFirst(tabs);
            // 没固定的先固定
            tryPinTab(tabs[0]);
            if (vars.minimizedWindowId !== tabs[0].windowId) {
                console.log(new Date().toLocaleString(), 'update4 vars.minimizedWindowId:', tabs[0].windowId);
                vars.minimizedWindowId = tabs[0].windowId
            }
        } else {
            // 没有隐藏窗口则新建一个
            chrome.windows.create({state: "minimized"}, window => {
                // 创建managerBackgroundUrl
                chrome.tabs.create({windowId: window.id, url: managerBackgroundUrl}, (tab) => {
                    console.log(new Date().toLocaleString(), 'update5 vars.minimizedWindowId:', window.id);
                    vars.minimizedWindowId = window.id;
                });
            });
        }
    })
}

export const checkHomePageExists = () => {
    checkHomePageExistsOnce();
    setTimeout(checkHomePageExists, 4000)
}

