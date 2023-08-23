const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const cookie = require("cookie-parser");
const { clientURL_1, clientURL_2 } = require("./utils/secrets");

const authRouter = require("./Routes/auth.router");
const inventoryRouter = require("./Routes/inventory.router");
const expensesRouter = require("./Routes/expenses.router");
const eventsRouter = require("./Routes/events.router");
const usersRouter = require("./Routes/users.router");
const settingsRouter = require("./Routes/settings.router");
const driveRouter = require("./Routes/drive.router");
const handleTokens = require("./utils/tokens");
const { handleRedirect } = require("./Controllers/auth.controller");

var whitelist = [
	clientURL_1,
	clientURL_2,
	"http://localhost:3000",
];

var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	allowedHeaders: ["Content-Type"],
	exposedHeaders: ["set-cookie"],
};

app.options("*", cors(corsOptions));
app.get("/", (req, res) => res.send("Live"));
app.post("/api/auth/redirect", handleRedirect);

app.use(cors(corsOptions));

//Do not delete the following commented lines, keep this to know what headers are to be set

//app.use((req, res, next) => {
//    res.set('Access-Control-Allow-Origin', clientURL);
//    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//    res.set('Access-Control-Allow-Headers', 'Content-Type');
//    res.set('Access-Control-Allow-Credentials', true);
//    next();
//})
app.use(express.json());
app.use(cookie());
app.use(authRouter);
app.use(inventoryRouter);
app.use(expensesRouter);
app.use(eventsRouter);
app.use(usersRouter);
app.use(settingsRouter);
app.use(driveRouter);

app.listen(process.env.PORT, () => {
	console.log(`Server live on port: ${process.env.PORT}`);
});
