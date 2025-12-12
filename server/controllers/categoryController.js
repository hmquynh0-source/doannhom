// server/controllers/categoryController.js

const Category = require('../models/Category');
const Product = require('../models/Product'); // Cần import Product để kiểm tra khi xóa

// @desc    Tạo Loại sản phẩm mới
// @route   POST /api/categories
// @access  Private (Admin/User có quyền)
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        // Xử lý lỗi trùng lặp tên
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên loại sản phẩm đã tồn tại. Vui lòng chọn tên khác.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tất cả Loại sản phẩm
// @route   GET /api/categories
// @access  Private (Chỉ cần đăng nhập)
exports.getCategories = async (req, res, next) => {
    try {
        // Sắp xếp theo tên
        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh mục.' });
    }
};

// @desc    Cập nhật Loại sản phẩm theo ID
// @route   PUT /api/categories/:id
// @access  Private (Admin/User có quyền)
exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm.' });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về đối tượng đã cập nhật
            runValidators: true // Chạy lại các validation trong Schema
        });

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        // Xử lý lỗi trùng lặp tên
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên loại sản phẩm đã tồn tại. Vui lòng chọn tên khác.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Xóa Loại sản phẩm theo ID
// @route   DELETE /api/categories/:id
// @access  Private (Admin/User có quyền)
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm.' });
        }
        
        // KIỂM TRA SẢN PHẨM LIÊN KẾT:
        const relatedProductsCount = await Product.countDocuments({ category: req.params.id });
        if (relatedProductsCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa: Có ${relatedProductsCount} sản phẩm đang sử dụng loại này. Vui lòng cập nhật sản phẩm trước.` 
            });
        }

        await category.deleteOne(); // Sử dụng deleteOne() thay vì remove()

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa loại sản phẩm.' });
    }
};