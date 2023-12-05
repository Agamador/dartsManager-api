'use strict';

const fs = require('fs').promises;
const db = require('./db');

async function getUserGames(req, res) {
    try {
        const games = await db.query('SELECT * FROM games WHERE id IN (SELECT gameid FROM `games-users` WHERE userid = ?)', [req.body.user.id]);
        res.status(200).send({ games });
    } catch (error) {
        res.status(500).send({ message: error.message });
        throw error;
    }
}

async function addGame(req, res, next) {
    try {
        const playersList = req.body.playersList;
        const gameMode = req.body.gameMode;
        const gameName = req.body.gameName;
        const hasEnded = false;
        const scores = {};
        for (let player in playersList) {
            scores[player] = { id: playersList[player].id, name: playersList[player].name, score: [] }
        }

        const insertGameQuery = 'INSERT INTO games (`gamemode`, `name`, `scores`, `hasended`) VALUES (?, ?, ?, ?)';
        const game = await db.query(insertGameQuery, [gameMode, gameName, JSON.stringify(scores), hasEnded]);
        if (!game) throw new Error('Error al crear la partida');

        const gameId = game.insertId;
        const insertGameUserQuery = 'INSERT INTO `games-users` (`gameid`, `userid`) VALUES (?, ?)';
        for (let player of playersList) {
            if (player.id != null) {
                const gameUser = await db.query(insertGameUserQuery, [gameId, player.id]);
                if (!gameUser) throw new Error('Error al añadir usuario a la partida');
            }
        }

        next(gameId);
    } catch (error) {
        res.status(500).send({ message: error.message });
        throw error;
    }
}

async function loadGame(req, res) {

}

async function saveGame(req, res) {
    try {
        const gameId = req.params.id; // Obtén el ID de la partida desde los parámetros de la ruta
        const fileName = gameId + '.txt';

        // Lee el contenido del archivo txt correspondiente al gameId
        const fileData = await fs.readFile(fileName, 'utf-8');
        const scores = JSON.parse(fileData);

        // Actualiza los datos de la partida en la base de datos si es necesario
        // Implementa la lógica de actualización según tus necesidades

        res.status(200).send({ scores });
    } catch (error) {
        res.status(500).send({ message: error.message });
        throw error;
    }
}

module.exports = { getUserGames, addGame, saveGame };
