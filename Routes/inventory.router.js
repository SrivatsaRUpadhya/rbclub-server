const router = require("express").Router();
const {
	addItem,
	getInventory,
	verifyAccessToInventory,
	getInventoryCategories,
	editItem,
	deleteItem,
} = require("../Controllers/inventory.controller");
const { auth, userStatus } = require("../Controllers/auth.controller");
router.post(
	"/api/inventory/addToInventory",
	auth,
	userStatus,
	verifyAccessToInventory,
	addItem
);
router.post(
	"/api/inventory/listInventory",
	auth,
	userStatus,
	verifyAccessToInventory,
	getInventory
);
router.post(
	"/api/inventory/getInventoryCategories",
	auth,
	userStatus,
	verifyAccessToInventory,
	getInventoryCategories
);
router.post(
	"/api/inventory/deleteItemById",
	auth,
	userStatus,
	verifyAccessToInventory,
	deleteItem
);
router.post(
	"/api/inventory/editItemById",
	auth,
	userStatus,
	verifyAccessToInventory,
	editItem
);
module.exports = router;
