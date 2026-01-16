import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatFileSize } from '../../utils/formatFileSize';

const UploadArea = ({ onFilesSelected, isBackendHealthy }) => {
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const { user, demoAttempts } = useAuth();
  const isDemo = !user;

  const onDrop = useCallback(acceptedFiles => {
    setError('');
    
    // In demo mode, only allow one file
    if (isDemo && (files.length + acceptedFiles.length) > 1) {
      setError('Demo mode only allows one file per attempt');
      toast.error('Demo mode only allows one file per attempt');
      return;
    }
    
    // Limit total files to 5 for registered users
    if (!isDemo && (files.length + acceptedFiles.length) > 5) {
      setError('Maximum 5 files allowed');
      toast.error('Maximum 5 files allowed');
      return;
    }
    
    // Store the original File objects directly - NO SPREADING
    const newFiles = acceptedFiles.map(file => {
      return {
        fileObject: file, // Store the actual File object
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        format: file.name.split('.').pop().toUpperCase()
      };
    });
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [files, isDemo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt']
    },
    maxFiles: isDemo ? 1 : 5,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setError('');
  };

  const handleProcess = () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    
    if (!isBackendHealthy) {
      toast.error('Backend is not available. Please check the connection.');
      return;
    }
    
    if (isDemo && files.length > 1) {
      toast.error('Demo mode only allows one file');
      return;
    }
    
    // Show processing info
    toast.success(`Processing ${files.length} file(s)...`);
    
    // Pass the actual File objects, not the wrapper objects
    const fileObjects = files.map(f => f.fileObject);
    onFilesSelected(fileObjects, language);
  };

  return (
    <div className="upload-container">
      <div 
        {...getRootProps()} 
        className={`upload-area ${isDragActive ? 'active' : ''} ${!isBackendHealthy ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} disabled={!isBackendHealthy} />
        <FaCloudUploadAlt className="upload-icon" />
        <h3>Drag & Drop your files here</h3>
        <p>or click to browse files</p>
        
        <div className="file-types">
          <span className="file-type">PDF</span>
          <span className="file-type">DOC/DOCX</span>
          <span className="file-type">TXT</span>
          <span className="file-type">PNG</span>
          <span className="file-type">JPG</span>
        </div>
        
        {isDemo && (
          <div className="demo-warning">
            ⚠️ Demo Mode: 1 file limit, {demoAttempts} attempt(s) remaining
          </div>
        )}

        {!isBackendHealthy && (
          <div className="backend-warning-inline">
            ⚠️ Backend connection issue - file processing disabled
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({files.length}):</h4>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <div className="file-info">
                  <span className="file-name" title={file.name}>{file.name}</span>
                  <div className="file-details">
                    <span className="file-format">{file.format}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="remove-btn"
                  title="Remove file"
                >
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="language-select">
        <label htmlFor="language">Document Language:</label>
        <select 
          id="language" 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={!isBackendHealthy}
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
          <option value="fr">French</option>
          <option value="ar">Arabic</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
        </select>
      </div>
      
      <button 
        className="btn btn-primary process-btn"
        onClick={handleProcess}
        disabled={files.length === 0 || !isBackendHealthy}
      >
        {isDemo ? `Use Demo Attempt (${demoAttempts} left)` : 'Detect Plagiarism'}
      </button>
    </div>
  );
};

export default UploadArea;