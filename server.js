const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const cookie = require('cookie-parser');
const { clientURL } = require('./utils/secrets');

const authRouter = require("./Routes/auth.router")
const inventoryRouter = require("./Routes/inventory.router")
const expensesRouter = require("./Routes/expenses.router")
const eventsRouter = require("./Routes/events.router")
const usersRouter = require("./Routes/users.router")

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', clientURL);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Credentials', true);
    next();
})
app.use(express.json());
app.use(cookie())
app.get("/", (req, res) => res.send("Live"))
app.use(authRouter)
app.use(inventoryRouter)
app.use(expensesRouter)
app.use(eventsRouter)
app.use(usersRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server live on port: ${process.env.PORT}`);
})
