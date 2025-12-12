const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên sản phẩm là bắt buộc'],
            unique: true, 
            trim: true,
        },
        sku: {
            type: String,
            required: [true, 'Mã SKU là bắt buộc'],
            unique: true, 
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        
        // SỬA LỖI TẠO SẢN PHẨM: KHÔNG BẮT BUỘC KHI TẠO
        // Giá vốn sẽ được cập nhật sau khi Nhập kho lần đầu
        costPrice: {
            type: Number,
            required: false, // <-- SỬA: KHÔNG BẮT BUỘC
            default: 0,
            min: [0, 'Giá nhập không thể âm'],
        },
        
        // SỬA LỖI TẠO SẢN PHẨM: KHÔNG BẮT BUỘC KHI TẠO
        salePrice: {
            type: Number,
            required: false, // <-- SỬA: KHÔNG BẮT BUỘC
            default: 0,
            min: [0, 'Giá bán không thể âm'],
        },
        
        // SỬA LỖI TẠO SẢN PHẨM: KHÔNG BẮT BUỘC KHI TẠO
        // Tồn kho ban đầu luôn là 0
        stockQuantity: {
            type: Number,
            required: false, // <-- SỬA: KHÔNG BẮT BUỘC
            default: 0, 
            min: [0, 'Số lượng tồn kho không thể âm'],
        },
        
        // BỔ SUNG TRƯỜNG TỒN TỐI THIỂU (minimumStock)
        minimumStock: {
            type: Number,
            required: false,
            default: 10,
            min: [0, 'Tồn tối thiểu không thể âm'],
        },
        
        unit: {
            type: String,
            required: [true, 'Đơn vị tính là bắt buộc'],
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;