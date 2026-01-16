import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaEnvelope, FaSignInAlt, FaUser, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, resetDemoAttempts } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <FaSearch className="logo-icon" />
            <h1>MultiPlagiarismDetector</h1>
          </div>
          
          <nav>
            <ul>
              {!user && (
                <li>
                  <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <FaHome /> Home
                  </NavLink>
                </li>
              )}
              
              {user && (
                <li>
                  <NavLink to="/detect" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <FaSearch /> Detect
                  </NavLink>
                </li>
              )}
              
              <li>
                <NavLink to="/contact" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                  <FaEnvelope /> Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="auth-buttons">
            {!user && (
              <button 
                onClick={resetDemoAttempts}
                className="btn btn-warning"
                style={{ marginRight: '10px' }}
              >
                <FaRedo /> Reset Demo
              </button>
            )}
            
            {user ? (
              <div className="user-menu">
                <span><FaUser /> {user.user_metadata?.name || 'User'}</span>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                <FaSignInAlt /> Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;