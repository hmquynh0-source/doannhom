// client/src/pages/TransactionsPage.jsx - GIAO DỊCH NHẬP/XUẤT
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TransactionsPage = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: '', type: 'in', quantity: '', note: '' });
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions', { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Transaction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Products error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transactions/transactions', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
      setForm({ productId: '', type: 'in', quantity: '', note: '' });
      alert('✅ Giao dịch thành công!');
    } catch (err) {
      alert('❌ Lỗi tạo giao dịch');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>📋 Quản lý Giao dịch</h1>
      
      {/* Create Transaction Form */}
      <div style={{ 
        background: 'white', padding: '2rem', borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: '2rem' 
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1f2937' }}>➕ Tạo giao dịch mới</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
              style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.quantity} {p.unit})</option>
              ))}
            </select>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}
            >
              <option value="in">📥 Nhập kho</option>
              <option value="out">📤 Xuất kho</option>
            </select>
          </div>
          <input
            type="number"
            placeholder="Số lượng"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            min="1"
            required
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
          />
          <textarea
            placeholder="Ghi chú (tùy chọn)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows="3"
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
          />
          <button
            type="submit"
            style={{
              padding: '1.25rem 2rem', background: '#10b981', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '1.1rem',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            💾 Lưu giao dịch
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
              <th style={{ padding: '1.5rem 1rem', textAlign: 'left' }}>Thời gian</th>
              <th style={{ padding: '1.5rem 1rem', textAlign: 'left' }}>Sản phẩm</th>
              <th style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>Loại</th>
              <th style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>Số lượng</th>
              <th style={{ padding: '1.5rem 1rem', textAlign: 'left' }}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={t._id || i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '1.5rem 1rem' }}>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={{ padding: '1.5rem 1rem', fontWeight: 500 }}>{t.productName}</td>
                <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                  <span style={{
                    padding: '0.5rem 1rem', borderRadius: '999px',
                    background: t.type === 'in' ? '#d1fae5' : '#fee2e2',
                    color: t.type === 'in' ? '#065f46' : '#991b1b'
                  }}>
                    {t.type === 'in' ? '📥 Nhập' : '📤 Xuất'}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  {t.quantity}
                </td>
                <td style={{ padding: '1.5rem 1rem' }}>{t.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
