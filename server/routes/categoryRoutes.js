// server/routes/categoryRoutes.js

const express = require('express');
const { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các route đều yêu cầu xác thực (protect)
router.route('/')
    .get(protect, getCategories)     // GET /api/categories
    .post(protect, createCategory);  // POST /api/categories

router.route('/:id')
    .put(protect, updateCategory)    // PUT /api/categories/:id
    .delete(protect, deleteCategory); // DELETE /api/categories/:id

module.exports = router;