const oAuth2Client = require('./oauth2Client');
const nodemailer=require('nodemailer');
const {googleSecret,googleID,googleRefreshToken } = require('./secrets')


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
				clientId: googleID,
				clientSecret: googleSecret,
				refreshToken: googleRefreshToken,
				accessToken: access_Token,
			}

		})

		//Generate message
		const message = {
			from: 'Robotics Club',
			to: email,
			subject: 'Payment Verified',
			text: `Payment verified!`
		};

		await transporter.sendMail(message);
	}
	catch(error){
		console.log(error);
		return -1
	}
}

module.exports = {sendMail}
