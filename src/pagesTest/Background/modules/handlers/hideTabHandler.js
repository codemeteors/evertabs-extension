import {vars} from "../const";

export function hideTabHandler(messenger, data) {
    const tab = data;
    console.log(new Date().toLocaleString(), 'cmd hide tab', tab);
    chrome.tabs.move(tab.id, {
        windowId: vars.minimizedWindowId,
        index: -1
    }).then();
}