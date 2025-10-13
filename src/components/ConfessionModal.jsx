import React, { useEffect } from 'react';
import { FaTimes, FaClock, FaHeart, FaComment, FaFacebookF } from 'react-icons/fa';
import './ConfessionModal.css';

function ConfessionModal({ confession, onClose }) {
  const [showFallback, setShowFallback] = React.useState(false);
  
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Log for debugging
    console.log('Modal opened for confession:', confession);
    
    // Check if running on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Load/Reload Facebook SDK plugins
    if (window.FB) {
      console.log('Facebook SDK found, parsing plugins...');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          window.FB.XFBML.parse(document.querySelector('.modal-facebook-section'));
          console.log('Facebook plugins parsed successfully');
          
          // If localhost, show fallback after attempting to load
          if (isLocalhost) {
            setTimeout(() => setShowFallback(true), 2000);
          }
        } catch (error) {
          console.error('Error parsing Facebook plugins:', error);
          setShowFallback(true);
        }
      }, 500);
    } else {
      console.warn('Facebook SDK not loaded yet');
      // Retry after a delay if FB SDK not ready
      setTimeout(() => {
        if (window.FB) {
          console.log('Facebook SDK loaded on retry, parsing...');
          window.FB.XFBML.parse(document.querySelector('.modal-facebook-section'));
        } else {
          setShowFallback(true);
        }
      }, 2000);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [confession]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFacebookUrl = (confession) => {
    if (confession.id && confession.id.includes('_')) {
      const [pageId, postId] = confession.id.split('_');
      // Use permalink format that works on both desktop and mobile
      return `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${pageId}`;
    }
    return null;
  };

  const fbUrl = getFacebookUrl(confession);

  return (
    <div className="confession-modal-overlay" onClick={onClose}>
      <div className="confession-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">{confession.fullId || `#ES_${confession.esId}`}</h2>
          <div className="modal-meta">
            <span className="modal-date">
              <FaClock /> {formatDate(confession.createdTime)}
            </span>
            <div className="modal-stats">
              <span><FaHeart /> {confession.reactionCount || 0} reactions</span>
              <span><FaComment /> {confession.commentCount || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Images */}
          {confession.images && confession.images.length > 0 && (
            <div className="modal-images">
              {confession.images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${confession.fullId} - Image ${index + 1}`}
                  className="modal-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="modal-content">
            <p>{confession.content}</p>
          </div>

          {/* Facebook Post Link */}
          {fbUrl && (
            <div className="modal-fb-link">
              <a 
                href={fbUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fb-link-btn"
              >
                <FaFacebookF /> Xem trên Facebook
              </a>
            </div>
          )}

          {/* Facebook Comments Plugin */}
          {fbUrl && (
            <div className="modal-facebook-section">
              <h3 className="facebook-section-title">💬 Comments & Reactions</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Comment và react ngay tại đây bằng tài khoản Facebook của bạn
              </p>
              
              {/* Facebook Like & Share Buttons */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div 
                  className="fb-like" 
                  data-href={fbUrl}
                  data-width=""
                  data-layout="button_count"
                  data-action="like"
                  data-size="large"
                  data-share="true"
                ></div>
              </div>

              {/* Facebook Comments */}
              <div className="facebook-comments-wrapper">
                <div 
                  className="fb-comments" 
                  data-href={fbUrl}
                  data-width="100%" 
                  data-numposts="10"
                  data-order-by="reverse_time"
                  data-colorscheme="light"
                  data-mobile="true"
                ></div>
                
                {/* Loading indicator */}
                {!showFallback && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#ff69b4' }}>
                    <div style={{ 
                      display: 'inline-block',
                      width: '40px',
                      height: '40px',
                      border: '4px solid #ffeef8',
                      borderTop: '4px solid #ff69b4',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '1rem' }}>Đang tải comments...</p>
                  </div>
                )}
              </div>

              {/* Fallback: Show embedded post if comments don't load */}
              {showFallback && (
                <div className="facebook-embed-wrapper" style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#666', marginBottom: '1rem', textAlign: 'center' }}>
                    ⚠️ Comments plugin không khả dụng. Đang hiển thị bản preview:
                  </p>
                  <iframe
                    src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(fbUrl)}&width=500&show_text=true&height=500&appId=567416515679221`}
                    width="100%"
                    height="600"
                    style={{ border: 'none', overflow: 'hidden', borderRadius: '12px' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              )}

              {/* Info Note */}
              <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: '#ffeef8', borderRadius: '12px' }}>
                <p style={{ color: '#666', marginBottom: '0', fontSize: '0.9rem' }}>
                  💡 {showFallback ? 'Để comment và react đầy đủ, click nút "Xem trên Facebook" ở trên' : 'Đăng nhập Facebook để comment và react ngay tại đây'}
                </p>
              </div>
            </div>
          )}

          {/* If no Facebook URL */}
          {!fbUrl && (
            <div className="no-facebook-info">
              <p>⚠️ Không thể tìm thấy link Facebook cho confession này</p>
              <p>Confession này có thể được gửi trực tiếp từ website</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfessionModal;
