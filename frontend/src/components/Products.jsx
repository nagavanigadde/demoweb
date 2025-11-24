import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await getProducts(searchTerm);
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="products-container">
      <header className="header">
        <h1>Product Catalog</h1>
        <div className="header-right">
          <span className="user-info">
            Welcome, <strong>{user?.username}</strong>
            {isAdmin() && <span className="admin-badge">Admin</span>}
          </span>
          {isAdmin() && (
            <button className="nav-btn" onClick={() => navigate('/admin')}>
              Add Product
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
          {search && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                setSearch('');
                fetchProducts();
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">
          {search ? 'No products found matching your search.' : 'No products available.'}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <p className="price">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
