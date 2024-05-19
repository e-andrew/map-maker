import { getSinglecast } from "@/socket.js";

const singlecast = getSinglecast('map');

export async function requestGetLibrary(){
    singlecast({
        action: 'getLibrary',
    });
}

export async function requestGetAllObjects(){
    singlecast({
        action: 'getAllObjects',
    });
}

export async function requestAddOneObject(libraryId){
    singlecast({
        action: 'addOneObject',
        libraryId,
    });
}

export async function requestMoveOneObject(id, x, y){
    singlecast({
        action: 'moveOneObject',
        id,
        x,
        y
    });
}

export async function requestRemoveOneObject(id){
    singlecast({
        action: 'removeOneObject',
        id
    });
}
export async function requestRemoveAllObjects(){
    singlecast({
        action: 'removeAllObjects',
    });
}

export async function requestSaveMap(){
    singlecast({
        action: 'saveMap',
    });
}

export async function requestDeleteMap(){
    singlecast({
        action: 'deleteMap',
    });
}

export function requestAll(){
    requestGetObjectLibrary();
    requestAddOneObject();
    requestRenameOneObject();
    requestMoveOneObject();
    requestRemoveOneObject();
    requestRemoveAllObjects();
    requestSaveMap();
    requestDeleteMap();
}