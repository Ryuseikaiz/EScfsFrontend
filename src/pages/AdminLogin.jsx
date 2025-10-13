import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaLock, FaHome, FaMoon, FaSun } from 'react-icons/fa';
import { adminLogin } from '../services/api';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const response = await adminLogin(username, password);
      
      // Save token to localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Có dỡn hong má?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <button 
        className="theme-toggle-btn-fixed"
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
      >
        {isDarkMode ? <FaSun /> : <FaMoon />}
      </button>

      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <div className="admin-icon">
              <FaUserShield />
            </div>
            <h1>Admin Login</h1>
            <p>Hội đồng quản trị ES!!VN Confession</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <FaUserShield /> Tên đăng nhập
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock /> Mật khẩu
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="back-to-home">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <FaHome /> Về trang chủ
            </button>
          </div>
        </div>

        <div className="login-info">
          <p>🔒 Khu vực quản trị</p>
          <p>Muốn vào thì liên hệ ngay Eichi Tenshouin</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
