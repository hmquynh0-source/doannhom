import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext'; 
import { FaChartLine, FaDollarSign, FaBoxes, FaExclamationTriangle, FaTimesCircle, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// --- HÀM TIỆN ÍCH ---
const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '0 VNĐ';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'decimal',
        minimumFractionDigits: 0 
    }).format(amount) + ' VNĐ';
};

const formatDecimal = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 0;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(amount);
};

// -----------------------

const ReportsPage = () => {
    const { token } = useAuth();
    const { shouldRefresh } = useDataRefresh(); 
    
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({ 
        // Mặc định 1 tháng
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
    });

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Products
            const productsRes = await axios.get('/api/products', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setProducts(productsRes.data.data || []); 

            // 2. Fetch Transactions (Tất cả giao dịch để tính toán)
            const transactionsRes = await axios.get('/api/transactions', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setTransactions(transactionsRes.data.data || []); 

        } catch (err) {
            console.error('Reports fetch error:', err);
            setError('Không thể tải dữ liệu báo cáo. Vui lòng kiểm tra API.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [token, shouldRefresh]);

    // --- XỬ LÝ DỮ LIỆU BÁO CÁO (USEMEMO ĐÃ SỬA LỖI) ---

    const reportData = useMemo(() => {
        
        // **FIX LỖI MÀN HÌNH TRẮNG: ĐẢM BẢO DỮ LIỆU ĐẦU VÀO LUÔN LÀ MẢNG**
        const validProducts = products || [];
        const validTransactions = transactions || [];
        
        let totalInventoryValue = 0; // Tổng giá trị tồn kho (stockQuantity * costPrice)
        let totalStockCount = 0;
        let lowStockItems = [];
        let outOfStockItems = [];

        // 1. TÍNH TOÁN DỮ LIỆU TỒN KHO & GIÁ TRỊ
        validProducts.forEach(p => {
            const stock = p.stockQuantity || 0;
            const cost = p.costPrice || 0;
            const min = p.minimumStock || 1;
            
            totalInventoryValue += stock * cost;
            totalStockCount += stock;

            if (stock === 0) {
                outOfStockItems.push(p);
            } else if (stock < min) {
                lowStockItems.push(p);
            }
        });
        
        // 2. TÍNH TOÁN DỮ LIỆU TÀI CHÍNH GIAO DỊCH (THEO THỜI GIAN)
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        let totalInValue = 0; // Tổng giá trị nhập kho (Giá vốn * Số lượng)
        let totalOutValue = 0; // Tổng giá trị xuất kho (Giá vốn * Số lượng)

        const filteredTransactions = validTransactions.filter(t => {
            const tDate = new Date(t.createdAt);
            // Lọc theo khoảng thời gian
            return tDate >= startDate && tDate <= endDate;
        });

        filteredTransactions.forEach(t => {
            const value = (t.quantity || 0) * (t.price || 0); // price ở đây là costPrice/SP
            if (t.type === 'in') {
                totalInValue += value;
            } else if (t.type === 'out') {
                totalOutValue += value;
            }
        });


        return {
            totalInventoryValue,
            totalStockCount,
            lowStockItems,
            outOfStockItems,
            totalInValue,
            totalOutValue,
            filteredTransactions,
        };
    }, [products, transactions, dateRange]);


    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang tải dữ liệu báo cáo...</div>;
    if (error) return <div style={{ color: 'red', padding: '4rem', textAlign: 'center' }}>🚨 {error}</div>;

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>📈 Báo Cáo & Thống Kê Kho hàng</h1>

            {/* --- 1. THỐNG KÊ TÀI CHÍNH & TỒN KHO TỔNG QUAN --- */}
            <h2 style={sectionTitleStyle}><FaDollarSign style={{ marginRight: '10px' }} /> Tổng quan Tài chính Kho hàng</h2>
            <div style={statsGridStyle}>
                
                {/* Tổng Giá trị Tồn kho */}
                <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                    <FaDollarSign style={statIconStyle} />
                    <div style={statNumberStyle}>{formatCurrency(reportData.totalInventoryValue)}</div>
                    <p style={statLabelStyle}>Tổng Giá trị Tồn kho (Theo Giá vốn)</p>
                </div>
                
                {/* Tổng Số lượng Tồn */}
                <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <FaBoxes style={statIconStyle} />
                    <div style={statNumberStyle}>{formatDecimal(reportData.totalStockCount)}</div>
                    <p style={statLabelStyle}>Tổng Số lượng Hàng hóa đang Tồn</p>
                </div>

                {/* Tổng giá trị Nhập (Trong kỳ) */}
                <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <FaArrowUp style={statIconStyle} />
                    <div style={statNumberStyle}>{formatCurrency(reportData.totalInValue)}</div>
                    <p style={statLabelStyle}>Tổng Giá trị Nhập (Trong kỳ)</p>
                </div>

                {/* Tổng giá trị Xuất (Trong kỳ) */}
                <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <FaArrowDown style={statIconStyle} />
                    <div style={statNumberStyle}>{formatCurrency(reportData.totalOutValue)}</div>
                    <p style={statLabelStyle}>Tổng Giá trị Xuất (Trong kỳ)</p>
                </div>

            </div>

            <hr style={dividerStyle} />

            {/* --- 2. BIỂU ĐỒ GIAO DỊCH & LỌC NGÀY --- */}
            <h2 style={sectionTitleStyle}><FaCalendarAlt style={{ marginRight: '10px' }} /> Giao dịch theo Thời gian</h2>
            
            <div style={controlsStyle}>
                <label style={{ color: '#4b5563', fontWeight: 600 }}>Chọn kỳ báo cáo:</label>
                <input 
                    type="date" 
                    value={dateRange.start} 
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} 
                    style={dateInputStyle} 
                />
                <span style={{ margin: '0 10px' }}>đến</span>
                <input 
                    type="date" 
                    value={dateRange.end} 
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
                    style={dateInputStyle} 
                />
            </div>

            <div style={chartPlaceholderStyle}>
                <FaChartLine style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '10px' }} />
                <p>Khu vực Biểu đồ Tần suất Giao dịch Nhập/Xuất (Cần tích hợp thư viện biểu đồ)</p>
                <p style={{fontSize: '0.9rem', color: '#6b7280'}}>Tổng số giao dịch trong kỳ: **{reportData.filteredTransactions.length}**</p>
            </div>
            
            <hr style={dividerStyle} />

            {/* --- 3. BÁO CÁO TỒN KHO CẢNH BÁO --- */}
            <h2 style={sectionTitleStyle}><FaExclamationTriangle style={{ marginRight: '10px' }} /> Cảnh báo Tồn kho</h2>

            {/* BÁO CÁO TỒN KHO THẤP */}
            <div style={reportSectionStyle}>
                <h3 style={reportHeaderStyle}><FaExclamationTriangle style={{ color: '#f59e0b' }}/> {reportData.lowStockItems.length} Sản phẩm Tồn kho Thấp</h3>
                <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={tableHeaderStyle}>Tên Sản phẩm</th>
                                <th style={tableHeaderStyle}>SKU</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Tồn hiện tại</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Tối thiểu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.lowStockItems.length > 0 ? (
                                reportData.lowStockItems.map((p) => (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={tableCellStyle}>{p.name}</td>
                                        <td style={tableCellStyle}>{p.sku}</td>
                                        <td style={{...tableCellStyle, textAlign: 'right', fontWeight: 600, color: '#f59e0b'}}>{formatDecimal(p.stockQuantity)} {p.unit}</td>
                                        <td style={{...tableCellStyle, textAlign: 'right'}}>{formatDecimal(p.minimumStock)} {p.unit}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={emptyCellStyle}>🎉 Không có sản phẩm nào Tồn kho Thấp!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BÁO CÁO HẾT HÀNG */}
            <div style={reportSectionStyle}>
                <h3 style={reportHeaderStyle}><FaTimesCircle style={{ color: '#ef4444' }}/> {reportData.outOfStockItems.length} Sản phẩm Đã hết hàng</h3>
                <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={tableHeaderStyle}>Tên Sản phẩm</th>
                                <th style={tableHeaderStyle}>SKU</th>
                                <th style={tableHeaderStyle}>Giá vốn cuối cùng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.outOfStockItems.length > 0 ? (
                                reportData.outOfStockItems.map((p) => (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={tableCellStyle}>{p.name}</td>
                                        <td style={tableCellStyle}>{p.sku}</td>
                                        <td style={tableCellStyle}>{formatCurrency(p.costPrice)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" style={emptyCellStyle}>✨ Không có sản phẩm nào Hết hàng!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
};

// --- STYLES ---

const pageStyle = { padding: '2rem', fontFamily: 'Segoe UI, sans-serif' };
const sectionTitleStyle = { fontSize: '1.8rem', color: '#1f2937', marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', display: 'flex', alignItems: 'center' };
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' };
const statCardStyle = { padding: '2rem', borderRadius: '16px', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s' };
const statIconStyle = { fontSize: '2.5rem', marginBottom: '0.8rem' };
const statNumberStyle = { fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' };
const statLabelStyle = { fontSize: '1rem', opacity: 0.8 };
const dividerStyle = { border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '3rem 0' };

// Chart/Date Controls
const controlsStyle = { display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '10px' };
const dateInputStyle = { padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' };
const chartPlaceholderStyle = { background: '#f9fafb', padding: '4rem', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#4b5563', marginBottom: '2rem' };

// Tables
const reportSectionStyle = { marginBottom: '2rem' };
const reportHeaderStyle = { fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' };
const tableContainerStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: '#f8fafc' };
const tableHeaderStyle = { padding: '1rem', textAlign: 'left', fontWweight: 600, color: '#374151', fontSize: '0.9rem' };
const tableCellStyle = { padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#4b5563' };
const emptyCellStyle = { padding: '2rem', textAlign: 'center', color: '#6b7280' };

export default ReportsPage;