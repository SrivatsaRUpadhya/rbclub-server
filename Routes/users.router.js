const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller")
const { verifyPayment, editUser, usersList, getRolesAndPermissions, verifyAccessToResorce, setUserInfo, getDeptList, getSkillsList,   getSkillsAndEvents } = require('../Controllers/users.controller')

router.post("/api/users/verifyPayment", auth, verifyAccessToResorce, verifyPayment);
router.post("/api/users/editUser", auth, verifyAccessToResorce, editUser);
router.post("/api/users/usersList", auth, verifyAccessToResorce, usersList);
router.post("/api/users/getRolesAndPermissions", auth, verifyAccessToResorce, getRolesAndPermissions);
router.post("/api/users/setUserInfo", auth,setUserInfo);
router.post("/api/users/getDeptList", auth,getDeptList);
router.post("/api/users/getDeptList", auth,getSkillsList);
router.post("/api/users/getSkillsAndEvents", auth, getSkillsAndEvents);

module.exports = router; 
