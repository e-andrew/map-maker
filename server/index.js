const config = require('./config.js');
const webSocketServer = require('./socket.js');
const mapService = require('./map-service.js');
const chatService = require('./chat-service.js');

mapService.openMap();
const wss = webSocketServer.start(config.PORT, config.HEARTBEAT_INTERVAL);
wss.RegisterMessageService('map', mapService);
wss.RegisterMessageService('chat', chatService);