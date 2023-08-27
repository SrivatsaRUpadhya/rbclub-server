const prisma = require("./db");

const websiteStatus = async (req, res, next) => {
	const settings = await prisma.settings.findFirst();
	const user = res.locals.user;
	if (settings.maintenanceMode && user?.hasAccessTo !== "SUPERUSER") {
		return res.status(200).json({ message: "Website under maintenance!" });
	}
	return next();
};
module.exports = websiteStatus;
