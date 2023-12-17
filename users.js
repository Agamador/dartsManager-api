const { createToken } = require('./auth');
const db = require('./db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function registerUser(req, res) {
    user = req.body.user;
    if (!user) { res.status(400).json({ message: 'User not provided' }); return; }

    try {
        const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
        if (existingUser.length > 0) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        const insertQuery = 'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)';
        const result = await db.query(insertQuery, [user.name, user.surname, user.email, hashedPassword]);

        const newUserid = result.insertId;

        const newUser = { id: newUserid, name: user.name };
        const token = createToken(newUser);
        if (!token) {
            throw new Error('Error creating token');
        }
        res.status(200).send({ token, user: newUser });

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

async function login(req, res) {
    try {
        if (!req.body.user) throw new Error('User not provided');
        const { email, password } = req.body.user;
        const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            throw new Error('Invalid credentials');
        }

        const hashedPassword = user[0].password;

        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        const token = createToken(user[0]);

        res.status(200).send({ token, user: { id: user[0].id, name: user[0].name } });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

async function modifyProfile(req, res) {
    try {
        const userId = req.body.user.id;
        if (!userId || !req.body.newData) throw new Error('User or new info not provided');
        const { newName, newSurname } = req.body.newData;
        const updateQuery = 'UPDATE users SET name = ?, surname = ? WHERE id = ?';
        await db.query(updateQuery, [newName, newSurname, userId]);

        const newToken = createToken({ id: userId, name: newName })
        if (!newToken) {
            throw new Error('Error creating token');
        }
        res.status(200).send({ user: { userId, "name": newName }, token: newToken });
    } catch (error) {
        res.status(500).send({ message: error.message });
        throw error;
    }
}

module.exports = { registerUser, login, modifyProfile };
