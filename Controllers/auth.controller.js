const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret, serverURL, clientURL } = require("../utils/secrets");
const { checkPassword, hashPassword } = require('../utils/passwords');
const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper")
//const { roles, accesses } = require("@prisma/client");
const { sendMail } = require('../utils/sendOTP');
const generateUID = require("../utils/generateUID");
const otpList = new Map();

const auth = async (req, res, next) => {
	const { accessToken } = req.cookies;
	if (!accessToken) {
		return res.status(401).json({ message: "Unauthorized Request!" })
	}
	try {
		jwt.verify(accessToken, accessTokenSecret)
		res.locals.email = await jwt.decode(accessToken, accessTokenSecret).data;
		next();
	}
	catch (error) {
		if (error.name === "TokenExpiredError") {
			try {
				const email = await jwt.decode(accessToken, accessTokenSecret).data;
				await prisma.users.findFirst({
					where: {
						email
					}
				})

				if (jwt.verify(user.refreshToken, refreshTokenSecret)) {
					accessToken = jwt.sign({ data: email }, accessTokenSecret, { expiresIn: '1h' });
					res.locals.email = await jwt.decode(accessToken, accessTokenSecret).data;
					next();
				}
			} catch (error) {
				console.log(error);
				if (error.message === "TokenExpiredError") {
					res.clearCookie("accessToken", {
						expires: new Date(Date.now() + 3600000),
						httpOnly: true,
						sameSite: "None",
						secure: true
					});
					return res.status(401).json({ message: "Session expired!" })
				}
				return res.status(500).json({ message: "An error occurred!" })

			}
		}
	}
}


const register = async (req, res) => {
	await asyncWrapper(req, res,
		async (req, res) => {
			//Wrap this inside an async wrapper
			const { Otp, Email, Password } = req.body;

			if(Email && !Otp && !Password){
				const user = await getUserByEmail(Email); 
				if (user && user.isVerified) {
					return res.status(200).json({ message: "User exists!", user })
				}else{
					if(!user){
						const allUsers = await prisma.users.findMany();
						const prevUser = allUsers.length > 0 ? allUsers[allUsers.length - 1] : null;

						const refreshToken = jwt.sign({ data: Email }, refreshTokenSecret, { expiresIn: '7d' });
						await prisma.users.create({
							data:{
								email:Email,
								refreshToken,
								IDCardNum: prevUser ? generateUID(prevUser) : ("RCN"+new Date().getFullYear()+"0A01")
							}
						})
					}

					const otp = await sendMail(Email)
					if(otp == -1){
						return res.status(200).json({message:"An Error Occurred"})
					}
					otpList.set(Email,otp);	

					const otpCookie = jwt.sign({data:Email},refreshTokenSecret, {expiresIn:'10m'});
					res.cookie("otpCookie",otpCookie, {
						expires: new Date(Date.now() + 600000),
						httpOnly: true,
						sameSite: "None",
						secure: true
					})
					return res.status(200).json({message:"OTP sent"})
				}
			}else if(!Email && !Password && Otp){
				const {otpCookie} = req.cookies;
				if(!otpCookie){					
					otpList.delete(email_from_cookie);
					return res.status(200).json({message:"OTP Expired"});
				}
				try{
					jwt.verify(otpCookie, refreshTokenSecret);
					const email_from_cookie = jwt.decode(otpCookie,refreshTokenSecret).data

					if(parseInt(Otp) === otpList.get(email_from_cookie)){

						otpList.delete(email_from_cookie);
						const accessToken = jwt.sign({ data: email_from_cookie }, accessTokenSecret, { expiresIn: '1h' });
						res.cookie("accessToken", accessToken, {
							expires: new Date(Date.now() + 3600000),
							httpOnly: true,
							sameSite: "None",
							secure: true
						});
						return res.status(200).json({message:"Verification Success"});
					}
					else{
						return res.status(200).json({message:"Invalid OTP"});
					}

				}
				catch(error){
					console.log(error);
					return res.status(200).json({message:"An error occurred!"});
				}
			}else if(Password){
				await auth(req,res);
				await prisma.users.update({
					where:{
						email:res.locals.email
					},
					data:{
						password:await hashPassword(Password)
					}

				})
				await prisma.users.update({
					where:{
						email: res.locals.email
					},
					data:{
						isVerified:true
					}
				})

				res.status(200).json({message:"success"});
			}
			else{
				return res.status(200).json({message:"Could not parse request!"})
			}
		})
}

