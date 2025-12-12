// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin', // Mặc định tạo tài khoản admin cho đồ án
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setLoading(false);
            return;
        }

        try {
            // Gửi dữ liệu đăng ký lên Back-end
            const res = await axios.post('/api/auth/register', {
                name,
                email,
                password,
                role
            });

            // Nếu đăng ký thành công (Server trả về token), chuyển hướng đến trang đăng nhập
            console.log('Đăng ký thành công:', res.data);
            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login');

        } catch (err) {
            console.error(err.response || err);
            const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Đăng Ký Tài Khoản</h2>
                
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                
                <form onSubmit={onSubmit}>
                    {/* Tên người dùng */}
                    <div style={{ marginBottom: '15px' }}>
                        <input type="text" placeholder="Họ tên" name="name" value={name} onChange={onChange} required 
                            style={inputStyle} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '15px' }}>
                        <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required 
                            style={inputStyle} />
                    </div>

                    {/* Mật khẩu */}
                    <div style={{ marginBottom: '15px' }}>
                        <input type="password" placeholder="Mật khẩu" name="password" value={password} onChange={onChange} required minLength="6"
                            style={inputStyle} />
                    </div>

                    {/* Xác nhận Mật khẩu */}
                    <div style={{ marginBottom: '20px' }}>
                        <input type="password" placeholder="Xác nhận Mật khẩu" name="confirmPassword" value={confirmPassword} onChange={onChange} required minLength="6"
                            style={inputStyle} />
                    </div>

                    {/* Nút Đăng ký */}
                    <button type="submit" disabled={loading}
                        style={submitButtonStyle}
                    >
                        {loading ? 'Đang Đăng ký...' : 'Đăng Ký'}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none' }}>Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

// Styles (để làm Component đẹp hơn)
const inputStyle = {
    width: '100%',
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
};

const submitButtonStyle = {
    width: '100%',
    padding: '12px',
    background: '#10b981', // Màu xanh lá cây
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
};

export default RegisterPage;