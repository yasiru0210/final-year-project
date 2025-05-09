import React from 'react';

export default function FeatureSlider({ weights, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Assign Feature Certainty</h2>
      {Object.entries(weights).map(([feature, value]) => (
        <div key={feature} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(feature, parseInt(e.target.value))}
            className="w-full"
          />
          <p>Certainty: {value}%</p>
        </div>
      ))}
    </div>
  );
}