const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret } = require("../utils/secrets");
const { checkPassword, hashPassword } = require('../utils/passwords');
const prisma = require("../utils/db");


const register = async (req, res) => {
    //Wrap this inside an async wrapper
    try {
        const { Name, Phone, Email, Usn, Role,profileImg, Password } = req.body;
        console.log(req.body);
        if (await prisma.users.findFirst({ where: { email: Email } })) {
            return res.status(200).json({ message: "User already exists!" })
        }

        const refreshToken = jwt.sign(Email, refreshTokenSecret);
        await prisma.users.create({
            data: {
                name: Name,
                phone: Phone,
                email: Email,
                usn: Usn,
                role: Role,
                profileImg,
                password: await hashPassword(Password),
                refreshToken,
                isVerified: true
            }
        })
        const accessToken = jwt.sign(Email, accessTokenSecret);

        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });
        return res.status(200).json({ message: "success" });
    } catch (error) {
        console.log(error);
        res.status(502).send("An error occurred!");
    }
}

const login = async (req, res) => {
    //Wrap this inside an async wrapper
    try {
        const { email, password } = req.body;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        });

        if (user) {
            if (await checkPassword(password, prisma.user.password)) {
                const accessToken = jwt.sign(phone, accessTokenSecret, { expiresIn: '1h' });
                res.cookie("accessToken", accessToken, { httpOnly: true });
                return res.status(200).json({ message: "success" });
            }
            else {
                return res.status(200).json({ message: "Ivalid credentials!" })
            }
        }

        return res.status(200).json({ message: "User Not Found!" })
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "An error occurred!" })

    }
}

const me = async (req, res) => {
    const { accessToken } = req.cookies;
    try {
        jwt.verify(accessToken, accessTokenSecret)
        const email = jwt.decode(accessToken, accessTokenSecret);
        const user = await prisma.users.findUnique({
            where: {
                email
            },
            select: {
                name: true,
                profileImg: true,
                role: true,
                email: true
            }
        });
        res.status(200).json({ user, message: "success" })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: "An error occurred!" })
    }
}

const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "success" })
}
module.exports = { register, login, me, logout };