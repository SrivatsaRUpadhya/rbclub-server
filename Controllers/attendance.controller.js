const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper");
const fs = require("fs");
const os = require("os");
const updateAttendance = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
			try {
				const { AttendanceList } = req.body;
				await prisma.users.updateMany({
					where: {
						userID: AttendanceList,
					},
					data: {
						attendance: { increment: 1 },
					},
				});
				return res.status(200).json({ message: "success" });
			} catch (error) {
				console.log(error);
				throw error;
			}
		} else {
			return res.status(403).send("Not Authorized!");
		}
	});
};

const getAttendanceList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
			try {
				const result = await prisma.users.findMany({select:{name:true,IDCardNum:true,attendance:true}});
				return res
					.status(200)
					.json({ message: "success", data: result });
			} catch (error) {
				console.log(error);
				throw error;
			}
		} else {
			return res.status(403).send("Not Authorized!");
		}
	});
};

const dowonloadAttendanceList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
			try {
				await fs.promises.appendFile(
					"list.csv",
					`Name,RCNID,Number of classes attended`
				);

				const users = await prisma.users.findMany({
					select: { name: true, IDCardNum: true, attendance: true },
				});
				await Promise.all(
					users.map(async (element) => {
						try {
							await fs.promises.appendFile(
								"list.csv",
								`${os.EOL}${element.name},${element.IDCardNum},${element.attendance}`
							);
						} catch (error) {
							throw error;
						}
					})
				);
				res.download("list.csv", (err) => {
					if (err) {
						console.log(err);
					}
				});
				await fs.promises.rm("list.csv");
			} catch (error) {
				console.log(error);
				return res.status(200).json({ message: "An error occurred!" });
			}
		} else {
			return res.status(403).send("Not Authorized!");
		}
	});
};

module.exports = { updateAttendance, getAttendanceList, dowonloadAttendanceList };
