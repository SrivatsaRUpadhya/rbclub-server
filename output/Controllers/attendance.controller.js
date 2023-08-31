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
exports.dowonloadAttendanceList = exports.getAttendanceList = exports.updateAttendance = void 0;
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const updateAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
            try {
                const { AttendanceList } = req.body;
                const update = Promise.all(AttendanceList.map((element) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        yield db_1.default.users.updateMany({
                            where: {
                                userID: element,
                            },
                            data: {
                                attendance: { increment: 1 },
                            },
                        });
                    }
                    catch (mapError) {
                        console.log(mapError);
                        throw mapError;
                    }
                })));
                yield update;
                return res.status(200).json({ message: "success" });
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        }
        else {
            return res.status(403).send("Not Authorized!");
        }
    }));
});
exports.updateAttendance = updateAttendance;
const getAttendanceList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
            try {
                const result = yield db_1.default.users.findMany({
                    select: { name: true, IDCardNum: true, attendance: true },
                });
                return res
                    .status(200)
                    .json({ message: "success", data: result });
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        }
        else {
            return res.status(403).send("Not Authorized!");
        }
    }));
});
exports.getAttendanceList = getAttendanceList;
const dowonloadAttendanceList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "SUPERUSER") {
            try {
                yield fs_1.default.promises.appendFile("list.csv", `Name,RCNID,Number of classes attended`);
                const users = yield db_1.default.users.findMany({
                    select: { name: true, IDCardNum: true, attendance: true },
                });
                yield Promise.all(users.map((element) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        yield fs_1.default.promises.appendFile("list.csv", `${os_1.default.EOL}${element.name},${element.IDCardNum},${element.attendance}`);
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
            return res.status(403).send("Not Authorized!");
        }
    }));
});
exports.dowonloadAttendanceList = dowonloadAttendanceList;
