// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware kiểm tra JWT
exports.protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra nếu token có trong header Authorization (Bearer Token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ chuỗi 'Bearer [token]'
            token = req.headers.authorization.split(' ')[1];

            // 2. Xác thực token (verify)
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            // `decoded` chứa { id: user_id }

            // 3. Tìm người dùng từ ID trong token và gắn vào request
            // .select('-password') để không lấy mật khẩu
            req.user = await User.findById(decoded.id).select('-password'); 

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Người dùng không tồn tại. Token không hợp lệ.' });
            }

            // Chuyển sang Controller tiếp theo (đã được xác thực)
            next();

        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            return res.status(401).json({ success: false, message: 'Không được phép truy cập. Token hết hạn hoặc không hợp lệ.' });
        }
    }

    // Nếu không tìm thấy Token trong header
    if (!token) {
        res.status(401).json({ success: false, message: 'Không được phép truy cập. Thiếu Token.' });
    }
};

/**
 * @desc    Middleware kiểm tra Phân quyền người dùng
 * @param   {...string} allowedRoles - Danh sách các role được phép (ví dụ: 'admin', 'manager')
 */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user được gắn vào từ middleware protect trước đó
        if (!req.user) {
            // Nếu không có req.user, có nghĩa là protect middleware đã không chạy/thất bại
            return res.status(401).json({ success: false, message: 'Lỗi xác thực trước khi kiểm tra quyền.' });
        }

        // Kiểm tra xem role của người dùng có nằm trong danh sách các role được phép không
        const userRole = req.user.role;
        
        if (!allowedRoles.includes(userRole)) {
            // Nếu không được phép
            return res.status(403).json({
                success: false,
                message: `Quyền truy cập bị từ chối. Chỉ có các role ${allowedRoles.join(', ')} mới được phép.`
            });
        }

        // Nếu được phép, chuyển sang Controller tiếp theo
        next();
    };
};