const router = require('express').Router();
const { addItem, getInventory, verifyAccessToInventory, getInventoryCategories, editItem, deleteItem } = require('../Controllers/inventory.controller')
const { auth } = require("../Controllers/auth.controller")
router.post("/api/inventory/addToInventory", auth, verifyAccessToInventory, addItem);
router.post("/api/inventory/listInventory", auth, verifyAccessToInventory, getInventory);
router.post("/api/inventory/getInventoryCategories", auth, verifyAccessToInventory, getInventoryCategories);
router.post("/api/inventory/deleteItemById", auth, verifyAccessToInventory, deleteItem);
router.post("/api/inventory/editItemById", auth, verifyAccessToInventory, editItem);
module.exports = router; 
