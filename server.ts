import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import authRouter from "./Routes/auth.router";
import inventoryRouter from "./Routes/inventory.router";
import expensesRouter from "./Routes/expenses.router";
import eventsRouter from "./Routes/events.router";
import usersRouter from "./Routes/users.router";
import settingsRouter from "./Routes/settings.router";
import driveRouter from "./Routes/drive.router";
import attendanceRouter from "./Routes/attendance.router";
import secrets from "./utils/secrets";
import { handleRedirect } from "./Controllers/auth.controller";
import { z } from "zod";

try {
	const app = express();
	var whitelist = [
		z.string().parse(secrets.clientURL_1),
		z.string().parse(secrets.clientURL_2),
		"http://localhost:3000",
	];

	//Do not delete the following commented lines, keep this to know what headers are to be set

	//app.use((req, res, next) => {
	//    res.set('Access-Control-Allow-Origin', clientURL);
	//    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	//    res.set('Access-Control-Allow-Headers', 'Content-Type');
	//    res.set('Access-Control-Allow-Credentials', true);
	//    next();
	//})

	var corsOptions: CorsOptions = {
		origin: function (origin, callback) {
			if (whitelist.indexOf(z.string().parse(origin)) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "DELETE", "POST"],
		allowedHeaders: ["Content-Type"],
		exposedHeaders: ["set-cookie"],
	};

	app.get("/", (req: Request, res: Response) => res.end("Live"));
	app.get("/api/auth/redirect", handleRedirect);

	app.options("*", cors(corsOptions));
	app.use(cors(corsOptions));
	app.use(express.json());
	app.use(cookieParser());
	app.use(authRouter);
	app.use(inventoryRouter);
	app.use(expensesRouter);
	app.use(eventsRouter);
	app.use(usersRouter);
	app.use(settingsRouter);
	app.use(driveRouter);
	app.use(attendanceRouter);
	app.listen(process.env.PORT, () => {
		console.log(`Server live on port: ${process.env.PORT}`);
	});
	const formatMemoryUsage = (data: any) =>
		`${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

	const memoryData = process.memoryUsage();

	const memoryUsage = {
		rss: `${formatMemoryUsage(
			memoryData.rss
		)} -> Resident Set Size - total memory allocated for the process execution`,
		heapTotal: `${formatMemoryUsage(
			memoryData.heapTotal
		)} -> total size of the allocated heap`,
		heapUsed: `${formatMemoryUsage(
			memoryData.heapUsed
		)} -> actual memory used during the execution`,
		external: `${formatMemoryUsage(
			memoryData.external
		)} -> V8 external memory`,
	};

	console.log(memoryUsage);
} catch (error) {
	console.log(error);
}
