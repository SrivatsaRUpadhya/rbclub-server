const prisma = require("../utils/db");

const findExpensesByUser = async (userID) => {
    try {
        return await prisma.expenses.findMany({
            where: {
                user_ID: userID
            },
            select: {
                user_ID: true,
                desc: true,
                catagory: true,
                expenseID: true,
                price: true,
                status: true,
                createdAt: true
            }
        })
    } catch (error) {
        console.log(error);
        return [];
    }
}

const getExpenseByUser = async (req, res) => {
    const email = res.locals.email;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email
            },
            select: {
                userID: true
            }
        })
        const expenses = await findExpensesByUser(user.userID)
        return res.status(200).json({ message: "success", expenses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred!" })
    }
}

const addExpense = async (req, res) => {
    const { List, Catagory } = req.body;
    let amount = 0;
    List.map((element) => {
        amount += parseFloat(element["Price"]);
    })
    if (amount == 0) {
        return res.status(200).json({ message: "Please enter appropriate data" });
    }
    try {

        const email = res.locals.email;
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })
        await prisma.expenses.create({
            data: {
                desc: JSON.stringify(List),
                catagory: Catagory,
                price: amount,
                status: "PENDING",
                user: {
                    connect: {
                        userID: user.userID
                    }
                }
            }
        })
        const userExpenses = await findExpensesByUser(user.userID)
        return res.status(200).json({ message: "success", expenses: userExpenses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred" })
    }
}

const deleteExpense = async (req, res) => {
    const email = res.locals.email;
    try {
        const { expenseID } = req.body;
        if (!expenseID) return res.send(403).json({ message: "Invalid request!" })

        await prisma.expenses.delete({
            where: {
                expenseID
            }
        })

        return res.status(200).json({ message: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "A error occurred!" })
    }
}

const getAllExpenses = async (req, res) => {
    try {
        const allExpenses = await prisma.expenses.findMany({
            select: {
                userID: true,
                desc: true,
                expenseID: true,
                price: true,
                status: true,
                createdAt: true
            }
        });
        return res.status(200).json({ message: "success", allExpenses });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred!" });
    }
}


module.exports = { getAllExpenses, deleteExpense, addExpense, getExpenseByUser }