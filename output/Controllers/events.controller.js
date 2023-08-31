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
exports.deleteEvent = exports.registerForEvent = exports.editEvent = exports.verifyAccessToEvents = exports.getEvents = exports.addEvent = void 0;
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const zod_1 = require("zod");
const auth_controller_1 = require("./auth.controller");
const verifyAccessToEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        if ((user === null || user === void 0 ? void 0 : user.hasAccessTo) === "ADMIN" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) === "EVENTS" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) === "SUPERUSER") {
            res.locals.user = user;
            return next();
        }
        return res.status(403).json({
            message: "Oops! You don't have access to this",
        });
    }
    catch (error) {
        return res.status(500).json({ message: "An error occurred!" });
    }
});
exports.verifyAccessToEvents = verifyAccessToEvents;
const fetchEvents = (fetchType) => __awaiter(void 0, void 0, void 0, function* () {
    return fetchType == "Admin"
        ? yield db_1.default.events.findMany({
            select: {
                id: false,
                users: {
                    select: {
                        userID: true,
                        name: true,
                        usn: true,
                    },
                },
                eventID: true,
                catagory: true,
                desc: true,
                eventName: true,
                eventDate: true,
                max_entries: true,
            },
        })
        : yield db_1.default.events.findMany({
            select: {
                id: false,
                users: false,
                eventID: true,
                catagory: true,
                desc: true,
                eventName: true,
                eventDate: true,
                max_entries: true,
            },
        });
});
const addEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { List } = req.body;
        List.map((element) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield db_1.default.events.create({
                    data: {
                        eventName: element.Name,
                        catagory: element.Catagory,
                        desc: element.Description,
                        eventDate: new Date(element.Date),
                        max_entries: parseInt(element.MaxEntries),
                    },
                });
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        }));
        const inventoryItems = yield fetchEvents();
        return res
            .status(200)
            .json({ message: "success", data: inventoryItems });
    }));
});
exports.addEvent = addEvent;
const editEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { EventID, EventName, Catagory, Description, newDate, MaxEntries, } = req.body;
        yield db_1.default.events.update({
            where: {
                eventID: EventID,
            },
            data: {
                eventName: EventName,
                catagory: Catagory,
                desc: Description,
                eventDate: newDate ? new Date(newDate) : undefined,
                max_entries: MaxEntries ? parseInt(MaxEntries) : undefined,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.editEvent = editEvent;
const registerForEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { EventID } = req.body;
        if (!EventID) {
            return res.status(200).json({ message: "Invalid Request!" });
        }
        const email = res.locals.email;
        const user = yield (0, auth_controller_1.getUserByEmail)(email);
        const settings = yield db_1.default.settings.findFirst();
        if ((settings === null || settings === void 0 ? void 0 : settings.eventLimitPerUser) !== -1) {
            if (zod_1.z.number().parse((_a = user === null || user === void 0 ? void 0 : user.Events) === null || _a === void 0 ? void 0 : _a.length) >=
                zod_1.z.number().parse(settings === null || settings === void 0 ? void 0 : settings.eventLimitPerUser)) {
                return res.status(200).json({ message: "Limit reached!" });
            }
        }
        yield db_1.default.users.update({
            where: {
                email,
            },
            data: {
                Events: {
                    connect: {
                        eventID: EventID,
                    },
                },
            },
            include: {
                Events: true,
            },
        });
        yield db_1.default.events.update({
            where: {
                eventID: EventID,
            },
            data: {
                users: {
                    connect: {
                        userID: user === null || user === void 0 ? void 0 : user.userID,
                    },
                },
            },
            include: {
                users: true,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.registerForEvent = registerForEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { EventID } = req.body;
        yield db_1.default.events.delete({
            where: {
                eventID: EventID,
            },
        });
        res.status(200).json({ message: "success" });
    }));
});
exports.deleteEvent = deleteEvent;
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        if ((user === null || user === void 0 ? void 0 : user.hasAccessTo) === "ADMIN" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) === "EVENTS" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) === "SUPERUSER") {
            return res
                .status(200)
                .json({ message: "success", data: yield fetchEvents("Admin") });
        }
        return res
            .status(200)
            .json({ message: "success", data: yield fetchEvents() });
    }));
});
exports.getEvents = getEvents;
