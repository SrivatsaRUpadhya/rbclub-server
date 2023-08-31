"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const auth_controller_1 = require("../Controllers/auth.controller");
const settings_controller_1 = require("../Controllers/settings.controller");
router.post("/api/settings/updateSettings", auth_controller_1.auth, auth_controller_1.userStatus, settings_controller_1.updateSettings);
router.get("/api/settings/getSettings", auth_controller_1.auth, auth_controller_1.userStatus, settings_controller_1.getSettings);
exports.default = router;
