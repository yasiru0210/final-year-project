import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="main-container">
      <nav className="nav-container">
        <div className="nav-content">
          
          <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>
      </nav>

      <div 
        className="content-section"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')"
        }}
      >
        <div className="content-overlay"></div>
        <div className="content-card">
          <div>
            <h1 className="title">
              Facial Sketch Identification System
            </h1>
            <p className="description">
              A sophisticated platform for law enforcement and security professionals to match witness sketches with potential suspects in our comprehensive database.
            </p>
          </div>

          <div className="button-container">
            <Link to="/identify" className="primary-button">
              Start Identification Process
            </Link>
            <Link to="/results" className="secondary-button">
              View Previous Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
