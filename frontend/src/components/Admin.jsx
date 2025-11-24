import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addProduct } from '../services/api';
import './Admin.css';

const Admin = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await addProduct({
        name,
        price: parseFloat(price),
        description
      });
      setSuccess('Product added successfully!');
      setName('');
      setPrice('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-container">
      <header className="header">
        <h1>Admin Panel</h1>
        <div className="header-right">
          <span className="user-info">
            Welcome, <strong>{user?.username}</strong>
            <span className="admin-badge">Admin</span>
          </span>
          <button className="nav-btn" onClick={() => navigate('/products')}>
            View Products
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <div className="add-product-form">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                disabled={loading}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
