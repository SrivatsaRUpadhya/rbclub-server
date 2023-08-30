import secrets from "../utils/secrets";
import prisma from "../utils/db";
import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response, NextFunction } from "express";
import { roles, accesses, skills, courses } from "@prisma/client";
import sendMail from "../utils/sendOTP";
import { z } from "zod";
const verifyAccessToResorce = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const isAllowed = await asyncWrapper(
		req,
		res,
		async (req: Request, res: Response) => {
			const user = res.locals.user;
			if (
				user.hasAccessTo === "ADMIN" ||
				user.hasAccessTo === "SUPERUSER"
			) {
				return true;
			}
			res.status(403).json({
				message: "Oops! You don't have access to this",
			});
			return false;
		}
	);
	isAllowed && next();
};

const getRolesAndPermissions = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		return res.status(200).json({
			message: "success",
			data: { roles, permissions: accesses },
		});
	});
};

const getSkillsAndEvents = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
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

const getDeptList = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		return res
			.status(200)
			.json({ message: "success", Departments: courses });
	});
};

const getSkillsList = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		return res.status(200).json({ message: "success", skills });
	});
};
const getAllUsers = async () => {
	return await prisma.users.findMany({
		select: {
			id: false,
			userID: true,
			IDCardNum: true,
			name: true,
			usn: true,
			email: true,
			phone: true,
			role: true,
			createdAt: true,
			hasAccessTo: true,
			paymentID: true,
			paymentStatus: true,
		},
	});
};

const usersList = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		return res
			.status(200)
			.json({ message: "success", data: await getAllUsers() });
	});
};

const editUser = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
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

const verifyPayment = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
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
		await sendMail(z.string().parse(user?.email));
		return res
			.status(200)
			.json({ message: "success", data: await getAllUsers() });
	});
};

const setUserInfo = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
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
		} else {
			return res
				.status(200)
				.json({ message: "Please fill in all the details!" });
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
				domain: secrets.serverURL,
				path: "/api",
				httpOnly: true,
				sameSite: "none",
				secure: true,
			});
		}
		res.status(200).json({ message: "success" });
	});
};

const downloadUsersList = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		if (
			res.locals.user.hasAccessTo === "ADMIN" ||
			res.locals.user.hasAccessTo === "SUPERUSER"
		) {
			try {
				await fs.promises.appendFile(
					"list.csv",
					`Name,RCNID,USN,Email,Phone,RegisteredOn,PaymentID,PaymentStatus`
				);

				const users = await getAllUsers();
				await Promise.all(
					users.map(async (element) => {
						try {
							await fs.promises.appendFile(
								"list.csv",
								`${os.EOL}${element.name},${element.IDCardNum},${element.usn},${element.email},${element.phone},${element.createdAt},${element.paymentID},${element.paymentStatus}`
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
			return res.status(403).json({ message: "Not Authorized!" });
		}
	});
};
export {
	editUser,
	verifyPayment,
	usersList,
	getRolesAndPermissions,
	verifyAccessToResorce,
	setUserInfo,
	getDeptList,
	getSkillsList,
	getSkillsAndEvents,
	downloadUsersList,
};
