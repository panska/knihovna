const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');

const db = require('./models/index');
db.sequelize
  .authenticate()
  .then(() => console.log('DATABASE CONNECTED'))
  .catch((err) => console.log(err));

const app = express();

app.use(express.static(path.resolve(__dirname, '../../client/build')));

app.use(bodyParser.json());

const bookRoute = require('./routes/book');
app.use('/api/book', bookRoute);
const userRoute = require('./routes/user');
app.use('/api/user', userRoute);
const projectionRoute = require('./routes/projection');
app.use('/api/projection', projectionRoute);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/build/index.html'));
});

const SERVER_PORT = process.env.PORT;
let server = app.listen(SERVER_PORT, () =>
  console.log(`LISTENING ON PORT ${SERVER_PORT}!`)
);
const io = require('socket.io')(server);
let connectedUsers = [];

io.sockets.on('connection', (socket) => {
  socket.on('controlsUpdate', (update) => {
    io.emit('controlsUpdate', update);
  });

  socket.on('mediaUpdate', (update) => {
    io.emit('mediaUpdate', update);
  });

  socket.on('textMessage', (message) => {
    io.emit('textMessage', message);
  });

  socket.on('userJoin', (user) => {
    connectedUsers.push({
      id: socket.id,
      username: user.username,
      profilePicture: user.profilePicture,
      permissions: user.permissions,
    });
    io.emit('userJoin', user);
  });

  socket.on('disconnect', () => {
    let user = connectedUsers.find((user) => {
      return user.id == socket.id;
    });

    if (!user) {
      return;
    }

    connectedUsers.pop(user);
    io.emit('userDisconnect', user);
  });
});

setInterval(() => {
  io.emit('userUpdate', connectedUsers);
}, 1000);
