'use strict';
const games = require('./games.js');


const rooms = {}; // { roomCode: { users: [socket1, socket2, ...], game: game } }

function disconnect() {
    console.log('Usuario desconectado');
}

//This has to be called in pre-lobby, an event would trigger the game start for the other players
function joinRoom(io, socket, data) {
    socket.join(data.room);
    if (!rooms[data.room]) rooms[data.room] = { gamemode: data?.gamemode, scores: { [data.user]: [] } }
    else rooms[data.room].scores[data.user] = [];

    io.to(data.room).emit('joinedRoom', data.room);
}


function addUserToLobby(io, data) {
    const lobby = rooms[data.room];
    if (!lobby) return;
    lobby.scores[data.user] = [];
    io.to(data.room).emit('userJoined', lobby);
    console.log(rooms[data.room])
}
function startGame(io, socket, data) {
    io.to(data.room).emit('gameStarted', 'Game has started');
}


module.exports = { joinRoom, disconnect, startGame, addUserToLobby };