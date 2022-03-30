export function focusTabHandler(messenger, data) {
    const tab = data;
    console.log(new Date().toLocaleString(), 'cmd focus tab', tab);

    chrome.tabs.update(tab.id, {
        active: true
    }, () => {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        }
    })
}