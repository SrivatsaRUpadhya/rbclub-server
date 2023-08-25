const asyncWrapper = require("../utils/asyncWrapper");
const updateSettings = async (req, res) => {
	const prisma = require("../utils/db");
	await asyncWrapper(req, res, async (req, res) => {
		const user = await prisma.users.findUnique({
			where: {
				email: res.locals.email,
			},
			select: {
				name: true,
				hasAccessTo: true,
			},
		});
		if (user.hasAccessTo === "SUPERVISOR") {
			const { SkipOtp, EventLimit, MaintenanceMode } = req.body;
			await prisma.settings.upsert({
				where: {
					id: 1,
				},
				update: {
					lastUpdatedBy: user.name,
					skipOtpOnRegister: SkipOtp,
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
					skipOtpOnRegister: SkipOtp,
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
		return res.status(403).json({ message: "Unauthorized request!" });
	});
};
const getSettings = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		if (res.locals.user.hasAccessTo === "SUPERVISOR") {
			const settitngs = await prisma.settings.findFirst();
			return res.status(200).json({ message: "success", settitngs });
		}
		return res.status(200).json({ message: "Not Authorized!" });
	});
};
module.exports = { updateSettings,getSettings };
