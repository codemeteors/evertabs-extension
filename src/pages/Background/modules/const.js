// 注意：最后一定不要加'/'
export const managerUrl = 'https://evertabs.codemeteors.com';
export const managerWorkspaceUrl = managerUrl + '/workspace';
export const managerWorkspaceUrlRegex = managerUrl + '/workspace*';
export const managerBackgroundUrl = managerUrl + '/background';
export const vars = {
    minimizedWindowId: undefined,
    currentWindowId: undefined,
    needUpdateTabs: false,
    foreignCreatedTab: undefined, // 从浏览器外部点击链接
    idMap: {}
}
