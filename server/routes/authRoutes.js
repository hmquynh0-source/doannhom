const express = require('express');
const router = express.Router();

// Mock login API - Test demo
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@kho.com' && password === 'password123') {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-warehouse-app-123456',
        name: 'Admin Kho',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }
});

module.exports = router;
