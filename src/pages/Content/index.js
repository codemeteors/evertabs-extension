import Transfer from "./modules/transfer";

const href = window.location.href
if (href === 'https://evertabs.codemeteors.com/' || href === 'https://evertabs.codemeteors.com/workspace') {
    const transfer = new Transfer()
    transfer.startListenMessage();
}