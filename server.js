const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const cookie = require('cookie-parser');
const { clientURL } = require('./utils/secrets');

const authRouter = require("./Routes/auth.router")
const expensesRouter = require("./Routes/expenses.router")

app.use(cors(clientURL))
app.use(express.json());
app.use(express.urlencoded(true))
app.use(cookie())

app.get("/", (req, res) => res.send("Live"))
app.use(authRouter)
app.use(expensesRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server live on port: ${process.env.PORT}`);
})