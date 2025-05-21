// src/pages/FeaturePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FeaturePage.css";

export default function FeaturePage() {
  const [sketches, setSketches] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing sketches from localStorage
    const savedSketches = localStorage.getItem('sketches');
    if (savedSketches) {
      setSketches(JSON.parse(savedSketches));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (sketches.length >= 10) {
        alert("Maximum 10 sketches allowed!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newSketch = {
          id: Date.now(),
          image: reader.result,
          name: file.name,
          timestamp: new Date().toISOString(),
          weights: {
            face: 1.0,
            eyes: 1.0,
            nose: 1.0,
            mouth: 1.0,
          }
        };
        
        const updatedSketches = [...sketches, newSketch];
        setSketches(updatedSketches);
        localStorage.setItem('sketches', JSON.stringify(updatedSketches));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWeightChange = (sketchId, feature, value) => {
    const updatedSketches = sketches.map(sketch => {
      if (sketch.id === sketchId) {
        return {
          ...sketch,
          weights: {
            ...sketch.weights,
            [feature]: parseFloat(value)
          }
        };
      }
      return sketch;
    });
    setSketches(updatedSketches);
    localStorage.setItem('sketches', JSON.stringify(updatedSketches));
  };

  const removeSketch = (id) => {
    const updatedSketches = sketches.filter(sketch => sketch.id !== id);
    setSketches(updatedSketches);
    localStorage.setItem('sketches', JSON.stringify(updatedSketches));
  };

  const submitSketches = () => {
    if (sketches.length === 0) {
      alert("Please upload at least one sketch.");
      return;
    }
    navigate("/results");
  };

  return (
    <div className="feature-container">
      <div className="feature-card">
        <div className="content-card">
          <div className="header">
            <h2 className="title">Feature Analysis</h2>
            <p className="description">
              Upload up to 10 witness sketches and adjust feature weights for each sketch
            </p>
          </div>

          <div>
            <div className="upload-section">
              <div className="upload-container">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="sketch-upload"
                  disabled={sketches.length >= 10}
                />
                <label
                  htmlFor="sketch-upload"
                  className={`cursor-pointer block w-full ${sketches.length >= 10 ? 'opacity-50' : ''}`}
                >
                  <div className="upload-icon">
                    <svg
                      className="h-8 w-8"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="upload-text">
                    {sketches.length >= 10 ? "Maximum sketches reached" : "Upload Sketch"}
                  </p>
                  <p className="upload-subtext">
                    {sketches.length}/10 sketches uploaded
                  </p>
                </label>
              </div>
            </div>

            {sketches.length > 0 && (
              <div className="sketches-grid">
                {sketches.map((sketch) => (
                  <div key={sketch.id} className="sketch-card">
                    <div className="sketch-image-container">
                      <img src={sketch.image} alt="Sketch" className="sketch-image" />
                      <button
                        onClick={() => removeSketch(sketch.id)}
                        className="remove-sketch"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="sketch-weights">
                      <h3 className="sketch-title">Feature Weights</h3>
                      <div className="weights-grid">
                        {["face", "eyes", "nose", "mouth"].map((feature) => (
                          <div key={feature} className="weight-item">
                            <div className="weight-header">
                              <label className="weight-label">
                                {feature}
                              </label>
                              <span className="weight-value">
                                {sketch.weights[feature].toFixed(1)}
                              </span>
                            </div>
                            <div className="range-container">
                              <div className="range-marks">
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={sketch.weights[feature]}
                                onChange={(e) => handleWeightChange(sketch.id, feature, e.target.value)}
                                className="range-input"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={submitSketches}
              disabled={isUploading || sketches.length === 0}
              className="submit-button"
            >
              {isUploading ? (
                <>
                  <svg className="loading-spinner h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process Identification'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
