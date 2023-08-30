import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper";
import prisma from "../utils/db";
import { userType } from "../utils/customTypes";

const updateSettings = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user: userType = res.locals.user;
		if (user.hasAccessTo === "SUPERUSER") {
			const { EventLimit, MaintenanceMode } = req.body;
			await prisma.settings.upsert({
				where: {
					id: 1,
				},
				update: {
					lastUpdatedBy: user.name,
					eventLimitPerUser:
						EventLimit === "No Limit"
							? -1
							: EventLimit
							? parseInt(EventLimit)
							: undefined,
					maintenanceMode: MaintenanceMode,
				},
				create: {
					lastUpdatedBy: user.name,
					eventLimitPerUser:
						EventLimit === "No Limit"
							? -1
							: EventLimit
							? parseInt(EventLimit)
							: undefined,
					maintenanceMode: MaintenanceMode,
				},
			});
			return res.status(200).json({ message: "success" });
		}
		return res.status(401).json({ message: "Not Authorized!" });
	});
};
const getSettings = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user: userType = res.locals.user;
		if (user.hasAccessTo === "SUPERUSER") {
			const settings = await prisma.settings.findFirst();
			return res.status(200).json({ message: "success", settings });
		}
		return res.status(401).json({ message: "Not Authorized!" });
	});
};
export { updateSettings, getSettings };
