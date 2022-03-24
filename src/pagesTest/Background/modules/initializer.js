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
}

export default Initializer;