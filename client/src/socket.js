let ws = null;

function validateMessage(message){
  return message["service"] !== undefined && message["action"] !== undefined;
}

export function join(host, port) {
  if (ws === null) {
    ws = new WebSocket(`ws://${host}:${port}/`);

    ws.messageServices = {};
    ws.registerMessageService = (service, handlers) => {
      ws.messageServices[service] = handlers;
    };
    ws.unregisterMessageService = (service) => {
      delete ws.messageServices[service];
    };
    ws.singlecast = (service) => (data) => {
      data['service'] = service;
      const message = JSON.stringify(data);
      ws.send(message);
    };

    ws.onopen = (event) => {
      console.log('Connected');
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if(!validateMessage(message)){
          console.log("Incorrect message!");
          return;
        }
        
        if (message.service === 'ping') {
          console.log('Received ping!');
          ws.singlecast('pong')({ action: '' });
          return;
        }
        
        const service = ws.messageServices[message.service];
        if (!service) {
          console.log(`Service ${message.service} don't exist!`);
          return;
        }

        const action = service[message.action];
        if (!action) {
          console.log(`Action ${message.action} don't exist!`);
          return;
        }

        await action(message);
      } catch (error) {
        console.log(error);
      }
    };

    ws.onerror = (event) => {
      console.log("Error from server ", event.data);
    };

    ws.onclose = (event) => {
      console.log("Closed");
    };
  }
}

export function leave() {
  if (ws !== null) {
    ws.close();
    ws = null;
  }
}

export function getSinglecast(service){
  if(ws !== null) {
    return ws.singlecast(service);
  } else {
    return (data) => { throw new Error("Trying singlecast when not connected to server!") };
  }
}

export function registerMessageService(service, handlers) {
  if(ws !== null) {
    ws.registerMessageService(service, handlers);
  }
};

export function unregisterMessageService(service) {
  if(ws !== null) {
    ws.unregisterMessageService(service);
  }
};