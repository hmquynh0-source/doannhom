       // client/src/pages/ProductsPage.jsx - FULL PRO VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { token, logout, userName } = useAuth();
  
  // States cơ bản
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    _id: null, name: '', unit: '', price: 0, quantity: 0
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setProducts(response.data.data || []);
      setFilteredProducts(response.data.data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Lỗi kết nối server');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Search & Filter logic
  useEffect(() => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.quantity <= 5 && p.quantity > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'price') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, stockFilter, sortBy, sortOrder, products]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // CRUD functions
  const handleDelete = async (id) => {
    if (window.confirm('Xóa sản phẩm này?')) {
      try {
        await axios.delete(`/api/products/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        fetchProducts();
        alert('✅ Xóa thành công!');
      } catch (err) {
        alert('❌ Lỗi xóa sản phẩm');
      }
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentProduct({ _id: null, name: '', unit: '', price: 0, quantity: 0 });
    setShowModal(true);
    setError(null);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct({ ...product, price: Number(product.price), quantity: Number(product.quantity) });
    setShowModal(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) {
        await axios.put(`/api/products/${currentProduct._id}`, currentProduct, config);
        alert('✅ Cập nhật thành công!');
      } else {
        await axios.post('/api/products', currentProduct, config);
        alert('✅ Thêm sản phẩm thành công!');
      }
      fetchProducts();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu sản phẩm');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
        ⏳ Đang tải dữ liệu kho hàng...
      </div>
    );
  }

  if (error && !showModal) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#dc2626' }}>
        ❌ {error}
        <br />
        <button onClick={fetchProducts} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          🔄 Thử lại
        </button>
      </div>
    );
  }

  // Stats calculations
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
  const lowStock = products.filter(p => Number(p.quantity) <= 5 && Number(p.quantity) > 0).length;
  const outOfStock = products.filter(p => Number(p.quantity) === 0).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1f2937', fontWeight: 'bold' }}>
            📦 Quản lý Sản phẩm
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '1.1rem' }}>
            ({filteredProducts.length} / {products.length} sản phẩm hiển thị)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleOpenCreate} 
            style={{ 
              padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', 
              border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ➕ Thêm sản phẩm mới
          </button>
          <span style={{ color: '#4b5563', fontWeight: 500, fontSize: '1.1rem' }}>
            Xin chào, {userName}
          </span>
          <button 
            onClick={logout} 
            style={{ 
              padding: '0.75rem 1.25rem', background: '#ef4444', color: 'white', 
              border: 'none', borderRadius: '12px', fontWeight: '500', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', 
          padding: '2rem', borderRadius: '20px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(16,185,129,0.3)', cursor: 'pointer',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => e.target.style.transform = 'translateY(-8px)'} 
           onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>Tổng sản phẩm</div>
        </div>
       <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', 
          padding: '2rem', borderRadius: '20px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(245,158,11,0.3)', cursor: 'pointer',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => e.target.style.transform = 'translateY(-8px)'} 
           onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {lowStock}
          </div>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>Hàng sắp hết</div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', 
          padding: '2rem', borderRadius: '20px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(239,68,68,0.3)', cursor: 'pointer',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => e.target.style.transform = 'translateY(-8px)'} 
           onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💰</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ₫{totalValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>Giá trị tồn kho</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ 
        display: 'flex', gap: '1rem', marginBottom: '2rem', 
        flexWrap: 'wrap', alignItems: 'center',
        background: 'white', padding: '1.5rem', borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '1rem 1.5rem', border: '2px solid #e5e7eb',
            borderRadius: '12px', fontSize: '1rem', minWidth: '300px',
            outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        
        <select 
          value={stockFilter} 
          onChange={(e) => setStockFilter(e.target.value)}
          style={{
            padding: '1rem 1.5rem', border: '2px solid #e5e7eb',
            borderRadius: '12px', fontSize: '1rem', background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">📋 Tất cả sản phẩm</option>
          <option value="low">⚠️ Sắp hết hàng (≤ 5)</option>
          <option value="out">❌ Hết hàng</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <span>Sắp xếp:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px' }}
          >
            <option value="name">Tên sản phẩm</option>
            <option value="price">Giá bán</option>
            <option value="quantity">Tồn kho</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '0.75rem 1rem', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {sortOrder === 'asc' ? '⬆️ Tăng dần' : '⬇️ Giảm dần'}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ 
        background: 'white', borderRadius: '16px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                  Tên sản phẩm
                </th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                  Đơn vị
                </th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                  Giá bán
                </th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                  Tồn kho
                </th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ 
                    padding: '4rem 2rem', textAlign: 'center', 
                    color: '#6b7280', fontSize: '1.2rem' 
                  }}>
                    📦 {searchTerm || stockFilter !== 'all' ? 'Không tìm thấy sản phẩm' : 'Kho hàng trống'}
                    <br />
                    <button 
                      onClick={handleOpenCreate} 
                      style={{ 
                        marginTop: '1rem', padding: '0.75rem 1.5rem', 
                        background: '#10b981', color: 'white', border: 'none', 
                        borderRadius: '12px', fontSize: '1rem', cursor: 'pointer' 
                      }}
                    >
                      ➕ Thêm sản phẩm đầu tiên
                    </button>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => (
                  <tr key={product._id} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    transition: 'background-color 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9fafb' : 'white'}>
                    <td style={{ padding: '1.5rem 1rem', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '1.5rem 1rem', color: '#6b7280' }}>{product.unit}</td>
                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                      ₫{Number(product.price).toLocaleString()}
                    </td>
                    <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 'bold',
                        fontSize: '1rem',
                        backgroundColor: Number(product.quantity) === 0 ? '#fee2e2' : 
                                        Number(product.quantity) <= 5 ? '#fed7aa' : '#d1fae5',
                        color: Number(product.quantity) === 0 ? '#991b1b' : 
                               Number(product.quantity) <= 5 ? '#c2410c' : '#065f46'
                      }}>
                        {product.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        style={{
                          padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white',
                          border: 'none', borderRadius: '10px', marginRight: '0.75rem',
                          fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#2563eb';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#3b82f6';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        style={{
                          padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white',
                          border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#dc2626';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#ef4444';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          gap: '1rem', padding: '2rem', background: 'white', 
          borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
        }}>
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '1rem 1.5rem', border: '2px solid #e5e7eb', background: 'white',
              borderRadius: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            ← Trang trước
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151' }}>
            Trang {currentPage} / {totalPages} ({filteredProducts.length} sản phẩm)
          </span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '1rem 1.5rem', border: '2px solid #e5e7eb', background: 'white',
              borderRadius: '12px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* MODAL - FULL CRUD FORM */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div style={{
            background: 'white', padding: '3rem', borderRadius: '20px',
            maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937' }}>
                {isEditing ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '2rem',
                  cursor: 'pointer', color: '#6b7280', padding: 0
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2', color: '#991b1b', padding: '1rem',
                borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #ef4444'
              }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '1rem 1.25rem', border: '2px solid #e5e7eb',
                    borderRadius: '12px', fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="VD: iPhone 15 Pro Max"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Đơn vị tính *
                </label>
                <input
                  type="text"
                  value={currentProduct.unit}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, unit: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '1rem 1.25rem', border: '2px solid #e5e7eb',
                    borderRadius: '12px', fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="VD: Cái, Hộp, Kg"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    required
                    min="0"
                    style={{
                      width: '100%', padding: '1rem 1.25rem', border: '2px solid #e5e7eb',
                      borderRadius: '12px', fontSize: '1rem', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="number"
                    value={currentProduct.quantity}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: Number(e.target.value) })}
                    required
                    min="0"
                    style={{
                      width: '100%', padding: '1rem 1.25rem', border: '2px solid #e5e7eb',
                      borderRadius: '12px', fontSize: '1rem', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitLoading}
                  style={{
                    padding: '1rem 2rem', background: '#6b7280', color: 'white',
                    border: 'none', borderRadius: '12px', fontSize: '1rem',
                    fontWeight: 600, cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.7 : 1
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    padding: '1rem 2rem', background: '#10b981', color: 'white',
                    border: 'none', borderRadius: '12px', fontSize: '1rem',
                    fontWeight: 600, cursor: submitLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    transition: 'all 0.2s', opacity: submitLoading ? 0.7 : 1
                  }}
                >
                  {submitLoading ? '⏳ Đang lưu...' : (isEditing ? '💾 Cập nhật' : '➕ Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;


