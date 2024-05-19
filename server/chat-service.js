const history = [];
let id = 0;

async function sendNewMessage(broadcast, singlecast, message){
    history.push(message.content);
    broadcast({
        action: message.action,
        history: history,
    });
}

async function getMessageHistory(broadcast, singlecast, message){
    singlecast({
        action: message.action,
        history: history,
    });
}

async function getRandomNickname(broadcast, singlecast, message){
    singlecast({
        action: message.action,
        nickname: `User ${id}`
    });
    id += 1;
}

module.exports = { 
    sendNewMessage,
    getMessageHistory,
    getRandomNickname,
};