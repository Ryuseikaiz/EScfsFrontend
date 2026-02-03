import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaPaperPlane, FaUserShield, FaSearch, FaClock, FaEye, FaMusic, FaTimes, FaExpand, FaCompress, FaComment, FaMoon, FaSun } from 'react-icons/fa';
import { getConfessions, getConfessionsProgressive, submitConfession } from '../services/api';
import ConfessionForm from '../components/ConfessionForm';
import ConfessionModal from '../components/ConfessionModal';
import './Home-new.css';

function Home() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedConfession, setSelectedConfession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 confessions per page
  const [searchQuery, setSearchQuery] = useState('');
  const [showSpotify, setShowSpotify] = useState(true); // Hiện player mặc định
  const [isSpotifyExpanded, setIsSpotifyExpanded] = useState(false);
  const [isSpotifyMinimized, setIsSpotifyMinimized] = useState(true); // Bắt đầu ở trạng thái ẩn
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfessions();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      
      // Step 1: Quick load first 100 posts
      console.log('⏳ Loading first 100 confessions...');
      const firstBatch = await getConfessions(100);
      setConfessions(firstBatch);
      setLoading(false); // Stop loading spinner, show first 100 immediately
      setError(null);
      console.log('✅ Displayed first 100 confessions');
      
      // Step 2: Background load remaining 400 posts
      try {
        console.log('⏳ Loading remaining confessions in background...');
        const allPosts = await getConfessions(500);
        if (allPosts.length > firstBatch.length) {
          setConfessions(allPosts);
          console.log(`✅ Loaded total ${allPosts.length} confessions`);
        }
      } catch (bgError) {
        console.error('Background load error:', bgError);
        // Keep first batch if background load fails
      }
      
    } catch (err) {
      console.error('Error fetching confessions:', err);
      setError('Không thể tải confessions. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleSubmit = async (content, images) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Append all images
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      await submitConfession(formData);
      setShowForm(false);
      alert('✅ Confession đã được gửi! Chờ admin duyệt nhé 💜');
    } catch (err) {
      throw new Error('Không thể gửi confession. Vui lòng thử lại.');
    }
  };

  // Pagination and filtering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const filteredConfessions = confessions.filter(confession => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const esId = confession.fullId?.toLowerCase() || '';
    const content = confession.content?.toLowerCase() || '';
    return esId.includes(query) || content.includes(query);
  });
  
  const currentConfessions = filteredConfessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConfessions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getFacebookUrl = (confession) => {
    if (confession.id && confession.id.includes('_')) {
      const [pageId, postId] = confession.id.split('_');
      // Use permalink format that works on both desktop and mobile
      return `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${pageId}`;
    }
    return null;
  };


  return (
    <div className="home-page">
      {/* Header/Navbar */}
      <header className="home-header">
        {/* Character decorations */}
        <div className="navbar-character left">
          <img 
            src="https://pbs.twimg.com/media/FIuJexTXsAI3wjL.png" 
            alt="Character decoration"
          />
        </div>
        <div className="navbar-character right">
          <img 
            src="https://pbs.twimg.com/media/Fs-EcRcaIAEPt_z.png" 
            alt="Character decoration"
          />
        </div>

        <nav className="navbar">
          <div className="logo-section">
            <div className="logo">
              <FaHeart />
            </div>
            <span className="logo-text">Ensemble Stars!! VN Confession</span>
          </div>

          <div className="search-section">
            <input
              type="text"
              className="search-bar"
              placeholder="Tìm kiếm cfs theo #ES_ID hoặc nội dung..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaSearch className="search-icon" />
          </div>

          <div className="nav-buttons">
            <button 
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button 
              className="nav-btn primary"
              onClick={() => setShowForm(true)}
            >
              <FaPaperPlane /> Gửi Confession
            </button>
            <Link to="/admin/login">
              <button className="nav-btn secondary">
                <FaUserShield /> Admin
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Ensemble Stars!! VN Confession</h1>
          <p>https://www.facebook.com/enstars.cfs</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Search Results Info */}
        {searchQuery && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-light)' }}>
            Tìm thấy <strong>{filteredConfessions.length}</strong> confessions
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--primary-pink)' }}>
              Đang tải confessions...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <h3>⚠️ Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button 
              className="nav-btn primary" 
              onClick={fetchConfessions}
              style={{ marginTop: '1rem' }}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredConfessions.length === 0 && (
          <div className="no-results">
            <h3>Không tìm thấy confession nào</h3>
            <p>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        )}

        {/* Confessions Grid */}
        {!loading && !error && currentConfessions.length > 0 && (
          <>
            <div className="confessions-grid">
              {currentConfessions.map((confession) => (
                <div 
                  key={confession._id} 
                  className="confession-card"
                  onClick={() => setSelectedConfession(confession)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Card Image */}
                  <div className="card-image-container">
                    {confession.images && confession.images.length > 0 ? (
                      <img 
                        src={confession.images[0]} 
                        alt={confession.fullId}
                        className="card-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23a8d8ea;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23aa96da;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23fcbad3;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad1)" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="white"%3E♥%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : confession.image ? (
                      <img 
                        src={confession.image} 
                        alt={confession.fullId}
                        className="card-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23a8d8ea;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23aa96da;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23fcbad3;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad1)" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="white"%3E♥%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div 
                        className="card-image no-image-placeholder"
                      >
                        <FaHeart />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <h3 className="card-title">{confession.fullId || `#ES_${confession.esId}`}</h3>
                    
                    <div className="card-meta">
                      <span>
                        <FaClock /> {formatDate(confession.createdTime)}
                      </span>
                    </div>

                    <p className="card-description">
                      {confession.content}
                    </p>

                    <div className="card-footer">
                      <div className="card-stats">
                        <span className="stat-item">
                          <FaHeart style={{ color: '#ff69b4' }} /> {confession.reactionCount || 0}
                        </span>
                        <span className="stat-item">
                          <FaComment style={{ color: '#ff69b4' }} /> {confession.commentCount || 0}
                        </span>
                      </div>
                      <button 
                        className="card-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const fbUrl = getFacebookUrl(confession);
                          if (fbUrl) {
                            window.open(fbUrl, '_blank');
                          } else {
                            alert('Không tìm thấy link Facebook cho confession này');
                          }
                        }}
                      >
                        Xem thêm →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}

                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Confession Form Modal */}
      {showForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem'
          }}
          onClick={() => setShowForm(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'white', 
              borderRadius: '20px', 
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <ConfessionForm 
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Confession Detail Modal */}
      {selectedConfession && (
        <ConfessionModal 
          confession={selectedConfession}
          onClose={() => setSelectedConfession(null)}
        />
      )}

      {/* Spotify Player - Luôn tồn tại trong DOM để nhạc không dừng */}
      <div 
        className={`spotify-player ${isSpotifyExpanded ? 'expanded' : 'minimized'}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          display: isSpotifyMinimized ? 'none' : 'block'
        }}
      >
        <div className="spotify-header">
          <div className="spotify-title">
            <FaMusic style={{ marginRight: '0.5rem' }} />
            <span>Ensemble Stars Music</span>
          </div>
          <div className="spotify-controls">
            <button 
              className="spotify-control-btn"
              onClick={() => setIsSpotifyExpanded(!isSpotifyExpanded)}
              title={isSpotifyExpanded ? "Thu nhỏ" : "Phóng to"}
            >
              {isSpotifyExpanded ? <FaCompress /> : <FaExpand />}
            </button>
            <button 
              className="spotify-control-btn"
              onClick={() => setIsSpotifyMinimized(true)}
              title="Ẩn player (nhạc vẫn chạy)"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="spotify-content">
          <iframe 
            data-testid="embed-iframe" 
            style={{
              borderRadius: '12px',
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            src="https://open.spotify.com/embed/playlist/6PUmJFyic4OAdXCee4PN8q?utm_source=generator"
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          />
        </div>
      </div>

      {/* Show Spotify Button (when minimized) */}
      {isSpotifyMinimized && (
        <button 
          className="show-spotify-btn"
          onClick={() => setIsSpotifyMinimized(false)}
          title="Hiện player (nhạc đang chạy)"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 99999
          }}
        >
          <FaMusic />
        </button>
      )}
    </div>
  );
}

export default Home;
