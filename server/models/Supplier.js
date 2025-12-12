// server/models/Supplier.js

const mongoose = require('mongoose');

const SupplierSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên nhà cung cấp là bắt buộc'],
            unique: true,
            trim: true,
        },
        contactName: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
            trim: true,
        },
        address: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

const Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = Supplier;