"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const oauth2Client_1 = __importDefault(require("./oauth2Client"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = __importDefault(require("./secrets"));
const zod_1 = require("zod");
const remind = () => __awaiter(void 0, void 0, void 0, function* () {
    const notPaidUsers = yield db_1.default.users.findMany({
        where: { paymentID: null },
        select: { email: true },
    });
    console.log(notPaidUsers[0]);
    console.log(notPaidUsers.length);
    console.log("------------------------------");
    var notPaidEmails = [];
    notPaidUsers.map((user) => {
        notPaidEmails.push(user.email);
    });
    const to = notPaidEmails.shift();
    return { to, bcc: notPaidEmails };
});
remind();
//Send the email containg the otp
function sendMail() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { to, bcc } = yield remind();
            const access_Token = yield oauth2Client_1.default.getAccessToken();
            //Create nodemailer transport object
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: "roboticsclub@nmamit.in",
                    clientId: secrets_1.default.googleID,
                    clientSecret: secrets_1.default.googleSecret,
                    refreshToken: secrets_1.default.googleRefreshToken,
                    accessToken: zod_1.z.string().parse(access_Token.token),
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
            yield transporter.sendMail(message);
        }
        catch (error) {
            console.log(error);
            return -1;
        }
    });
}
sendMail();
