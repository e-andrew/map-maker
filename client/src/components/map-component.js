'use client';

import styles from "./map.module.css";
import React from "react";
import { registerMessageService, unregisterMessageService } from "@/socket.js";
import * as requests from './map-requests.js';

export default class Map extends React.Component {
  serviceName = 'map';
  library = {};
  items = {};
  currentItemId = undefined;
  isDragging = false;
  startX;
  startY;
  offsetX;
  offsetY;

  constructor() {
    super();
    this.onGetLibrary = this.onGetLibrary.bind(this);
    this.onGetAllObjects = this.onGetAllObjects.bind(this);
    this.onAddOneObject = this.onAddOneObject.bind(this);
    this.onMoveOneObject = this.onMoveOneObject.bind(this);
    this.onRemoveOneObject = this.onRemoveOneObject.bind(this);
    this.onRemoveAllObjects = this.onRemoveAllObjects.bind(this);
    this.onSaveMap = this.onSaveMap.bind(this);
    this.onDeleteMap = this.onDeleteMap.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderWorkspace = this.renderWorkspace.bind(this);
    this.startDragging = this.startDragging.bind(this);
    this.continueDragging = this.continueDragging.bind(this);
    this.stopDragging = this.stopDragging.bind(this);
    this.findCurrentItemId = this.findCurrentItemId.bind(this);
    this.changeOffsets = this.changeOffsets.bind(this);
    this.renderLibrary = this.renderLibrary.bind(this);
  }

  onGetLibrary(message) {
    Object.keys(this.library).forEach(key => delete this.library[key]);
    Object.keys(message.library).forEach(key => this.library[key] = message.library[key]);
    this.renderLibrary(this.library);
  }

  onGetAllObjects(message) {
    Object.keys(this.items).forEach(key => delete this.items[key]);
    Object.keys(message.items).forEach(key => this.items[key] = message.items[key]);
    this.renderItems(this.items);
    this.renderWorkspace(this.items);
  }

  onAddOneObject(message) {
    this.renderItems(message.items);
    Object.keys(this.items).forEach((key) => delete this.items[key]);
    Object.keys(message.items).forEach((key) => this.items[key] = message.items[key]);
    this.renderWorkspace(this.items);
  }

  onMoveOneObject(message) {
    Object.keys(this.items).forEach((key) => delete this.items[key]);
    Object.keys(message.items).forEach((key) => this.items[key] = message.items[key]);
    this.renderWorkspace(this.items);
  }

  onRemoveOneObject(message) {
    this.renderItems(message.items)
    Object.keys(this.items).forEach((key) => delete this.items[key]);
    Object.keys(message.items).forEach((key) => this.items[key] = message.items[key]);
    this.renderWorkspace(this.items);
  }

  onRemoveAllObjects(message) {
    document.getElementById('items').innerHTML = '';
    Object.keys(this.items).forEach((key) => delete this.items[key]);
    this.renderWorkspace(this.items);
  }

  onSaveMap(message) {
    alert(`Map with title '${message.title}' is saved on server!`);
  }

  onDeleteMap(message) {
    alert(`Map with title '${message.title}' is deleted from server!`);
  }


  render() {
    return (
      <div className={styles.editorPanel}>
        <div className={styles.itemsPanel}>
          <h2 className={styles.title}>Current Added Items</h2>

          <div className={styles.items} id='items' />
          <div className={styles.mapControl}>
            <button className={styles.button} id='clear'>Clear</button>
            <button className={styles.button} id='save'>Save</button>
            <button className={styles.button} id='delete'>Delete</button>
          </div>
        </div>
        <div className={styles.workspacePanel}>
          <canvas className={styles.workspace} id='workspace'></canvas>
          <h2 className={styles.title}>Library</h2>
          <div className={styles.library} id='library' />
        </div>
      </div>
    );
  }

  componentDidMount() {
    registerMessageService(this.serviceName, {
      getLibrary: this.onGetLibrary,
      getAllObjects: this.onGetAllObjects,
      addOneObject: this.onAddOneObject,
      moveOneObject: this.onMoveOneObject,
      removeOneObject: this.onRemoveOneObject,
      removeAllObjects: this.onRemoveAllObjects,
      saveMap: this.onSaveMap,
      deleteMap: this.onDeleteMap
    });

    const workspace = document.getElementById('workspace');
    workspace.width = 1000;
    workspace.height = 1000;
    this.changeOffsets();

    requests.requestGetLibrary();
    requests.requestGetAllObjects();
 
    document.getElementById('clear').onclick = (event) => requests.requestRemoveAllObjects();
    document.getElementById('save').onclick = (event) => requests.requestSaveMap();
    document.getElementById('delete').onclick = (event) => requests.requestDeleteMap();

    workspace.onmousedown = this.startDragging;
    workspace.onmouseup = this.stopDragging;
    workspace.onmouseout = this.stopDragging;
    workspace.onmousemove = this.continueDragging;
    window.addEventListener('scroll', this.changeOffsets);
    window.addEventListener('resize', this.changeOffsets);
    workspace.onresize = this.changeOffsets;
  }

