import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useContext } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          Mini Event Platform
        </Link>
      </div>
      <div className="nav-right">
        <button type="button" className="secondary small" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        {user ? (
          <>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Events
            </Link>
            <Link
              to="/my-events"
              className={location.pathname === '/my-events' ? 'active' : ''}
            >
              My Events
            </Link>
            <Link
              to="/events/new"
              className={location.pathname === '/events/new' ? 'active' : ''}
            >
              Create
            </Link>
            <span className="user-chip">Hi, {user.name}</span>
            <button type="button" className="secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
            <Link
              to="/register"
              className={location.pathname === '/register' ? 'active' : ''}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


