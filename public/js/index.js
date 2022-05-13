'use strict'
import chat from "./chatHandler.js";

const insertNickDialog = new bootstrap.Modal(document.querySelector('#name-modal'), {
  keyboard: false
});
const btnSaveName = document.querySelector('#name-modal #save-name-btn');
let socket = io({autoConnect: false, reconnection: false});

//State
let isModalOpen = false;

let shortcutKeys = {
  Enter: (evt) =>{
    if (isModalOpen) {
      btnSaveName.click();
    } else {
      if (document.activeElement.id === chat.components.messageInput.id){
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        if (selection.focusOffset === range.commonAncestorContainer.length) {
          evt.preventDefault();
          chat.components.messageSender.click();
        }
      }
    }
  },
  NumpadEnter: (evt) =>{
    if (isModalOpen) {
      btnSaveName.click();
    } else {
      if (document.activeElement.id === chat.components.messageInput.id){
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        if (selection.focusOffset === range.commonAncestorContainer.length) {
          evt.preventDefault()
          chat.components.messageSender.click();
        }
      }
    }
  },
  Space: (evt) => {
    if (document.activeElement.tagName === 'BODY'){
      evt.preventDefault();
      chat.components.messageInput.focus()
    }
  }
};

insertNickDialog.show();
isModalOpen = true;

// Handle key shortcuts
window.onkeydown = (evt) => {
  if(shortcutKeys[evt.code]){
    shortcutKeys[evt.code](evt);
  }
};

btnSaveName.onclick = () => {
  //validate input
  let nick = document.querySelector('#name-input').value.trim();
  if (nick === '') return alert('Seu nick não pode ser vazio');
  if (!/^[A-Za-z0-9_]+$/.test(nick)) return alert('Seu nick contém caractéres inválidos!');
  
  // Send the user to the server
  let user = {
    nick,
    socketId: socket.id
  };
  socket.auth = { username: user.nick};
  socket.connect();
  insertNickDialog.hide();
  isModalOpen = false;
};

socket.on('connect', () => {
  chat.setSocket(socket);
  chat.turnOnMsgReceivement();
});

// Receive an array of connected users then add in list
socket.on('getuserlist', users => {
  chat.updateConnectedUsersList(users);
});

socket.on('client leave', (user) => { 
  if (socket.chattingWith === user.id){
    alert('Seu parceiro de chat foi desconectado!');
    chat.destroyDOMchat();
  }
});

/*socket.on('receive message', (msg) => {
  if (!chat.openedChats[msg.senderId]) {
    chat.openedChats[msg.senderId] = [];
  }
  chat.openedChats[msg.senderId].push({ msg, type: 'received' });

  if (socket.chattingWith === msg.senderId){
    chat.newMessage('received', msg);
  } else {
    chat.notify(msg.senderId);
  }
});*/