'use strict';
const games = require('./games.js');


const rooms = {}; // { roomCode: { users: [socket1, socket2, ...], game: game } }

function disconnect() {
    console.log('Usuario desconectado');
}

//This has to be called in pre-lobby, an event would trigger the game start for the other players
function joinRoom(io, socket, data) {
    socket.join(data.room);
    if (!rooms[data.room]) rooms[data.room] = { gamemode: data?.gamemode, scores: { [data.user]: { id: data?.userId, score: [] } } }
    else rooms[data.room].scores[data.user] = { id: data?.userId, score: [] };
    console.log(rooms[data.room])
    io.to(data.room).emit('userJoined', rooms[data.room]);
}

function addUserToLobby(io, data) {
    const lobby = rooms[data.room];
    if (!lobby) return;
    lobby.scores[data.user] = { id: data?.userId, score: [] };
    io.to(data.room).emit('userJoined', rooms[data.room]);
    console.log(rooms[data.room])
}

function startGame(io, data) {
    io.to(data.room).emit('gameStarted', { roomId: data.room, room: rooms[data.room] });
}

function submitScore(io, data) {

    const lobby = rooms[data.room];
    console.log(lobby, data)
    if (!lobby) return;

    lobby.scores[data.user].score.push(data.newScore);
    io.to(data.room).emit('scoreSubmitted', rooms[data.room]);
    //TODO: Check if the game has ended
    gameFinished(io, { room: data.room, lobby });
}

//si termina la partida, gameFinished, de momento pon que si hay 2T20T20T20 en un player
function gameFinished(io, data) {
    io.to(data.room).emit('gameFinished', rooms[data.room]);
}


module.exports = { joinRoom, disconnect, startGame, addUserToLobby, submitScore };