// server/models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // Tên loại sản phẩm (VD: Điện thoại, Phụ kiện, Đồ gia dụng)
    name: {
        type: String,
        required: [true, 'Tên loại sản phẩm là bắt buộc'],
        trim: true,
        unique: true, // Đảm bảo tên loại sản phẩm không trùng lặp
        maxlength: [100, 'Tên loại sản phẩm không được vượt quá 100 ký tự']
    },
    // Mô tả ngắn về loại sản phẩm
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    // Ngày tạo (Tự động)
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Thêm index cho trường name để tăng tốc độ tìm kiếm
categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;