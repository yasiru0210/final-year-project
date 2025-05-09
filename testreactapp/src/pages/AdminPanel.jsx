// src/pages/AdminPanel.jsx

import React, { useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nic, setNic] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const correctPassword = "admin123"; // 🔒 You can change this password

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === correctPassword) {
      setAuthenticated(true);
    } else {
      setMessage("Incorrect password ❌");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !name || !age || !nic) {
      setMessage("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("nic", nic);

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/admin/upload", formData);
      setMessage("Mugshot uploaded successfully ✅");
      setName("");
      setAge("");
      setNic("");
      setImage(null);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2 className="admin-title">Admin Login</h2>

          {message && (
            <div className={`message error`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Password:</label>
              <div className="password-input-container">
                <input
                  type="password"
                  className="password-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2 className="admin-title">Admin - Upload Mugshot</h2>

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
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age:</label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">National Identity Card:</label>
            <input
              type="text"
              className="form-input"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mugshot Image:</label>
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => setImage(e.target.files[0])}
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
      </div>
    </div>
  );
}
