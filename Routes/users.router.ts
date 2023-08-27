const router = require("express").Router();
const { auth, userStatus } = require("../Controllers/auth.controller.ts");
const {
	verifyPayment,
	editUser,
	usersList,
	getRolesAndPermissions,
	verifyAccessToResorce,
	setUserInfo,
	getDeptList,
	getSkillsList,
	getSkillsAndEvents,
} = require("../Controllers/users.controller.ts");

router.post(
	"/api/users/verifyPayment",
	auth,
	userStatus,
	verifyAccessToResorce,
	verifyPayment
);
router.post(
	"/api/users/editUser",
	auth,
	userStatus,
	verifyAccessToResorce,
	editUser
);
router.post(
	"/api/users/usersList",
	auth,
	userStatus,
	verifyAccessToResorce,
	usersList
);
router.post(
	"/api/users/getRolesAndPermissions",
	auth,
	userStatus,
	verifyAccessToResorce,
	getRolesAndPermissions
);
router.post("/api/users/setUserInfo", auth, setUserInfo);
router.post("/api/users/getDeptList", auth, getDeptList);
router.post("/api/users/getSkillsAndEvents", auth, getSkillsAndEvents);

module.exports = router;