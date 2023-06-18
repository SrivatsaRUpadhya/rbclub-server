const router = require('express').Router();
const { addItem, getInventory, verifyAccessToInventory, getInventoryCategories } = require('../Controllers/inventory.controller')
const { auth } = require("../Controllers/auth.controller")
router.post("/api/inventory/addToInventory", auth, verifyAccessToInventory, addItem);
router.post("/api/inventory/listInventory", auth, verifyAccessToInventory, getInventory);
router.post("/api/inventory/getInventoryCategories", auth, verifyAccessToInventory, getInventoryCategories);
// router.post("/api/inventory/me", inventory, me);
// router.delete("/api/inventory/logout", logout)
// router.post("/api/inventory/deleteAccount", auth, deleteAccount)

module.exports = router; 
