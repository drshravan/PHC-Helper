import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ancData } from "./anc_data";
import "./EDDList.css";
import Calculator from "./Calculator";

export default function EDDList() {

  /* ---------------- STATE ---------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortPopup, setShowSortPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [sortOption, setSortOption] = useState(null);

  const [selectedSubCenters, setSelectedSubCenters] = useState([]);
  const [selectedGravidas, setSelectedGravidas] = useState([]);
  const [highRiskOnly, setHighRiskOnly] = useState(false);

  // 🔥 ONLY ONE GROUP OPEN AT A TIME
  const [expandedGroup, setExpandedGroup] = useState(null);

  /* ---------------- DROPDOWN VALUES ---------------- */
  const subCenters = useMemo(() => {
    return [...new Set(ancData.map(item => item.subCentre))];
  }, []);

  const gravidas = useMemo(() => {
    return [...new Set(ancData.map(item => item.gravida))];
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleSubCenterChange = (center) => {
    setSelectedSubCenters(prev =>
      prev.includes(center)
        ? prev.filter(c => c !== center)
        : [...prev, center]
    );
  };

  const handleGravidaChange = (gravida) => {
    setSelectedGravidas(prev =>
      prev.includes(gravida)
        ? prev.filter(g => g !== gravida)
        : [...prev, gravida]
    );
  };

  // ✅ ACCORDION TOGGLE
  const toggleGroup = (group) => {
    setExpandedGroup(prev => (prev === group ? null : group));
  };

  /* ---------------- FILTER + SORT ---------------- */
  const filteredAndSortedData = useMemo(() => {
    let data = ancData.filter(item => {

      const searchMatch =
        item.ancName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subCentre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ancContactNo.includes(searchTerm);

      const subCenterMatch =
        selectedSubCenters.length === 0 ||
        selectedSubCenters.includes(item.subCentre);

      const gravidaMatch =
        selectedGravidas.length === 0 ||
        selectedGravidas.includes(item.gravida);

      const highRiskMatch =
        !highRiskOnly || item.causeOfHighRisk;

      return searchMatch && subCenterMatch && gravidaMatch && highRiskMatch;
    });

    if (sortOption) {
      data.sort((a, b) => {
        if (a[sortOption] < b[sortOption]) return -1;
        if (a[sortOption] > b[sortOption]) return 1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, selectedSubCenters, selectedGravidas, highRiskOnly, sortOption]);

  /* ---------------- GROUP BY SUB-CENTER ---------------- */
  const groupedData = useMemo(() => {
    return filteredAndSortedData.reduce((acc, item) => {
      acc[item.subCentre] = acc[item.subCentre] || [];
      acc[item.subCentre].push(item);
      return acc;
    }, {});
  }, [filteredAndSortedData]);

  /* ---------------- UI ---------------- */
  return (
    <div className="edd-list-container">

      <Calculator />

      {/* 🔍 SEARCH BAR */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search ANC / Sub-center / Village / Phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="buttons-container">
          <button onClick={() => { setShowSortPopup(!showSortPopup); setShowFilterPopup(false); }}>
            Sort
          </button>

          <button onClick={() => { setShowFilterPopup(!showFilterPopup); setShowSortPopup(false); }}>
            Filter
          </button>
        </div>
      </div>

      {/* 🔃 SORT POPUP */}
      {showSortPopup && (
        <div className="popup">
          <h3>Sort By</h3>
          <button onClick={() => { setSortOption("subCentre"); setShowSortPopup(false); }}>Sub-center</button>
          <button onClick={() => { setSortOption("ancName"); setShowSortPopup(false); }}>ANC Name</button>
          <button onClick={() => { setSortOption("gravida"); setShowSortPopup(false); }}>Gravida</button>
        </div>
      )}

      {/* 🧰 FILTER POPUP */}
      {showFilterPopup && (
        <div className="popup">
          <h3>Filter</h3>

          <h4>Sub-center</h4>
          {subCenters.map(center => (
            <label key={center}>
              <input
                type="checkbox"
                checked={selectedSubCenters.includes(center)}
                onChange={() => handleSubCenterChange(center)}
              />
              {center}
            </label>
          ))}

          <h4>Gravida</h4>
          {gravidas.map(g => (
            <label key={g}>
              <input
                type="checkbox"
                checked={selectedGravidas.includes(g)}
                onChange={() => handleGravidaChange(g)}
              />
              {g}
            </label>
          ))}

          <label>
            <input
              type="checkbox"
              checked={highRiskOnly}
              onChange={() => setHighRiskOnly(!highRiskOnly)}
            />
            High Risk Only
          </label>
        </div>
      )}

      {/* 📋 ANC LIST */}
      <div className="anc-list">
        {Object.keys(groupedData).map(group => (
          <div key={group} className="anc-group">

            <h3
              className={`group-header ${expandedGroup === group ? "active" : ""}`}
              onClick={() => toggleGroup(group)}
            >
              {group} ({groupedData[group].length})
            </h3>


            {/* 🔥 ONLY ONE EXPANDS */}
            {expandedGroup === group && (
              <div className="anc-items">
                {groupedData[group].map(item => (
                  <Link to={`/anc/${item.id}`} key={item.id} className="anc-item">

                    <div>
                      <strong>{item.ancName}</strong>
                      <div>Age: {item.ancAge}</div>
                    </div>

                    <span className={`status-tag ${item.status}`}>
                      {item.status}
                    </span>

                  </Link>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
