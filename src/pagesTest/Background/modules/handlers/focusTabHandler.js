export function focusTabHandler(messenger, data) {
    const tab = data;
    console.log(new Date().toLocaleString(), 'cmd focus tab', tab);
    chrome.tabs.update(tab.id, {
        active: true
    }).then();
}