import { Router } from "express";
const router = Router()
import {auth,userStatus} from "../Controllers/auth.controller"
import { updateSettings, getSettings } from '../Controllers/settings.controller';

router.post("/api/settings/updateSettings", auth,userStatus, updateSettings);
router.get("/api/settings/getSettings", auth,userStatus, getSettings);


export default router
