// server/controllers/TransactionController.js
const Transaction = require('../models/Transaction');
const Product = require('../models/Product'); // Cần import Product để cập nhật tồn kho

// server/controllers/TransactionController.js
// ... (các hàm import, bao gồm cả mongoose)

/**
 * @desc    Tạo một Giao dịch (Nhập hoặc Xuất kho) - ĐÃ BỎ SESSION TẠM THỜI
 * @route   POST /api/transactions
 * @access  Public
 */
exports.createTransaction = async (req, res) => {
    // Bỏ qua session ở đây để khắc phục lỗi Replica Set
    try {
        const { product, type, quantity, price, notes } = req.body;

        // Validation cơ bản
        if (!product || !type || !quantity || !price) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp đầy đủ thông tin: product ID, loại giao dịch, số lượng và giá.' 
            });
        }

        // 1. Tìm Sản phẩm
        const existingProduct = await Product.findById(product); // Bỏ .session(session)

        if (!existingProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy Sản phẩm này để thực hiện giao dịch.' 
            });
        }

        // 2. Tính toán Tồn kho mới và kiểm tra
        let newStock;
        
        if (type === 'in') {
            newStock = existingProduct.stockQuantity + quantity;
        } else if (type === 'out') {
            newStock = existingProduct.stockQuantity - quantity;
            
            if (newStock < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Lỗi: Không đủ hàng trong kho. Tồn kho hiện tại: ${existingProduct.stockQuantity}` 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Loại giao dịch không hợp lệ. Phải là "in" hoặc "out".' 
            });
        }

        // 3. Cập nhật số lượng Tồn kho của Sản phẩm
        existingProduct.stockQuantity = newStock;
        if (type === 'in') {
            existingProduct.costPrice = price; 
        }
        
        await existingProduct.save(); // Bỏ { session }

        // 4. Ghi lại Giao dịch vào Database (Tạo Transaction)
        const transaction = await Transaction.create({
            product,
            type,
            quantity,
            price,
            notes: notes || ''
        }); // Tạo Transaction đơn lẻ

        res.status(201).json({ 
            success: true, 
            message: `Giao dịch ${type === 'in' ? 'nhập' : 'xuất'} kho thành công. Tồn kho mới: ${newStock}`, 
            data: transaction 
        });

    } catch (error) {
        // Không cần rollback, chỉ trả về lỗi
        res.status(500).json({ 
            success: false, 
            message: 'Thực hiện giao dịch thất bại.', 
            error: error.message 
        });
    }
};

// ... (Hàm getTransactions giữ nguyên)

/**
 * @desc    Lấy tất cả các Giao dịch
 * @route   GET /api/transactions
 * @access  Public
 */
exports.getTransactions = async (req, res) => {
    try {
        // Lấy tất cả giao dịch và populate (điền đầy đủ) thông tin Sản phẩm
        const transactions = await Transaction.find().populate('product', 'name sku unit'); 

        res.status(200).json({ 
            success: true, 
            count: transactions.length, 
            data: transactions 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lấy lịch sử giao dịch thất bại.', 
            error: error.message 
        });
    }
};
/**
 * @desc    Lấy Báo cáo Tổng Giá trị Tồn kho
 * @route   GET /api/reports/inventory-value
 * @access  Public (Tạm thời, có thể bảo vệ sau)
 */
exports.getInventoryReport = async (req, res) => {
    try {
        // Sử dụng Mongoose Aggregation để tính toán
        const report = await Product.aggregate([
            {
                // Chỉ lấy các sản phẩm có tồn kho > 0
                $match: { stockQuantity: { $gt: 0 } }
            },
            {
                // Tính toán giá trị hàng tồn kho cho mỗi sản phẩm: stockQuantity * costPrice
                $addFields: {
                    inventoryValue: { $multiply: ["$stockQuantity", "$costPrice"] }
                }
            },
            {
                // Nhóm tất cả các kết quả lại và tính tổng giá trị tồn kho
                $group: {
                    _id: null, // Nhóm tất cả thành một kết quả duy nhất
                    totalProducts: { $sum: 1 }, // Đếm tổng số loại sản phẩm có hàng
                    totalInventoryValue: { $sum: "$inventoryValue" } // Tính tổng giá trị
                }
            },
            {
                // Định dạng lại kết quả đầu ra
                $project: {
                    _id: 0, // Bỏ trường _id
                    totalProducts: 1,
                    totalInventoryValue: 1
                }
            }
        ]);

        // Nếu không có sản phẩm nào trong kho, trả về 0
        const result = report.length > 0 ? report[0] : { totalProducts: 0, totalInventoryValue: 0 };

        res.status(200).json({
            success: true,
            message: 'Lấy báo cáo tổng giá trị tồn kho thành công.',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo báo cáo tồn kho.',
            error: error.message
        });
    }
};