// server/models/Product.js
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
        costPrice: {
            type: Number,
            required: [true, 'Giá nhập là bắt buộc'],
            min: [0, 'Giá nhập không thể âm'],
        },
        salePrice: {
            type: Number,
            required: [true, 'Giá bán là bắt buộc'],
            min: [0, 'Giá bán không thể âm'],
        },
        stockQuantity: {
            type: Number,
            required: [true, 'Số lượng tồn kho là bắt buộc'],
            default: 0, 
            min: [0, 'Số lượng tồn kho không thể âm'],
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