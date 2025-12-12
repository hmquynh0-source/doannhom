// server/controllers/TransactionController.js

const Transaction = require('../models/Transaction');
const Product = require('../models/Product'); 

/**
 * @desc    Tạo một Giao dịch (Nhập hoặc Xuất kho)
 * @route   POST /api/transactions
 */
exports.createTransaction = async (req, res) => {
    try {
        // 🚨 NHẬN ĐẦY ĐỦ TRƯỜNG DỮ LIỆU TỪ FRONTEND ĐÃ SỬA
        const { productId, type, quantity, note, costPrice } = req.body; 
        
        const numQuantity = parseFloat(quantity);
        const numCostPrice = parseFloat(costPrice) || 0; // Giá vốn phải là số

        // Validation cơ bản
        if (!productId || !type || isNaN(numQuantity) || numQuantity <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp đầy đủ thông tin: ID sản phẩm, loại giao dịch, và số lượng hợp lệ (> 0).' 
            });
        }
        
        // Validation: Cần giá vốn khi nhập
        if (type === 'in' && numCostPrice <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Khi nhập kho, giá vốn phải lớn hơn 0.' 
            });
        }

        // 1. Tìm Sản phẩm
        const existingProduct = await Product.findById(productId); 

        if (!existingProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy Sản phẩm này để thực hiện giao dịch.' 
            });
        }

        // 2. Tính toán Tồn kho mới
        let newStock;
        let oldCostPrice = existingProduct.costPrice || 0;

        if (type === 'in') {
            newStock = existingProduct.stockQuantity + numQuantity;
        } else if (type === 'out') {
            newStock = existingProduct.stockQuantity - numQuantity;
            
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

        // 3. Cập nhật số lượng Tồn kho của Sản phẩm VÀ GIÁ VỐN
        
        if (type === 'in') {
            // 💡 TÍNH GIÁ VỐN TRUNG BÌNH KHI NHẬP KHO
            const oldTotalValue = existingProduct.stockQuantity * oldCostPrice;
            const incomingValue = numQuantity * numCostPrice;
            const newTotalStock = existingProduct.stockQuantity + numQuantity;
            
            if (newTotalStock > 0) {
                // Công thức giá vốn trung bình di động: (Tổng giá trị cũ + Tổng giá trị mới nhập) / Tổng số lượng mới
                existingProduct.costPrice = (oldTotalValue + incomingValue) / newTotalStock; 
            } else {
                existingProduct.costPrice = numCostPrice; // Trường hợp nhập lô hàng đầu tiên
            }
            existingProduct.stockQuantity = newStock;
            
        } else if (type === 'out') {
            // Logic XUẤT KHO: Cập nhật tồn kho
            existingProduct.stockQuantity = newStock;
        }
        
        // Lưu lại sản phẩm đã cập nhật
        await existingProduct.save(); 

        // 4. Ghi lại Giao dịch vào Database (Tạo Transaction)
        const transaction = await Transaction.create({
            product: productId, 
            type,
            quantity: numQuantity,
            // 💡 Dùng giá vốn ĐÃ LƯU TRONG SẢN PHẨM để ghi lại giá vốn của giao dịch
            price: type === 'in' ? numCostPrice : oldCostPrice, // Lưu giá nhập (in) hoặc giá vốn cũ (out)
            notes: note || '' 
        }); 

        res.status(201).json({ 
            success: true, 
            message: `Giao dịch ${type === 'in' ? 'nhập' : 'xuất'} kho thành công. Tồn kho mới: ${newStock}`, 
            data: transaction 
        });

    } catch (error) {
        console.error('Lỗi server khi tạo giao dịch:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Thực hiện giao dịch thất bại.', 
            error: error.message 
        });
    }
};

/**
 * @desc    Lấy tất cả các Giao dịch
 * @route   GET /api/transactions
 */
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            // Populate (điền đầy đủ) thông tin sản phẩm cần thiết cho hiển thị
            .populate('product', 'name sku unit stockQuantity')
            .sort({ createdAt: -1 })
            .lean(); 

        const processedTransactions = transactions.map(t => ({
            ...t,
            // Đảm bảo tên sản phẩm được hiển thị (tránh lỗi nếu product là null)
            productName: t.product ? t.product.name : 'Sản phẩm đã bị xóa',
            // Đảm bảo tồn kho được hiển thị
            stockQuantity: t.product ? t.product.stockQuantity : 0
        }));

        res.status(200).json({ 
            success: true, 
            count: processedTransactions.length, 
            data: processedTransactions 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lấy lịch sử giao dịch thất bại.', 
            error: error.message 
        });
    }
};

// ... (Các hàm khác nếu có, ví dụ: exports.getInventoryReport)
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