import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaPaperPlane, FaUserShield, FaSearch } from 'react-icons/fa';
import { getConfessions, submitConfession } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import ConfessionForm from '../components/ConfessionForm';
import './Home.css';

function Home() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 confessions per page
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const data = await getConfessions(100); // Fetch up to 100 posts (Facebook API limit)
      setConfessions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching confessions:', err);
      setError('Không thể tải confessions. Vui lòng thử lại sau.');
    } finally {
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Filter confessions based on search query
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
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="home-page">
      {/* Header with Search */}
      <header className="home-header">
        {/* Character Decorations in Navbar */}
        <div className="navbar-character left">
          <img 
            src="https://i.ibb.co/v6c7hSgY/284.png" 
            alt="Hiiro Amagi"
          />
        </div>
        <div className="navbar-character right">
          <img 
            src="https://i.ibb.co/wr4gMmZJ/316.png" 
            alt="Rinne Amagi"
          />
        </div>

        <div className="container">
          <div className="header-top">
            <div className="header-brand">
              <h1 className="title">
                <FaHeart className="heart-icon" />
                EnStars!! Confession
              </h1>
              <p className="subtitle">Chia sẻ những tâm tư của bạn về EnStars!</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <FaPaperPlane /> Gửi Confession
              </button>
              <Link to="/admin/login" className="btn btn-secondary">
                <FaUserShield /> Admin
              </Link>
            </div>
          </div>

          {/* Search Bar in Navbar */}
          <div className="header-search">
            <div className="search-box-navbar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm confession theo ES_ID hoặc nội dung..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="search-results-navbar">
                <strong>{filteredConfessions.length}</strong> kết quả cho "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </header> 

      {/* Confession Form Modal */}
      {showForm && (
        <ConfessionForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Confessions List */}
      <main className="container">
        <div className="confessions-section">
          <h2 className="section-title">
            ✨ Confessions gần nhất ✨
          </h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <p>Đang tải confessions...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="empty-state card">
              <p>Chưa có confession nào được đăng.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Hãy là người đầu tiên!
              </button>
            </div>
          ) : filteredConfessions.length === 0 ? (
            <div className="empty-state card">
              <p>Không tìm thấy confession nào với từ khóa "{searchQuery}"</p>
              <button 
                className="btn btn-primary"
                onClick={() => setSearchQuery('')}
              >
                Xóa tìm kiếm
              </button>
            </div>
          ) : (
            <>
              <div className="confessions-grid">
                {currentConfessions.map((confession) => (
                  <ConfessionCard 
                    key={confession.id} 
                    confession={confession}
                  />
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
                    ← Trước
                  </button>
                  
                  <div className="pagination-pages">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`pagination-page ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
                      ) {
                        return <span key={pageNumber} className="pagination-dots">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p>Made with <FaHeart className="heart-icon" /> for EnStars!! fans</p>
          <p className="small">Developed by ryuseikaiz © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
