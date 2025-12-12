// client/src/pages/CategoriesPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext'; 
import { FaTags, FaPlus, FaEdit, FaTrash, FaTimes, FaLayerGroup } from 'react-icons/fa';

// --- HÀM TIỆN ÍCH ---
const BASE_URL = '/api/categories';

const CategoriesPage = () => {
    const { token } = useAuth();
    const { triggerRefresh, shouldRefresh } = useDataRefresh(); 
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Modal Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    
    // State cho Form
    const [form, setForm] = useState({
        name: '',
        description: '',
    });

    // --- FETCH DATA ---
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(BASE_URL, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Sắp xếp theo tên A-Z
            const sortedData = res.data.data.sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sortedData); 
        } catch (err) {
            console.error('Category fetch error:', err);
            setError('Không thể tải danh sách Loại sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token, shouldRefresh]); // shouldRefresh giúp tự động tải lại

    // --- FORM HANDLERS ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(BASE_URL, form, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerRefresh(); // Kích hoạt tải lại danh sách
            closeModal();
            alert('✅ Tạo Loại sản phẩm mới thành công!');
        } catch (err) {
            console.error('Error creating category:', err);
            alert(`❌ Lỗi tạo: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/${currentCategory._id}`, form, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerRefresh(); 
            closeModal();
            alert('✅ Cập nhật Loại sản phẩm thành công!');
        } catch (err) {
            console.error('Error updating category:', err);
            alert(`❌ Lỗi cập nhật: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };

    // --- MODAL CONTROLS ---
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentCategory(null);
        setForm({ name: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setForm({ 
            name: category.name, 
            description: category.description || '', 
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentCategory(null);
        setIsEditing(false);
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa Loại sản phẩm "${name}" không? Thao tác này có thể ảnh hưởng đến các sản phẩm liên quan.`)) {
            try {
                await axios.delete(`${BASE_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                triggerRefresh();
                alert(`✅ Xóa Loại sản phẩm ${name} thành công.`);
            } catch (err) {
                console.error('Error deleting category:', err);
                // Hiển thị lỗi rõ ràng từ backend nếu có sản phẩm liên kết
                alert(`❌ Lỗi xóa: ${err.response?.data?.message || 'Đã xảy ra lỗi khi xóa.'}`);
            }
        }
    };

    // --- LOADING & ERROR STATES ---
    if (!token) return <div style={{ padding: '4rem', textAlign: 'center', color: '#dc2626' }}>🚨 Lỗi xác thực. Vui lòng đăng nhập lại.</div>;
    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải danh sách Loại sản phẩm...</div>;
    if (error) return <div style={{ color: 'red', padding: '4rem', textAlign: 'center' }}>🚨 {error}</div>;

    return (
        <div style={pageStyle}>
            <h1 style={titleStyle}><FaTags style={{marginRight: '15px', color: '#3b82f6'}} /> Quản lý Loại sản phẩm</h1>

            {/* Header & Button */}
            <div style={headerStyle}>
                <p style={totalCountStyle}>Tổng số Loại sản phẩm: **{categories.length}**</p>
                <button onClick={openCreateModal} style={createButtonStyle}>
                    <FaPlus style={{marginRight: '10px'}}/> Thêm Loại sản phẩm mới
                </button>
            </div>

            {/* Categories Table */}
            <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHeaderRowStyle}>
                            <th style={tableHeaderStyle}>Tên Loại sản phẩm</th>
                            <th style={tableHeaderStyle}>Mô tả</th>
                            <th style={tableHeaderStyle}>Ngày tạo</th>
                            <th style={tableHeaderStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map((c) => (
                                <tr key={c._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{...tableCellStyle, fontWeight: 600, color: '#1d4ed8', display: 'flex', alignItems: 'center'}}>
                                        <FaLayerGroup style={{marginRight: '10px'}} /> {c.name}
                                    </td>
                                    <td style={tableCellStyle}>{c.description || 'Không có mô tả'}</td>
                                    <td style={tableCellStyle}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td style={tableCellStyle}>
                                        <button onClick={() => openEditModal(c)} style={{...actionButtonStyle, background: '#3b82ff'}}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(c._id, c.name)} style={{...actionButtonStyle, background: '#dc2626', marginLeft: '8px'}}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    Chưa có Loại sản phẩm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{margin: 0}}>{isEditing ? '🖊️ Chỉnh sửa Loại sản phẩm' : '➕ Thêm Loại sản phẩm mới'}</h3>
                            <FaTimes style={closeButtonStyle} onClick={closeModal} />
                        </div>
                        <form onSubmit={isEditing ? handleEditSubmit : handleCreateSubmit} style={formStyle}>
                            
                            {/* Tên Loại sản phẩm (Bắt buộc) */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Tên Loại sản phẩm <span style={{color: '#dc2626'}}>*</span></label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="Ví dụ: Điện thoại thông minh" />
                            </div>

                            {/* Mô tả */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Mô tả</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows="3" style={inputStyle} placeholder="Mô tả ngắn về nhóm sản phẩm này..." />
                            </div>
                            
                            <button type="submit" style={{...submitButtonStyle, background: isEditing ? '#3b82f6' : '#10b981'}}>
                                {isEditing ? 'Cập nhật' : 'Thêm Loại sản phẩm'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES (Dùng lại và tùy chỉnh từ SuppliersPage) ---

const pageStyle = { padding: '2rem', fontFamily: 'Segoe UI, sans-serif' };
const titleStyle = { fontSize: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const totalCountStyle = { fontSize: '1.1rem', fontWeight: 600, color: '#374151' };
const createButtonStyle = { padding: '1rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center' };
const tableWrapperStyle = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' };
const tableHeaderStyle = { padding: '1.5rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.9rem' };
const tableCellStyle = { padding: '1.25rem 1rem', color: '#4b5563', fontSize: '0.95rem' };
const actionButtonStyle = { padding: '0.6rem', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', transition: 'background 0.3s' };

// Modal Styles
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' };
const closeButtonStyle = { cursor: 'pointer', fontSize: '1.2rem', color: '#4b5563' };
const formStyle = { display: 'grid', gap: '1.5rem' };
const formGroupStyle = { display: 'flex', flexDirection: 'column' };
const labelStyle = { marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '0.9rem' };
const inputStyle = { padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const submitButtonStyle = { padding: '1.25rem 2rem', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', marginTop: '1rem' };

export default CategoriesPage;