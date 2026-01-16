import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadArea from '../components/Detection/UploadArea';
import ResultsView from '../components/Detection/ResultsView';
import BackendStatus from '../components/UI/BackendStatus';
import { toast } from 'react-hot-toast';

const Detect = () => {
  const navigate = useNavigate();
  const { user, demoAttempts, useDemoAttempt } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const isDemo = !user;

  const API_BASE = 'http://localhost:8000/api/v1';

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
          const health = await response.json();
          setBackendStatus(health.status);
        } else {
          setBackendStatus('unhealthy');
        }
      } catch (error) {
        setBackendStatus('unreachable');
      }
    };

    checkBackendHealth();
  }, [API_BASE]);

  const handleFilesSelected = async (files, language) => {
    if (isDemo) {
      if (demoAttempts <= 0) {
        toast.error('You have no demo attempts left. Please register for full access.');
        return;
      }
      useDemoAttempt();
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      formData.append('language', language);

      if (user) {
        formData.append('user_id', user.id);
      }
      
      const response = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.processing_id) {
        const finalResults = await pollForResults(result.processing_id);
        
        if (finalResults && finalResults.results) {
          setResults(finalResults.results);
        } else {
          setResults([]);
        }
        
        setProcessing(false);
        setAnalysisComplete(true);
        
        if (isDemo) {
          toast.success(`Demo completed! ${demoAttempts - 1} demo attempt(s) remaining.`);
        } else {
          toast.success('Analysis completed successfully!');
        }
      } else {
        throw new Error('No processing ID received from server');
      }
    } catch (error) {
      let errorMessage = error.message || 'Failed to process files';
      
      if (errorMessage.includes('422')) {
        errorMessage = 'Invalid request format. Please check file types.';
      } else if (errorMessage.includes('413')) {
        errorMessage = 'File too large. Maximum file size is 50MB.';
      } else if (errorMessage.includes('415')) {
        errorMessage = 'Unsupported file type.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const pollForResults = async (processingId) => {
    let attempts = 0;
    const maxAttempts = 300;
    const pollInterval = 2000;
    
    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`${API_BASE}/status/${processingId}`);
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to get status: ${statusResponse.status}`);
        }
        
        const status = await statusResponse.json();
        
        if (status.status === 'completed') {
          const resultsResponse = await fetch(`${API_BASE}/results/${processingId}`);
          
          if (!resultsResponse.ok) {
            throw new Error(`Failed to get results: ${resultsResponse.status}`);
          }
          
          const results = await resultsResponse.json();
          return results;
          
        } else if (status.status === 'error') {
          throw new Error(status.error || 'Processing failed on server');
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        
      } catch (error) {
        throw new Error(`Failed to get results: ${error.message}`);
      }
    }
    
    throw new Error('Processing timeout - please try again');
  };

  const handleReset = () => {
    setResults([]);
    setAnalysisComplete(false);
    setProcessing(false);
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const health = await response.json();
      setBackendStatus(health.status);
      toast.success(`Backend status: ${health.status}. ${health.total_models_loaded}/4 models loaded.`);
    } catch (error) {
      toast.error('Backend connection failed');
    }
  };

  const testSimpleUpload = async () => {
    try {
      const testFile = new File(['Test file content for plagiarism detection.'], 'test.txt', { 
        type: 'text/plain' 
      });
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('language', 'en');
      
      const response = await fetch(`${API_BASE}/test-upload-simple`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      toast.success('Simple upload test successful!');
    } catch (error) {
      toast.error(`Simple upload test failed: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="upload-section">
        <div className="section-title">
          <h2>Detect Plagiarism</h2>
          <p>
            {user ? `Welcome back, ${user.user_metadata?.name || 'User'}!` : 'Demo Mode'}
            {isDemo && (
              <span className="demo-warning">
                Demo attempts remaining: {demoAttempts}
              </span>
            )}
          </p>
          
          <div className="backend-status">
            <BackendStatus status={backendStatus} />
  
          </div>

          {isDemo && demoAttempts > 0 && (
            <div className="demo-attempts">
              ⚠️ You have {demoAttempts} demo attempt{demoAttempts !== 1 ? 's' : ''} remaining
            </div>
          )}
          
          {isDemo && demoAttempts <= 0 && (
            <div className="demo-warning">
              ❌ No demo attempts remaining. Please register for full access.
            </div>
          )}
        </div>
        
        {processing ? (
          <div className="processing-container">
            <div className="processing-spinner"></div>
            <h3>Analyzing your documents...</h3>
            <p>This may take a few moments. Please don't close this page.</p>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>
            <div className="processing-info">
              <p>Processing with AI models:</p>
              <ul>
                <li>✓ Text Similarity Analysis</li>
                <li>✓ Handwriting Recognition</li>
                <li>✓ Cross-language Detection</li>
                <li>✓ Image Similarity Check</li>
              </ul>
              <p className="processing-note">
                Note: First-time processing may take longer as models initialize.
              </p>
            </div>
          </div>
        ) : analysisComplete ? (
          <ResultsView results={results} onReset={handleReset} />
        ) : (
          <UploadArea 
            onFilesSelected={handleFilesSelected} 
            isBackendHealthy={backendStatus === 'healthy'}
          />
        )}
      </div>
    </div>
  );
};

export default Detect;