import { Router } from "express";
const router = Router();

import {
	verifyAccessToEvents,
	addEvent,
	editEvent,
	deleteEvent,
	registerForEvent,
	verifyAccess,
	getEvents,
} from "../Controllers/events.controller";
import { auth, userStatus } from "../Controllers/auth.controller";

router.post(
	"/api/events/addEvents",
	auth,
	userStatus,
	verifyAccessToEvents,
	addEvent
);
router.post("/api/events/getAllEvents", auth, userStatus, getEvents);
router.post(
	"/api/events/editEventById",
	auth,
	userStatus,
	verifyAccessToEvents,
	editEvent
);
router.post(
	"/api/events/deleteEventById",
	auth,
	userStatus,
	verifyAccessToEvents,
	deleteEvent
);
router.post("/api/events/register", auth, registerForEvent);
router.post(
	"/api/events/verifyAccess",
	auth,
	verifyAccessToEvents,
	verifyAccess
);

export default router;
