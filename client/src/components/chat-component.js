'use client';

import styles from "./chat.module.css";
import { registerMessageService, unregisterMessageService } from "@/socket.js";
import * as requests from "./chat-requests.js";
import React from "react";

export default class Chat extends React.Component {
    serviceName = 'chat';

    constructor() {
        super();
        this.onSendNewMessage = this.onSendNewMessage.bind(this);
        this.onGetMessageHistory = this.onGetMessageHistory.bind(this);
        this.onGetRandomNickname = this.onGetRandomNickname.bind(this);
        this.renderHistory = this.renderHistory.bind(this);
    }

    onSendNewMessage(message){
        this.renderHistory(message.history);
    }
    
    onGetMessageHistory(message){
        this.renderHistory(message.history);
    }
    
    onGetRandomNickname(message){
        const nickname = document.getElementById('nickname')
        nickname.innerText = message.nickname;
    }

    render() {
        return (
            <div className={styles.chat}>
                <div className={styles.nickname} id="nickname"/>
                <div className={styles.history} id="history"></div>

                <div className={styles.messageForm}>
                    <input className={styles.messageInput} type="text" placeholder="Message" id="message" />
                    <button className={styles.button} id='sendMessageButton'>Send</button>
                </div>
            </div>
        );
    }

    componentDidMount() {
        registerMessageService(this.serviceName, {
            sendNewMessage: this.onSendNewMessage,
            getMessageHistory: this.onGetMessageHistory,
            getRandomNickname: this.onGetRandomNickname,
        });

        requests.requestGetRandomNickname();
        requests.requestGetMessageHistory();

        document.getElementById('sendMessageButton').onclick = (event) => {
            if (message.value) {
                const nickname = document.getElementById('nickname');
                const message = document.getElementById('message');
                requests.requestSendNewMessage(`${nickname.innerText}: ${message.value}`);
                message.value = '';
            }
        }
    }

    componentWillUnmount() {
        unregisterMessageService(this.serviceName);
        document.getElementById('sendMessageButton').removeAttribute("onclick");
    }

    renderHistory(messageHistory){
        const history = document.getElementById('history');
        history.innerHTML = '';
        messageHistory.forEach(message => {
            const messageContainer = document.createElement('div');
            messageContainer.classList.add(styles.message);
            messageContainer.innerText = message;
            history.appendChild(messageContainer);
        });
    }
}