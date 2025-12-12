// client/src/components/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
    FiMenu, FiX, FiHome, FiPackage, FiLogIn, FiLogOut, FiBarChart2 
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
    const { userName, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); 
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            setIsMobile(newIsMobile);
            if (!newIsMobile) {
                setSidebarOpen(true);
            } 
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); 
    
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // Hàm để tạo style cho Nav Item (kiểm tra đường dẫn active)
    const navStyle = (path) => ({
        display: 'flex', 
        alignItems: 'center',
        padding: '15px 20px', 
        textDecoration: 'none',
        transition: 'all 0.2s',
        // Kiểm tra active (sử dụng startsWith cho transactions)
        backgroundColor: location.pathname.startsWith(path) ? '#e0e7ff' : 'transparent', 
        color: location.pathname.startsWith(path) ? '#4f46e5' : '#374151', 
        borderLeft: location.pathname.startsWith(path) ? '4px solid #4f46e5' : '4px solid transparent',
        marginBottom: '5px',
        fontWeight: location.pathname.startsWith(path) ? '600' : '400',
    });
    
    // CẬP NHẬT ĐƯỜNG DẪN ĐỘNG
    const navItems = [
        { path: '/', label: 'Trang Chủ', icon: <FiHome style={{ marginRight: '10px' }} /> }, 
        { path: '/products', label: 'Sản phẩm', icon: <FiPackage style={{ marginRight: '10px' }} /> },
        { path: '/transactions/inbound', label: 'Nhập kho', icon: <FiLogIn style={{ marginRight: '10px' }} /> }, 
        { path: '/transactions/outbound', label: 'Xuất kho', icon: <FiLogOut style={{ marginRight: '10px' }} /> }, 
        { path: '/reports', label: 'Báo cáo', icon: <FiBarChart2 style={{ marginRight: '10px' }} /> },
    ];
    
    // Logic tìm tiêu đề trang
    const currentTitle = navItems.find(item => 
        location.pathname === item.path || (
            item.path.startsWith('/transactions') && 
            location.pathname.startsWith('/transactions')
        )
    )?.label || 'Trang Chủ';
    
    return (
        <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
            
            {/* 1. Sidebar (giữ nguyên logic hiển thị) */}
            <div 
                style={{
                    position: isMobile ? 'fixed' : 'sticky', top: 0, left: 0, bottom: 0, width: '260px', minHeight: '100vh', background: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', zIndex: 1000,
                    display: (isMobile && !sidebarOpen && location.pathname !== '/') ? 'none' : 'flex', flexDirection: 'column',
                }}
            >
                {/* Logo/Tiêu đề & Nút đóng Mobile */}
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem', fontWeight: 'bold' }}>Kho Hàng XYZ</h2>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ef4444' }}>
                            <FiX />
                        </button>
                    )}
                </div>
                
                {/* Menu Điều hướng */}
                <nav style={{ padding: '20px 0', flexGrow: 1 }}>
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            style={navStyle(item.path)} 
                            onClick={() => { if (isMobile) setSidebarOpen(false); }}
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </nav>
                
                {/* Footer Sidebar (User/Logout) */}
                <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
                    <p style={{ margin: '10px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                        Tài khoản: **{userName}**
                    </p>
                    <button 
                        onClick={logout}
                        style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* 2. Main content (giữ nguyên logic hiển thị) */}
            <div 
                style={{ 
                    marginLeft: isMobile ? '0' : '260px', padding: '20px', flexGrow: 1, 
                    transition: 'margin-left 0.3s ease', width: isMobile ? '100%' : 'calc(100% - 260px)', minHeight: '100vh',
                }}
            >
                {/* Header */}
                <div style={{ 
                    display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
                    background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    
                    {/* Nút Mobile Menu Toggle */}
                    {isMobile && !sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', marginRight: '1rem', cursor: 'pointer', color: '#4f46e5', padding: '0 10px' }}>
                            <FiMenu />
                        </button>
                    )}

                    {/* Tiêu đề Trang hiện tại */}
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937', fontWeight: 600 }}>
                        {currentTitle}
                    </h1> 
                </div>

                {/* Page content */}
                <main>{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;