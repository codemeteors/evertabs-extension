import {vars, managerWorkspaceUrlRegex} from "./const";

chrome.commands.onCommand.addListener((command, tab) => {
    console.log(`Command "${command}" triggered`);

    chrome.tabs.query({currentWindow: true, url: managerWorkspaceUrlRegex}, (tabs) => {
        if (tabs.length === 1) {
            vars.curPort.postMessage({cmd: 'CMD_EXECUTE_CMD', data: {command: command, tab: tab}})
            chrome.tabs.update(tabs[0].id, {active: true}, () => {

            })
        } else {
            console.log(new Date().toLocaleString(), 'onCommand query tabs error', tabs)
        }
    })
});