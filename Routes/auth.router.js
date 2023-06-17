const router = require('express').Router();
const { login, register, me, logout, auth, deleteAccount, verifyUser, editUserAccess } = require('../Controllers/auth.controller')

router.post("/api/auth/login", login);
router.post("/api/auth/register", register);
router.post("/api/auth/me", auth, me);
router.post("/api/auth/verifyUser", auth, verifyUser);
router.post("/api/auth/editUserAccess", auth, editUserAccess);
router.delete("/api/auth/logout", logout)
router.post("/api/auth/deleteAccount",auth, deleteAccount)

module.exports = router; 
