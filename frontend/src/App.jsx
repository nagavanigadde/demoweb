import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Products from './components/Products';
import Admin from './components/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/products" replace /> : <Login />}
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
