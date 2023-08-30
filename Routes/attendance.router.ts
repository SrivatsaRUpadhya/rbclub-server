import { auth, userStatus } from "../Controllers/auth.controller";
import { Router } from "express";
const router  = Router()

import {
	updateAttendance,
	getAttendanceList,
	dowonloadAttendanceList,
} from "../Controllers/attendance.controller";

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

export default router;
