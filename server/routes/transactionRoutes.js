// server/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();

const { createTransaction, getTransactions } = require('../controllers/TransactionController'); 

// 💡 SỬA LỖI TẠI ĐÂY: Import HÀM 'protect' BẰNG DẤU NGOẶC NHỌN
const { protect } = require('../middleware/authMiddleware'); 


// --- CÁC ROUTE CHÍNH THỨC ---

/**
 * POST /api/transactions
 * @desc Tạo giao dịch mới (Nhập hoặc Xuất kho)
 */
// Sử dụng hàm 'protect' đã được import
router.post('/', protect, createTransaction); // Dòng 22 đã được sửa!

/**
 * GET /api/transactions
 * @desc Lấy tất cả lịch sử giao dịch
 */
router.get('/', protect, getTransactions); 

module.exports = router;