  componentWillUnmount() {
    unregisterMessageService(this.serviceName);
    const workspace = document.getElementById('workspace');
    document.getElementById('clear').removeAttribute('onclick');
    document.getElementById('save').removeAttribute('onclick');
    document.getElementById('delete').removeAttribute('onclick');
    workspace.removeAttribute('onmousedown');
    workspace.removeAttribute('onmouseup');
    workspace.removeAttribute('onmouseout');
    workspace.removeAttribute('onmousemove');
    workspace.removeAttribute('onresize');
    window.removeEventListener('scroll', this.changeOffsets);
    window.removeEventListener('resize', this.changeOffsets);
  }

  renderLibrary(library){
    const libraryContainer = document.getElementById('library');
    libraryContainer.innerHTML = '';
    Object.keys(library).forEach((id) => {
      const item = library[id];

      const image = document.createElement('img');
      image.src = item.src;
      image.width = 100;
      image.height = 100;

      const button = document.createElement('button');
      button.type = 'button';
      button.appendChild(image);
      button.classList.add(styles.libraryItem);
      button.onclick = (event) => {
        requests.requestAddOneObject(id);
      };

      libraryContainer.appendChild(button);
    });
  }

  renderItems(items) {
    const itemsContainer = document.getElementById('items');
    itemsContainer.innerHTML = '';
    
    Object.keys(items).forEach((id) => {
      const item = items[id];
      const idContainer = document.createElement('div');
      idContainer.innerText = `${id}`;
      idContainer.classList.add(styles.itemId);

      const title = document.createElement('div');
      title.innerText = `${item.title}`;
      title.classList.add(styles.itemTitle);

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add(styles.itemButton);

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.innerText = 'X';
      deleteButton.classList.add(styles.deleteButton);
      deleteButton.onclick = (event) => {
        requests.requestRemoveOneObject(id);
      };

      buttonContainer.appendChild(deleteButton);

      const itemContainer = document.createElement('div');
      itemContainer.appendChild(idContainer);
      itemContainer.appendChild(title);
      itemContainer.appendChild(buttonContainer);
      itemContainer.classList.add(styles.item);
      itemsContainer.appendChild(itemContainer);
    });
  }

  renderWorkspace(shapes) {
    const workspace = document.getElementById('workspace');
    const context = workspace.getContext('2d');
    context.clearRect(0, 0, workspace.width, workspace.height);
    Object.keys(shapes).forEach((key) => {
      const shape = shapes[key];
      const image = new Image;
      image.src = this.library[shape.libraryID].src;
      image.onload = () => {
        context.drawImage(image, shape.x, shape.y, shape.width, shape.height);
      };
    });
  }

  startDragging(event) {
    event.preventDefault();
    this.startX = parseInt(event.clientX - this.offsetX);
    this.startY = parseInt(event.clientY - this.offsetY);
    this.currentItemId = this.findCurrentItemId(this.startX, this.startY, this.items);
    if (this.currentItemId !== undefined) this.isDragging = true;
  }

  continueDragging(event) {
    if (this.isDragging) {
      event.preventDefault();
      const finishX = parseInt(event.clientX - this.offsetX);
      const finishY = parseInt(event.clientY - this.offsetY);
      
      const currentShape = this.items[this.currentItemId];
      currentShape.x += (finishX - this.startX);
      currentShape.y += (finishY - this.startY);

      this.renderWorkspace(this.items);

      this.startX = finishX;
      this.startY = finishY;
    }
  }

  stopDragging(event) {
    if (this.isDragging) {
      event.preventDefault();
      this.isDragging = false;
      requests.requestMoveOneObject(this.currentItemId, this.startX, this.startY);
    }
  }

  findCurrentItemId(x, y, shapes) {
    function isMouseInShape(x, y, shape) {
      const leftBorder = shape.x;
      const rightBorder = shape.x + shape.width;
      const topBorder = shape.y;
      const bottomBorder = shape.y + shape.height;
      return x > leftBorder && x < rightBorder && y > topBorder && y < bottomBorder;
    }

    for (const id of Object.keys(shapes)) {
      if (isMouseInShape(x, y, shapes[id])) {
        return id;
      }
    }

    return undefined;
  }

  changeOffsets(event){
    const workspace = document.getElementById('workspace');
    const offsets = workspace.getBoundingClientRect();
    this.offsetX = offsets.left;
    this.offsetY = offsets.top;
  }
}