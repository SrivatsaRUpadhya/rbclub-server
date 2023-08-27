const asyncWrapper = require("../utils/asyncWrapper");
const prisma = require("../utils/db");
const updateSettings = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "SUPERUSER") {
			const {EventLimit, MaintenanceMode } = req.body;
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
		return res.status(401).json({ message: "Not Authorized!" });
	});
};
const getSettings = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		if (res.locals.user.hasAccessTo === "SUPERUSER") {
			const settings = await prisma.settings.findFirst();
			return res.status(200).json({ message: "success", settings });
		}
		return res.status(401).json({ message: "Not Authorized!" });
	});
};
module.exports = { updateSettings, getSettings };
