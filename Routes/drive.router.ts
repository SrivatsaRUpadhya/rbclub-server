import { getFilesList } from '../Controllers/drive.controller';
import { Router } from "express";
const router = Router();

router.post("/api/drive/listFiles", getFilesList);
//router.post("/api/auth/me", auth, me);
//router.delete("/api/auth/logout", logout)
//router.post("/api/auth/deleteAccount",auth, deleteAccount)

export default  router; 
