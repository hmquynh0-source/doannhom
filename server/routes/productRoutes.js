// server/routes/productRoutes.js - CÓ DATA DEMO
const express = require('express');
const router = express.Router();

// DATA DEMO SẴN
const demoProducts = [
  { _id: '1', name: 'iPhone 15 Pro', unit: 'Cái', price: 25000000, quantity: 8 },
  { _id: '2', name: 'Samsung S24 Ultra', unit: 'Cái', price: 22000000, quantity: 3 },
  { _id: '3', name: 'MacBook Air M2', unit: 'Cái', price: 28000000, quantity: 5 },
  { _id: '4', name: 'AirPods Pro 2', unit: 'Cái', price: 6500000, quantity: 12 }
];

// GET /api/products
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: demoProducts
  });
});

// POST /api/products - Thêm mới
router.post('/', (req, res) => {
  const newProduct = {
    _id: Date.now().toString(),
    ...req.body
  };
  demoProducts.push(newProduct);
  res.json({ success: true, data: newProduct });
});

// PUT /api/products/:id - Sửa
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const index = demoProducts.findIndex(p => p._id === id);
  if (index !== -1) {
    demoProducts[index] = { ...demoProducts[index], ...req.body };
    res.json({ success: true, data: demoProducts[index] });
  } else {
    res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = demoProducts.findIndex(p => p._id === id);
  if (index !== -1) {
    demoProducts.splice(index, 1);
    res.json({ success: true, message: 'Xóa thành công' });
  } else {
    res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
  }
});

module.exports = router;