const login = async (req, res) => {
	await asyncWrapper(req, res,
		async (req, res) => {
			//Wrap this inside an async wrapper
			const { Email, Password } = req.body;
			const user = await getUserByEmail(Email);

			if (user) {
				try {
					jwt.verify(user.refreshToken, refreshTokenSecret);
				} catch (error) {
					if (error.name === "TokenExpiredError") {
						const newRefreshToken = jwt.sign({ data: Email }, refreshTokenSecret, { expiresIn: '7d' });
						prisma.users.update({
							where: {
								email: Email
							},
							data: {
								refreshToken: newRefreshToken
							}
						})
					}
				}
				if(!user.password){
					return res.status(200).json({message:"Password not set.\nPlease verify your account and set up a new password!"});
				}
				if (await checkPassword(Password, user.password)) {
					const accessToken = jwt.sign({ data: Email }, accessTokenSecret, { expiresIn: '1h' });
					res.cookie("accessToken", accessToken, {
						expires: new Date(Date.now() + 3600000),
						httpOnly: true,
						sameSite: "None",
						secure: true
					});
					return res.status(200).json({ message: "success" });
				}
				else {
					return res.status(200).json({ message: "Ivalid credentials!" })
				}
			}

			return res.status(200).json({ message: "User Not Found!" })
		}
	)
}

const getUserByEmail = async(email) => {
	return await prisma.users.findUnique({
		where: {
			email
		},
			select: {
				name: true,
				profileImg: true,
				role: true,
				dob:true,
				interests:true,
				yearOfStudy:true,
				hasAccessTo:true,
				usn:true,
				Events:{
						select:{
							eventID:true,
							eventDate:true,
							eventName:true
						}
				},
				email: true,
				isProfileComplete: true,
				isVerified:true,
				IDCardNum:true,
				password:true,
				paymentID:true,
				paymentStatus:true,
			}
	});

}
const me = async (req, res) => {
	await asyncWrapper(req, res,
		async (req, res) => {
			const email = res.locals.email;
			const user = await getUserByEmail(email)			
			res.status(200).json({
				user: {
					Name: user.name,
					ProfileImg: user.profileImg,
					Role: user.role,
					Email: user.email,
					Usn:user.usn,
					Permissions:user.hasAccessTo,
					Events:user.Events,
					ID:user.IDCardNum,
					Interests:user.interests,
					PaymentID: user.paymentID
				}, message: "success"
			})
		}
	)
}

const logout = (req, res) => {
	res.clearCookie("accessToken", {
		expires: new Date(Date.now() + 3600000),
		httpOnly: true,
		sameSite: "None",
		secure: true
	});
	return res.status(200).json({ message: "success" })
}

const deleteAccount = async (req, res) => {
	await asyncWrapper(req, res,
		async (req, res) => {
			const email = res.locals.email;
			const { Password } = req.body;
			const user = await getUserByEmail(email);
			if (await checkPassword(Password, user.password)) {
				await prisma.users.delete({
					where: {
						email
					}
				})
				res.clearCookie("accessToken", {
					expires: new Date(Date.now() + 3600000),
					httpOnly: true,
					sameSite: "None",
					secure: true
				});
				return res.status(200).json({ message: "success" });
			}
			else {
				return res.status(200).json({ message: "Incorrect password" })
			}
		}
	)
}
module.exports = { register, login, me, logout, auth, deleteAccount, getUserByEmail };
