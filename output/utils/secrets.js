"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const jwt = __importStar(require("jsonwebtoken"));
const zod_1 = require("zod");
const secrets = {
    port: process.env.PORT,
    accessTokenSecret: jwt.sign(zod_1.z.string().parse(process.env.ACCESS_TOKEN_SECRET), zod_1.z.string().parse(process.env.JWT_SECRET)),
    refreshTokenSecret: jwt.sign(zod_1.z.string().parse(process.env.REFRESH_TOKEN_SECRET), zod_1.z.string().parse(process.env.JWT_SECRET)),
    clientURL_1: process.env.CLIENT_URL_1,
    clientURL_2: process.env.CLIENT_URL_2,
    serverURL: process.env.SERVER_URL,
    googleID: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURL: process.env.REDIRECT_URL,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    oauthClientID: process.env.OAUTH_CLIENT_ID,
    oauthClientSecret: process.env.OAUTH_CLIENT_SECRET,
    oauthRedirectURL: process.env.OAUTH_REDIRECT_URL,
    googleAccessToken: process.env.GOOGLE_ACCESS_TOKEN
};
exports.default = secrets;
