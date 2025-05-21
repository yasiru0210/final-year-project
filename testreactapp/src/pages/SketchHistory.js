// src/pages/SketchHistory.js

import React, { useEffect, useState } from 'react';
import './SketchHistory.css';

export default function SketchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sketches from localStorage
    const savedSketches = localStorage.getItem('sketches');
    if (savedSketches) {
      setHistory(JSON.parse(savedSketches));
    }
    setLoading(false);
  }, []);

  return (
    <div className="history-container">
      <div className="history-content">
        <h2 className="history-title">Sketch Upload History</h2>

        {loading && <p className="loading-message loading-pulse">Loading history...</p>}

        {!loading && history.length === 0 && (
          <p className="no-results">No sketch history found.</p>
        )}

        {/* Grid for history items */}
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-image-container">
                <img
                  src={item.image}
                  alt={`Sketch ${item.id}`}
                  className="history-image"
                />
              </div>
              <div className="history-info">
                <p className="history-timestamp">{new Date(item.timestamp).toLocaleString()}</p>
                <p className="history-description">{item.name}</p>
                <div className="history-weights">
                  <h4>Feature Weights:</h4>
                  {Object.entries(item.weights).map(([feature, weight]) => (
                    <p key={feature} className="weight-item">
                      <span className="feature-name">{feature}:</span>
                      <span className="weight-value">{weight.toFixed(1)}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 