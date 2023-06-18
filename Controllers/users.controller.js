const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret, serverURL, clientURL } = require("../utils/secrets");
const { checkPassword, hashPassword } = require('../utils/passwords');
const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper")
const { roles, accesses } = require("@prisma/client")

const verifyAccessToResorce = async (req, res, next) => {
    const isAllowed = await asyncWrapper(req, res,
        async (req, res) => {
            const email = res.locals.email;
            const user = await prisma.users.findUnique({
                where: {
                    email
                }
            })
            if (user.hasAccessTo === "ADMIN") {
                return true
            }
            res.status(403).json({ message: "Oops! You don't have access to this" })
            return false
        })
    isAllowed && next()
}

const getRolesAndPermissions = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            return res.status(200).json({ message: "success", data: { roles, permissions: accesses } })
        })
}

const getAllUsers = async () => {
    return await prisma.users.findMany({
        select: {
            id: false,
            userID: true,
            name: true,
            usn: true,
            email: true,
            phone: true,
            role: true,
            isVerified: true,
            hasAccessTo: true
        }
    });
}

const usersList = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            return res.status(200).json({ message: "success", data: await getAllUsers() })
        })
}

const editUser = async (req, res) => {
    asyncWrapper(req, res,
        async (req, res) => {
            const { newAccess, userToUpdate, NewRole } = req.body;
            console.log(req.body);
            await prisma.users.update({
                where: {
                    userID: userToUpdate
                },
                data: {
                    hasAccessTo: newAccess,
                    role: NewRole
                }
            })
            return res.status(200).json({ message: "success", data: await getAllUsers() })
        })
}
const verifyUser = async (req, res) => {
    asyncWrapper(req, res,
        async (req, res) => {
            const { userToVerify } = req.body;
            await prisma.users.update({
                where: {
                    userID: userToVerify
                },
                data: {
                    isVerified: true
                }
            })
            return res.status(200).json({ message: "success", data: await getAllUsers() })
        })
}

module.exports = { editUser, verifyUser, usersList, getRolesAndPermissions, verifyAccessToResorce }