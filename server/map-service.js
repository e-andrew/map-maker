const fs = require('node:fs');

const library = {}
let items = {}
const libraryPath = './resources/library/';
const savesPath = './resources/saves/';
const mapTitle = "Example.json";
let id = 0;

async function getLibrary(broadcast, singlecast, message) {
    singlecast({
        action: message.action,
        library: library,
    });
}

async function getAllObjects(broadcast, singlecast, message) {
    singlecast({
        action: message.action,
        items: items,
    });
}

async function addOneObject(broadcast, singlecast, message) {
    items[id] = {
        title: `New item ${id}`,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        libraryID: message.libraryId
    };
    id += 1;

    broadcast({
        action: message.action,
        items
    });
}

async function moveOneObject(broadcast, singlecast, message) {
    items[message.id].x = message.x;
    items[message.id].y = message.y;
    broadcast({
        action: message.action,
        items
    });
}

async function removeOneObject(broadcast, singlecast, message) {
    delete items[message.id];
    broadcast({
        action: message.action,
        items
    })
}

async function removeAllObjects(broadcast, singlecast, message) {
    Object.keys(items).forEach(id => delete items[id]);
    broadcast({
        action: message.action
    })
}

async function saveMap(broadcast, singlecast, message) {
    try {
        const data = {
            id,
            items
        };
        fs.writeFileSync(savesPath + mapTitle, JSON.stringify(data));
    } catch (error) {}

    broadcast({
        action: message.action,
        title: mapTitle
    });
}

async function openMap() {
    const mimetype = 'image/png';
    const encoding = 'base64';

    fs.readdirSync(libraryPath).forEach(filename => {
        const data = fs.readFileSync(libraryPath + filename, { encoding: encoding });
        library[filename] = {
            mimetype,
            encoding,
            data: data,
            src: `data:${mimetype};${encoding},${data}`
        }
    });

    try {
        const data = JSON.parse(fs.readFileSync(savesPath + mapTitle));
        id = data.id;
        items = data.items;
    } catch (error) {
        items = {};
        id = 0;
    }
}

async function deleteMap(broadcast, singlecast, message) {
    try {
        fs.unlinkSync(savesPath + mapTitle);
    } catch (error) {}

    broadcast({
        action: message.action,
        title: mapTitle
    });
}

module.exports = {
    getLibrary,
    getAllObjects,
    addOneObject,
    moveOneObject,
    removeOneObject,
    removeAllObjects,
    saveMap,
    openMap,
    deleteMap,
};