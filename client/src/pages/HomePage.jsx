import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStore, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaClipboardCheck } from 'react-icons/fa';

// **********************************
// 📦 COMPONENT CHÍNH: HomePage
// **********************************
const HomePage = () => {
    // Lấy tên người dùng từ AuthContext (để cá nhân hóa lời chào)
    const { userName } = useAuth();
    
    // Giả định thông tin cửa hàng - Dữ liệu tĩnh
    const storeInfo = {
        name: "Cửa hàng Phân phối Thiết bị XYZ",
        address: "52/1A Đường XYZ, Phường 10, Quận 1, TP. Hồ Chí Minh",
        phone: "0901 234 567",
        email: "info@phanphoiXYZ.com",
        hours: "T2 - T7: 8:00 - 17:00",
        slogan: "Đối tác tin cậy cho mọi giải pháp kho vận."
    };

    // Style chung cho các khối nội dung
    const sectionStyle = {
        padding: '2.5rem',
        borderRadius: '16px',
        backgroundColor: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        marginBottom: '2rem',
        fontFamily: 'Arial, sans-serif'
    };

    const textStyle = { color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.75' };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* 1. Header & Ảnh bìa (Hero Section) */}
            <div style={{ 
                // Ảnh bìa đại diện cho kho hàng/công nghệ
                backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?fit=crop&w=1200&h=400")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px',
                minHeight: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Lớp phủ để làm nổi bật chữ */}
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0, 70, 100, 0.6)', 
                    borderRadius: '20px'
                }}></div>
                <div style={{ textAlign: 'center', color: 'white', zIndex: 1, padding: '2rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: 0 }}>
                        👋 Chào mừng, {userName || 'Quản trị viên'}!
                    </h1>
                    <p style={{ fontSize: '1.5rem', marginTop: '0.5rem', opacity: 0.9 }}>
                        {storeInfo.slogan}
                    </p>
                </div>
            </div>

            {/* 2. Lời giới thiệu */}
            <div style={{...sectionStyle, borderLeft: '5px solid #3b82f6', transition: 'all 0.3s'}}>
                <h2 style={{ color: '#1f2937', fontSize: '2rem', marginBottom: '1rem' }}>
                    <FaClipboardCheck style={{ marginRight: '0.75rem', color: '#3b82f6' }} />
                    Hệ thống Quản lý Kho hàng
                </h2>
                <p style={textStyle}>
                    **{storeInfo.name}** được xây dựng để cung cấp một cái nhìn toàn diện và chính xác về hoạt động tồn kho, nhập xuất và định giá sản phẩm.
                </p>
                <p style={textStyle}>
                    Sử dụng các mục **Quản lý Sản phẩm**, **Nhập/Xuất kho** và **Báo cáo** để theo dõi số lượng tồn kho theo thời gian thực, đảm bảo bạn luôn có thể phục vụ khách hàng kịp thời và đưa ra quyết định kinh doanh hiệu quả.
                </p>
            </div>

            {/* 3. Thông tin Cửa hàng và Liên hệ */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem' 
            }}>
                
                {/* Thông tin Cửa hàng */}
                <div style={{...sectionStyle, borderTop: '5px solid #10b981'}}>
                    <h3 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        <FaStore style={{ marginRight: '0.75rem', color: '#10b981' }} /> 
                        Thông tin Cơ sở
                    </h3>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{...textStyle, marginBottom: '1rem' }}>
                            <FaMapMarkerAlt style={{ marginRight: '0.75rem', color: '#60a5fa' }} />
                            **Địa chỉ:** {storeInfo.address}
                        </li>
                        <li style={{...textStyle, marginBottom: '1rem' }}>
                            <FaClock style={{ marginRight: '0.75rem', color: '#f59e0b' }} />
                            **Giờ làm việc:** {storeInfo.hours}
                        </li>
                    </ul>
                </div>

                {/* Thông tin Liên hệ */}
                <div style={{...sectionStyle, borderTop: '5px solid #ef4444'}}>
                    <h3 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        <FaPhoneAlt style={{ marginRight: '0.75rem', color: '#ef4444' }} /> 
                        Hỗ trợ Kỹ thuật
                    </h3>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{...textStyle, marginBottom: '1rem' }}>
                            <FaPhoneAlt style={{ marginRight: '0.75rem', color: '#60a5fa' }} />
                            **Hotline:** <a href={`tel:${storeInfo.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{storeInfo.phone}</a>
                        </li>
                        <li style={{...textStyle, marginBottom: '1rem' }}>
                            <FaEnvelope style={{ marginRight: '0.75rem', color: '#60a5fa' }} />
                            **Email:** <a href={`mailto:${storeInfo.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{storeInfo.email}</a>
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>
    );
};

export default HomePage;