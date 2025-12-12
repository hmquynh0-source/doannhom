// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DataRefreshProvider } from './context/DataRefreshContext'; 

// Component Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; 
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage'; 
import ReportsPage from './pages/ReportsPage'; 
import SuppliersPage from './pages/SuppliersPage'; // <--- BỔ SUNG IMPORT TRANG NHÀ CUNG CẤP
import CategoriesPage from './pages/CategoriesPage';

// Component Layout
import DashboardLayout from './components/DashboardLayout'; 

// Component Bảo vệ Route
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const LayoutWrapper = () => {
    const location = useLocation();
    
    return (
        <DashboardLayout key={location.pathname}>
            <Routes>
                
                {/* Trang chính Dashboard */}
                <Route path="/" element={<HomePage />} /> 
                
                {/* Trang Quản lý Sản phẩm */}
                <Route path="/products" element={<ProductsPage />} />
                
                {/* Trang Quản lý Nhà cung cấp */}
                <Route path="/suppliers" element={<SuppliersPage />} /> {/* <--- BỔ SUNG ROUTE NHÀ CUNG CẤP */}
                
                <Route path="categories" element={<CategoriesPage />} />
                
                {/* Trang Giao dịch (Nhập/Xuất kho) - Dùng tham số động */}
                <Route path="/transactions/:type" element={<TransactionsPage />} />
                
                {/* Trang Báo cáo */}
                <Route path="/reports" element={<ReportsPage />} />

                {/* Xử lý 404 */}
                <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1 style={{color: '#ef4444'}}>404</h1>
                    <p>Trang bạn tìm kiếm không tồn tại trong khu vực quản trị.</p>
                </div>} />
            </Routes>
        </DashboardLayout>
    );
};


function App() {
    const { isAuthenticated } = useAuth(); 

    return (
        <DataRefreshProvider>
            <Routes>
                
                {/* ===== A. Public Routes (Login & Register) ===== */}
                <Route 
                    path="/login" 
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
                />
                <Route 
                    path="/register" 
                    element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} 
                />
                
                {/* ===== B. Protected Routes (Tất cả khu vực Dashboard) ===== */}
                <Route 
                    path="/*" 
                    element={
                        <ProtectedRoute>
                            <LayoutWrapper />
                        </ProtectedRoute>
                    }
                />
                
            </Routes>
        </DataRefreshProvider>
    );
}

export default App;