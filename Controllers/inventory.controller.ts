import prisma from "../utils/db"
import asyncWrapper from "../utils/asyncWrapper";
import { checkPassword } from "../utils/passwords";
const { inventory_catagories } = require("@prisma/client");
const verifyAccessToInventory = async (req, res, next) => {
	const isAllowed = asyncWrapper(req, res, async (req, res, next) => {
		const user = res.locals.user;
if (user.accesses == "ADMIN" || user.accesses == "INVENTORY" ||user.hasAccessTo === "SUPERUSER" ) {
			return true;
		}
		return false;
	});
	isAllowed && next();
};

const fetchInventory = async () => {
	try {
		return await prisma.inventory.findMany({
			select: {
				id: false,
				itemID: true,
				itemName: true,
				quantity: true,
				catagory: true,
				condition: true,
				remarks: true,
				user_ID: true,
				createdAt: true,
			},
		});
	} catch (error) {
		return null;
	}
};

const addItem = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { List } = req.body;
		const user = res.locals.user;
		async function addItems() {
			try {
				List.map(async (element) => {
					await prisma.inventory.create({
						data: {
							quantity: parseInt(element.Quantity),
							catagory: element.Catagory,
							itemName: element.Name,
							condition: element.Condition,
							remarks: element.Remarks,
							user: {
								connect: {
									userID: user.userID,
								},
							},
						},
					});
				});
			} catch (error) {
				throw new Error(error);
			}
		}
		await addItems();
		const inventoryItems = await fetchInventory(user.userID);
		return res
			.status(200)
			.json({ message: "success", data: inventoryItems });
	});
};

const getInventory = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		res.status(200).json({
			message: "success",
			data: await fetchInventory(),
		});
	});
};

const getInventoryCategories = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		return res
			.status(200)
			.json({ message: "success", categories: inventory_catagories });
	});
};

const editItem = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { ItemID, Quantity, Catagory, ItemName, Condition, Remarks } =
			req.body;
		await prisma.inventory.update({
			where: {
				itemID: ItemID,
			},
			data: {
				quantity: Quantity ? parseInt(Quantity) : undefined,
				catagory: Catagory,
				itemName: ItemName,
				remarks: Remarks,
				condition: Condition,
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

const deleteItem = async (req, res) => {
	await asyncWrapper(req, res, async (req, res) => {
		const { itemID } = req.body;
		await prisma.inventory.delete({
			where: {
				itemID,
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

module.exports = {
	addItem,
	getInventory,
	verifyAccessToInventory,
	getInventoryCategories,
	editItem,
	deleteItem,
};
