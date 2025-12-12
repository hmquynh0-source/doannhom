// client/src/pages/TransactionsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext'; 
import { useParams } from 'react-router-dom'; 
import { FaClipboardList, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';


// --- HÀM TIỆN ÍCH ---
const formatCurrency = (amount) => {
    // Trả về '0' nếu là N/A để tránh lỗi hiển thị trong form/select
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '0';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'decimal',
        minimumFractionDigits: 0 
    }).format(amount);
};
// -----------------------

const TransactionsPage = () => {
    const { token } = useAuth();
    const { triggerRefresh } = useDataRefresh(); 
    const { type: transactionTypeParam } = useParams(); 
    
    // Xác định loại giao dịch thực tế ('in'/'out') và tiêu đề
    const isExport = transactionTypeParam === 'outbound';
    const formType = isExport ? 'out' : 'in';
    const pageTitle = isExport ? '📤 Quản lý Xuất kho' : '📥 Quản lý Nhập kho';

    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State Form: Bổ sung costPrice
    const [form, setForm] = useState({ 
        productId: '', 
        type: formType, 
        quantity: '', 
        note: '',
        costPrice: '' // THÊM TRƯỜNG GIÁ VỐN
    });

    // Đồng bộ formType khi URL thay đổi (Chuyển từ Nhập sang Xuất và ngược lại)
    useEffect(() => {
        setForm(prev => ({ 
            productId: '', // Reset sản phẩm khi chuyển trang
            type: formType, 
            quantity: '', 
            note: '',
            costPrice: '' // Reset giá vốn
        }));
        // Tải lại giao dịch khi formType thay đổi
        fetchTransactions();
        fetchProducts(); // Cần tải lại để lấy tồn kho mới nhất
    }, [formType, token]); 


    // --- FETCH TRANSACTIONS ---
    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/transactions', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            const sortedTransactions = res.data.data || [];
            
            const filteredTransactions = sortedTransactions.filter(t => t.type === formType)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất lên đầu

            setTransactions(filteredTransactions); 

        } catch (err) {
            console.error('Transaction fetch error:', err);
            setError('Không thể tải lịch sử giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    // --- FETCH PRODUCTS ---
    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setProducts(res.data.data || []); 
        } catch (err) {
            console.error('Products fetch error:', err);
        }
    };
    
    // --- SUBMIT LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Định nghĩa lại qty và price trong hàm để đảm bảo giá trị mới nhất
        const qtyToSubmit = parseFloat(form.quantity);
        const priceToSubmit = parseFloat(form.costPrice);
        const selectedProduct = products.find(p => p._id === form.productId);
        const currentStock = selectedProduct ? selectedProduct.stockQuantity || 0 : 0;

        if (qtyToSubmit <= 0 || isNaN(qtyToSubmit)) {
            alert('❌ Số lượng phải là số dương.');
            return;
        }
        
        // KIỂM TRA TỒN KHO KHI XUẤT KHO (RẤT QUAN TRỌNG)
        if (isExport && (!selectedProduct || qtyToSubmit > currentStock)) {
            alert(`❌ Không đủ hàng trong kho. Tồn kho hiện tại của ${selectedProduct.name} là: ${formatCurrency(currentStock)} ${selectedProduct.unit}.`);
            return;
        }

        // KIỂM TRA GIÁ VỐN KHI NHẬP
        if (!isExport && (priceToSubmit <= 0 || isNaN(priceToSubmit))) {
            alert('❌ Khi nhập kho, Giá vốn/SP phải là số dương.');
            return;
        }


        try {
            // Xây dựng payload
            const payload = {
                productId: form.productId, 
                type: form.type,
                quantity: qtyToSubmit, // Sử dụng biến đã được tính toán
                note: form.note,
            };
            
            // Chỉ thêm costPrice nếu là giao dịch nhập kho
            if (!isExport) {
                payload.costPrice = priceToSubmit; // Sử dụng biến đã được tính toán
            }

            await axios.post('/api/transactions', payload, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Xử lý thành công: Tải lại giao dịch, kích hoạt tải lại ProductPage/Dashboard
            fetchTransactions(); 
            triggerRefresh(); 
            
            // Reset Form (giữ lại formType)
            setForm(prev => ({ 
                productId: '', 
                type: formType, 
                quantity: '', 
                note: '',
                costPrice: ''
            }));
            alert('✅ Giao dịch thành công! Tồn kho đã được cập nhật.');
        } catch (err) {
            console.error('Error creating transaction:', err);
            alert(`❌ Lỗi tạo giao dịch: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Lấy thông tin sản phẩm đang chọn để hiển thị tồn kho/đơn vị
    const selectedProduct = products.find(p => p._id === form.productId);
    const currentStock = selectedProduct ? selectedProduct.stockQuantity || 0 : 0;
    const unit = selectedProduct ? selectedProduct.unit : 'Cái';

    // FIX LỖI: Định nghĩa biến qty ở đây để JSX có thể sử dụng
    const qty = parseFloat(form.quantity); 
    
    // Khuyến nghị: Kiểm tra token trước khi tải
    if (!token) return <div style={{ padding: '4rem', textAlign: 'center', color: '#dc2626' }}>🚨 Lỗi xác thực. Vui lòng đăng nhập lại.</div>;


    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải...</div>;
    if (error) return <div style={{ color: 'red', padding: '4rem', textAlign: 'center' }}>🚨 {error}</div>;


    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
                {pageTitle}
            </h1>
            
            {/* Create Transaction Form */}
            <div style={formContainerStyle}>
                <h2 style={formTitleStyle}>
                    {isExport ? <FaArrowDown style={{marginRight: '10px', color: '#dc2626'}}/> : <FaArrowUp style={{marginRight: '10px', color: '#047857'}}/>} 
                    Tạo giao dịch {isExport ? 'Xuất' : 'Nhập'} mới
                </h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={formGridStyle}>
                        
                        {/* 1. Chọn Sản phẩm */}
                        <div style={{gridColumn: 'span 3'}}>
                            <label style={labelStyle}>Sản phẩm:</label>
                            <select name="productId" value={form.productId} onChange={handleChange} required style={inputStyle}>
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name} (Tồn: {formatCurrency(p.stockQuantity)} {p.unit}) - SKU: {p.sku || 'N/A'}
                                </option>
                            ))}
                        </select>
                        </div>
                        
                        {/* Loại giao dịch (Read-only) */}
                        <div>
                            <label style={labelStyle}>Loại giao dịch:</label>
                            <input type="text" name="type" value={isExport ? 'Xuất kho' : 'Nhập kho'} readOnly style={{...inputStyle, background: '#f3f4f6', color: '#4b5563', cursor: 'default'}} />
                        </div>
                        
                        {/* 3. Số lượng */}
                        <div>
                            <label style={labelStyle}>Số lượng ({unit}):</label>
                            <input type="number" name="quantity" placeholder="Số lượng" value={form.quantity} onChange={handleChange} min="1" required style={inputStyle} />
                            {isExport && (
                                <p style={{ fontSize: '0.8rem', color: qty > currentStock ? '#dc2626' : '#6b7280', marginTop: '5px' }}>
                                    {qty > currentStock ? <FaExclamationTriangle style={{marginRight: '5px'}}/> : ''}
                                    Tồn hiện tại: {formatCurrency(currentStock)} {unit}
                                </p>
                            )}
                        </div>
                        
                        {/* 4. Giá vốn/SP (CHỈ HIỆN KHI NHẬP KHO) */}
                        {!isExport && (
                            <div>
                                <label style={labelStyle}>Giá vốn/SP (VNĐ):</label>
                            <input 
                                type="number" 
                                name="costPrice" 
                                placeholder="Giá vốn/SP (VNĐ)" 
                                value={form.costPrice} 
                                onChange={handleChange} 
                                min="1" 
                                required={!isExport} 
                                style={inputStyle} 
                            />
                            </div>
                        )}
                    </div>
                    
                    {/* 5. Ghi chú */}
                    <div>
                        <label style={labelStyle}>Ghi chú (lý do):</label>
                        <textarea name="note" placeholder="Ghi chú (lý do nhập/xuất...)" value={form.note} onChange={handleChange} rows="3" style={{...inputStyle, resize: 'vertical'}} />
                    </div>
                    
                    {/* Nút Submit */}
                    <button type="submit" style={{...buttonStyle, background: isExport ? '#dc2626' : '#047857', marginTop: '1.5rem'}}>
                        <FaClipboardList style={{marginRight: '8px'}} /> Lưu Giao dịch {isExport ? 'Xuất' : 'Nhập'}
                    </button>
                </form>
            </div>

            {/* Transactions Table */}
            <div style={tableWrapperStyle}>
                <h2 style={tableTitleStyle}>Lịch sử {pageTitle} (15 giao dịch gần nhất)</h2>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHeaderRowStyle}>
                            <th style={tableHeaderStyle}>Thời gian</th>
                            <th style={tableHeaderStyle}>Sản phẩm</th>
                            <th style={tableHeaderStyle}>Số lượng</th>
                            <th style={tableHeaderStyle}>Ghi chú</th>
                            <th style={{...tableHeaderStyle, textAlign: 'right'}}>Giá vốn/SP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 15).map((t, i) => ( 
                            <tr key={t._id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={tableCellStyle}>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                                <td style={{...tableCellStyle, fontWeight: 500 }}>{t.productName || 'Sản phẩm đã bị xóa'}</td>
                                <td style={{...tableCellStyle, textAlign: 'right', fontWeight: 600, color: isExport ? '#dc2626' : '#047857'}}>
                                    {isExport ? `-${formatCurrency(t.quantity)}` : `+${formatCurrency(t.quantity)}`} {t.product?.unit || ''}
                                </td>
                                <td style={tableCellStyle}>{t.notes || t.note || '-'}</td>
                                <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(t.price)} VNĐ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Chưa có giao dịch nào được ghi nhận.</p>
                )}
            </div>
        </div>
    );
};

// --- STYLES ---

const formContainerStyle = { background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: '3rem' };
const formTitleStyle = { margin: '0 0 1.5rem 0', color: '#1f2937', display: 'flex', alignItems: 'center' };
const formStyle = { display: 'grid', gap: '1.5rem', maxWidth: '800px' };
// Cấu trúc lại grid để dễ quản lý hơn
const formGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }; 
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 500, color: '#374151', fontSize: '0.9rem' };
const inputStyle = { padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const buttonStyle = { padding: '1.25rem 2rem', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableWrapperStyle = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' };
const tableTitleStyle = { padding: '1.5rem 2rem', margin: 0, borderBottom: '1px solid #e5e7eb', fontWeight: 600 };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' };
const tableHeaderStyle = { padding: '1.5rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.9rem' };
const tableCellStyle = { padding: '1.25rem 1rem', color: '#374151', fontSize: '0.95rem' };

export default TransactionsPage;