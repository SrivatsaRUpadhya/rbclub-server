import prisma from "../utils/db";
import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getUserByEmail } from "./auth.controller";
import { Users } from "@prisma/client";
import { userType } from "../utils/customTypes";
import * as os from "os";
import * as fs from "fs";
const verifyAccessToEvents = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user: userType = res.locals.user;
		if (
			user?.hasAccessTo === "ADMIN" ||
			user?.hasAccessTo === "EVENTS" ||
			user?.hasAccessTo === "SUPERUSER"
		) {
			res.locals.user = user;
			return next();
		}
		return res.status(403).json({
			message: "Oops! You don't have access to this",
		});
	} catch (error) {
		return res.status(500).json({ message: "An error occurred!" });
	}
};

const fetchEvents = async (fetchType?: "Admin") => {
	return fetchType == "Admin"
		? await prisma.events.findMany({
				select: {
					id: false,
					users: {
						where: {
							paymentStatus: "RECEIVED",
						},
						select: {
							userID: true,
							name: true,
							usn: true,
						},
					},
					eventID: true,
					catagory: true,
					desc: true,
					eventName: true,
					eventDate: true,
					max_entries: true,
				},
		  })
		: await prisma.events.findMany({
				select: {
					id: false,
					users: false,
					eventID: true,
					catagory: true,
					desc: true,
					eventName: true,
					eventDate: true,
					max_entries: true,
				},
		  });
};

const addEvent = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { List } = req.body;
		List.map(
			async (element: {
				Name: string;
				Catagory: string;
				Description: string;
				Date: string;
				MaxEntries: string;
			}) => {
				try {
					await prisma.events.create({
						data: {
							eventName: element.Name,
							catagory: element.Catagory,
							desc: element.Description,
							eventDate: new Date(element.Date),
							max_entries: parseInt(element.MaxEntries),
						},
					});
				} catch (err) {
					console.log(err);
					throw err;
				}
			}
		);
		const inventoryItems = await fetchEvents();
		return res
			.status(200)
			.json({ message: "success", data: inventoryItems });
	});
};

const editEvent = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const {
			EventID,
			EventName,
			Catagory,
			Description,
			newDate,
			MaxEntries,
		} = req.body;
		await prisma.events.update({
			where: {
				eventID: EventID,
			},
			data: {
				eventName: EventName,
				catagory: Catagory,
				desc: Description,
				eventDate: newDate ? new Date(newDate) : undefined,
				max_entries: MaxEntries ? parseInt(MaxEntries) : undefined,
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

const registerForEvent = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { EventID } = req.body;
		if (!EventID) {
			return res.status(200).json({ message: "Invalid Request!" });
		}
		const email = res.locals.email;
		const user = await getUserByEmail(email);
		const settings = await prisma.settings.findFirst();
		if (settings?.eventLimitPerUser !== -1) {
			if (
				z.number().parse(user?.Events?.length) >=
				z.number().parse(settings?.eventLimitPerUser)
			) {
				return res.status(200).json({ message: "Limit reached!" });
			}
		}
		await prisma.users.update({
			where: {
				email,
			},
			data: {
				Events: {
					connect: {
						eventID: EventID,
					},
				},
			},
			include: {
				Events: true,
			},
		});

		await prisma.events.update({
			where: {
				eventID: EventID,
			},
			data: {
				users: {
					connect: {
						userID: user?.userID,
					},
				},
			},
			include: {
				users: true,
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

const deleteEvent = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { EventID } = req.body;
		await prisma.events.delete({
			where: {
				eventID: EventID,
			},
		});
		res.status(200).json({ message: "success" });
	});
};

const getEvents = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user: Users = res.locals.user;
		if (
			user?.hasAccessTo === "ADMIN" ||
			user?.hasAccessTo === "EVENTS" ||
			user?.hasAccessTo === "SUPERUSER"
		) {
			return res
				.status(200)
				.json({ message: "success", data: await fetchEvents("Admin") });
		}
		return res
			.status(200)
			.json({ message: "success", data: await fetchEvents() });
	});
};

const UserListbyEvent = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user: Users = res.locals.user;
		if (
			user?.hasAccessTo === "ADMIN" ||
			user?.hasAccessTo === "EVENTS" ||
			user?.hasAccessTo === "SUPERUSER"
		) {
			try {
				const { EventId } = req.body;

				const event = await prisma.events.findUnique({
					where: {
						eventID: EventId,
					},
					select: {
						eventName: true,
						users: {
							where: {
								paymentStatus: "RECEIVED",
							},
							select: {
								name: true,
								IDCardNum: true,
								usn: true,
							},
						},
					},
				});
				await fs.promises.appendFile(
					`${event?.eventName}.csv`,
					`Name,RCNID,USN`
				);
				await Promise.all<any>(
					event?.users.map(async (element) => {
						try {
							await fs.promises.appendFile(
								`${event?.eventName}.csv`,
								`${os.EOL}${element.name},${element.IDCardNum},${element.usn}`
							);
						} catch (error) {
							throw error;
						}
					})
				);
				res.download(`${event?.eventName}.csv`, (err) => {
					if (err) {
						console.log(err);
					}
				});
				await fs.promises.rm(`${event?.eventName}.csv`);
			} catch (error) {
				console.log(error);
				return res.status(200).json({ message: "An error occurred!" });
			}
		} else {
			return res.status(403).json({ message: "Not Authorized!" });
		}
	});
};

export {
	addEvent,
	getEvents,
	verifyAccessToEvents,
	editEvent,
	registerForEvent,
	deleteEvent,
	UserListbyEvent,
};
