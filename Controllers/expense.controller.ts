import prisma from "../utils/db";
import asyncWrapper from "../utils/asyncWrapper";
import { Request, Response } from "express";

const findExpensesByUser = async (userID: string) => {
	try {
		return await prisma.expenses.findMany({
			where: {
				user_ID: userID,
			},
			select: {
				user_ID: true,
				desc: true,
				catagory: true,
				expenseID: true,
				price: true,
				status: true,
				createdAt: true,
			},
		});
	} catch (error) {
		console.log(error);
		return null;
	}
};

const getExpenseByUser = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
		const user = res.locals.user;
		const expenses = await findExpensesByUser(user.userID);
		return res.status(200).json({ message: "success", expenses });
	});
};

const addExpense = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { List, Catagory } = req.body;
		let amount = 0;
		List.map(
			(element: { Name: string; Price: string; Catagory: string }) => {
				amount += parseFloat(element.Price);
			}
		);
		if (amount == 0) {
			return res
				.status(200)
				.json({ message: "Please enter appropriate data" });
		}

		const user = res.locals.user;
		await prisma.expenses.create({
			data: {
				desc: JSON.stringify(List),
				catagory: Catagory,
				price: amount,
				status: "PENDING",
				user: {
					connect: {
						userID: user.userID,
					},
				},
			},
		});
		return res.status(200).json({ message: "success" });
	});
};

const deleteExpense = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
		const { expenseID } = req.body;
		if (!expenseID)
			return res.send(403).json({ message: "Invalid request!" });

		await prisma.expenses.delete({
			where: {
				expenseID,
			},
		});

		return res.status(200).json({ message: "success" });
	});
};

const getAllExpenses = async (req: Request, res: Response) => {
	asyncWrapper(req, res, async (req: Request, res: Response) => {
		const allExpenses = await prisma.expenses.findMany({
			select: {
				user_ID: true,
				desc: true,
				expenseID: true,
				price: true,
				status: true,
				createdAt: true,
			},
		});
		return res.status(200).json({ message: "success", allExpenses });
	});
};

export { getAllExpenses, deleteExpense, addExpense, getExpenseByUser };
