import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await resetPassword(email);
      toast.success('Password reset instructions sent to your email');
      setEmailSent(true);
    } catch (error) {
      toast.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {emailSent ? (
          <>
            <h2>Check Your Email</h2>
            <div className="success-message">
              <p>We've sent password reset instructions to <strong>{email}</strong>.</p>
              <p>Please check your inbox and follow the instructions.</p>
            </div>
            <button 
              className="btn btn-outline back-to-login"
              onClick={() => navigate('/login')}
            >
              <FaArrowLeft /> Back to Login
            </button>
          </>
        ) : (
          <>
            <h2>Reset Your Password</h2>
            <p>Enter your email to receive reset instructions</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <FaEnvelope />
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>Remember your password? <Link to="/login">Sign In</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;