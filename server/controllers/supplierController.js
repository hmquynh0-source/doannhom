// server/controllers/supplierController.js

const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');

// @desc    Tạo Nhà cung cấp mới
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
    const { name, contactName, phone, email, address } = req.body;

    // Kiểm tra tên NCC đã tồn tại chưa
    const supplierExists = await Supplier.findOne({ name });

    if (supplierExists) {
        res.status(400);
        throw new Error('Nhà cung cấp đã tồn tại trong hệ thống');
    }

    const supplier = await Supplier.create({
        name,
        contactName,
        phone,
        email,
        address,
    });

    if (supplier) {
        res.status(201).json({
            success: true,
            data: supplier,
            message: 'Tạo nhà cung cấp thành công',
        });
    } else {
        res.status(400);
        throw new Error('Dữ liệu nhà cung cấp không hợp lệ');
    }
});

// @desc    Lấy tất cả Nhà cung cấp
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    res.json({
        success: true,
        count: suppliers.length,
        data: suppliers,
    });
});

// @desc    Cập nhật Nhà cung cấp
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        supplier.name = req.body.name || supplier.name;
        supplier.contactName = req.body.contactName || supplier.contactName;
        supplier.phone = req.body.phone || supplier.phone;
        supplier.email = req.body.email || supplier.email;
        supplier.address = req.body.address || supplier.address;

        const updatedSupplier = await supplier.save();
        res.json({
            success: true,
            data: updatedSupplier,
            message: 'Cập nhật nhà cung cấp thành công',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy Nhà cung cấp');
    }
});

// @desc    Xóa Nhà cung cấp
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        await Supplier.deleteOne({ _id: req.params.id });
        res.json({ message: 'Xóa nhà cung cấp thành công' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy Nhà cung cấp');
    }
});

module.exports = {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
};