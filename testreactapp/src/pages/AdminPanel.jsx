// src/pages/AdminPanel.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nic, setNic] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedMugshots, setUploadedMugshots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuthStatus(token);
    }
  }, []);

  const checkAuthStatus = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.isAdmin) {
        setAuthenticated(true);
        fetchMugshots(token);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
    }
  };

  const fetchMugshots = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/faces/mugshots", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadedMugshots(response.data);
    } catch (err) {
      console.error("Failed to fetch mugshots:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        setAuthenticated(true);
        setMessage("Login successful ✅");
        fetchMugshots(response.data.token);
      } else {
        setMessage("Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (images.length === 0) {
        throw new Error("Please select at least one image");
      }

      if (images.length > 5) {
        throw new Error("Maximum 5 images allowed");
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("mugshots", image);
      });
      formData.append("name", name);
      formData.append("age", age);
      formData.append("nic", nic);
      formData.append("metadata", JSON.stringify({ age, nic }));

      const response = await axios.post(
        "http://localhost:5000/api/faces/upload/mugshots",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Mugshots uploaded successfully!");
      setName("");
      setAge("");
      setNic("");
      setImages([]);
      setImagePreviews([]);
      
      // Add new mugshots to the list
      setUploadedMugshots(prev => [...response.data.faces, ...prev]);
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || "Error uploading mugshots");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setMessage("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    
    // Generate previews
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImagePreviews(previews);
    setMessage("");
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    setMessage("Logged out successfully");
  };

  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2 className="admin-title">Admin Login</h2>

          {message && (
            <div className={`message ${message.includes("success") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Email:</label>
              <input
                type="email"
                className="form-input"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password:</label>
              <div className="password-input-container">
                <input
                  type="password"
                  className="password-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2 className="admin-title">Admin - Upload Mugshots</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name:</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age:</label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">National Identity Card:</label>
            <input
              type="text"
              className="form-input"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mugshot Images (up to 5):</label>
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={handleFileChange}
              multiple
              required
            />
            <small className="help-text">You can select up to 5 images at once</small>
            {imagePreviews.length > 0 && (
              <div className="image-preview">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-preview"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="submit-button"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <div className="mugshots-list">
          <h3>Uploaded Mugshots</h3>
          <div className="mugshots-grid">
            {uploadedMugshots.map((mugshot) => (
              <div key={mugshot.id} className="mugshot-card">
                <img
                  src={mugshot.imageUrl}
                  alt={mugshot.description}
                  className="mugshot-image"
                />
                <div className="mugshot-info">
                  <p>{mugshot.description}</p>
                  {mugshot.isMainMugshot && <span className="main-badge">Main</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
