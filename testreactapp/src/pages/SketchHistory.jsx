import React, { useEffect, useState } from 'react';

export default function SketchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/history') // You will create this API soon!
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Sketch Upload History</h1>

      {loading && <p className="text-center text-blue-600">Loading history...</p>}

      {history.length === 0 && !loading && (
        <p className="text-center text-gray-500">No sketch history yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {history.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <img
              src={`data:image/jpeg;base64,${item.sketchImage}`}
              alt="Sketch"
              className="rounded-md w-full h-48 object-cover mb-4"
            />
            <p className="font-semibold text-indigo-600 mb-2">Uploaded at: {item.timestamp}</p>
            <p className="text-gray-700">Top Match: {item.topMatch?.name || "Unknown"}</p>
            <p className="text-gray-700">Score: {item.topMatch?.score || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
