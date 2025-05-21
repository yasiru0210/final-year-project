// src/pages/Results.jsx

import React, { useEffect, useState } from "react";
import "./Results.css";

// Inline SVG placeholder image
const placeholderImage = `data:image/svg+xml;base64,${btoa(`
<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#F3F4F6"/>
  <circle cx="150" cy="100" r="50" fill="#D1D5DB"/>
  <path d="M75 250C75 211.34 108.34 180 150 180C191.66 180 225 211.34 225 250V300H75V250Z" fill="#D1D5DB"/>
</svg>
`)}`;

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulating API call with mock data
    const fetchMockData = async () => {
      try {
        // Create mock data with placeholder image
        const mockData = Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          image: placeholderImage,
          description: `Person ${index + 1}`,
          similarity: (Math.random() * 0.5 + 0.5).toFixed(2), // Random similarity between 0.5 and 1
          metadata: {
            age: Math.floor(Math.random() * 30 + 20), // Random age between 20-50
            gender: Math.random() > 0.5 ? "Male" : "Female",
            location: `Location ${index + 1}`
          }
        }));

        // Sort by similarity score
        mockData.sort((a, b) => b.similarity - a.similarity);
        
        setResults(mockData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading results:", err);
        setError("Failed to load results. Please try again later.");
        setLoading(false);
      }
    };

    fetchMockData();
  }, []);

  const getBadge = (index) => {
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <h2 className="results-title">Identification Results</h2>

        {loading && <p className="loading-message loading-pulse">Loading results...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && results.length === 0 && (
          <p className="no-results">No matches found.</p>
        )}

        {/* Top Match Highlight */}
        {!loading && !error && results.length > 0 && (
          <div className="best-match">
            <h3 className="best-match-title">
              <span>🏆</span>
              <span>Best Match</span>
            </h3>
            <img
              src={results[0].image}
              alt="Top Match"
              className="best-match-image"
            />
            <div className="best-match-info">
              <p className="best-match-description">{results[0].description}</p>
              <p className="best-match-similarity">Similarity: {(results[0].similarity * 100).toFixed(2)}%</p>
              {results[0].metadata && (
                <p className="best-match-metadata">
                  {Object.entries(results[0].metadata).map(([key, value]) => (
                    <span key={key}>{key}: {value} </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Grid for other matches */}
        <div className="results-grid">
          {results.map((item, index) => (
            <div key={item.id} className="result-card">
              <div className="result-image-container">
                <img
                  src={item.image}
                  alt={`Match ${index + 1}`}
                  className="result-image"
                />
                {index < 3 && (
                  <span className="result-badge">
                    {getBadge(index)}
                  </span>
                )}
              </div>
              <div className="result-info">
                <p className="result-description">{item.description}</p>
                <p className="result-similarity">Similarity: {(item.similarity * 100).toFixed(2)}%</p>
                {item.metadata && (
                  <p className="result-metadata">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <span key={key}>{key}: {value} </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
