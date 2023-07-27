const oAuth2Client = require('./oauth2');
const nodemailer=require('nodemailer');
const {googleSecret,googleID,googleRefreshToken } = require('./secrets')

const CLIENT_ID = googleID
const CLIENT_SECRET = googleSecret
const REFRESH_TOKEN = googleRefreshToken

const otp = Math.floor(100000 + Math.random()*900000);
//Send the email containg the otp
async function sendMail(email) {
	try {
		const access_Token = await oAuth2Client.getAccessToken()

		//Create nodemailer transport object
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: 'roboticsclub@nmamit.in',
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: access_Token,
			}

		})

		//Generate message
		const message = {
			from: 'Robotics Club Nitte',
			to: email,
			subject: 'One Time Password to login',
			text: `Use ${otp} as one time password to verify your account.`,
		};

		await transporter.sendMail(message);
		return otp;
	}
	catch(error){
		console.log(error);
		return -1
	}
}

module.exports = {sendMail}
