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
exports.getExpenseByUser = exports.addExpense = exports.deleteExpense = exports.getAllExpenses = void 0;
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const findExpensesByUser = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.expenses.findMany({
            where: {
                user_ID: userID,
            },
            select: {
                user_ID: true,
                desc: true,
                catagory: true,
                expenseID: true,
                price: true,
                status: true,
                createdAt: true,
            },
        });
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
const getExpenseByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.user;
        const expenses = yield findExpensesByUser(user.userID);
        return res.status(200).json({ message: "success", expenses });
    }));
});
exports.getExpenseByUser = getExpenseByUser;
const addExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { List, Catagory } = req.body;
        let amount = 0;
        List.map((element) => {
            amount += parseFloat(element.Price);
        });
        if (amount == 0) {
            return res
                .status(200)
                .json({ message: "Please enter appropriate data" });
        }
        const user = res.locals.user;
        yield db_1.default.expenses.create({
            data: {
                desc: JSON.stringify(List),
                catagory: Catagory,
                price: amount,
                status: "PENDING",
                user: {
                    connect: {
                        userID: user.userID,
                    },
                },
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.addExpense = addExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { expenseID } = req.body;
        if (!expenseID)
            return res.send(403).json({ message: "Invalid request!" });
        yield db_1.default.expenses.delete({
            where: {
                expenseID,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.deleteExpense = deleteExpense;
const getAllExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const allExpenses = yield db_1.default.expenses.findMany({
            select: {
                user_ID: true,
                desc: true,
                expenseID: true,
                price: true,
                status: true,
                createdAt: true,
            },
        });
        return res.status(200).json({ message: "success", allExpenses });
    }));
});
exports.getAllExpenses = getAllExpenses;
