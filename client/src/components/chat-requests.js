import { getSinglecast } from "@/socket.js";

const singlecast = getSinglecast('chat');

export function requestSendNewMessage(content){
    singlecast({
        action: 'sendNewMessage',
        content: content
    });
}

export async function requestGetMessageHistory(){
    singlecast({
        action: 'getMessageHistory',
    });
}

export async function requestGetRandomNickname(){
    singlecast({
        action: 'getRandomNickname',
    });
}