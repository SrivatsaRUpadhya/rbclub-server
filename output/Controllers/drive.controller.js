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
exports.getFilesList = void 0;
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const driveService_1 = __importDefault(require("../utils/driveService"));
const getFilesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { WorkshopName } = req.body;
        const results = yield driveService_1.default.files.list({
            q: `name='${WorkshopName}'`,
            fields: "files(name,webViewLink,thumbnailLink)",
        });
        res.status(200).json({ message: "success", data: results.data });
    }));
});
exports.getFilesList = getFilesList;
