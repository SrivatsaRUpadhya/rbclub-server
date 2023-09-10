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
const zod_1 = require("zod");
const db_1 = __importDefault(require("../utils/db"));
const generateUID_1 = __importDefault(require("../utils/generateUID"));
const getData = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield db_1.default.events.findMany({
        select: {
            eventName: true,
            users: {
                select: {
                    paymentStatus: true,
                    usn: true
                }
            }
        }
    });
    data.map(event => {
        var count = 0;
        event.users.map(user => {
            user.paymentStatus === "RECEIVED" ? count += 1 : count = count;
        });
        console.log(`${event.eventName} : ${count}`);
    });
});
const repeatEntries = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield db_1.default.users.findMany({
        select: {
            name: true,
            usn: true,
            Events: {
                select: { eventName: true, eventID: true }
            },
            email: true
        }
    });
    var count = 0;
    var names = [];
    Promise.all(data.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user.Events.length > 1) {
            count += 1;
            names.push(zod_1.z.string().parse(user === null || user === void 0 ? void 0 : user.name));
            yield db_1.default.users.update({
                where: {
                    email: user.email
                },
                data: {
                    Events: {
                        disconnect: {
                            eventID: user.Events[1].eventID
                        }
                    }
                }
            });
        }
    })));
    console.log(count);
    console.log(names);
});
const resetRcnIds = () => __awaiter(void 0, void 0, void 0, function* () {
    for (var i = 0; i < (yield db_1.default.users.count()); i++) {
        var prevUser = yield db_1.default.users.findFirst({ where: { IDCardNum: { not: "null" } }, take: -1 });
        var newid = prevUser
            ? (0, generateUID_1.default)(prevUser)
            : "RCN" + new Date().getFullYear() + "0A01";
        console.log(newid);
        const userToUpdate = yield db_1.default.users.findFirst({
            where: { IDCardNum: "null" }
        });
        yield db_1.default.users.update({
            where: { email: userToUpdate === null || userToUpdate === void 0 ? void 0 : userToUpdate.email },
            data: { IDCardNum: newid }
        });
    }
});
const clearIds = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.users.updateMany({
        data: { IDCardNum: "null" }
    });
    console.log(yield db_1.default.users.count());
});
//getData();
//repeatEntries();
//clearIds();
resetRcnIds();
