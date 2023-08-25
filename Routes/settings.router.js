const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller");
const { updateSettings, getSettings } = require('../Controllers/settings.controller');

router.post("/api/settings/updateSettings", auth, updateSettings);
router.get("/api/settings/getSettings", auth, getSettings);


module.exports = router
