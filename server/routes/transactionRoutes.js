// server/routes/transactionRoutes.js - FULL CRUD
const express = require('express');
const router = express.Router();

let transactions = [
  { _id: 1, productId: '1', productName: 'iPhone 15 Pro', type: 'in', quantity: 10, note: 'Nhập lô mới', createdAt: new Date() },
  { _id: 2, productId: '2', productName: 'Samsung S24', type: 'out', quantity: 2, note: 'Bán cho khách', createdAt: new Date(Date.now() - 86400000) }
];

// GET all transactions
router.get('/transactions', (req, res) => {
  res.json({ success: true, data: transactions });
});

// POST new transaction
router.post('/transactions', (req, res) => {
  const newTransaction = {
    _id: Date.now(),
    ...req.body,
    createdAt: new Date()
  };
  transactions.unshift(newTransaction); // Add to beginning
  res.json({ success: true, data: newTransaction });
});

module.exports = router;
