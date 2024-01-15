'use strict';
const games = require('./games.js');


const rooms = {};

function disconnect() {
    console.log('Usuario desconectado');
}

function joinRoom(io, socket, data) {
    socket.join(data.room);
    if (data.user != '' && data.user != null) {
        if (!rooms[data.room]) rooms[data.room] = { scores: { [data.user]: { id: data?.userId, score: [], totalScore: 0, position: 1 } }, turn: 1, gameStarted: false }
        else if (!rooms[data.room].scores[data.user]) rooms[data.room].scores[data.user] = { id: data?.userId, score: [], totalScore: 0, position: Object.keys(rooms[data.room].scores).length + 1 };
        io.in(data.room).emit('userJoined', rooms[data.room]);
    }
}

function spectateRoom(io, socket, data) {
    socket.join(data.room);
}

function leaveRoom(io, socket, data) {
    if (!rooms[data.room]) return;
    let deletedPosition = rooms[data.room].scores[data.userName].position;
    delete rooms[data.room].scores[data.userName];
    for (let player in rooms[data.room].scores) {
        if (rooms[data.room].scores[player].position > deletedPosition) {
            rooms[data.room].scores[player].position--;
        }
    }
    if (Object.keys(rooms[data.room].scores).length != 0)
        io.to(data.room).emit('userLeft', rooms[data.room]);
    else {
        //FUTURE: saveGame for players with id to start again later
        delete rooms[data.room];
        socket.leave(data.room);
    }
}

function hasGameStarted(req, res) {
    let gameId = req.params.id;
    if (!rooms[gameId]) res.status(200).send({ started: false });
    else res.status(200).send({ started: rooms[gameId].gameStarted });
}

function startGame(io, data) {
    let gameMode = data.gamemode;
    rooms[data.room].gamemode = gameMode;
    if (gameMode === '301' || gameMode === '501') {
        for (let player of Object.keys(rooms[data.room].scores)) {
            rooms[data.room].scores[player].totalScore = parseInt(gameMode);
        }
    }
    rooms[data.room].gameStarted = true;
    io.to(data.room).emit('gameStarted', { roomId: data.room, room: rooms[data.room] });
}

function submitScore(io, data) {
    if (!rooms[data.room]) return;
    rooms[data.room].scores[data.player].score.push(data.newScore);
    let scored = parseScore(data.newScore);
    let previousScore = rooms[data.room].scores[data.player].totalScore;
    if (previousScore - scored >= 0) {
        rooms[data.room].scores[data.player].totalScore -= scored
    }
    if (rooms[data.room].scores[data.player].totalScore == 0) {
        games.saveGame(rooms[data.room])
        io.to(data.room).emit('gameFinished', { scores: rooms[data.room].scores, winner: data.player });
    }
    else {
        let newTurn = rooms[data.room].turn + 1;
        newTurn = newTurn > Object.keys(rooms[data.room].scores).length ? 1 : newTurn;
        rooms[data.room].turn = newTurn;
        io.to(data.room).emit('scoreSubmitted', { scores: rooms[data.room].scores, turn: newTurn });
    }
}


function parseScore(score) {
    let total = 0;
    let multiplier = 1;

    for (let i = 0; i < score.length; i++) {
        const current = score[i];
        if (current[0] === 'T') {
            const value = parseInt(current.slice(1));
            if (!isNaN(value)) {
                total += value * 3;
            }
        } else if (current[0] === 'D') {
            if (current.slice(1) == 'B') total += 50;
            else {
                const value = parseInt(current.slice(1));
                if (!isNaN(value)) {
                    total += value * 2;
                }
            }
        } else if (current === 'B') {
            total += 25 * multiplier;
            multiplier = 1;
        } else if (current === 'X') {
            total += 0;
            multiplier = 1;
        } else {
            const value = parseInt(current);
            if (!isNaN(value)) {
                total += value * multiplier;
            }
        }
    }
    return total;
}

module.exports = { joinRoom, disconnect, startGame, submitScore, leaveRoom, spectateRoom, hasGameStarted };