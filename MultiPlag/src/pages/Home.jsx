import React from 'react';
import { FaSearch, FaFont, FaImage, FaPen, FaGlobe, FaBolt, FaFileDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { user, demoAttempts, useDemoAttempt } = useAuth();

  const handleTryDemo = () => {
    if (user) {
      navigate('/detect');
      return;
    }

    if (demoAttempts > 0) {
      useDemoAttempt();
      navigate('/detect');
    } else {
      toast.error('You have used all your demo attempts. Please register for full access.');
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h2>Advanced Plagiarism Detection Tool</h2>
        <p>Detects plagiarism across text and non-text formats, e.g images, handwritten content and provision to detect multiple languages powered by AI. This tool ensures academic integrity with cutting-edge technology.</p>
        
        <button className="btn btn-primary" onClick={handleTryDemo}>
          <FaSearch /> Try Demo
        </button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-title">
          <h2>Key Features</h2>
          <p>Comprehensive plagiarism detection for modern academic needs</p>
        </div>
        
        <div className="features-grid compact">
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaFont />
            </div>
            <h3>Text Analysis</h3>
          </div>
          
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaImage />
            </div>
            <h3>Image Detection</h3>
          </div>
          
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaPen />
            </div>
            <h3>Handwriting Recognition</h3>
          </div>
          
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaGlobe />
            </div>
            <h3>Cross-Language Detection</h3>
          </div>
          
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaBolt />
            </div>
            <h3>Real-time Processing</h3>
          </div>
          
          <div className="feature-card compact">
            <div className="feature-icon">
              <FaFileDownload />
            </div>
            <h3>Comprehensive Reports</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;