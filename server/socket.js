const WebSocketServer = require('ws').WebSocketServer;

function validateMessage(message){
    return message["service"] !== undefined && message["action"] !== undefined;
}

function start(PORT, HEARTBEAT_INTERVAL) {
    const wss = new WebSocketServer({ port: PORT });
    
    wss.messageServices = {};
    wss.RegisterMessageService = (service, handlers) => {
        wss.messageServices[service] = handlers;
    }
    wss.UnregisterMessageService = (service) => {
        delete wss.messageServices[service];
    }

    const broadcast = (service) => (data) => {
        data['service'] = service;
        const message = JSON.stringify(data);
        wss.clients.forEach(ws => ws.send(message));
    };

    const singlecast = (ws, service) => (data) => {
        data['service'] = service;
        const message = JSON.stringify(data);
        ws.send(message);
    };

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                if(!validateMessage(message)) {
                    console.log("Incorrect message");
                    return;
                }
                
                if (message.service === 'pong') {
                    ws.isAlive = true;
                    console.log('received pong');
                    return;
                }

                const service = wss.messageServices[message.service];
                if (!service) {
                    console.log("Service don't exist!");
                    return;
                }

                const action = service[message.action];
                if (!action) {
                    console.log("Action don't exist!");
                    return;
                }

                await action(broadcast(message.service), singlecast(ws, message.service), message);
            } catch (error) {
                console.log(error); 
            }
        });

        ws.on('error', console.error);
        ws.on('close', () => {
            console.log("Socket closed!");
        });
    });

    const initHealthCheckInterval = (wss) => setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();

            ws.isAlive = false;
            singlecast(ws, 'ping')({action: ''});
        });
    }, HEARTBEAT_INTERVAL);

    const healthcheckInterval = initHealthCheckInterval(wss);

    wss.on('close', () => {
        clearInterval(healthcheckInterval);
    });

    return wss;
}

module.exports = { start };