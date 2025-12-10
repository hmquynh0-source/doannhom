// server/app.js - FIXED VERSION

// 1. Tải Biến Môi trường
require('dotenv').config(); 

// 2. Import Modules
const express = require('express');
const connectDB = require('./config/db.config'); 
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');

// 3. Khởi tạo Ứng dụng Express
const app = express();

// 4. Middleware cơ bản (Body Parser)
app.use(express.json());

// 5. Định tuyến (Routes) - SỬA ĐÚNG PATH
app.use('/api/products', productRoutes);    // ← /api/products
app.use('/api/transactions', transactionRoutes); // ← /api/transactions  
app.use('/api/auth', authRoutes);           // ← /api/auth (LOGIN OK!)

app.get('/', (req, res) => {
    res.send('Warehouse API Running...');
});

// 6. Khởi động Server - SỬA LOGIC ASYNC
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();  // ← CHỈ GỌI 1 LẦN
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📱 API Endpoints:`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/products`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
