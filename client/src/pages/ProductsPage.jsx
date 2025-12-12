// client/src/pages/ProductsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext'; 
import { FaBoxes, FaSearch, FaDollarSign, FaEdit, FaTimes } from 'react-icons/fa';

// --- (HÀM TIỆN ÍCH) ---
const formatCurrency = (amount) => {
    // Nếu giá trị là null, undefined, hoặc NaN, trả về '0'
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '0';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'decimal',
        minimumFractionDigits: 0 
    }).format(amount);
};
// -----------------------

const ProductsPage = () => {
    const { token } = useAuth();
    const { refreshSignal } = useDataRefresh(); 
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal Sửa
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Modal Thêm Mới
    const [currentProduct, setCurrentProduct] = useState(null); 

    // ------------------------------------------
    // HÀM TẢI DỮ LIỆU SẢN PHẨM
    // ------------------------------------------
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/products', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setProducts(res.data.data || []);
        } catch (err) {
            console.error('Products fetch error:', err);
            setError('Không thể tải dữ liệu sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [token, refreshSignal]); 

    // ------------------------------------------
    // LOGIC TẠO SẢN PHẨM MỚI
    // ------------------------------------------
    const handleCreateProduct = async (productData) => {
        try {
            await axios.post('/api/products', productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Tạo sản phẩm mới thành công!');
            setIsCreateModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error('Create error:', err);
            alert(`❌ Lỗi tạo sản phẩm: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        }
    };

    // ------------------------------------------
    // LOGIC SỬA SẢN PHẨM
    // ------------------------------------------
    const handleEdit = (product) => {
        setCurrentProduct({
            _id: product._id,
            name: product.name,
            sku: product.sku || '',
            // 💡 SỬA LỖI: Dùng salePrice và costPrice
            salePrice: product.salePrice || 0,
            costPrice: product.costPrice || 0,
            unit: product.unit || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        
        if (!currentProduct || !currentProduct._id) {
            alert('❌ Lỗi: ID sản phẩm không hợp lệ.');
            return;
        }

        try {
            const updateData = {
                name: currentProduct.name,
                sku: currentProduct.sku,
                // 💡 SỬA LỖI: Dùng salePrice và costPrice
                salePrice: parseFloat(currentProduct.salePrice), 
                costPrice: parseFloat(currentProduct.costPrice),
                unit: currentProduct.unit,
            };

            await axios.put(`/api/products/${currentProduct._id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Cập nhật sản phẩm thành công!');
            
        } catch (err) {
            console.error('Update error:', err);
            alert(`❌ Lỗi cập nhật sản phẩm: ${err.response?.data?.message || 'Vui lòng kiểm tra lại.'}`);
        } finally {
            setIsModalOpen(false);
            setCurrentProduct(null); 
            fetchProducts(); 
        }
    };

    // ------------------------------------------
    // LOGIC XÓA SẢN PHẨM
    // ------------------------------------------
    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${productName}?`)) {
            return;
        }

        try {
            await axios.delete(`/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Xóa sản phẩm thành công!');
            fetchProducts();
        } catch (err) {
            console.error('Delete error:', err);
            alert(`❌ Lỗi xóa sản phẩm: ${err.response?.data?.message || 'Không thể xóa sản phẩm.'}`);
        }
    };

    // ------------------------------------------
    // LOGIC TÌM KIẾM & THỐNG KÊ
    // ------------------------------------------
    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products;
        }
        const lowerSearch = searchTerm.toLowerCase();
        
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerSearch) || 
            (p.sku && p.sku.toLowerCase().includes(lowerSearch))
        );
    }, [products, searchTerm]);

    const { totalItems, totalInventoryValue } = useMemo(() => {
        // 💡 SỬA LỖI: Dùng p.stockQuantity (thay vì p.quantity)
        const totalItems = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
        // 💡 SỬA LỖI: Dùng p.stockQuantity * p.salePrice (thay vì p.quantity * p.price)
        const totalInventoryValue = products.reduce((sum, p) => 
            sum + ((p.stockQuantity || 0) * (p.salePrice || 0)), 0); 
        return { totalItems, totalInventoryValue };
    }, [products]);


    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải dữ liệu sản phẩm...</div>;
    if (error) return <div style={{ color: 'red', padding: '4rem', textAlign: 'center' }}>🚨 {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                📦 Quản lý Sản phẩm & Tồn kho
            </h1>
            
            {/* THỐNG KÊ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <Card icon={<FaBoxes />} title="Tổng số mặt hàng" value={products.length} color="#3b82f6" />
                <Card icon={<FaBoxes />} title="Tổng số lượng tồn" value={formatCurrency(totalItems)} color="#10b981" />
                <Card icon={<FaDollarSign />} title="Tổng Giá trị tồn kho" value={`${formatCurrency(totalInventoryValue)} VNĐ`} color="#f59e0b" />
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                {/* THANH TÌM KIẾM VÀ NÚT THÊM */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', maxWidth: '400px' }}>
                        <FaSearch style={{ marginRight: '10px', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Mã SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={searchInputStyle}
                        />
                    </div>
                    {/* 💡 Nút Thêm mới */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        style={createButtonStyle} 
                        title="Thêm sản phẩm mới"
                    >
                        + Thêm sản phẩm mới
                    </button>
                </div>

                
                {/* BẢNG SẢN PHẨM */}
                <ProductsTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} />
            </div>

            {/* MODAL SỬA SẢN PHẨM */}
            {isModalOpen && currentProduct && (
                <EditProductModal 
                    product={currentProduct}
                    onClose={() => {
                        setIsModalOpen(false); 
                        setCurrentProduct(null); 
                    }}
                    onUpdate={handleUpdateProduct}
                    setCurrentProduct={setCurrentProduct}
                />
            )}

            {/* MODAL THÊM SẢN PHẨM MỚI */}
            {isCreateModalOpen && (
                <CreateProductModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateProduct}
                />
            )}
        </div>
    );
};

// --- COMPONENT CON & STYLES ---

const Card = ({ icon, title, value, color }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: `0 10px 20px rgba(0,0,0,0.05), 0 0 0 4px ${color}1A`, borderLeft: `5px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ color, fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>{title}</p>
        <h2 style={{ margin: '0', fontSize: '1.5rem', color: '#1f2937' }}>{value}</h2>
    </div>
);

const ProductsTable = ({ products, onEdit, onDelete }) => {
    return (
        <table style={tableStyle}>
            <thead>
                <tr style={tableHeaderRowStyle}>
                    <th style={tableHeaderStyle}>Mã SKU</th>
                    <th style={tableHeaderStyle}>Tên Sản phẩm</th>
                    <th style={tableHeaderStyle}>Đơn vị</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Tồn kho</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Giá bán</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Giá trị tồn</th>
                    <th style={{...tableHeaderStyle, textAlign: 'center'}}>Hành động</th> 
                </tr>
            </thead>
            <tbody>
                {products.map((p, i) => {
                    // 💡 SỬA LỖI: Dùng p.stockQuantity * p.salePrice
                    const inventoryValue = (p.stockQuantity || 0) * (p.salePrice || 0);
                    return (
                        <tr key={p._id || i} style={tableRowStyle(i)}>
                            <td style={tableCellStyle}>{p.sku || 'N/A'}</td> 
                            <td style={{...tableCellStyle, fontWeight: 600}}>{p.name}</td>
                            <td style={tableCellStyle}>{p.unit}</td>
                            {/* 💡 SỬA LỖI: Dùng p.stockQuantity */}
                            <td style={{...tableCellStyle, textAlign: 'right', fontWeight: 600}}>{formatCurrency(p.stockQuantity)}</td> 
                            {/* 💡 SỬA LỖI: Dùng p.salePrice */}
                            <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(p.salePrice)} VNĐ</td> 
                            <td style={{...tableCellStyle, textAlign: 'right', color: '#059669', fontWeight: 600}}>
                                {formatCurrency(inventoryValue)} VNĐ
                            </td>
                            <td style={{...tableCellStyle, textAlign: 'center'}}>
                                <button 
                                    onClick={() => onEdit(p)} 
                                    style={editButtonStyle}
                                    title="Chỉnh sửa sản phẩm"
                                >
                                    <FaEdit />
                                </button>
                                {/* 💡 NÚT XÓA */}
                                <button 
                                    onClick={() => onDelete(p._id, p.name)} 
                                    style={deleteButtonStyle}
                                    title="Xóa sản phẩm"
                                >
                                    <FaTimes />
                                </button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
};

const EditProductModal = ({ product, onClose, onUpdate, setCurrentProduct }) => (
    <div style={modalBackdropStyle}>
        <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
                <h3 style={{ margin: 0 }}>✏️ Chỉnh sửa Sản phẩm</h3>
                <button onClick={onClose} style={closeButtonStyle}><FaTimes /></button>
            </div>
            <form onSubmit={onUpdate} style={{ display: 'grid', gap: '15px' }}>
                <input type="text" value={product.name} onChange={(e) => setCurrentProduct({...product, name: e.target.value})} placeholder="Tên sản phẩm" required style={modalInputStyle} />
                <input type="text" value={product.sku} onChange={(e) => setCurrentProduct({...product, sku: e.target.value})} placeholder="Mã SKU" style={modalInputStyle} />
                
                {/* 💡 SỬA LỖI: Dùng costPrice */}
                <input 
                    type="number" 
                    value={product.costPrice} 
                    onChange={(e) => setCurrentProduct({...product, costPrice: e.target.value})} 
                    placeholder="Giá nhập/vốn (Cost Price)" 
                    min="0" 
                    required 
                    style={modalInputStyle} 
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* 💡 SỬA LỖI: Dùng salePrice */}
                    <input 
                        type="number" 
                        value={product.salePrice} 
                        onChange={(e) => setCurrentProduct({...product, salePrice: e.target.value})} 
                        placeholder="Giá bán (Sale Price)" 
                        min="0" 
                        required 
                        style={{...modalInputStyle, flex: 1}} 
                    /> 
                    <input type="text" value={product.unit} onChange={(e) => setCurrentProduct({...product, unit: e.target.value})} placeholder="Đơn vị" required style={{...modalInputStyle, flex: 1}} />
                </div>
                <button type="submit" style={modalSaveButtonStyle}>Lưu Thay đổi</button>
            </form>
        </div>
    </div>
);

const CreateProductModal = ({ onClose, onCreate }) => {
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        salePrice: 0,
        costPrice: 0, 
        unit: 'Cái'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            // Đảm bảo giá trị số được parse
            [name]: name === 'salePrice' || name === 'costPrice' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(newProduct);
    };

    return (
        <div style={modalBackdropStyle}>
            <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                    <h3 style={{ margin: 0 }}>➕ Thêm Sản phẩm Mới</h3>
                    <button onClick={onClose} style={closeButtonStyle}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" name="name" value={newProduct.name} onChange={handleChange} placeholder="Tên sản phẩm" required style={modalInputStyle} />
                    <input type="text" name="sku" value={newProduct.sku} onChange={handleChange} placeholder="Mã SKU (Bắt buộc)" required style={modalInputStyle} />
                    
                    <input type="number" name="costPrice" value={newProduct.costPrice} onChange={handleChange} placeholder="Giá nhập/vốn (Cost Price)" min="0" required style={modalInputStyle} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" name="salePrice" value={newProduct.salePrice} onChange={handleChange} placeholder="Giá bán (Sale Price)" min="0" required style={{...modalInputStyle, flex: 1}} />
                        <input type="text" name="unit" value={newProduct.unit} onChange={handleChange} placeholder="Đơn vị (VD: Cái, Hộp)" required style={{...modalInputStyle, flex: 1}} />
                    </div>
                    
                    <button type="submit" style={modalSaveButtonStyle}>Tạo Sản phẩm</button>
                </form>
            </div>
        </div>
    );
};


// --- STYLES (Đã thêm styles cho nút mới) ---
const searchInputStyle = { padding: '12px 15px', borderRadius: '10px', border: '2px solid #e5e7eb', width: '100%', fontSize: '1rem' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: '#f9fafb' };
const tableHeaderStyle = { padding: '1.5rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' };
const tableCellStyle = { padding: '1rem', color: '#374151' };
const tableRowStyle = (i) => ({ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fcfcfc' : 'white' });
const editButtonStyle = { background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', transition: 'background 0.3s' };
const deleteButtonStyle = { background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', transition: 'background 0.3s', marginLeft: '8px' }; // 💡 Style nút Xóa
const createButtonStyle = { background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 20px', cursor: 'pointer', transition: 'background 0.3s', fontWeight: 600, display: 'flex', alignItems: 'center' }; // 💡 Style nút Thêm mới
const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' };
const closeButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' };
const modalInputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' };
const modalSaveButtonStyle = { padding: '12px 20px', background: '#047857', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' };

export default ProductsPage;