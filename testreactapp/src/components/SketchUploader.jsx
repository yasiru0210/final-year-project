import React from "react";

export default function SketchUpload({ onChange }) {
  return (
    <div>
      <label>Upload Sketch:</label>
      <input type="file" onChange={onChange} accept="image/*" />
    </div>
  );
}
