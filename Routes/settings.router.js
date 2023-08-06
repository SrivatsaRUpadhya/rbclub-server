const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller");
const { updateSettings } = require('../Controllers/settings.controller');

router.post("/api/settings/updateSettings", auth, updateSettings);

module.exports = router
