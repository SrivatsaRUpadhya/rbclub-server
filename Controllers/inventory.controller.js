const prisma = require("../utils/db")
const asyncWrapper = require("../utils/asyncWrapper")
const { checkPassword } = require("../utils/passwords")
const { inventory_catagories } = require("@prisma/client")
const verifyAccessToInventory = async (req, res, next) => {
    const isAllowed = asyncWrapper(req, res, async (req, res, next) => {
        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })
        if (user.accesses == "ALL" || user.accesses == "INVENTORY") {
            return true
        }
        return false
    })
    isAllowed && next()
}

const fetchInventory = async () => {
    try {
        return await prisma.inventory.findMany({
            select: {
                id: false,
                itemID: true,
                itemName: true,
                quantity: true,
                catagory: true,
                user_ID: true,
                createdAt: true
            }
        })
    } catch (error) {
        return null
    }
}

const addItem = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const { List } = req.body
        const user = await prisma.users.findUnique({
            where: {
                email: res.locals.email
            }
        })
        async function addItems() {
            try {
                List.map(async element => {
                    await prisma.inventory.create({
                        data: {
                            quantity: parseInt(element.Quantity),
                            catagory: element.Catagory,
                            itemName: element.Name,
                            user: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    })
                })
            } catch (error) {
                throw new Error(error)
            }
        };
        await addItems();
        const inventoryItems = await fetchInventory(user.userID)
        return res.status(200).json({ message: "success", data: inventoryItems })
    })
}

const getInventory = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        res.status(200).json({ message: "success", data: await fetchInventory() })
    })
}

const getInventoryCategories = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        return res.status(200).json({ message: "success", categories: inventory_catagories })
    })
}

const editItem = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const { ItemID, Quantity, Catagory, ItemName } = req.body
        await prisma.inventory.update({
            where: {
                itemID: ItemID
            },
            data: {
                quantity: Quantity ? parseInt(Quantity) : undefined,
                catagory: Catagory,
                itemName: ItemName
            }
        })
        return res.status(200).json({ message: "success" })
    })
}

const deleteItem = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const { itemID } = req.body
        await prisma.inventory.delete({
            where: {
                itemID
            }
        })
        return res.status(200).json({ message: "success" })
    })
}

module.exports = { addItem, getInventory, verifyAccessToInventory, getInventoryCategories, editItem, deleteItem }