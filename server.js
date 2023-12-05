'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth.js');
const users = require('./users.js');
const games = require('./games.js');
const gamesEvents = require('./gamesEvents.js');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//users routes
app.post('/api/users/register', users.registerUser);
app.post('/api/users/login', users.login);
app.post('/api/users/edit', auth.verifyToken, users.modifyProfile);

//game routes
app.get('/api/games/usergames', auth.verifyToken, games.getUserGames);
app.post('/api/games/new', games.addGame);


io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
    socket.on('disconnect', gamesEvents.disconnect);
    socket.on('joinRoom', (data) => gamesEvents.joinRoom(io, socket, data));
    socket.on('startGame', (data) => gamesEvents.startGame(io, socket, data));
    socket.on('addUserToLobby', (data) => gamesEvents.addUserToLobby(io, data));
});


const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = server;
