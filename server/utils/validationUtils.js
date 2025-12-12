// server/utils/validationUtils.js

// Bạn có thể thêm các hàm kiểm tra dữ liệu vào đây sau, 
// ví dụ: isNumeric, isValidSKU, v.v.
const validationUtils = {
    // Để trống hoặc thêm hàm kiểm tra cơ bản nếu cần
    isEmpty: (value) => value === null || value === undefined || value === '',
    isPositiveNumber: (value) => typeof value === 'number' && value > 0
};

module.exports = validationUtils;