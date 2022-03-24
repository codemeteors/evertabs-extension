import {vars} from "./const";
import {checkHomePageExistsOnce} from "./windowInitializer";
import {handlers} from "./messageHandler";
import {tryUpdateTabs} from "./tabUpdater";

// 重新加载这个tab页
export const recreateTab = (port, tab, active) => {
    chrome.tabs.create({
        active: active,
        url: tab.url,
        windowId: vars.currentWindowId
    }, (newTab) => {
        console.log(new Date().toLocaleString(), 'recreate tab ', tab, ' newid=', newTab.id, ' in currentWindowId:', vars.currentWindowId);
        port.postMessage({
            cmd: 'CMD_UPDATE_TAB',
            data: {
                tab: tab,
                newTab: newTab
            }
        })
    });
}

// 消息响应
chrome.runtime.onConnect.addListener(function (port) {
    console.log(new Date().toLocaleString(), 'port onConnect')
    console.assert(port.name === 'conn');
    if (vars.currentWindowId === undefined || vars.minimizedWindowId === undefined) {
        checkHomePageExistsOnce();
    }
    port.onMessage.addListener(function (msg) {
        handlers.map((value => {
            if (msg.msg.cmd === value.name) {
                value.handler(port, msg);
            }
        }))
    })

    port.onDisconnect.addListener(() => {
        console.log(new Date().toLocaleString(), 'port onDisconnect')
        port = undefined;
        vars.curPort = undefined;
    })

    vars.curPort = port;

    console.log(new Date().toLocaleString(), 'chrome.runtime.onConnect set curPort', vars.curPort)
    setTimeout(tryUpdateTabs, 1000)
})

// 升级插件时保证重新注入脚本
const manifest = chrome.runtime.getManifest();

function installContentScript() {
    let contentScripts = manifest.content_scripts;
    for (let i = 0; i < contentScripts.length; i++) {
        let contScript = contentScripts[i];
        chrome.tabs.query({ url: contScript.matches }, function(foundTabs) {
            for (let j = 0; j < foundTabs.length; j++) {
                let javaScripts = contScript.js;
                for (let k = 0; k < javaScripts.length; k++) {
                    chrome.scripting.executeScript(
                        {
                            target: {
                                tabId: foundTabs[j].id
                            },
                            files: [
                                javaScripts[k]
                            ]
                        }
                    ).then();
                }
            }
        });
    }
}

chrome.runtime.onInstalled.addListener(installContentScript);
