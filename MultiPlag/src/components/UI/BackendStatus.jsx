import React from 'react';
import './BackendStatus.css';

const BackendStatus = ({ status }) => {
  const getCircleClass = (circleNumber) => {
    if (status === 'healthy') return `connection-circle circle-${circleNumber} connected`;
    if (status === 'unhealthy') return `connection-circle circle-${circleNumber} degraded`;
    return `connection-circle circle-${circleNumber} disconnected`;
  };

  const getStatusText = () => {
    switch(status) {
      case 'healthy': return 'Connected';
      case 'unhealthy': return 'Partial';
      case 'unreachable': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  return (
    <div className="backend-status-indicator">
      <div className="connection-circles">
        <div className={getCircleClass(1)}></div>
        <div className={getCircleClass(2)}></div>
        <div className={getCircleClass(3)}></div>
      </div>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

export default BackendStatus;