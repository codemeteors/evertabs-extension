import {vars, managerWorkspaceUrlRegex} from "./const";

chrome.commands.onCommand.addListener((cmd, tab) => {
    console.log(`Command "${cmd}" triggered`);

    chrome.tabs.query({currentWindow: true, url: managerWorkspaceUrlRegex}, (tabs) => {
        if (tabs.length === 1) {
            vars.curPort.postMessage({cmd: 'CMD_EXECUTE_CMD', data: {cmd: cmd, tab: tab}})
            chrome.tabs.update(tabs[0].id, {active: true}, () => {

            })
        } else {
            console.log(new Date().toLocaleString(), 'onCommand query tabs error', tabs)
        }
    })
});