const router = require('express').Router();
const { addItem, getInventory } = require('../Controllers/inventory.controller')
const { auth } = require("../Controllers/auth.controller")
router.post("/api/inventory/addToInventory", auth, addItem);
router.post("/api/inventory/listInventory", auth, getInventory);
// router.post("/api/inventory/me", inventory, me);
// router.delete("/api/inventory/logout", logout)
// router.post("/api/inventory/deleteAccount", auth, deleteAccount)

module.exports = router; 
