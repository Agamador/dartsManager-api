const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth.js');
const users = require('./users.js');
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//users routes
app.post('/api/register', users.registerUser);
app.post('/api/login', users.login);
app.post('/api/user-edit', auth.verifyToken, users.modifyProfile);

//


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});