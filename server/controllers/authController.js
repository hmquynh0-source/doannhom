// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    Tạo JWT (JSON Web Token)
 * @param   {string} id - User ID
 * @returns {string} Token
 */
const generateToken = (id) => {
    // Sử dụng JWT_SECRET từ .env để ký (sign) token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'Người dùng với email này đã tồn tại.' });
        }

        // 2. Tạo người dùng mới
        const user = await User.create({
            name,
            email,
            password,
            // role sẽ lấy giá trị default từ User Model (ví dụ: 'admin' hoặc 'staff')
        });

        if (user) {
            // 3. Trả về thông tin người dùng và JWT
            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công.',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id), // Tạo token
                },
            });
        } else {
            res.status(400).json({ success: false, message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký.', error: error.message });
    }
};

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm người dùng bằng email và chọn cả trường password
        const user = await User.findOne({ email }).select('+password');

        // 2. Kiểm tra tồn tại và so sánh mật khẩu
        if (user && (await user.matchPassword(password))) {
            // 3. Trả về thông tin người dùng và JWT
            res.json({
                success: true,
                message: 'Đăng nhập thành công.',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id), // Tạo token
                },
            });
        } else {
            res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập.', error: error.message });
    }
};

/**
 * @desc    Lấy thông tin người dùng hiện tại (dựa trên JWT)
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    // req.user được gán bởi 'protect' middleware sau khi xác thực token
    const user = await User.findById(req.user._id).select('-password'); 

    if (user) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
};

// 💡 Cấu trúc exports cuối cùng
exports.generateToken = generateToken;