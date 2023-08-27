const router = require('express').Router();
const { getFilesList } = require('../Controllers/drive.controller.ts');


router.post("/api/drive/listFiles", getFilesList);
//router.post("/api/auth/me", auth, me);
//router.delete("/api/auth/logout", logout)
//router.post("/api/auth/deleteAccount",auth, deleteAccount)

module.exports = router; 
