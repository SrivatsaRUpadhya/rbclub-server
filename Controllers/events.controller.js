const prisma = require("../utils/db")
const asyncWrapper = require("../utils/asyncWrapper")
const { checkPassword } = require("../utils/passwords")

const fetchEvents = async () => {
    return await prisma.events.findMany({
        select: {
            id: false,
            users: true,
            name: true,
            catagory: true,
            desc: true,
            eventName: true,
            eventDate: true,
            max_entries: true
        }
    })
}

const addEvent = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })

        if (user.accesses == "ALL" || user.accesses == "EVENTS") {
            const { data, Password } = req.body
            if (checkPassword(Password, user.password)) {
                data.map(async element => {
                    await prisma.events.create({
                        data: {
                            name: element.Name,
                            catagory: element.Catagory,
                            description: element.Description,
                            eventDate: element.Date,
                            max_entries: element.MaxEntries
                        }
                    })
                })
                const inventoryItems = await fetchEvents()
                return res.status(200).json({ message: "sucess", data: inventoryItems })
            }
            return res.status(403).json({ message: "Oops! You don't have access to this" })
        }
    })
}

const getEvents = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })

        if (user.accesses == "ALL" || user.accesses == "EVENTS") {
            res.status(200).json({ message: "success", data: await fetchEvents() })
        }
        return res.status(403).json({ message: "Oops! You don't have access to this" })
    })
}

module.exports = { addEvent, getEvents }