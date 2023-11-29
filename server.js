const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth.js');
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/users', async (req, res) => {
    let users = await auth.consultaEjemplo();
    res.json(users);
    res.end();
});
app.post('/api/users', (req, res) => {
    const newUser = req.body;
    // Your code to save the new user to the database or any other source
    // Send a response indicating success or failure
    res.json({ message: 'User created successfully' });
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});