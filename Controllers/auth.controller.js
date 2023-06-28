const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret, serverURL, clientURL } = require("../utils/secrets");
const { checkPassword, hashPassword } = require('../utils/passwords');
const prisma = require("../utils/db");
const asyncWrapper = require("../utils/asyncWrapper")
const { roles, accesses } = require("@prisma/client")

const auth = async (req, res, next) => {
    const { accessToken } = req.cookies;
    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized Request!" })
    }
    try {
        jwt.verify(accessToken, accessTokenSecret)
        res.locals.email = await jwt.decode(accessToken, accessTokenSecret).data;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            try {
                const email = await jwt.decode(accessToken, accessTokenSecret).data;
                await prisma.users.findFirst({
                    where: {
                        email
                    }
                })

                if (jwt.verify(user.refreshToken, refreshTokenSecret)) {
                    accessToken = jwt.sign({ data: email }, accessTokenSecret, { expiresIn: '1h' });
                    res.locals.email = await jwt.decode(accessToken, accessTokenSecret).data;
                    next();
                }
            } catch (error) {
                console.log(error);
                if (error.message === "TokenExpiredError") {
                    res.clearCookie("accessToken", {
                        expires: new Date(Date.now() + 3600000),
                        httpOnly: true,
                        sameSite: "None",
                        secure: true
                    });
                    return res.status(401).json({ message: "Session expired!" })
                }
                return res.status(500).json({ message: "An error occurred!" })

            }
        }
    }
}


const register = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            //Wrap this inside an async wrapper
            const { Name, Phone, Email, Usn, profileImg, Password } = req.body;
            if (await prisma.users.findFirst({ where: { email: Email } })) {
                return res.status(200).json({ message: "User already exists!" })
            }

            const refreshToken = jwt.sign({ data: Email }, refreshTokenSecret, { expiresIn: '7d' });
            await prisma.users.create({
                data: {
                    name: Name,
                    phone: Phone,
                    email: Email,
                    usn: Usn,
                    profileImg,
                    password: await hashPassword(Password),
                    refreshToken,
                    Events:{}
                }
            })
            const accessToken = jwt.sign({ data: Email }, accessTokenSecret, { expiresIn: '1h' });

            res.cookie("accessToken", accessToken, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
                sameSite: "None",
                secure: true
            });
            return res.status(200).json({ message: "success" });
        }
    )
}

const login = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            //Wrap this inside an async wrapper
            const { Email, Password } = req.body;
            const user = await prisma.users.findUnique({
                where: {
                    email: Email
                }
            });
            try {
                jwt.verify(user.refreshToken, refreshTokenSecret);
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    const newRefreshToken = jwt.sign({ data: Email }, refreshTokenSecret, { expiresIn: '7d' });
                    prisma.users.update({
                        where: {
                            email: Email
                        },
                        data: {
                            refreshToken: newRefreshToken
                        }
                    })
                }
            }
            if (user) {
                if (await checkPassword(Password, user.password)) {
                    const accessToken = jwt.sign({ data: Email }, accessTokenSecret, { expiresIn: '1h' });
                    res.cookie("accessToken", accessToken, {
                        expires: new Date(Date.now() + 3600000),
                        httpOnly: true,
                        sameSite: "None",
                        secure: true
                    });
                    return res.status(200).json({ message: "success" });
                }
                else {
                    return res.status(200).json({ message: "Ivalid credentials!" })
                }
            }

            return res.status(200).json({ message: "User Not Found!" })
        }
    )
}

const me = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            const email = res.locals.email;
            const user = await prisma.users.findUnique({
                where: {
                    email
                },
                select: {
                    name: true,
                    profileImg: true,
                    role: true,
                    hasAccessTo:true,
                    usn:true,
                    email: true
                }
            });
            res.status(200).json({
                user: {
                    Name: user.name,
                    ProfileImg: user.profileImg,
                    Role: user.role,
                    Email: user.email,
                    Usn:user.usn,
                    Permissions:user.hasAccessTo
                }, message: "success"
            })
        }
    )
}

const logout = (req, res) => {
    res.clearCookie("accessToken", {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
        sameSite: "None",
        secure: true
    });
    return res.status(200).json({ message: "success" })
}

const deleteAccount = async (req, res) => {
    await asyncWrapper(req, res,
        async (req, res) => {
            const email = res.locals.email;
            const { Password } = req.body;
            const user = await prisma.users.findUnique({
                where: {
                    email
                }
            })
            if (await checkPassword(Password, user.password)) {
                await prisma.users.delete({
                    where: {
                        email
                    }
                })
                res.clearCookie("accessToken", {
                    expires: new Date(Date.now() + 3600000),
                    httpOnly: true,
                    sameSite: "None",
                    secure: true
                });
                return res.status(200).json({ message: "success" });
            }
            else {
                return res.status(200).json({ message: "Incorrect password" })
            }
        }
    )
}
module.exports = { register, login, me, logout, auth, deleteAccount };
