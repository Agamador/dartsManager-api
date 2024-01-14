'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth.js');
const users = require('./users.js');
const games = require('./games.js');
const gamesEvents = require('./gamesEvents.js');
const app = express();
const cors = require('cors');
const fs = require('fs'); // Agregamos fs para leer archivos
const https = require('https'); // Agregamos https

const privateKey = fs.readFileSync('/furanet/sites/dartsmanager.agamador.com/web/certs/dartsmanager.agamador.com/privkey.pem'); // Reemplaza con la ruta a tu clave privada
const certificate = fs.readFileSync('/furanet/sites/dartsmanager.agamador.com/web/certs/dartsmanager.agamador.com/fullchain.pem'); // Reemplaza con la ruta a tu certificado SSL
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app); // Usamos https.createServer

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
//users routes
app.post('/api/users/register', users.registerUser);
app.post('/api/users/login', users.login);
app.post('/api/users/edit', auth.verifyToken, users.modifyProfile);
app.get('/api/users/profile', auth.verifyToken, users.getProfile);

//game routes
app.get('/api/games/usergames', auth.verifyToken, games.getUserGames);
app.get('/api/games/:id', games.loadGame);
app.get('/api/games/started/:id', gamesEvents.hasGameStarted);

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
    socket.on('disconnect', gamesEvents.disconnect);
    socket.on('joinRoom', (data) => gamesEvents.joinRoom(io, socket, data));
    socket.on('spectateRoom', (data) => gamesEvents.spectateRoom(io, socket, data));
    socket.on('startGame', (data) => gamesEvents.startGame(io, data));
    socket.on('submitScore', (data) => gamesEvents.submitScore(io, data));
    socket.on('leaveRoom', (data) => gamesEvents.leaveRoom(io, socket, data));
});


const port = 3000; // Puerto HTTPS estándar
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = server;
