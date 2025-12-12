// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const authMiddleware = require('../middleware/authMiddleware'); // Nếu bạn có dùng middleware

// ----------------------------------------------------
// DÙNG MONGO DB CONTROLLER THAY VÌ DATA DEMO CỐ ĐỊNH
// ----------------------------------------------------

// GET /api/products - Lấy TẤT CẢ sản phẩm từ MongoDB
router.get('/', productController.getProducts);

// POST /api/products - Thêm sản phẩm mới vào MongoDB
router.post('/', productController.createProduct);

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', productController.deleteProduct);

module.exports = router;