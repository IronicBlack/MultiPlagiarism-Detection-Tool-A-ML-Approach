import { useState } from 'react';
import { FaFilePdf, FaDownload, FaSearch, FaExternalLinkAlt, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import PlagiarismChart from './PlagiarismChart';

const ResultsView = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  console.log('📊 ResultsView received results:', results);
  
  // If no results or empty results array
  if (!results || results.length === 0) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h2>Plagiarism Detection Results</h2>
        </div>
        <div className="no-results" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No Results Available</h3>
          <p>No plagiarism analysis results were returned. This could be because:</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
            <li>The files contained no text content</li>
            <li>There was an error processing the files</li>
            <li>No plagiarism was detected</li>
          </ul>
          <button className="btn btn-primary" onClick={onReset}>
            Analyze New Files
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall similarity from actual backend results
  const validResults = results.filter(r => r.similarity_score !== undefined);
  const overallSimilarity = validResults.length > 0 
    ? validResults.reduce((acc, curr) => acc + curr.similarity_score, 0) / validResults.length
    : 0;

  // Format results for display - handle both backend format and fallback
  const resultsToDisplay = results.map(result => ({
    document: result.document || result.filename || 'Unknown Document',
    similarity: result.similarity_score || result.similarity || 0,
    is_plagiarized: result.is_plagiarized || false,
    confidence: result.confidence || 0,
    model_used: result.model_used || 'unknown',
    error: result.error,
    // Add mock sources for demo - in real app these would come from backend
    sources: result.sources || [
      { 
        url: 'https://example.com/source1', 
        similarity: Math.floor((result.similarity_score || 0) * 0.6), 
        text: 'Sample matched text from source document...' 
      },
      { 
        url: 'https://example.com/source2', 
        similarity: Math.floor((result.similarity_score || 0) * 0.4), 
        text: 'Another sample of matched content...' 
      }
    ].filter(source => source.similarity > 10) // Only show sources with meaningful similarity
  }));

  console.log('📊 Formatted results for display:', resultsToDisplay);

  const downloadReport = () => {
    // Create a simple report
    const report = {
      overallSimilarity: overallSimilarity.toFixed(1),
      results: resultsToDisplay,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt />;
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FaFilePdf />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FaFileImage />;
    return <FaFileAlt />;
  };

  const getSimilarityClass = (similarity) => {
    if (similarity > 70) return 'high';
    if (similarity > 40) return 'medium';
    return 'low';
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Plagiarism Detection Results</h2>
        <div className="overall-score">
          <span>Overall Similarity:</span>
          <div className={`score ${getSimilarityClass(overallSimilarity)}`}>
            {overallSimilarity.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="results-actions">
        <button className="btn btn-outline" onClick={onReset}>
          Analyze New Files
        </button>
        <button className="btn btn-primary" onClick={downloadReport}>
          <FaDownload /> Download Report
        </button>
      </div>
      
      <div className="results-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Detailed Results
        </button>
        <button 
          className={activeTab === 'sources' ? 'active' : ''}
          onClick={() => setActiveTab('sources')}
        >
          Matched Sources
        </button>
      </div>
      
      <div className="results-content">
        {activeTab === 'overview' && (
          <>
            <div className="chart-section">
              <PlagiarismChart results={resultsToDisplay} />
            </div>
            
            <div className="summary">
              <h3>Analysis Summary</h3>
              <div className="summary-grid">
                {resultsToDisplay.map((result, index) => (
                  <div className="summary-card" key={index}>
                    <div className="file-info">
                      {getFileIcon(result.document)}
                      <span className="file-name" title={result.document}>
                        {result.document.length > 30 
                          ? result.document.substring(0, 30) + '...' 
                          : result.document
                        }
                      </span>
                    </div>
                    <div className={`similarity ${getSimilarityClass(result.similarity)}`}>
                      {result.similarity.toFixed(1)}%
                    </div>
                    <div className="file-details">
                      <span className={`status ${result.is_plagiarized ? 'plagiarized' : 'original'}`}>
                        {result.is_plagiarized ? '⚠️ Plagiarized' : '✅ Original'}
                      </span>
                      <span className="model-used">
                        Model: {result.model_used}
                      </span>
                    </div>
                    {result.error && (
                      <div className="error-message" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                        ⚠️ {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'details' && (
          <div className="detailed-results">
            {resultsToDisplay.map((result, docIndex) => (
              <div className="document-result" key={docIndex}>
                <h3>
                  {getFileIcon(result.document)} {result.document} 
                  <span className={`similarity-badge ${getSimilarityClass(result.similarity)}`}>
                    {result.similarity.toFixed(1)}% similar
                  </span>
                </h3>
                
                <div className="result-meta">
                  <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                  <span>Model: {result.model_used}</span>
                  <span>Status: {result.is_plagiarized ? 'Plagiarized' : 'Original'}</span>
                </div>

                {result.error ? (
                  <div className="error-section">
                    <h4>Processing Error</h4>
                    <p>{result.error}</p>
                  </div>
                ) : result.sources && result.sources.length > 0 ? (
                  <div className="match-details">
                    <div className="match-header">
                      <span>Matched Text</span>
                      <span>Source</span>
                      <span>Similarity</span>
                    </div>
                    
                    {result.sources.map((source, sourceIndex) => (
                      <div className="match-item" key={sourceIndex}>
                        <div className="matched-text">
                          <p>{source.text}</p>
                        </div>
                        <div className="source-info">
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.url} <FaExternalLinkAlt />
                          </a>
                        </div>
                        <div className="source-similarity">
                          {source.similarity}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-matches">
                    <p>No significant matches found. This appears to be original content.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'sources' && (
          <div className="sources-list">
            <h3>Matched Sources</h3>
            <div className="sources-grid">
              {resultsToDisplay.flatMap((result, docIndex) => 
                result.sources ? result.sources.map((source, sourceIndex) => (
                  <div className="source-card" key={`${docIndex}-${sourceIndex}`}>
                    <div className="source-header">
                      <div className="similarity-badge">{source.similarity}% match</div>
                      <div className="document-name">{result.document}</div>
                    </div>
                    <div className="source-url">
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.url} <FaExternalLinkAlt />
                      </a>
                    </div>
                    <div className="matched-preview">
                      <p>{source.text}</p>
                    </div>
                    <button className="btn btn-outline">
                      <FaSearch /> View in Context
                    </button>
                  </div>
                )) : []
              )}
            </div>
            
            {resultsToDisplay.every(result => !result.sources || result.sources.length === 0) && (
              <div className="no-sources" style={{ textAlign: 'center', padding: '40px' }}>
                <h4>No Matched Sources Found</h4>
                <p>The analysis did not find any significant matches with existing sources.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add toast for download confirmation
const toast = {
  success: (message) => {
    if (typeof window !== 'undefined' && window.reactHotToast) {
      window.reactHotToast.success(message);
    } else {
      console.log('✅', message);
    }
  }
};

export default ResultsView;