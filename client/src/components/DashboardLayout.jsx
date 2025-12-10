// client/src/components/DashboardLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { userName, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '260px',
        background: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: 1000
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>Kho Hàng</h2>
        </div>
        <nav style={{ padding: '20px 0' }}>
          <a href="/" style={navStyle('/')}>📦 Sản phẩm</a>
          <a href="/transactions" style={navStyle('/transactions')}>💳 Giao dịch</a>
          <a href="/reports" style={navStyle('/reports')}>📊 Báo cáo</a>
        </nav>
      </div>

      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 1001,
          background: 'white', border: 'none', padding: '10px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        ☰
      </button>

      {/* Overlay khi mobile menu mở */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div style={{ marginLeft: '260px', padding: '20px', paddingTop: '80px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#6b7280' }}>Xin chào, {userName}</span>
            <button 
              onClick={logout}
              style={{
                padding: '10px 20px', background: '#ef4444', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

const navStyle = (path) => ({
  display: 'block', padding: '15px 20px', color: '#374151', textDecoration: 'none',
  borderLeft: '4px solid transparent', marginBottom: '5px',
  ':hover': { background: '#f3f4f6', color: '#1f2937' }
});

export default DashboardLayout;
