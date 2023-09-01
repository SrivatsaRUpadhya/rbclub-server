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
			subject: "Registration successful",
			html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Robotics Club Nitte!</title>
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
            display: inline-block;
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
            <h1>Welcome to Robotics Club Nitte!</h1>
        </div>

        <div class="content">
            <p>Dear member,</p>

            <p>Congratulations and a warm welcome to Robotics Club Nitte! We're excited to have you on board and look forward to an incredible journey together. Your registration process is now complete, and we're thrilled to officially welcome you to our community.</p>

            <p>Here are the key details you need to know:</p>

            <ol>
                <li><strong>Access to Dashboard:</strong> You now have full access to the dashboard of our website. Here, you'll find a wealth of resources, updates, and information about upcoming events, workshops, and projects. Feel free to explore and make the most of this platform.</li>
                <li><strong>Workshop Details:</strong> We're currently finalizing the details for our upcoming workshops. Rest assured, you'll be among the first to receive information about these exciting learning opportunities. Stay tuned for emails with workshop schedules, topics, and registration instructions.</li>
                <li><strong>Stay Connected:</strong> As a member of Robotics Club Nitte, you're a vital part of our community. We encourage you to engage with fellow members, share your ideas, and collaborate on projects. Follow us on our social media channels to stay updated and connected.</li>
            </ol>

            <p>Once again, welcome to Robotics Club Nitte! If you have any questions, concerns, or suggestions, please don't hesitate to reach out to us.</p>

            <p>Here's to an inspiring and innovative journey ahead!</p>

            <p>Best regards,</p>
        </div>

        <div class="footer">
            <p>&copy; 2023 Robotics Club Nitte. All rights reserved. | For more information, visit our <a href="https://roboticsclubnitte.com/">website</a>.</p>
            <div class="social-icons">
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

export default sendMail ;
