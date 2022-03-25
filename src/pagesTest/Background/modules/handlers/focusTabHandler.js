const getUrlPattern = (url) => {
    const fragmentIndex = url.indexOf('#')
    if (fragmentIndex > 0) {
        return url.substring(0, fragmentIndex) + '*'
    } else {
        return url;
    }
}

export function focusTabHandler(messenger, data) {
    const tab = data;
    console.log(new Date().toLocaleString(), 'cmd focus tab', tab);

    // chrome.tabs.query不支持#符号，所以需要做个正则
    const urlPattern = getUrlPattern(tab.url);
    // 避免tab.id找不到抛异常，所以先query，再匹配
    chrome.tabs.query({url: urlPattern}, (tabs) => {
        if (tabs) {
            tabs.map((t) => {
                if (t.id === tab.id) {
                    chrome.tabs.update(tab.id, {
                        active: true
                    }).then();
                }
            })
        }
    })

}