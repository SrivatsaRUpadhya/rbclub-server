const router = require('express').Router();
const { auth, userStatus } = require("../Controllers/auth.controller");
const { addEvent, getEvents, verifyAccessToEvents, editEvent, registerForEvent, deleteEvent, verifyAccess } = require('../Controllers/events.controller');
router.post("/api/events/addEvents", auth,userStatus, verifyAccessToEvents, addEvent);
router.post("/api/events/getAllEvents", auth,userStatus, getEvents);
router.post("/api/events/editEventById", auth, userStatus,verifyAccessToEvents, editEvent);
router.post("/api/events/deleteEventById", auth,userStatus, verifyAccessToEvents, deleteEvent);
router.post("/api/events/register", auth,userStatus, registerForEvent);
router.post("/api/events/verifyAccess", auth,userStatus, verifyAccessToEvents, verifyAccess);

module.exports = router; 
