import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaFilter, FaCheck, FaTimes, FaChartBar, FaClock, FaMoon, FaSun, FaCheckDouble, FaBan, FaTrashAlt } from 'react-icons/fa';
import { getPendingConfessions, approveConfession, approveAllConfessions, rejectConfession, deleteConfession, deleteAllConfessions, getStats } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [confessions, setConfessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'website', 'google_sheets'
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Reset pagination when filters change
    setPage(1);
    setConfessions([]);
    setHasMore(true);
    fetchData(1, true); // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, sourceFilter, statusFilter]);

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const fetchData = async (pageNum = 1, isInitial = false) => {
    try {
      if (!isInitial && !hasMore) return;
      
      setLoading(true);
      
      // Pass pagination params AND status to the API
      const confessionsData = await getPendingConfessions(sourceFilter, pageNum, 10, statusFilter);
      const statsData = await getStats();
      
      const newConfessions = confessionsData.confessions || [];
      const pagination = confessionsData.pagination || {};
      
      setConfessions(prev => isInitial ? newConfessions : [...prev, ...newConfessions]);
      setStats(confessionsData.stats || statsData);
      
      // Update pagination state
      if (pagination.page >= pagination.totalPages || newConfessions.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, false);
    }
  };


  const handleReject = async (confession) => {
    if (!window.confirm(`Từ chối confession này?\n\n"${confession.content.substring(0, 100)}..."`)) {
      return;
    }

    try {
      setProcessingId(confession.id);
      await rejectConfession(confession.id, confession.sourceType);
      alert('🚫 Đã từ chối confession!');
      fetchData();
    } catch (err) {
      console.error('Error rejecting confession:', err);
      alert('❌ Lỗi khi từ chối confession: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (confession) => {
    if (!window.confirm(`Xóa vĩnh viễn confession này?\n\n"${confession.content.substring(0, 100)}..."`)) {
      return;
    }

    try {
      setProcessingId(confession.id);
      await deleteConfession(confession.id, confession.sourceType);
      alert('🗑️ Đã xóa confession!');
      fetchData();
    } catch (err) {
      console.error('Error deleting confession:', err);
      alert('❌ Lỗi khi xóa confession: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingConfessions = confessions.filter(c => c.status === 'pending');
    
    if (pendingConfessions.length === 0) {
      alert('Không có confession nào đang chờ duyệt!');
      return;
    }

    const filterText = sourceFilter === 'all' ? 'tất cả nguồn' : 
                       sourceFilter === 'website' ? 'từ Website' : 'từ Google Sheets';

    if (!window.confirm(`Duyệt tất cả ${pendingConfessions.length} confession ${filterText}?\n\nQuá trình này có thể mất vài phút.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Call new bulk API
      const result = await approveAllConfessions(sourceFilter, statusFilter);
      
      alert(`✅ Hoàn thành!\n\nĐã duyệt: ${result.successCount} confession\n${result.failCount > 0 ? `Lỗi: ${result.failCount} confession` : 'Không có lỗi!'}`);
      fetchData();
    } catch (err) {
      console.error('Error in bulk approve:', err);
      alert('❌ Lỗi khi duyệt hàng loạt: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    const targetConfessions = confessions.filter(c => 
      statusFilter === 'all' 
        ? (c.status === 'approved' || c.status === 'rejected') 
        : c.status === statusFilter
    );
    
    if (targetConfessions.length === 0) {
      alert('Không có confession nào để xóa!');
      return;
    }

    const filterText = sourceFilter === 'all' ? 'tất cả nguồn' : 
                       sourceFilter === 'website' ? 'từ Website' : 'từ Google Sheets';
    const statusText = statusFilter === 'approved' ? 'đã duyệt' : 
                       statusFilter === 'rejected' ? 'đã từ chối' : 'đã duyệt/từ chối';

    if (!window.confirm(`⚠️ XÓA TẤT CẢ ${targetConfessions.length} confession ${statusText} ${filterText}?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    try {
      setLoading(true);
      
      const result = await deleteAllConfessions(sourceFilter, statusFilter);
      
      alert(`✅ Hoàn thành!\n\nĐã xóa: ${result.successCount} confession\n${result.failCount > 0 ? `Lỗi: ${result.failCount} confession` : 'Không có lỗi!'}`);
      fetchData();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      alert('❌ Lỗi khi xóa hàng loạt: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Đăng xuất khỏi admin panel?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Quản lý Confessions</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="theme-toggle-btn-admin"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon website">
                <FaClock />
              </div>
              <div className="stat-info">
                <h3>{stats.website || 0}</h3>
                <p>Website Pending</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon sheets">
                <FaClock />
              </div>
              <div className="stat-info">
                <h3>{stats.google_sheets || 0}</h3>
                <p>Google Sheets Pending</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon total">
                <FaChartBar />
              </div>
              <div className="stat-info">
                <h3>{stats.total || 0}</h3>
                <p>Tổng Pending</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="filter-section card">
          <div className="filter-header">
            <FaFilter /> <span>Lọc confessions:</span>
          </div>
          
          {/* Source Filter */}
          <div className="filter-group">
            <label>Nguồn:</label>
            <div className="filter-buttons">
              <button
                className={`btn ${sourceFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSourceFilter('all')}
              >
                Tất cả ({stats?.total || 0})
              </button>
              <button
                className={`btn ${sourceFilter === 'website' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSourceFilter('website')}
              >
                Website ({stats?.website || 0})
              </button>
              <button
                className={`btn ${sourceFilter === 'google_sheets' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSourceFilter('google_sheets')}
              >
                Google Sheets ({stats?.google_sheets || 0})
              </button>
            </div>
          </div>



          {/* Bulk Actions for Pending */}
          {statusFilter === 'pending' && confessions.filter(c => c.status === 'pending').length > 0 && (
            <div className="filter-group bulk-actions">
              <label>Thao tác hàng loạt:</label>
              <button
                className="btn btn-approve-all"
                onClick={handleApproveAll}
                disabled={loading}
              >
                <FaCheckDouble /> Duyệt tất cả ({confessions.filter(c => c.status === 'pending').length})
              </button>
            </div>
          )}


        </div>

        {/* Confessions List */}
        <div className="confessions-section">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <p>Đang tải...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="empty-state card">
              <p>✨ Không có confession nào đang chờ duyệt!</p>
            </div>
          ) : (
            <div className="confessions-list">
              {confessions.map((confession) => (
                <div key={confession.id} className="confession-item card fade-in">
                  <div className="confession-meta">
                    <div className="badges">
                      <span className={`source-badge ${confession.sourceType}`}>
                        {confession.sourceType === 'website' ? '🌐 Website' : '📊 Google Sheets'}
                      </span>
                      <span className={`status-badge ${confession.status || 'pending'}`}>
                        {confession.status === 'approved' ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                      </span>
                    </div>
                    <span className="confession-time">
                      <FaClock /> {formatDate(confession.timestamp || confession.submittedAt)}
                    </span>
                  </div>

                  <div className="confession-body">
                    <p>{confession.content}</p>
                  </div>

                  {/* Images Grid */}
                  {confession.images && confession.images.length > 0 && (
                    <div className="confession-images-grid">
                      {confession.images.map((imageUrl, index) => (
                        <div key={index} className="confession-image-preview">
                          <img 
                            src={imageUrl} 
                            alt={`Confession image ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legacy single image support */}
                  {confession.image && (!confession.images || confession.images.length === 0) && (
                    <div className="confession-image-preview">
                      <img 
                        src={confession.image} 
                        alt="Confession"
                      />
                    </div>
                  )}

                  {/* Google Form drive link - Only show if no images array */}
                  {confession.driveLink && (!confession.images || confession.images.length === 0) && (
                    <div className="confession-link">
                      <a href={confession.driveLink} target="_blank" rel="noopener noreferrer">
                        🔗 Xem file đính kèm
                      </a>
                    </div>
                  )}

                  <div className="confession-actions">
                    {confession.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(confession)}
                          disabled={processingId === confession.id}
                        >
                          <FaCheck /> {processingId === confession.id ? 'Đang xử lý...' : 'Duyệt'}
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => handleReject(confession)}
                          disabled={processingId === confession.id}
                        >
                          <FaBan /> Từ chối
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(confession)}
                      disabled={processingId === confession.id}
                    >
                      <FaTimes /> Xóa
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="load-more-container" style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleLoadMore}
                    disabled={loading}
                    style={{ minWidth: '200px' }}
                  >
                    {loading ? 'Đang tải thêm...' : 'Tải thêm confessions'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
