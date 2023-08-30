import { Router } from "express";
const router = Router()
const { auth, userStatus } = require("../Controllers/auth.controller");
const {
	updateAttendance,
	getAttendanceList,
	dowonloadAttendanceList,
} = require("../Controllers/attendance.controller");

router.post(
	"/api/attendance/submitAttendance",
	auth,
	userStatus,
	updateAttendance
);
router.get(
	"/api/attendance/getAttendanceList",
	auth,
	userStatus,
	getAttendanceList
);
router.get(
	"/api/attendance/downloadAttendance",
	auth,
	userStatus,
	dowonloadAttendanceList
);

module.exports = router;
