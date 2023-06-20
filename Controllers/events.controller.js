const prisma = require("../utils/db")
const asyncWrapper = require("../utils/asyncWrapper")
const { checkPassword } = require("../utils/passwords")

const verifyAccessToEvents = async (req, res, next) => {
    const isAllowed = await asyncWrapper(req, res,
        async (req, res) => {
            const email = res.locals.email;
            const user = await prisma.users.findUnique({
                where: {
                    email
                }
            })
            if (user.hasAccessTo === "ADMIN" || user.hasAccessTo === "EVENTS") {
                return true
            }
            res.status(403).json({ message: "Oops! You don't have access to this" })
            return false
        })
    isAllowed && next()
}

const verifyAccess = async (req, res) => {
    return res.status(200).json({ message: "success" })
}

const fetchEvents = async () => {
    return await prisma.events.findMany({
        select: {
            id: false,
            users: true,
            eventID: true,
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
        const { List } = req.body
        List.map(async element => {
            await prisma.events.create({
                data: {
                    eventName: element.Name,
                    catagory: element.Catagory,
                    desc: element.Description,
                    eventDate: new Date(element.Date),
                    max_entries: parseInt(element.MaxEntries)
                }
            })
        })
        const inventoryItems = await fetchEvents()
        return res.status(200).json({ message: "success", data: inventoryItems })
    })
}

const editEvent = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const { EventID, EventName, Catagory, Description, newDate, MaxEntries } = req.body
        await prisma.events.update({
            where: {
                eventID: EventID
            },
            data: {
                eventName: EventName,
                catagory: Catagory,
                desc: Description,
                eventDate: newDate ? new Date(newDate) : undefined,
                max_entries: MaxEntries ? parseInt(MaxEntries) : undefined
            }
        })
    })
    res.status(200).json({ message: "success" })
}

const deleteEvent = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        const { EventID } = req.body
        await prisma.events.delete({
            where: {
                eventID: EventID
            }
        })
    })
    res.status(200).json({ message: "success" })
}


const getEvents = async (req, res) => {
    await asyncWrapper(req, res, async (req, res) => {
        res.status(200).json({ message: "success", data: await fetchEvents() })
    })
}

module.exports = { addEvent, getEvents, verifyAccessToEvents, verifyAccess, editEvent, deleteEvent }