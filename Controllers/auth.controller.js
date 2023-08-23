const jwt = require("jsonwebtoken");
const oauth2Client = require("../utils/oauth2Client");
const {
	accessTokenSecret,
	refreshTokenSecret,
	clientURL_2,
	clientURL_1,
} = require("../utils/secrets");
const { checkPassword, hashPassword } = require("../utils/passwords");
const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper");
const generateUID = require("../utils/generateUID");
const { google } = require("googleapis");

const auth = async (req, res, next) => {
	const { accessToken } = req.cookies;
	if (!accessToken) {
		return res.status(401).json({ message: "Unauthorized Request!" });
	}
	try {
		jwt.verify(accessToken, accessTokenSecret);
		res.locals.email = await jwt.decode(accessToken, accessTokenSecret)
			.data;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			try {
				const email = await jwt.decode(accessToken, accessTokenSecret)
					.data;
				await prisma.users.findFirst({
					where: {
						email,
					},
				});

				if (jwt.verify(user.refreshToken, refreshTokenSecret)) {
					accessToken = jwt.sign({ data: email }, accessTokenSecret, {
						expiresIn: "1h",
					});
					res.locals.email = await jwt.decode(
						accessToken,
						accessTokenSecret
					).data;
					next();
				}
			} catch (error) {
				console.log(error);
				if (error.message === "TokenExpiredError") {
					res.clearCookie("accessToken", {
						expires: new Date(Date.now() + 3600000),
						httpOnly: true,
						sameSite: "None",
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

const userStatus = async (req, res, next) => {
	const user = await getUserByEmail(res.locals.email);
	if (user && user.paymentStatus === "PENDING") {
		return res.status(200).json({
			message: "Incomplete Profile",
			user: await getUserByEmail(res.locals.email),
		});
	}
	res.locals.user = user;
	return next();
};
const register = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		//Wrap this inside an async wrapper
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

const handleRedirect = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		//	console.log(req.query?.code || res.query?.error);
		const { tokens } = req.query.code
			? await oauth2Client.getToken(req.query.code)
			: undefined;
		//Store tokens in  db
		//	console.log(tokens)
		const user = jwt.decode(tokens.id_token);
		const result = await prisma.users.findUnique({
			where: {
				email: user.email,
			},
			select: {
				id: false,
				name: true,
				usn: true,
				email: true,
				phone: true,
				dob: true,
				skills: true,
				isVerified: true,
				isProfileComplete: true,
				paymentStatus: true,
				yearOfStudy: true,
				course: true,
				Events: {
					select: {
						eventID: true,
					},
				},
			},
		});
		if (!result) {
			const allUsers = await prisma.users.findMany();
			const prevUser =
				allUsers.length > 0 ? allUsers[allUsers.length - 1] : null;

			await prisma.users.create({
				data: {
					email: user.email,
					isVerified: user.email_verified,
					profileImg: user.picture,
					name: user.name,
					IDCardNum: prevUser.IDCardNum
						? generateUID(prevUser)
						: "RCN" + new Date().getFullYear() + "0A01",
					refreshToken: tokens.refresh_token,
				},
			});
		}
		const accessToken = jwt.sign({ data: user.email }, accessTokenSecret, {
			expiresIn: "24h",
		});

		res.cookie("accessToken", accessToken, {
			expires: new Date(Date.now() + 3600000 * 24),
			path: "/api",
			httpOnly: true,
			sameSite: "lax",
			domain: "rbclub-server.onrender.com",
		});
		return res.redirect(`${clientURL_2}/register`);
	});
};

const getUserByEmail = async (email) => {
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

const me = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const email = res.locals.email;
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

const logout = (req, res) => {
	res.clearCookie("accessToken", {
		expires: new Date(Date.now() + 3600000),
		path: "/api",
		httpOnly: true,
		sameSite: "lax",
		domain: "rbclub-server.onrender.com",
	});
	return res.status(200).json({ message: "success" });
};

const deleteAccount = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const email = res.locals.email;
		const { Password } = req.body;
		const user = await getUserByEmail(email);
		if (await checkPassword(Password, user.password)) {
			await prisma.users.delete({
				where: {
					email,
				},
			});
			res.clearCookie("accessToken", {
				expires: new Date(Date.now() + 3600000),
				httpOnly: true,
				sameSite: "None",
				secure: true,
			});
			return res.status(200).json({ message: "success" });
		} else {
			return res.status(200).json({ message: "Incorrect password" });
		}
	});
};
module.exports = {
	register,
	me,
	logout,
	auth,
	deleteAccount,
	getUserByEmail,
	handleRedirect,
	userStatus,
};
