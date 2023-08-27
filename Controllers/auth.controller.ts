import * as jwt from "jsonwebtoken";
import oauth2Client from "../utils/oauth2Client";
import { Auth } from "googleapis";
import { Request, Response, RequestHandler, NextFunction } from "express";
import { z } from "zod";
import secrets from "../utils/secrets";
const { checkPassword, hashPassword } = require("../utils/passwords");
import prisma from "../utils/db";
const asyncWrapper = require("../utils/asyncWrapper");
const generateUID = require("../utils/generateUID");

const auth: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let { accessToken }: { accessToken: string } = req.cookies;
	if (!accessToken) {
		return res.status(401).json({ message: "Unauthorized Request!" });
	}
	try {
		const email = jwt.verify(
			z.string().parse(accessToken),
			secrets.accessTokenSecret
		);
		res.locals.email = email;
		next();
	} catch (error: jwt.TokenExpiredError | any) {
		if (error.name === "TokenExpiredError") {
			try {
				const email = z
					.string()
					.parse(jwt.verify(accessToken, secrets.accessTokenSecret));
				const user = await prisma.users.findFirst({
					where: {
						email,
					},
				});

				jwt.verify(
					z.string().parse(user?.refreshToken),
					secrets.refreshTokenSecret
				);
				accessToken = jwt.sign(
					{ data: email },
					secrets.accessTokenSecret,
					{
						expiresIn: "24h",
					}
				);
				res.cookie("accessToken", accessToken, {
					expires: new Date(Date.now() + 3600000 * 24),
					domain: serverURL,
					path: "/api",
					httpOnly: true,
					sameSite: "none",
					secure: true,
				});

				res.locals.email = email;
				next();
			} catch (error: jwt.TokenExpiredError | any) {
				console.log(error);
				if (error.message === "TokenExpiredError") {
					res.clearCookie("accessToken", {
						expires: new Date(Date.now() + 3600000 * 24),
						domain: serverURL,
						path: "/api",
						httpOnly: true,
						sameSite: "none",
						secure: true,
					});

					return res
						.status(401)
						.json({ message: "Session expired!" });
				}
				return res.status(500).json({ message: "An error occurred!" });
			}
		}
	}
};

const userStatus: RequestHandler = async (
	req: Request,
	res: Response,
	next
) => {
	const user = await getUserByEmail(res.locals.email);
	if (user && user.paymentStatus === "PENDING") {
		return res.status(200).json({
			message: "Incomplete Profile",
			user: {
				Name: user.name,
				ProfileImg: user.profileImg,
				Role: user.role,
				Email: user.email,
				Usn: user.usn,
				Permissions: user.hasAccessTo,
				Events: user.Events,
				ID: user.IDCardNum,
				Skills: user.skills,
				Phone: user.phone,
				Department: user.course,
				isProfileComplete: user.isProfileComplete,
				DOB: user.dob,
				YearOfStudy: user.yearOfStudy,
				PaymentID: user.paymentID,
				PaymentStatus: user.paymentStatus,
			},
		});
	}
	res.locals.user = user;
	return next();
};
const register = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: "offline",
			scope: [
				"https://www.googleapis.com/auth/userinfo.profile",
				"openid",
				"https://www.googleapis.com/auth/userinfo.email",
			],
			include_granted_scopes: true,
		});
		//console.log(authUrl);
		return res.status(200).json({ message: "success", authUrl });
	});
};

const handleRedirect = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		//Get tokens from AuthCode
		const authCode: string = z.string().parse(req.query.code);
		const { tokens } = await oauth2Client.getToken(authCode);
		const tokenResult = await oauth2Client.verifyIdToken({
			idToken: z.string().parse(tokens?.id_token),
			maxExpiry: z.number().parse(tokens?.expiry_date),
		});

		//Verify token and extract payload
		const user = tokenResult.getPayload();
		if (!user?.hd) {
			return res
				.status(200)
				.redirect(
					`${clientURL_2}/register?error=Please use organization email only`
				);
		}

		//Register or login the user
		const allUsers = await prisma.users.findMany();
		const prevUser =
			allUsers.length > 0 ? allUsers[allUsers.length - 1] : null;

		await prisma.users.upsert({
			where: {
				email: user.email,
			},
			create: {
				email: z.string().parse(user.email),
				isVerified: user.email_verified,
				profileImg: user.picture,
				name: user.family_name,
				IDCardNum: prevUser?.IDCardNum
					? generateUID(prevUser)
					: "RCN" + new Date().getFullYear() + "0A01",
				refreshToken: z.string().parse(tokens.refresh_token),
			},
			update: {
				email: user.email,
				isVerified: user.email_verified,
				profileImg: user.picture,
				name: user.family_name,
				IDCardNum: prevUser?.IDCardNum
					? generateUID(prevUser)
					: "RCN" + new Date().getFullYear() + "0A01",
			},
		});

		//Generate and send accessToken
		const accessToken = jwt.sign(
			{ data: user.email },
			secrets.accessTokenSecret,
			{
				expiresIn: "24h",
			}
		);

		res.cookie("accessToken", accessToken, {
			expires: new Date(Date.now() + 3600000 * 24),
			domain: serverURL,
			path: "/api",
			httpOnly: true,
			sameSite: "none",
			secure: true,
		});

		//Redirect back to register page
		return res.redirect(`${clientURL_2}/register`);
	});
};

const getUserByEmail = async (email: string) => {
	return await prisma.users.findUnique({
		where: {
			email,
		},
		select: {
			name: true,
			profileImg: true,
			role: true,
			dob: true,
			skills: true,
			yearOfStudy: true,
			hasAccessTo: true,
			usn: true,
			Events: {
				select: {
					eventID: true,
					eventDate: true,
					eventName: true,
				},
			},
			email: true,
			isProfileComplete: true,
			isVerified: true,
			IDCardNum: true,
			password: true,
			paymentID: true,
			phone: true,
			course: true,
			paymentStatus: true,
		},
	});
};

const me = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user = res.locals.user;
		res.status(200).json({
			user: {
				Name: user.name,
				ProfileImg: user.profileImg,
				Role: user.role,
				Email: user.email,
				Usn: user.usn,
				Permissions: user.hasAccessTo,
				Events: user.Events,
				ID: user.IDCardNum,
				Skills: user.skills,
				Phone: user.phone,
				Department: user.course,
				isProfileComplete: user.isProfileComplete,
				DOB: user.dob,
				YearOfStudy: user.yearOfStudy,
				PaymentID: user.paymentID,
				PaymentStatus: user.paymentStatus,
			},
			message: "success",
		});
	});
};

const logout = (req: Request, res: Response) => {
	res.clearCookie("accessToken", {
		expires: new Date(Date.now() + 3600000 * 24),
		domain: serverURL,
		path: "/api",
		httpOnly: true,
		sameSite: "none",
		secure: true,
	});
	return res.status(200).json({ message: "success" });
};

const deleteAccount = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const email = res.locals.email;
		await prisma.users.delete({
			where: {
				email,
			},
		});
		res.clearCookie("accessToken", {
			expires: new Date(Date.now() + 3600000),
			domain: serverURL,
			path: "/api",
			httpOnly: true,
			sameSite: "none",
			secure: true,
		});
		return res.status(200).json({ message: "success" });
	});
};
export  {
	register,
	me,
	logout,
	auth,
	deleteAccount,
	getUserByEmail,
	handleRedirect,
	userStatus,
};
