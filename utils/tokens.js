const { google } = require("googleapis");
const asyncWrapper = require("./asyncWrapper");
const oauth2Client = require("./oauth2Client");
const jwt = require("jsonwebtoken");
const prisma = require("./db");
const handleTokens = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		console.log(req.query?.code || res.query?.error);
		const { tokens } = req.query.code
			? await oauth2Client.getToken(req.query.code)
			: undefined;
		console.log(tokens);
		//Store tokens in  db
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
		if (result) {
			return res
				.status(200)
				.json({ message: "User Exists!", data: { result } });
		}
		const allUsers = await prisma.users.findMany();
		const prevUser = allUsers.length > 0 ? allUsers[allUsers.length - 1] : null;

		await prisma.users.create({
			data: {
				email: user.email,
				isVerified: user.email_verified,
				profileImg: user.picture,
				name: user.name,
				IDCardNum: prevUser.IDCardNum
					? generateUID(prevUser)
					: "RCN" + new Date().getFullYear() + "0A01",
				refreshToken:tokens.refresh_token,
				access_token:tokens.access_token
			},
		});
	});
};

module.exports = handleTokens;
