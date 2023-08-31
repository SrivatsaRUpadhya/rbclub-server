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
const googleapis_1 = require("googleapis");
const oauth2Client_1 = __importDefault(require("../utils/oauth2Client"));
const asyncWrapper_1 = __importDefault(require("../utils/asyncWrapper"));
const getFilesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, asyncWrapper_1.default)(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { FileType } = req.body;
        const access_token = yield oauth2Client_1.default.getAccessToken();
        console.log(access_token);
        oauth2Client_1.default.setCredentials({
            access_token: access_token.token,
        });
        const driveInstance = googleapis_1.google.drive("v3");
        const folderToAccess = FileType;
        const folderID = yield driveInstance.files.list({
            auth: oauth2Client_1.default,
            q: `mimeType='application/vnd.google-apps.folder' and name contains ${folderToAccess}`,
            fields: "files(id)",
        });
        const results = yield driveInstance.files.list({
            auth: oauth2Client_1.default,
            q: `parents in ${folderID}`,
            fields: "files(name,webViewLink,thumbnailLink)",
        });
        console.log({ folderID, results });
        res.status(200).json({ message: "success", data: results.data });
    }));
});
exports.getFilesList = getFilesList;
