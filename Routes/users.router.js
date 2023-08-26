const router = require("express").Router();
const { auth, userStatus } = require("../Controllers/auth.controller");
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
	downloadUsersList,
} = require("../Controllers/users.controller");

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
router.get("/api/users/downloadUsersList", auth, userStatus, downloadUsersList);

module.exports = router;
