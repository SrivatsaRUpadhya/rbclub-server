const router = require("express").Router();
import {
	register,
	me,
	logout,
	auth,
	deleteAccount,
	userStatus,
	deleteUserById,
} from "../Controllers/auth.controller";

router.post("/api/auth/register", register);
router.post("/api/auth/me", auth, userStatus, me);
router.delete("/api/auth/logout", logout);
router.post("/api/auth/deleteAccount", auth, userStatus, deleteAccount);
router.post("/api/auth/deleteAccountByUserId", auth, userStatus, deleteUserById);

export default router;
