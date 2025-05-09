// src/pages/FeaturePage.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FeaturePage.css";

export default function FeaturePage() {
  const [sketch, setSketch] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [weights, setWeights] = useState({
    face: 1.0,
    eyes: 1.0,
    nose: 1.0,
    mouth: 1.0,
  });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSketch(file);
    }
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeights({ ...weights, [name]: parseFloat(value) });
  };

  const submitSketch = async () => {
    if (!sketch) {
      alert("Please upload a sketch image.");
      return;
    }
  
    setIsUploading(true);
    const formData = new FormData();
    formData.append("sketchFile", sketch);
    formData.append("weightsJson", JSON.stringify(weights));
  
    try {
      await axios.post("http://localhost:8082/api/identify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/results");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to identify sketch. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-card">
        <div className="content-card">
          <div className="header">
            <h2 className="title">Feature Analysis</h2>
            <p className="description">
              Upload the witness sketch and adjust feature weights to optimize the identification process
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
                />
                <label
                  htmlFor="sketch-upload"
                  className="cursor-pointer block w-full"
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
                    {sketch ? "Change Sketch" : "Upload Sketch"}
                  </p>
                  <p className="upload-subtext">
                    {sketch ? sketch.name : "PNG, JPG, or JPEG up to 10MB"}
                  </p>
                </label>
              </div>
            </div>

            <div className="weights-section">
              <h3 className="weights-title">Feature Weights</h3>
              <div className="weights-grid">
                {["face", "eyes", "nose", "mouth"].map((feature) => (
                  <div key={feature} className="weight-item">
                    <div className="weight-header">
                      <label className="weight-label">
                        {feature}
                      </label>
                      <span className="weight-value">
                        {weights[feature].toFixed(1)}
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
                        name={feature}
                        min="0"
                        max="2"
                        step="0.1"
                        value={weights[feature]}
                        onChange={handleWeightChange}
                        className="range-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={submitSketch}
              disabled={isUploading || !sketch}
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
