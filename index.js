const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');

const secrets = require('./utils/secrets.js')
const app = express();

app.use(cors("http://localhost:3000"));
app.use(express.json());
app.use(cookie())
app.use(require('./Routes/auth.router.js'))

app.get("/", (req, res) => {
    res.send("Live")
})
app.listen(secrets.port, () => {
    console.log(`Server live on port ${secrets.port}`);
})