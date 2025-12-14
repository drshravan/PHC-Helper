import { useNavigate } from "react-router-dom";

export default function NCD() {
  const navigate = useNavigate(); // Standard naming convention

  return (
    <div className="ncd-container">
      <h2>NCD Page</h2>
      {/* 1. Use arrow function () => ... */}
      {/* 2. Fixed typo in class name 'back-arrow' */}
      <span className="back-arrow" onClick={() => navigate("/")}>
        Back
      </span>
    </div>
  );
}