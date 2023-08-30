import { Router } from "express";
const router = Router();

import {
	verifyPayment,
	editUser,
	usersList,
	getRolesAndPermissions,
	verifyAccessToResorce,
	setUserInfo,
	getDeptList,
	getSkillsAndEvents,
	downloadUsersList,

} from "../Controllers/users.controller";
import { auth, userStatus } from "../Controllers/auth.controller";
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

export default router;
