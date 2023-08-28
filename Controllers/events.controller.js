const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper");

const verifyAccessToEvents = async (req, res, next) => {
	const isAllowed = await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "EVENTS" || user.hasAccessTo === "SUPERUSER") {
			return true;
		}
		res.status(403).json({
			message: "Oops! You don't have access to this",
		});
		return false;
	});
	isAllowed && next();
};

const verifyAccess = async (req, res) => {
	return res.status(200).json({ message: "success" });
};

const fetchEvents = async (fetchType) => {
	return fetchType == "Admin"
		? await prisma.events.findMany({
				select: {
					id: false,
					users: {
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

const addEvent = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { List } = req.body;
		List.map(async (element) => {
			await prisma.events.create({
				data: {
					eventName: element.Name,
					catagory: element.Catagory,
					desc: element.Description,
					eventDate: new Date(element.Date),
					max_entries: parseInt(element.MaxEntries),
				},
			});
		});
		const inventoryItems = await fetchEvents();
		return res
			.status(200)
			.json({ message: "success", data: inventoryItems });
	});
};

const editEvent = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
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
	});
	return res.status(200).json({ message: "success" });
};

const registerForEvent = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { EventID } = req.body;
		if (!EventID) {
			return res.status(200).json({ message: "Invalid Request!" });
		}
		const user = res.locals.user;
		const settings = await prisma.settings.findFirst();
		if (settings.eventLimitPerUser !== -1) {
			if (user.Events.length >= settings.eventLimitPerUser) {
				return res.status(200).json({ message: "Limit reached!" });
			}
		}
		await prisma.users.update({
			where: {
				email:res.locals.email,
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
						userID: user.userID,
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

const deleteEvent = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { EventID } = req.body;
		await prisma.events.delete({
			where: {
				eventID: EventID,
			},
		});
	});
	res.status(200).json({ message: "success" });
};

const getEvents = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "EVENTS" || user.hasAccessTo === "SUPERUSER") {
			return res
				.status(200)
				.json({ message: "success", data: await fetchEvents("Admin") });
		}
		return res
			.status(200)
			.json({ message: "success", data: await fetchEvents() });
	});
};

module.exports = {
	addEvent,
	getEvents,
	verifyAccessToEvents,
	verifyAccess,
	editEvent,
	registerForEvent,
	deleteEvent,
};
