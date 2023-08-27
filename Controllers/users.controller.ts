const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper");
const { roles, accesses, courses, skills } = require("@prisma/client");
const { sendMail } = require("../utils/sendOTP");
const { serverURL } = require("../utils/secrets");

const verifyAccessToResorce = async (req, res, next) => {
	const isAllowed = await asyncWrapper(req, res, async (req, res) => {
		const user = res.locals.user;
		if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
			return true;
		}
		res.status(403).json({
			message: "Oops! You don't have access to this",
		});
		return false;
	});
	isAllowed && next();
};

const getRolesAndPermissions = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		return res.status(200).json({
			message: "success",
			data: { roles, permissions: accesses },
		});
	});
};

const getSkillsAndEvents = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const Events = await prisma.events.findMany({
			select: {
				eventID: true,
				eventName: true,
			},
		});
		return res
			.status(200)
			.json({ message: "success", data: { Skills: skills, Events } });
	});
};

const getDeptList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		return res
			.status(200)
			.json({ message: "success", Departments: courses });
	});
};

const getSkillsList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		return res.status(200).json({ message: "success", skills });
	});
};
const getAllUsers = async () => {
	return await prisma.users.findMany({
		select: {
			id: false,
			userID: true,
			name: true,
			usn: true,
			email: true,
			phone: true,
			role: true,
			hasAccessTo: true,
			paymentID: true,
			paymentStatus: true,
		},
	});
};

const usersList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		return res
			.status(200)
			.json({ message: "success", data: await getAllUsers() });
	});
};

const editUser = async (req, res) => {
	asyncWrapper(req, res, async (req, res) => {
		const { newAccess, userToUpdate, NewRole } = req.body;
		await prisma.users.update({
			where: {
				userID: userToUpdate,
			},
			data: {
				hasAccessTo: newAccess,
				role: NewRole,
			},
		});
		return res
			.status(200)
			.json({ message: "success", data: await getAllUsers() });
	});
};

const verifyPayment = async (req, res) => {
	asyncWrapper(req, res, async (req, res) => {
		const { userToVerify } = req.body;
		await prisma.users.update({
			where: {
				userID: userToVerify,
			},
			data: {
				paymentStatus: "RECEIVED",
			},
		});
		const user = await prisma.users.findUnique({
			where: {
				userID: userToVerify,
			},
			select: { email: true },
		});
		await sendMail(user.email);
		return res
			.status(200)
			.json({ message: "success", data: await getAllUsers() });
	});
};

const setUserInfo = async (req, res) => {
	asyncWrapper(req, res, async (req, res) => {
		const {
			Department,
			Name,
			YearOfStudy,
			Skills,
			USN,
			Phone,
			DOB,
			PaymentID,
		} = req.body;
		let profileStatus = false;
		if (
			Department !== null &&
			Name !== null &&
			YearOfStudy !== null &&
			Skills !== null &&
			USN !== null &&
			Phone !== null &&
			DOB !== null
		) {
			profileStatus = true;
		}
		else{
			return res.status(200).json({message:"Please fill in all the details!"})
		}
		await prisma.users.update({
			where: {
				email: res.locals.email,
			},
			data: {
				name: Name,
				usn: USN,
				skills: Skills,
				yearOfStudy: YearOfStudy ? parseInt(YearOfStudy) : undefined,
				phone: Phone,
				dob: DOB ? new Date(DOB) : undefined,
				course: Department,
				paymentID: PaymentID,
				isProfileComplete: profileStatus,
			},
		});
		if (PaymentID) {
			res.clearCookie("accessToken", {
				expires: new Date(Date.now() + 3600000 * 24),
				domain: serverURL,
				path: "/api",
				httpOnly: true,
				sameSite: "None",
				secure: true,
			});
		}
		res.status(200).json({ message: "success" });
	});
};
module.exports = {
	editUser,
	verifyPayment,
	usersList,
	getRolesAndPermissions,
	verifyAccessToResorce,
	setUserInfo,
	getDeptList,
	getSkillsList,
	getSkillsAndEvents,
};
