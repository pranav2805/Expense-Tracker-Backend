const express = require('express');

const router = express.Router();

const expenseController = require('../controllers/expCont');
const userAuthentication = require('../middleware/auth');

router.get('/expenses', userAuthentication.authenticate, expenseController.getExpenses);

router.post('/expenses', userAuthentication.authenticate, expenseController.postExpense);

router.get('/expenses/download', userAuthentication.authenticate, expenseController.downloadExpense);

router.get('/expenses/downloadFiles',  userAuthentication.authenticate, expenseController.getDownloadedFiles);

router.delete('/expenses/:id', userAuthentication.authenticate, expenseController.deleteExpense);

router.put('/expenses/edit-expense/:id', expenseController.editExpense);

module.exports = router;