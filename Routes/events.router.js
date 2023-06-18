const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller");
const { addEvent, getEvents, verifyAccessToEvents } = require('../Controllers/events.controller');
router.post("/api/events/addEvents", auth, verifyAccessToEvents, addEvent);
router.post("/api/events/getAllEvents", auth, verifyAccessToEvents, getEvents);
// router.post("/api/inventory/me", inventory, me);
// router.delete("/api/inventory/logout", logout)
// router.post("/api/inventory/deleteAccount", auth, deleteAccount)

module.exports = router; 
