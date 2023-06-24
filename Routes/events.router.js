const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller");
const { addEvent, getEvents, verifyAccessToEvents, editEvent, deleteEvent, verifyAccess } = require('../Controllers/events.controller');
router.post("/api/events/addEvents", auth, verifyAccessToEvents, addEvent);
router.post("/api/events/getAllEvents", auth, getEvents);
router.post("/api/events/editEventById", auth, verifyAccessToEvents, editEvent);
router.post("/api/events/deleteEventById", auth, verifyAccessToEvents, deleteEvent);
router.post("/api/events/verifyAccess", auth, verifyAccessToEvents, verifyAccess);

module.exports = router; 
