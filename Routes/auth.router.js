const router = require('express').Router();
const { register, me, logout, auth, deleteAccount, userStatus} = require('../Controllers/auth.controller');


router.post("/api/auth/register", register);
router.post("/api/auth/me", auth,userStatus, me);
router.delete("/api/auth/logout", logout)
router.post("/api/auth/deleteAccount",auth,userStatus, deleteAccount)

module.exports = router; 
