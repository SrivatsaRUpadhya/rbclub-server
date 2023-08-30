import { Router } from "express";
	const router = Router()
import { auth, userStatus } from "../Controllers/auth.controller";
import {
	addExpense,
	deleteExpense,
	getExpenseByUser,
	getAllExpenses,
} from "../Controllers/expense.controller";

router.post("/api/expenses/addExpenseByUser", auth, userStatus, addExpense);
router.post(
	"/api/expenses/getExpenseByUser",
	auth,
	userStatus,
	getExpenseByUser
);
router.delete(
	"/api/expenses/deleteExpense/:expenseID",
	auth,
	userStatus,
	deleteExpense
);
router.get("/api/expenses/getAllExpenses", getAllExpenses);

export default router;
