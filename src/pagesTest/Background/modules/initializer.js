import {checkHomePageExists} from "./windowInitializer";
import {managerWorkspaceUrlRegex, vars} from "../../../pages/Background/modules/const";

class Initializer {

    installContentScript() {
        // 升级插件时保证重新注入脚本
        const manifest = chrome.runtime.getManifest();
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

    initContentScript() {
        chrome.runtime.onInstalled.addListener(this.installContentScript);
    }

    initWindow() {
        setTimeout(checkHomePageExists, 1000)
    }

    initCommandListener(messenger) {
        chrome.commands.onCommand.addListener((cmd, tab) => {
            console.log(`Command "${cmd}" triggered`);

            chrome.tabs.query({currentWindow: true, url: managerWorkspaceUrlRegex}, (tabs) => {
                if (tabs.length === 1) {
                    messenger.sendMessage({
                        cmd: 'CMD_EXECUTE_CMD',
                        data: {
                            cmd: cmd,
                            tab: tab
                        }
                    })
                    chrome.tabs.update(tabs[0].id, {active: true}, () => {

                    })
                } else {
                    console.log(new Date().toLocaleString(), 'onCommand query tabs error', tabs)
                }
            })
        });
    }
}

export default Initializer;