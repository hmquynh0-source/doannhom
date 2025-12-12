// server/routes/authRoutes.js (PHIÊN BẢN HOÀN CHỈNH)

const express = require('express');
const { 
    registerUser, 
    loginUser,
    getMe // Thêm hàm này để dùng khi cần lấy thông tin user
} = require('../controllers/authController');

// Import middleware bảo vệ (nếu đã tạo)
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Đăng ký người dùng mới
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Đăng nhập người dùng
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Lấy thông tin người dùng đang đăng nhập (Protected Route)
// @access  Private
// Dùng middleware 'protect' để kiểm tra JWT token trước khi gọi getMe
// Nếu bạn chưa tạo protect middleware, bạn có thể tạm thời comment dòng này:
// router.get('/me', protect, getMe);

module.exports = router;