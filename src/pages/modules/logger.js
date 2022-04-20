const isDev = process.env.NODE_ENV === 'development';

const baseApi = 'https://evertabs.codemeteors.com/api/evertabs/track';
export const log = (msg, data) => {
    console.log(msg, data)

    if(isDev && typeof window != 'undefined' && window.XMLHttpRequest) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseApi + '/debug', true); //方式 路径
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
            msg: msg,
            data: data
        }));
    }
}