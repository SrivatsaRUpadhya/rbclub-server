import oauth2Client from "./oauth2Client";
import nodemailer from "nodemailer";
import secrets from "./secrets";
import { z } from "zod";

//Send the email containg the otp
async function sendMail(email: string) {
	try {
		const access_Token = await oauth2Client.getAccessToken();
		//Create nodemailer transport object
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: "roboticsclub@nmamit.in",
				clientId: secrets.googleID,
				clientSecret: secrets.googleSecret,
				refreshToken: secrets.googleRefreshToken,
				accessToken: z.string().parse(access_Token.token),
			},
		});

		//Generate message
		const message = {
			from: "Robotics Club",
			to: email,
			subject: "Payment Verified",
			text: `Payment verified!`,
		};

		await transporter.sendMail(message);
	} catch (error) {
		console.log(error);
		return -1;
	}
}

export default sendMail ;
