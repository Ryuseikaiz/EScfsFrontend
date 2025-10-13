import React, { useEffect } from 'react';
import { FaTimes, FaClock, FaHeart, FaComment, FaFacebookF, FaChevronLeft, FaChevronRight, FaShareAlt } from 'react-icons/fa';
import './ConfessionModal.css';

function ConfessionModal({ confession, onClose }) {
  const [showFallback, setShowFallback] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Log for debugging
    console.log('Modal opened for confession:', confession);
    console.log('Current URL:', window.location.href);
    
    // Check if running on production
    const isProduction = window.location.hostname.includes('vercel.app') || 
                         window.location.hostname.includes('enstarsvn');
    
    console.log('Is Production:', isProduction);
    
    // If not production, show fallback immediately
    if (!isProduction) {
      console.log('Not on production domain, showing fallback immediately');
      setShowFallback(true);
      setIsLoading(false);
    } else {
      // On production, try to load Facebook plugins
      if (window.FB) {
        console.log('Facebook SDK found, parsing plugins...');
        setTimeout(() => {
          try {
            window.FB.XFBML.parse(document.querySelector('.modal-facebook-section'));
            console.log('Facebook plugins parsed successfully');
            // Give it 1 second to load, then stop loading indicator and show fallback
            setTimeout(() => {
              setIsLoading(false);
              setShowFallback(true); // Always show fallback for better UX
              console.log('Showing fallback for better interaction');
            }, 1000);
          } catch (error) {
            console.error('Error parsing Facebook plugins:', error);
            setShowFallback(true);
            setIsLoading(false);
          }
        }, 500);
      } else {
        console.warn('Facebook SDK not loaded yet');
        // Retry once after delay
        setTimeout(() => {
          if (window.FB) {
            console.log('Facebook SDK loaded on retry, parsing...');
            window.FB.XFBML.parse(document.querySelector('.modal-facebook-section'));
            setTimeout(() => {
              setIsLoading(false);
              const commentsBox = document.querySelector('.fb-comments iframe');
              if (!commentsBox) {
                setShowFallback(true);
              }
            }, 3000);
          } else {
            setShowFallback(true);
            setIsLoading(false);
          }
        }, 1500);
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [confession]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
          {((confession.images && confession.images.length > 0) || confession.image) && (
            <div className="modal-images">
              {confession.images && confession.images.length > 0 ? (
                confession.images.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`${confession.fullId} - Image ${index + 1}`}
                    className="modal-image"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setImageViewerOpen(true);
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))
              ) : confession.image ? (
                <img 
                  src={confession.image} 
                  alt={confession.fullId}
                  className="modal-image"
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setImageViewerOpen(true);
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
          )}

          {/* Content */}
          <div className="modal-content">
            <p>{confession.content}</p>
          </div>

          {/* Facebook Post Link & Share */}
          {fbUrl && (
            <div className="modal-fb-actions">
              <a 
                href={fbUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fb-link-btn"
              >
                <FaFacebookF /> Xem trên Facebook
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fbUrl)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="fb-share-btn"
              >
                <FaShareAlt /> Chia sẻ
              </a>
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

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="image-viewer-overlay" onClick={() => setImageViewerOpen(false)}>
          <button className="image-viewer-close" onClick={() => setImageViewerOpen(false)}>
            <FaTimes />
          </button>
          
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={confession.images ? confession.images[currentImageIndex] : confession.image}
              alt={`Image ${currentImageIndex + 1}`}
              className="image-viewer-img"
            />
            
            {confession.images && confession.images.length > 1 && (
              <>
                <button 
                  className="image-viewer-nav prev"
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === 0 ? confession.images.length - 1 : prev - 1
                  )}
                >
                  <FaChevronLeft />
                </button>
                
                <button 
                  className="image-viewer-nav next"
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === confession.images.length - 1 ? 0 : prev + 1
                  )}
                >
                  <FaChevronRight />
                </button>
                
                <div className="image-viewer-counter">
                  {currentImageIndex + 1} / {confession.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfessionModal;
