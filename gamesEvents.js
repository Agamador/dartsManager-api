'use strict';
const games = require('./games.js');


const rooms = {};

function disconnect() {
    console.log('Usuario desconectado');
}

function joinRoom(io, socket, data) {
    socket.join(data.room);
    if (!rooms[data.room]) rooms[data.room] = { gamemode: data?.gamemode, scores: { [data.user]: { id: data?.userId, score: [] } } }
    else rooms[data.room].scores[data.user] = { id: data?.userId, score: [] };
    console.log(rooms[data.room])
    io.in(data.room).emit('userJoined', rooms[data.room]);
}

function leaveRoom(io, socket, data) {
    socket.leave(data.room);
    if (!rooms[data.room]) return;
    delete rooms[data.room].scores[data.user];
    if (rooms[data.room].scores.length != 0)
        io.to(data.room).emit('userLeft', rooms[data.room]);
    else delete rooms[data.room];

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

//TODO: Send winner along with the room
function gameFinished(io, data) {
    io.to(data.room).emit('gameFinished', rooms[data.room]);
}


module.exports = { joinRoom, disconnect, startGame, submitScore, leaveRoom };