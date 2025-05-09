// src/pages/Results.jsx

import React, { useEffect, useState } from "react";
import "./Results.css";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8082/api/results")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading results:", err);
        setError("Failed to load results. Please try again later.");
        setLoading(false);
      });
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
              src={`data:image/jpeg;base64,${results[0].image}`}
              alt="Top Match"
              className="best-match-image"
            />
            <div className="best-match-info">
              <p className="best-match-name">{results[0].name || "Unknown"}</p>
              <p className="best-match-score">Score: {results[0].score}</p>
              <p className="best-match-age">Age: {results[0].age}</p>
            </div>
          </div>
        )}

        {/* Grid for other matches */}
        <div className="results-grid">
          {results.map((item, index) => (
            <div key={index} className="result-card">
              <div className="result-image-container">
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
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
                <p className="result-name">{item.name || "Unknown"}</p>
                <p className="result-score">Score: {item.score}</p>
                <p className="result-age">Age: {item.age}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
