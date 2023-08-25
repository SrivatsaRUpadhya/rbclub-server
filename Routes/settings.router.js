const router = require('express').Router();
const { auth, userStatus } = require("../Controllers/auth.controller");
const { updateSettings, getSettings } = require('../Controllers/settings.controller');

router.post("/api/settings/updateSettings", auth,userStatus, updateSettings);
router.get("/api/settings/getSettings", auth,userStatus, getSettings);


module.exports = router
