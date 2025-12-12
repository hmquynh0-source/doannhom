// server/routes/supplierRoutes.js

const express = require('express');
const {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware'); // Đảm bảo bạn có middleware này

const router = express.Router();

router.route('/')
    .post(protect, createSupplier) // Yêu cầu đăng nhập để tạo
    .get(protect, getSuppliers);   // Yêu cầu đăng nhập để lấy danh sách

router.route('/:id')
    .put(protect, updateSupplier)  // Yêu cầu đăng nhập để cập nhật
    .delete(protect, deleteSupplier); // Yêu cầu đăng nhập để xóa

module.exports = router;