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
exports.deleteUserById = exports.userStatus = exports.handleRedirect = exports.getUserByEmail = exports.deleteAccount = exports.auth = exports.logout = exports.me = exports.register = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const oauth2Client_1 = __importDefault(require("../utils/oauth2Client"));
const zod_1 = require("zod");
const secrets_1 = __importDefault(require("../utils/secrets"));
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const generateUID_1 = __importDefault(require("../utils/generateUID"));
const customTypes_1 = require("../utils/customTypes");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { accessToken } = req.cookies;
    try {
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized Request!" });
        }
        const data = customTypes_1.jwtPayloadSchema.parse(jwt.verify(accessToken, secrets_1.default.accessTokenSecret));
        res.locals.email = data.data;
        next();
    }
    catch (error) {
        res.clearCookie("accessToken", {
            expires: new Date(Date.now() + 3600000 * 24),
            domain: secrets_1.default.serverURL,
            path: "/api",
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return res.status(401).json({ message: "Session expired!" });
    }
});
exports.auth = auth;
const userStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserByEmail(res.locals.email);
    if (user && user.paymentStatus === "PENDING") {
        return res.status(200).json({
            message: "Incomplete Profile",
            user: {
                Name: user.name,
                ProfileImg: user.profileImg,
                Role: user.role,
                Email: user.email,
                Usn: user.usn,
                Permissions: user.hasAccessTo,
                Events: user.Events,
                UserID: user.userID,
                RcnID: user.IDCardNum,
                Skills: user.skills,
                Phone: user.phone,
                Department: user.course,
                isProfileComplete: user.isProfileComplete,
                DOB: user.dob,
                YearOfStudy: user.yearOfStudy,
                PaymentID: user.paymentID,
                PaymentStatus: user.paymentStatus,
            },
        });
    }
    res.locals.user = user;
    return next();
});
exports.userStatus = userStatus;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const authUrl = oauth2Client_1.default.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
            include_granted_scopes: true,
        });
        //console.log(authUrl);
        return res.status(200).json({ message: "success", authUrl });
    }));
});
exports.register = register;
const handleRedirect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        //Get tokens from AuthCode
        const authCode = zod_1.z.string().parse(req.query.code);
        const { tokens } = yield oauth2Client_1.default.getToken(authCode);
        const tokenResult = yield oauth2Client_1.default.verifyIdToken({
            idToken: zod_1.z.string().parse(tokens === null || tokens === void 0 ? void 0 : tokens.id_token),
            maxExpiry: zod_1.z.number().parse(tokens === null || tokens === void 0 ? void 0 : tokens.expiry_date),
        });
        //Verify token and extract payload
        const user = tokenResult.getPayload();
        if (!(user === null || user === void 0 ? void 0 : user.hd)) {
            return res
                .status(200)
                .redirect(`${secrets_1.default.clientURL_2}/register?error=Please use organization email only`);
        }
        //Verify if user is from nmamit
        if (user.hd !== "nmamit.in") {
            return res
                .status(200)
                .redirect(`${secrets_1.default.clientURL_2}/register?error=Oops! Looks like you are not allowed to access this!. If you think this is an error please contact us at roboticsclub@nmamit.in.`);
        }
        //Register or login the user
        const allUsers = yield db_1.default.users.findMany();
        const prevUser = allUsers.length > 0 ? allUsers[allUsers.length - 1] : null;
        const data = yield getUserByEmail(zod_1.z.string().parse(user.email));
        if (data) {
            db_1.default.users.update({
                where: { email: user.email },
                data: {
                    email: user.email,
                    isVerified: user.email_verified,
                    profileImg: user.picture,
                    name: user.family_name,
                    IDCardNum: (prevUser === null || prevUser === void 0 ? void 0 : prevUser.IDCardNum)
                        ? (0, generateUID_1.default)(prevUser)
                        : "RCN" + new Date().getFullYear() + "0A01",
                },
            });
        }
        else {
            const settings = yield db_1.default.settings.findFirst();
            if (settings === null || settings === void 0 ? void 0 : settings.maintenanceMode) {
                return res
                    .status(200)
                    .redirect(`${secrets_1.default.clientURL_2}/register?error=Sorry, Registrations are no longer open!`);
            }
            yield db_1.default.users.create({
                data: {
                    email: zod_1.z.string().parse(user.email),
                    isVerified: user.email_verified,
                    profileImg: user.picture,
                    name: user.name,
                    IDCardNum: (prevUser === null || prevUser === void 0 ? void 0 : prevUser.IDCardNum)
                        ? (0, generateUID_1.default)(prevUser)
                        : "RCN" + new Date().getFullYear() + "0A01",
                    refreshToken: tokens.refresh_token,
                },
            });
        }
        //Generate and send accessToken
        const accessToken = jwt.sign({ data: zod_1.z.string().parse(user.email) }, secrets_1.default.accessTokenSecret, {
            expiresIn: "24h",
        });
        res.cookie("accessToken", accessToken, {
            expires: new Date(Date.now() + 3600000 * 24),
            domain: secrets_1.default.serverURL,
            path: "/api",
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        //Redirect back to register page
        return res.redirect(`${secrets_1.default.clientURL_2}/register`);
    }));
});
exports.handleRedirect = handleRedirect;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.users.findUnique({
            where: {
                email,
            },
            select: {
                email: true,
                dob: true,
                usn: true,
                name: true,
                role: true,
                phone: true,
                course: true,
                skills: true,
                userID: true,
                IDCardNum: true,
                paymentID: true,
                attendance: true,
                isVerified: true,
                profileImg: true,
                yearOfStudy: true,
                refreshToken: true,
                paymentStatus: true,
                hasAccessTo: true,
                isProfileComplete: true,
                Events: {
                    select: {
                        desc: true,
                        eventID: true,
                        eventName: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
exports.getUserByEmail = getUserByEmail;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        res.status(200).json({
            user: {
                Name: user.name,
                ProfileImg: user.profileImg,
                Role: user.role,
                Email: user.email,
                Usn: user.usn,
                Permissions: user.hasAccessTo,
                Events: user.Events,
                UserID: user.userID,
                RcnID: user.IDCardNum,
                Skills: user.skills,
                Phone: user.phone,
                Department: user.course,
                isProfileComplete: user.isProfileComplete,
                DOB: user.dob,
                YearOfStudy: user.yearOfStudy,
                PaymentID: user.paymentID,
                PaymentStatus: user.paymentStatus,
            },
            message: "success",
        });
    }));
});
exports.me = me;
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        expires: new Date(Date.now() + 3600000 * 24),
        domain: secrets_1.default.serverURL,
        path: "/api",
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "success" });
};
exports.logout = logout;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = res.locals.email;
        yield db_1.default.users.delete({
            where: {
                email,
            },
        });
        res.clearCookie("accessToken", {
            expires: new Date(Date.now() + 3600000),
            domain: secrets_1.default.serverURL,
            path: "/api",
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.deleteAccount = deleteAccount;
const deleteUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userID } = req.body;
        yield db_1.default.users.delete({
            where: {
                userID,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.deleteUserById = deleteUserById;
const select = {
    name: true,
    profileImg: true,
    role: true,
    dob: true,
    skills: true,
    yearOfStudy: true,
    hasAccessTo: true,
    usn: true,
    Events: {
        select: {
            eventID: true,
            eventDate: true,
            eventName: true,
        },
    },
    email: true,
    isProfileComplete: true,
    isVerified: true,
    IDCardNum: true,
    password: true,
    paymentID: true,
    phone: true,
    course: true,
    paymentStatus: true,
};
