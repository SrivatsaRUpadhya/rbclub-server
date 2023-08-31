"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drive_controller_1 = require("../Controllers/drive.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/api/drive/listFiles", drive_controller_1.getFilesList);
//router.post("/api/auth/me", auth, me);
//router.delete("/api/auth/logout", logout)
//router.post("/api/auth/deleteAccount",auth, deleteAccount)
exports.default = router;
