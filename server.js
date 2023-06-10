const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

const authRouter = require("./Routes/auth.router")

app.use(cors())
app.use(express.json());
app.use(express.urlencoded(true))

app.get("/", (req,res)=>res.send("Live"))
app.use(authRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server live on port: ${process.env.PORT}`);
})