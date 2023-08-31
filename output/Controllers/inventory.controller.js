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
exports.deleteItem = exports.editItem = exports.getInventoryCategories = exports.verifyAccessToInventory = exports.getInventory = exports.addItem = void 0;
const db_1 = __importDefault(require("../utils/db"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const client_1 = require("@prisma/client");
const verifyAccessToInventory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.users.findUnique({
            where: { email: res.locals.email },
        });
        if ((user === null || user === void 0 ? void 0 : user.hasAccessTo) == "ADMIN" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) == "INVENTORY" ||
            (user === null || user === void 0 ? void 0 : user.hasAccessTo) === "SUPERUSER") {
            res.locals.user = user;
            return next();
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred!" });
    }
});
exports.verifyAccessToInventory = verifyAccessToInventory;
const fetchInventory = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.inventory.findMany({
            select: {
                id: false,
                itemID: true,
                itemName: true,
                quantity: true,
                catagory: true,
                condition: true,
                remarks: true,
                user_ID: true,
                createdAt: true,
            },
        });
    }
    catch (error) {
        return null;
    }
});
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { List } = req.body;
        const user = res.locals.user;
        function addItems() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    List.map((element) => __awaiter(this, void 0, void 0, function* () {
                        yield db_1.default.inventory.create({
                            data: {
                                quantity: parseInt(element.Quantity),
                                catagory: element.Catagory,
                                itemName: element.Name,
                                condition: element.Condition,
                                remarks: element.Remarks,
                                user: {
                                    connect: {
                                        userID: user.userID,
                                    },
                                },
                            },
                        });
                    }));
                }
                catch (error) {
                    throw error;
                }
            });
        }
        yield addItems();
        const inventoryItems = yield fetchInventory();
        return res
            .status(200)
            .json({ message: "success", data: inventoryItems });
    }));
});
exports.addItem = addItem;
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(200).json({
            message: "success",
            data: yield fetchInventory(),
        });
    }));
});
exports.getInventory = getInventory;
const getInventoryCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res
            .status(200)
            .json({ message: "success", categories: client_1.inventory_catagories });
    }));
});
exports.getInventoryCategories = getInventoryCategories;
const editItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { ItemID, Quantity, Catagory, ItemName, Condition, Remarks } = req.body;
        yield db_1.default.inventory.update({
            where: {
                itemID: ItemID,
            },
            data: {
                quantity: Quantity ? parseInt(Quantity) : undefined,
                catagory: Catagory,
                itemName: ItemName,
                remarks: Remarks,
                condition: Condition,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.editItem = editItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { itemID } = req.body;
        yield db_1.default.inventory.delete({
            where: {
                itemID,
            },
        });
        return res.status(200).json({ message: "success" });
    }));
});
exports.deleteItem = deleteItem;
