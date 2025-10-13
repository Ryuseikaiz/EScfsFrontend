import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Trang không tồn tại</h2>
        <p className="error-message">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>

        <div className="error-actions">
          <button 
            className="btn-home"
            onClick={() => navigate('/')}
          >
            <FaHome /> Về trang chủ
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="floating-hearts">
          <span className="heart">💕</span>
          <span className="heart">💖</span>
          <span className="heart">💗</span>
          <span className="heart">💝</span>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
