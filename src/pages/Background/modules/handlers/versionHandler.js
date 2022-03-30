export function versionHandler(messenger, data) {
    messenger.sendMessage({cmd: 'CMD_VERSION', data: '1.0'})
}