const engines = require('consolidate');
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

app.use(express.static('public'));
app.engine('html', engines.hogan)
app.set('view engine', 'html');
app.set('views', './public/views');

app.get('/', (req, res) => {
  res.render('index.html');
});

const users = [];

const server = http.createServer(app);
const io = new Server(server);
io.on('connection', socket => {
  console.log('Conectado:', socket.handshake.auth.username, 'id:', socket.id);
  let user = {
    name: socket.handshake.auth.username,
    id: socket.id
  };
  // Add the user to the connected users list
  users.push(user);
  // Then emit the list
  io.emit('getuserlist', users);

  // Handle send messages
  socket.on('send message', (msg) => {
    io.to(msg.to).emit('receive message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Desconectado:', socket.handshake.auth.username);
    let disconnectedUser = {
      name: socket.handshake.auth.username,
      id: socket.id
    };
    users.splice(users.findIndex(userObject => userObject.id === disconnectedUser.id), 1);
    io.emit('getuserlist', users);
    io.emit('client leave', disconnectedUser);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('O chat agora está online no endereço 0.0.0.0:3000');
});