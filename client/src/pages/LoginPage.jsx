// client/src/pages/LoginPage.jsx (ĐÃ FIX - Copy paste hoàn toàn)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ FIX: ../contexts/

const LoginPage = () => {
    const [email, setEmail] = useState('admin@kho.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success) {
                const { token, name, role } = response.data.data;
                login(token, name); // ✅ FIX: Bỏ role param tạm thời
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra Server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#f3f4f6', 
            padding: '2rem' 
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '400px'
            }}>
                {/* Logo + Title */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        backgroundColor: '#4f46e5',
                        borderRadius: '16px',
                        margin: '0 auto 1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg style={{ width: '28px', height: '28px', color: 'white' }} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-4V7m8 10v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2"/>
                        </svg>
                    </div>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '0.5rem' 
                    }}>
                        Đăng nhập Kho hàng
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        admin@kho.com / password123
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '500', 
                            color: '#374151' 
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', 
                                padding: '0.75rem 1rem', 
                                border: '1px solid #d1d5db',
                                borderRadius: '8px', 
                                fontSize: '1rem',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                outline: 'none'
                            }}
                            placeholder="admin@kho.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '500', 
                            color: '#374151' 
                        }}>
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', 
                                padding: '0.75rem 1rem', 
                                border: '1px solid #d1d5db',
                                borderRadius: '8px', 
                                fontSize: '1rem',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                outline: 'none'
                            }}
                            placeholder="password123"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', 
                            padding: '1rem', 
                            backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            fontSize: '1rem', 
                            fontWeight: '500', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    <strong>Demo:</strong> admin@kho.com / password123
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
