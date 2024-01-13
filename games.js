'use strict';

const fs = require('fs').promises;
const db = require('./db');

async function getUserGames(req, res) {
    try {
        const games = await db.query('SELECT id, name FROM games WHERE id IN (SELECT gameid FROM `games-users` WHERE userid = ?)', [req.body.user.id]);
        res.status(200).send({ games });
    } catch (error) {
        res.status(500).send({ message: error.message });
        throw error;
    }
}

async function saveGame(game) {
    const scores = game.scores;
    const status = game.status ? 1 : 0;
    const gameMode = game.gamemode;
    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }
    const loggedPlayers = Object.keys(scores).filter(player => scores[player].id);
    if (loggedPlayers.length < 1) return;
    const name = 'Partida ' + gameMode + ' ' + new Date().toLocaleString('es-ES', dateOptions);
    const insertGameQuery = 'INSERT INTO games (name, gamemode, scores, hasended) VALUES (?, ?, ?, ?)';
    const insertGameUserQuery = 'INSERT INTO `games-users` (gameid, userid) VALUES (?, ?)';
    try {
        const gameData = await db.query(insertGameQuery, [name, gameMode, JSON.stringify(scores), status]);
        const gameId = gameData.insertId;
        for (let player of loggedPlayers) {
            await db.query(insertGameUserQuery, [gameId, scores[player].id]);
        }
    } catch (e) {
        console.log(e);
    }
}

async function loadGame(req, res) {
    let gameId = req.params.id;
    const getGameQuery = 'SELECT * FROM games WHERE id = ?';
    try {
        const game = await db.query(getGameQuery, [gameId]);
        const gameData = game[0];
        res.status(200).send({ gameData });
    }
    catch (e) {
        res.status(500).send({ message: 'Error al cargar la partida' });
    }
}

module.exports = { getUserGames, loadGame, saveGame };
