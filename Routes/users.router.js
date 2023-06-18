const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller")
const { verifyUser, editUser, usersList, getRolesAndPermissions, verifyAccessToResorce } = require('../Controllers/users.controller')

router.post("/api/users/verifyUser", auth, verifyAccessToResorce, verifyUser);
router.post("/api/users/editUser", auth, verifyAccessToResorce, editUser);
router.post("/api/users/usersList", auth, verifyAccessToResorce, usersList);
router.post("/api/users/getRolesAndPermissions", auth, verifyAccessToResorce, getRolesAndPermissions);

module.exports = router; 
