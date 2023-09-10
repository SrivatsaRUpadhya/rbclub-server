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
exports.downloadUsersList = exports.getSkillsAndEvents = exports.getSkillsList = exports.getDeptList = exports.setUserInfo = exports.verifyAccessToResorce = exports.getRolesAndPermissions = exports.usersList = exports.verifyPayment = exports.editUser = void 0;
const secrets_1 = __importDefault(require("../utils/secrets"));
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const client_1 = require("@prisma/client");
const sendOTP_1 = __importDefault(require("../utils/sendOTP"));
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const verifyAccessToResorce = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const isAllowed = yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        if (user.hasAccessTo === "ADMIN" ||
            user.hasAccessTo === "SUPERUSER") {
            return true;
        }
        res.status(403).json({
            message: "Oops! You don't have access to this",
        });
        return false;
    }));
    isAllowed && next();
});
exports.verifyAccessToResorce = verifyAccessToResorce;
const getRolesAndPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res.status(200).json({
            message: "success",
            data: { roles: client_1.roles, permissions: client_1.accesses },
        });
    }));
});
exports.getRolesAndPermissions = getRolesAndPermissions;
const getSkillsAndEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const Events = yield db_1.default.events.findMany({
            select: {
                eventID: true,
                eventName: true,
            },
        });
        return res
            .status(200)
            .json({ message: "success", data: { Skills: client_1.skills, Events } });
    }));
});
exports.getSkillsAndEvents = getSkillsAndEvents;
const getDeptList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res
            .status(200)
            .json({ message: "success", Departments: client_1.courses });
    }));
});
exports.getDeptList = getDeptList;
const getSkillsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res.status(200).json({ message: "success", skills: client_1.skills });
    }));
});
exports.getSkillsList = getSkillsList;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.users.findMany({
        select: {
            id: false,
            userID: true,
            IDCardNum: true,
            name: true,
            usn: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            hasAccessTo: true,
            paymentID: true,
            paymentStatus: true,
        },
    });
});
const usersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res
            .status(200)
            .json({ message: "success", data: yield getAllUsers() });
    }));
});
exports.usersList = usersList;
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { newAccess, userToUpdate, NewRole } = req.body;
        yield db_1.default.users.update({
            where: {
                userID: userToUpdate,
            },
            data: {
                hasAccessTo: newAccess,
                role: NewRole,
            },
        });
        return res
            .status(200)
            .json({ message: "success", data: yield getAllUsers() });
    }));
});
exports.editUser = editUser;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userToVerify } = req.body;
        yield db_1.default.users.update({
            where: {
                userID: userToVerify,
            },
            data: {
                paymentStatus: "RECEIVED",
            },
        });
        const user = yield db_1.default.users.findUnique({
            where: {
                userID: userToVerify,
            },
            select: { email: true },
        });
        yield (0, sendOTP_1.default)(zod_1.z.string().parse(user === null || user === void 0 ? void 0 : user.email));
        return res
            .status(200)
            .json({ message: "success", data: yield getAllUsers() });
    }));
});
exports.verifyPayment = verifyPayment;
const setUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { Department, Name, YearOfStudy, Skills, USN, Phone, DOB, PaymentID, } = req.body;
        let profileStatus = false;
        if (Department !== null &&
            Name !== null &&
            YearOfStudy !== null &&
            Skills !== null &&
            USN !== null &&
            Phone !== null &&
            DOB !== null) {
            profileStatus = true;
        }
        else {
            return res
                .status(200)
                .json({ message: "Please fill in all the details!" });
        }
        yield db_1.default.users.update({
            where: {
                email: res.locals.email,
            },
            data: {
                name: Name,
                usn: USN,
                skills: Skills,
                yearOfStudy: YearOfStudy ? parseInt(YearOfStudy) : undefined,
                phone: Phone,
                dob: DOB ? new Date(DOB) : undefined,
                course: Department,
                paymentID: PaymentID,
                isProfileComplete: profileStatus,
            },
        });
        if (PaymentID) {
            res.clearCookie("accessToken", {
                expires: new Date(Date.now() + 3600000 * 24),
                domain: secrets_1.default.serverURL,
                path: "/api",
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
        }
        res.status(200).json({ message: "success" });
    }));
});
exports.setUserInfo = setUserInfo;
const downloadUsersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { Type } = req.body;
        if (res.locals.user.hasAccessTo === "ADMIN" ||
            res.locals.user.hasAccessTo === "SUPERUSER") {
            try {
                yield fs_1.default.promises.appendFile("list.csv", `Name,RCNID,USN,Email,Phone,RegisteredOn,PaymentID,PaymentStatus`);
                var users = [];
                if (Type == "RECEIVED") {
                    users = yield db_1.default.users.findMany({
                        where: {
                            paymentStatus: "RECEIVED",
                        },
                        select: {
                            id: false,
                            userID: true,
                            IDCardNum: true,
                            name: true,
                            usn: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            hasAccessTo: true,
                            paymentID: true,
                            paymentStatus: true,
                        },
                    });
                }
                else {
                    users = yield getAllUsers();
                }
                yield Promise.all(users.map((element) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        yield fs_1.default.promises.appendFile("list.csv", `${os_1.default.EOL}${element.name},${element.IDCardNum},${element.usn},${element.email},${element.phone},${element.createdAt},${element.paymentID},${element.paymentStatus}`);
                    }
                    catch (error) {
                        throw error;
                    }
                })));
                res.download("list.csv", (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                yield fs_1.default.promises.rm("list.csv");
            }
            catch (error) {
                console.log(error);
                return res.status(200).json({ message: "An error occurred!" });
            }
        }
        else {
            return res.status(403).json({ message: "Not Authorized!" });
        }
    }));
});
exports.downloadUsersList = downloadUsersList;
