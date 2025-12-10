// server/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = mongoose.Schema(
    {
        // Liên kết đến Sản phẩm nào đang được giao dịch
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Tham chiếu đến Model Product
            required: [true, 'Sản phẩm là bắt buộc cho giao dịch.'],
        },
        // Loại giao dịch: 'in' (Nhập kho) hoặc 'out' (Xuất kho)
        type: {
            type: String,
            required: [true, 'Loại giao dịch (in/out) là bắt buộc.'],
            enum: ['in', 'out'], 
        },
        // Số lượng sản phẩm được nhập hoặc xuất
        quantity: {
            type: Number,
            required: [true, 'Số lượng là bắt buộc.'],
            min: [1, 'Số lượng giao dịch phải lớn hơn 0.'],
        },
        // Giá trị tại thời điểm giao dịch (ví dụ: giá nhập kho mới nhất)
        price: {
            type: Number,
            required: [true, 'Giá giao dịch là bắt buộc.'],
            min: [0, 'Giá không thể là số âm.'],
        },
        // Mô tả chi tiết giao dịch (ví dụ: Tên nhà cung cấp, Tên khách hàng)
        notes: {
            type: String,
            trim: true,
        },
        // Người thực hiện giao dịch (Tạm thời không bắt buộc)
        user: {
            type: String, 
            default: 'System', 
        },
    },
    {
        // Tự động thêm 'createdAt' và 'updatedAt'
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;