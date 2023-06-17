const prisma = require("../utils/db")
const asyncWrapper = require("../utils/asyncWrapper")
const { checkPassword } = require("../utils/passwords")

const fetchInventory = async (userID) => {
    return await prisma.inventory.findMany({
        where: {
            user_ID: userID
        }
    })
}

const addItem = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })

        if (user.accesses == "ALL" || user.accesses == "INVENTORY") {
            const { data, Password } = req.body
            if (checkPassword(Password, user.password)) {
                data.map(async element => {
                    await prisma.inventory.create({
                        data: {
                            quantity: element.Quantity,
                            user: {
                                connect: {
                                    userID: user.userID
                                }
                            }
                        }
                    })
                })
                const inventoryItems = await fetchInventory(user.userID)
                return res.status(200).json({ message: "sucess", data: inventoryItems })
            }
            return res.status(200).json({ message: "Invalid Password" })
        }
    })
}

const getInventory = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })

        res.status(200).json({ message: "success", data: await fetchInventory(user.userID) })
    })
}

module.exports = { addItem, getInventory }