const router = require('express').Router();
const { auth } = require('../Controllers/auth.controller');
const { addExpense, deleteExpense, getExpenseByUser, getAllExpenses } = require('../Controllers/expense.controller')

router.post("/api/expenses/addExpenseByUser", auth, addExpense);
router.post("/api/expenses/getExpenseByUser", auth, getExpenseByUser);
router.delete("/api/expenses/deleteExpense/:expenseID", auth, deleteExpense);
router.get("/api/expenses/getAllExpenses", getAllExpenses)

module.exports = router; 
