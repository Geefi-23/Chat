/**
 * @author Geefi-23
 * @description módulo destinado ao controle geral das mensagens
 */

const chatHandler = () => {
  const chat = document.querySelector('#chat');
  let defaultInnerHTML = `<div class="d-flex flex-column justify-content-center align-items-center h-100 w-100">
    <h2>Inicie uma conversa!</h2>
    <span>Você pode iniciar uma conversa com algum usuário conectado na lista à esquerda.</span>
    <p class="w-75 text-secondary mt-2">
      Atalhos úteis:<br>
      Return ou Enter: Enviar mensagem<br>
      Espaço: Focar input de mensagem
    </p>
  </div>`;
  let chatInnerHTML = `
  <div class="ps-2 pt-2 border-bottom">
    <h4 id="chatting-with"></h4>
  </div>
  <div id="messages-container"></div>
  <div class="d-flex align-items-start w-100 border-top py-2">
    <div id="write-message" class="ps-2" type="text" placeholder="Mensagem" contenteditable autofocus></div>
    <button id="btn-send_message">Enviar</button>
  </div>`;
  let sidebar = document.querySelector('#sidebar');
  let messagesContainer = null;
  let messageInput = null;
  let messageSender = null;
  let connectedUsersList = document.querySelector('#connected-users-list');
  let lis = connectedUsersList.querySelectorAll('li');
  let chattingWith = null;

  let listOpenMobile = document.querySelector('#mobile-openlist__btn');

  let isReady = false;

  const openedChats = {};
  let socket = null;

  listOpenMobile.onclick = () => {
    if (!sidebar.classList.contains('mobile-opened')){
      sidebar.classList.add('mobile-opened');
    }
    else{
      sidebar.classList.remove('mobile-opened');
    }
  };

  return {
    states: {
      isReady
    },
    components: {
      messageInput,
      messageSender
    },
    openedChats,
    setSocket: sckt => {
      socket = sckt;
    },
    config: function() {
      this.createDOMChat();
      // Send messages
      if (!messageSender.onclick){
        messageSender.onclick = () => {
          let content = messageInput.innerHTML.trim();
          if (content === '') return;
          
          let msg = {
            sender: socket.auth.username,
            senderId: socket.id,
            to: socket.chattingWith,
            content
          };
          socket.emit('send message', msg);
          this.newMessage('sent', msg);
          messageInput.textContent = '';
          if (!openedChats[msg.to]){
            openedChats[msg.to] = [];
          }
          openedChats[msg.to].push({ msg, type: 'sent' });
        };
      }
      this.isReady = true;
    },
    createDOMChat: function(){
      chat.innerHTML = '';
      chat.insertAdjacentHTML('beforeend', chatInnerHTML);

      messagesContainer = document.querySelector('#messages-container');
      messageInput = document.querySelector('#write-message');
      this.components.messageInput = document.querySelector('#write-message');
      messageSender = document.querySelector('#btn-send_message');
      this.components.messageSender = document.querySelector('#btn-send_message');
      chattingWith = document.querySelector('#chatting-with');
    },
    destroyDOMchat: function() {
      chat.innerHTML = '';
      chat.insertAdjacentHTML('beforeend', defaultInnerHTML);

      messagesContainer = null;
      messageInput = null;
      this.components.messageInput = null;
      messageSender = null;
      this.components.messageSender = null;
      chattingWith = null;
      this.isReady = false;
    },
    turnOnMsgReceivement: function() {
      socket.on('receive message', (msg) => {
        if (!this.openedChats[msg.senderId]) {
          this.openedChats[msg.senderId] = [];
        }
        this.openedChats[msg.senderId].push({ msg, type: 'received' });
      
        if (socket.chattingWith === msg.senderId){
          this.newMessage('received', msg);
        } else {
          this.notify(msg.senderId);
        }
      });
    },
    clearMessages: () => {
      messagesContainer.innerHTML = '';
    },
    newMessage: (type, msg) => {
      let className = `message ${type}`;
      let wrapper = document.createElement('div');
      let speechBubble = document.createElement('div');
      let sender = document.createElement('small');
      
      wrapper.className = `d-flex justify-content-${type === 'sent' ? 'end':'start'} py-1`;
      speechBubble.className = className;
      sender.className = 'd-block text-end text-secondary';
      sender.append(msg.sender);
      
      speechBubble.insertAdjacentHTML('beforeend', msg.content);
      speechBubble.append(sender)
      wrapper.append(speechBubble);
    
      messagesContainer.append(wrapper);
      wrapper.scrollIntoView();
    },
    openNewChat: function(userToChat) {
      this.clearMessages();
      this.setChattingWith(userToChat.name);
      messageInput.innerText = '';
      messageInput.focus();
    },
    openChat: function(userToChat) {
      this.clearMessages();
      this.setChattingWith(userToChat.name);
      messageInput.innerText = '';
      messageInput.focus();
      openedChats[userToChat.id].forEach((message) => {
        this.newMessage(message.type, message.msg);
      });
    },
    setChattingWith: (name = '') => {
      chattingWith.innerHTML = '';
      chattingWith.append(name);
    },
    updateConnectedUsersList: function (usersArray) {
      connectedUsersList.innerHTML = '';
      usersArray.forEach((user) => {
        let li = document.createElement('li');
        li.onclick = () => {
          if (socket.chattingWith === user.id){
            sidebar.classList.remove('mobile-opened');
            return;
          }
          if (!li.classList.contains('myself')) {
            if (!this.states.isReady)
              this.config();
            if (openedChats[user.id]){
              this.openChat(user);
              li.setAttribute('data-content', '');
              document.title = document.title.replace(/[(\d)]/g, '');
            } else {
              this.openNewChat(user);
            }
            connectedUsersList.querySelectorAll('li').forEach((li) => {
              li.classList.remove('active');
            });
            li.classList.add('active');
            socket.chattingWith = user.id;
            sidebar.classList.remove('mobile-opened');
          }
          
        };
        li.append(user.name);
        if (user.id === socket.id) {
          li.className = 'myself';
          connectedUsersList.prepend(li);
        } else {
          li.className = user.id;
          connectedUsersList.append(li);
        }
      });
    },
    notify: (onId) => {
      let li = null;
      connectedUsersList.childNodes.forEach(child => {
        if (child.className === onId) li = child;
      });
      console.log(1, li)
      li.setAttribute('data-content', (parseInt(li.getAttribute('data-content')) | 0) + 1);
      document.title = `(1)Chat`;
    }
  }
};

export default chatHandler();