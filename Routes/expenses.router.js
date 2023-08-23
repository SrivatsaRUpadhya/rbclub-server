const router = require("express").Router();
const { auth, userStatus } = require("../Controllers/auth.controller");
const {
	addExpense,
	deleteExpense,
	getExpenseByUser,
	getAllExpenses,
} = require("../Controllers/expense.controller");

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

module.exports = router;
