"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_1 = __importDefault(require("./secrets"));
const googleapis_1 = require("googleapis");
const oauth2Client = new googleapis_1.google.auth.OAuth2(secrets_1.default.googleID, secrets_1.default.googleSecret, secrets_1.default.oauthRedirectURL);
oauth2Client.setCredentials({ refresh_token: secrets_1.default.googleRefreshToken });
exports.default = oauth2Client;
