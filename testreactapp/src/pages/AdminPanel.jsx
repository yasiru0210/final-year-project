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
  const [image, setImage] = useState(null);
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

    if (!image || !name || !age || !nic) {
      setMessage("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    // Combine name, age, and nic into description and metadata
    const description = `Name: ${name}, Age: ${age}, NIC: ${nic}`;
    const metadata = JSON.stringify({ name, age, nic });

    formData.append("description", description);
    formData.append("metadata", metadata);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/faces/upload/mugshot", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setMessage("Mugshot uploaded successfully ✅");
      setName("");
      setAge("");
      setNic("");
      setImage(null);
      
      // Refresh mugshots list
      fetchMugshots(token);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setMessage("Session expired. Please log in again.");
        setAuthenticated(false);
        localStorage.removeItem("token");
      } else {
        setMessage(err.response?.data?.message || "Upload failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="admin-title">Admin - Upload Mugshot</h2>
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
            <label className="form-label">Mugshot Image:</label>
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <div className="mugshots-list">
          <h3>Uploaded Mugshots</h3>
          <div className="mugshots-grid">
            {uploadedMugshots.map((mugshot) => (
              <div key={mugshot._id} className="mugshot-card">
                <img
                  src={`data:image/jpeg;base64,${mugshot.image}`}
                  alt={mugshot.description}
                  className="mugshot-image"
                />
                <div className="mugshot-info">
                  <p>{mugshot.description}</p>
                  <p>Uploaded: {new Date(mugshot.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
