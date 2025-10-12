import React, { useEffect, useRef } from 'react';
import { FaClock, FaFacebookF } from 'react-icons/fa';
import './ConfessionCard.css';

function ConfessionCard({ confession }) {
  const commentsRef = useRef(null);

  useEffect(() => {
    // Reload Facebook comments plugin when confession changes
    if (window.FB && commentsRef.current) {
      window.FB.XFBML.parse(commentsRef.current);
    }
  }, [confession.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract Facebook post URL from ID
  const getFacebookUrl = () => {
    if (confession.id && confession.id.includes('_')) {
      return `https://www.facebook.com/${confession.id}`;
    }
    return null;
  };

  const fbUrl = getFacebookUrl();

  return (
    <div className="confession-card card fade-in">
      {/* ES ID Header */}
      <div className="confession-header">
        <span className="es-id">{confession.fullId || `#ES_${confession.esId}`}</span>
        <span className="confession-date">
          <FaClock /> {formatDate(confession.createdTime)}
        </span>
      </div>

      {/* Confession Content */}
      <div className="confession-content">
        <p>{confession.content}</p>
      </div>

      {/* Images - Show multiple images if available */}
      {confession.images && confession.images.length > 0 ? (
        <div className="confession-images-grid">
          {confession.images.map((imageUrl, index) => (
            <div key={index} className="confession-image">
              <img src={imageUrl} alt={`Confession ${index + 1}`} />
            </div>
          ))}
        </div>
      ) : confession.image ? (
        <div className="confession-image">
          <img src={confession.image} alt="Confession" />
        </div>
      ) : null}

      {/* Facebook Comments */}
      {fbUrl && (
        <div className="fb-comments-section" ref={commentsRef}>
          <div 
            className="fb-comments" 
            data-href={fbUrl}
            data-width="100%" 
            data-numposts="5"
            data-order-by="reverse_time"
          ></div>
        </div>
      )}

      {/* Footer with Facebook Link */}
      <div className="confession-footer">
        {fbUrl && (
          <a 
            href={fbUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fb-link"
          >
            <FaFacebookF /> Xem trên Facebook
          </a>
        )}
      </div>
    </div>
  );
}

export default ConfessionCard;
