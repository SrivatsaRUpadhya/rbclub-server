import prisma from "../utils/db";
import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response, NextFunction } from "express";
import { inventory_catagories } from "@prisma/client";
import { InventoryItemType, userType } from "../utils/customTypes";

const verifyAccessToInventory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await prisma.users.findUnique({
			where: { email: res.locals.email },
		});
		if (
			user?.hasAccessTo == "ADMIN" ||
			user?.hasAccessTo == "INVENTORY" ||
			user?.hasAccessTo === "SUPERUSER"
		) {
			res.locals.user = user;
			return next();
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "An error occurred!" });
	}
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

const addItem = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { List } = req.body;
		const user: userType = res.locals.user;
		async function addItems() {
			try {
				List.map(async (element: InventoryItemType) => {
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
				throw error;
			}
		}
		await addItems();
		const inventoryItems = await fetchInventory();
		return res
			.status(200)
			.json({ message: "success", data: inventoryItems });
	});
};

const getInventory = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		res.status(200).json({
			message: "success",
			data: await fetchInventory(),
		});
	});
};

const getInventoryCategories = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		return res
			.status(200)
			.json({ message: "success", categories: inventory_catagories });
	});
};

const editItem = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
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

const deleteItem = async (req: Request, res: Response) => {
	await asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { itemID } = req.body;
		await prisma.inventory.delete({
			where: {
				itemID,
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

export {
	addItem,
	getInventory,
	verifyAccessToInventory,
	getInventoryCategories,
	editItem,
	deleteItem,
};
