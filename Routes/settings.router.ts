import { Router } from "express";
const router = Router()

import { updateSettings, getSettings } from '../Controllers/settings.controller';

router.post("/api/settings/updateSettings", auth,userStatus, updateSettings);
router.get("/api/settings/getSettings", auth,userStatus, getSettings);


module.exports = router
