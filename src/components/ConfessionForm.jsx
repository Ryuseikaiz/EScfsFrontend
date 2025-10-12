import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaImage, FaTrash } from 'react-icons/fa';
import './ConfessionForm.css';

function ConfessionForm({ onSubmit, onCancel }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate total number of images
    if (images.length + files.length > 5) {
      setError('Tối đa 5 ảnh');
      return;
    }
    
    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chỉ chọn file ảnh');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Mỗi ảnh không được vượt quá 10MB');
        return;
      }
    }
    
    // Add new images
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke old preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung confession');
      return;
    }

    if (content.length > 1000) {
      setError('Confession không được dài quá 1000 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(content, images);
      setContent('');
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confession-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gửi Confession</h2>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Nội dung Confession <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn về EnStars!!..."
              rows="8"
              maxLength="1000"
              disabled={loading}
            />
            <div className="char-count">
              {content.length}/1000
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              <FaImage /> Thêm ảnh (tối đa 5 ảnh, mỗi ảnh max 10MB)
            </label>
            
            {imagePreviews.length < 5 && (
              <div className="image-upload-area">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <FaImage className="upload-icon" />
                  <span>Chọn ảnh để tải lên ({imagePreviews.length}/5)</span>
                  <small>JPG, PNG, GIF (Max 10MB mỗi ảnh)</small>
                </label>
              </div>
            )}
            
            {imagePreviews.length > 0 && (
              <div className="image-previews-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn-small"
                      onClick={() => handleRemoveImage(index)}
                      disabled={loading}
                      title="Xóa ảnh"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-info">
            <p>📝 Confession của bạn sẽ được admin xem xét trước khi đăng.</p>
            <p>💜 Hãy giữ thái độ tôn trọng và tích cực nhé!</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !content.trim()}
            >
              <FaPaperPlane /> {loading ? 'Đang gửi...' : 'Gửi Confession'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfessionForm;
