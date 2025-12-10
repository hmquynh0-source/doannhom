// server/controllers/ProductController.js
const Product = require('../models/Product'); // Import Model Sản phẩm

/**
 * @desc    Tạo một Sản phẩm mới
 * @route   POST /api/products
 * @access  Public (Tạm thời)
 */
exports.createProduct = async (req, res) => {
    try {
        // Lấy dữ liệu từ body của request
        const { name, sku, costPrice, salePrice, stockQuantity, unit } = req.body;

        // 1. Kiểm tra các trường bắt buộc (validation cơ bản)
        if (!name || !sku || !costPrice || !salePrice || !unit) {
            // Trả về lỗi 400 (Bad Request) nếu thiếu trường
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc: tên, SKU, giá nhập, giá bán và đơn vị tính.' 
            });
        }

        // 2. Tạo sản phẩm mới trong CSDL
        const product = await Product.create({
            name,
            sku,
            description: req.body.description || '', // Mô tả có thể không bắt buộc
            costPrice,
            salePrice,
            stockQuantity: stockQuantity || 0, // Mặc định là 0 nếu không cung cấp
            unit
        });

        // 3. Trả về sản phẩm vừa tạo với mã 201 (Created)
        res.status(201).json({ 
            success: true, 
            message: 'Tạo sản phẩm thành công.', 
            data: product 
        });

    } catch (error) {
        // Xử lý lỗi CSDL (ví dụ: tên/SKU bị trùng do unique: true)
        res.status(500).json({ 
            success: false, 
            message: 'Tạo sản phẩm thất bại. Có thể Tên hoặc SKU đã bị trùng.', 
            error: error.message 
        });
    }
};

/**
 * @desc    Lấy tất cả các Sản phẩm
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
    try {
        // Tìm và trả về tất cả sản phẩm
        const products = await Product.find({}); 

        // Trả về kết quả với mã 200 (OK)
        res.status(200).json({ 
            success: true, 
            count: products.length, 
            data: products 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lấy danh sách sản phẩm thất bại.', 
            error: error.message 
        });
    }
};
/**
 * @desc    Lấy một Sản phẩm theo ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
    try {
        // Lấy ID từ tham số URL (ví dụ: /api/products/69383978ea81da8aaaad1741)
        const product = await Product.findById(req.params.id);

        // 1. Kiểm tra xem sản phẩm có tồn tại không
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm với ID này.'
            });
        }

        // 2. Trả về sản phẩm tìm được
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        // Xử lý lỗi nếu ID không hợp lệ (ví dụ: định dạng ID không đúng)
        if (error.kind === 'ObjectId') {
             return res.status(400).json({
                success: false,
                message: 'ID sản phẩm không hợp lệ.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tìm sản phẩm.',
            error: error.message
        });
    }
};
/**
 * @desc    Cập nhật Sản phẩm theo ID (Update)
 * @route   PUT /api/products/:id
 * @access  Public
 */
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để cập nhật.'
            });
        }

        // Dùng findByIdAndUpdate với tùy chọn { new: true } để trả về tài liệu mới
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về tài liệu đã cập nhật
            runValidators: true // Chạy lại các validation trong Schema
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công.',
            data: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cập nhật sản phẩm thất bại.',
            error: error.message
        });
    }
};


/**
 * @desc    Xóa Sản phẩm theo ID (Delete)
 * @route   DELETE /api/products/:id
 * @access  Public
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để xóa.'
            });
        }

        // Xóa sản phẩm
        await Product.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công.',
            data: {} // Trả về đối tượng trống để xác nhận xóa
        });

    } catch (error) {
         res.status(500).json({
            success: false,
            message: 'Xóa sản phẩm thất bại.',
            error: error.message
        });
    }
};