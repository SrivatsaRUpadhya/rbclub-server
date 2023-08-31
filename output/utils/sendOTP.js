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
const oauth2Client_1 = __importDefault(require("./oauth2Client"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = __importDefault(require("./secrets"));
const zod_1 = require("zod");
//Send the email containg the otp
function sendMail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
                to: email,
                subject: "Payment Verified",
                text: `Payment verified!`,
            };
            yield transporter.sendMail(message);
        }
        catch (error) {
            console.log(error);
            return -1;
        }
    });
}
exports.default = sendMail;
