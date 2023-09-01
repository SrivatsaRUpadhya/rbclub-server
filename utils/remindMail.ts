import prisma from "./db";
import oauth2Client from "./oauth2Client";
import nodemailer from "nodemailer";
import secrets from "./secrets";
import { z } from "zod";

const remind = async () => {
	const notPaidUsers = await prisma.users.findMany({
		where: { paymentID: null },
		select: { email: true },
	});
	console.log(notPaidUsers[0]);
	console.log(notPaidUsers.length);
	console.log("------------------------------");
	var notPaidEmails: string[] = [];
	notPaidUsers.map((user) => {
		notPaidEmails.push(user.email);
	});
	const to = notPaidEmails.shift();
	return { to, bcc: notPaidEmails };
};

remind();

//Send the email containg the otp
async function sendMail() {
	try {
		const { to, bcc } = await remind();
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
			to,
			bcc,
			subject: "Urgent! Complete Your Robotics Club Registration Today",
			html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Robotics Club Nitte</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #303f9f;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }

        .content {
            padding: 20px;
        }

        .footer {
            background-color: #303f9f;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
        }

        .footer a {
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
        }

        .social-icons {
            margin-top: 10px;
            text-align: center;
        }

        .social-icons a {
            margin: 0 10px;
        }

        .logo {
            max-width: 150px;
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h1>Robotics Club Nitte</h1>
        </div>

        <div class="content">
            <p>Dear Student,</p>

            <p>We hope this email finds you well. We wanted to remind you that the registration for the Robotics Club is about to close, and we noticed that your registration is not yet complete. There are only a few slots left, and we wouldn't want you to miss out on this exciting opportunity.</p>

            <p>Completing your registration is easy for me. Follow these steps:</p>

            <p><strong>Visit Our Registration Page:</strong></p>
            <p>Go to <a href="https://dashboard.roboticsclubnitte.com/register">https://dashboard.roboticsclubnitte.com/register</a> to access the registration form.</p>

            <p><strong>Provide the Required Information:</strong></p>
            <p>Fill in the necessary details in the registration form. Make sure to double-check your contact information and all other fields marked as mandatory.</p>

            <p>Once your payment is completed make sure that you will provide the proper Transaction ID in the respective field given below the QR code.</p>

            <p>Remember, there are only a few slots left, and the registration will be closing very soon. Complete your registration today to secure your spot in the Robotics Club.</p>

            <p>"Unlock Your Potential with the Robotics Club Nitte!"</p>

            <p>Ignite your passion for robotics and innovation with us. Join a community of like-minded enthusiasts who are shaping the future of technology.</p>

            <p>If you are facing issues registering or for any queries, feel free to contact:</p>
            <p>Kanzal : +91 9902583612</p>
            <p>Shashank: +91 9483229302</p>

            <p>Thank you for your interest in the Robotics Club. We look forward to welcoming you as a member!</p>

            <p>Best regards,</p>
        </div>

        <div class="footer">
            <p>&copy; 2023 Robotics Club Nitte. All rights reserved. | For more information, visit our <a href="https://roboticsclubnitte.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">website</a>.</p>
            <div class="social-icons" style="margin-top: 10px; text-align: center;">
                <a href="https://www.instagram.com/roboticsclub_nitte/?hl=en" style="color: #007bff; text-decoration: none;">Instagram</a>
            </div>
        </div>
    </div>

</body>
</html>`,
		};

		await transporter.sendMail(message);
	} catch (error) {
		console.log(error);
		return -1;
	}
}
sendMail();
