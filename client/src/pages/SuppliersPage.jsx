// client/src/pages/SuppliersPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext'; 
import { FaUserTag, FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

// --- HÀM TIỆN ÍCH ---
const BASE_URL = '/api/suppliers';

const SuppliersPage = () => {
    const { token } = useAuth();
    const { triggerRefresh, shouldRefresh } = useDataRefresh(); 
    
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Modal Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    
    // State cho Form
    const [form, setForm] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
    });

    // --- FETCH DATA ---
    const fetchSuppliers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(BASE_URL, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Sắp xếp theo tên A-Z
            const sortedData = res.data.data.sort((a, b) => a.name.localeCompare(b.name));
            setSuppliers(sortedData); 
        } catch (err) {
            console.error('Supplier fetch error:', err);
            setError('Không thể tải danh sách Nhà cung cấp.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSuppliers();
        }
    }, [token, shouldRefresh]);

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
            alert('✅ Tạo Nhà cung cấp thành công!');
        } catch (err) {
            console.error('Error creating supplier:', err);
            alert(`❌ Lỗi tạo Nhà cung cấp: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/${currentSupplier._id}`, form, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerRefresh(); 
            closeModal();
            alert('✅ Cập nhật Nhà cung cấp thành công!');
        } catch (err) {
            console.error('Error updating supplier:', err);
            alert(`❌ Lỗi cập nhật: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };

    // --- MODAL CONTROLS ---
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentSupplier(null);
        setForm({ name: '', contactName: '', phone: '', email: '', address: '' });
        setShowModal(true);
    };

    const openEditModal = (supplier) => {
        setIsEditing(true);
        setCurrentSupplier(supplier);
        setForm({ 
            name: supplier.name, 
            contactName: supplier.contactName || '', 
            phone: supplier.phone || '', 
            email: supplier.email || '', 
            address: supplier.address || '' 
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentSupplier(null);
        setIsEditing(false);
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa Nhà cung cấp "${name}" không? Thao tác này không thể hoàn tác.`)) {
            try {
                await axios.delete(`${BASE_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                triggerRefresh();
                alert(`✅ Xóa Nhà cung cấp ${name} thành công.`);
            } catch (err) {
                console.error('Error deleting supplier:', err);
                alert(`❌ Lỗi xóa: ${err.response?.data?.message || 'Đã xảy ra lỗi khi xóa.'}`);
            }
        }
    };

    // --- LOADING & ERROR STATES ---
    if (!token) return <div style={{ padding: '4rem', textAlign: 'center', color: '#dc2626' }}>🚨 Lỗi xác thực. Vui lòng đăng nhập lại.</div>;
    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải danh sách Nhà cung cấp...</div>;
    if (error) return <div style={{ color: 'red', padding: '4rem', textAlign: 'center' }}>🚨 {error}</div>;

    return (
        <div style={pageStyle}>
            <h1 style={titleStyle}><FaUserTag style={{marginRight: '15px', color: '#059669'}} /> Quản lý Nhà cung cấp</h1>

            {/* Header & Button */}
            <div style={headerStyle}>
                <p style={totalCountStyle}>Tổng số Nhà cung cấp: **{suppliers.length}**</p>
                <button onClick={openCreateModal} style={createButtonStyle}>
                    <FaPlus style={{marginRight: '10px'}}/> Thêm Nhà cung cấp mới
                </button>
            </div>

            {/* Suppliers Table */}
            <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHeaderRowStyle}>
                            <th style={tableHeaderStyle}>Tên Nhà cung cấp</th>
                            <th style={tableHeaderStyle}>Người liên hệ</th>
                            <th style={tableHeaderStyle}>Thông tin liên lạc</th>
                            <th style={tableHeaderStyle}>Địa chỉ</th>
                            <th style={tableHeaderStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.length > 0 ? (
                            suppliers.map((s) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{...tableCellStyle, fontWeight: 600, color: '#047857'}}>{s.name}</td>
                                    <td style={tableCellStyle}>{s.contactName || 'N/A'}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                            {s.phone && <span style={{display: 'flex', alignItems: 'center'}}><FaPhone style={{marginRight: '5px', color: '#4b5563'}}/> {s.phone}</span>}
                                            {s.email && <span style={{display: 'flex', alignItems: 'center'}}><FaEnvelope style={{marginRight: '5px', color: '#4b5563'}}/> {s.email}</span>}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}><FaMapMarkerAlt style={{marginRight: '5px', color: '#4b5563'}}/> {s.address || 'N/A'}</td>
                                    <td style={tableCellStyle}>
                                        <button onClick={() => openEditModal(s)} style={{...actionButtonStyle, background: '#f59e0b'}}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(s._id, s.name)} style={{...actionButtonStyle, background: '#dc2626', marginLeft: '8px'}}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    Chưa có Nhà cung cấp nào. Hãy thêm Nhà cung cấp đầu tiên!
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
                            <h3 style={{margin: 0}}>{isEditing ? '🖊️ Chỉnh sửa Nhà cung cấp' : '➕ Thêm Nhà cung cấp mới'}</h3>
                            <FaTimes style={closeButtonStyle} onClick={closeModal} />
                        </div>
                        <form onSubmit={isEditing ? handleEditSubmit : handleCreateSubmit} style={formStyle}>
                            
                            {/* Tên NCC (Bắt buộc) */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Tên Nhà cung cấp <span style={{color: '#dc2626'}}>*</span></label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="Ví dụ: Công ty A Nhập khẩu" />
                            </div>

                            {/* Người liên hệ */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Người liên hệ</label>
                                <input type="text" name="contactName" value={form.contactName} onChange={handleChange} style={inputStyle} placeholder="Ví dụ: Anh/Chị B" />
                            </div>

                            {/* Phone & Email (Split) */}
                            <div style={grid2Cols}>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Điện thoại</label>
                                    <input type="text" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="090..." />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="contact@email.com" />
                                </div>
                            </div>

                            {/* Địa chỉ */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Địa chỉ</label>
                                <textarea name="address" value={form.address} onChange={handleChange} rows="2" style={inputStyle} placeholder="Địa chỉ đầy đủ..." />
                            </div>
                            
                            <button type="submit" style={{...submitButtonStyle, background: isEditing ? '#f59e0b' : '#047857'}}>
                                {isEditing ? 'Cập nhật' : 'Thêm Nhà cung cấp'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---

const pageStyle = { padding: '2rem', fontFamily: 'Segoe UI, sans-serif' };
const titleStyle = { fontSize: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const totalCountStyle = { fontSize: '1.1rem', fontWeight: 600, color: '#374151' };
const createButtonStyle = { padding: '1rem 2rem', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center' };
const tableWrapperStyle = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' };
const tableHeaderStyle = { padding: '1.5rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.9rem' };
const tableCellStyle = { padding: '1.25rem 1rem', color: '#4b5563', fontSize: '0.95rem' };
const actionButtonStyle = { padding: '0.6rem', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', transition: 'background 0.3s' };

// Modal Styles
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' };
const closeButtonStyle = { cursor: 'pointer', fontSize: '1.2rem', color: '#4b5563' };
const formStyle = { display: 'grid', gap: '1.5rem' };
const formGroupStyle = { display: 'flex', flexDirection: 'column' };
const labelStyle = { marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '0.9rem' };
const inputStyle = { padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const submitButtonStyle = { padding: '1.25rem 2rem', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', marginTop: '1rem' };
const grid2Cols = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' };

export default SuppliersPage;