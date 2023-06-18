const router = require('express').Router();
const { auth } = require("../Controllers/auth.controller");
const { addEvent, getEvents } = require('../Controllers/events.controller');
router.post("/api/inventory/addEvents", auth, addEvent);
router.post("/api/inventory/getAllEvents", auth, getEvents);
// router.post("/api/inventory/me", inventory, me);
// router.delete("/api/inventory/logout", logout)
// router.post("/api/inventory/deleteAccount", auth, deleteAccount)

module.exports = router; 
