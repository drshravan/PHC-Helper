import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ancData } from './anc_data';
import './EDDList.css';
import Calculator from './Calculator';

export default function EDDList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSortPopup, setShowSortPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [sortOption, setSortOption] = useState(null);
  const [selectedSubCenters, setSelectedSubCenters] = useState([]);
  const [selectedGravidas, setSelectedGravidas] = useState([]);
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const subCenters = useMemo(() => [...new Set(ancData.map(item => item.subCentre))], []);
  const gravidas = useMemo(() => [...new Set(ancData.map(item => item.gravida))], []);

  const handleSubCenterChange = (center) => {
    setSelectedSubCenters(prev =>
      prev.includes(center) ? prev.filter(c => c !== center) : [...prev, center]
    );
  };

  const handleGravidaChange = (gravida) => {
    setSelectedGravidas(prev =>
      prev.includes(gravida) ? prev.filter(g => g !== gravida) : [...prev, gravida]
    );
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = ancData.filter(item => {
      const searchTermMatch =
        item.ancName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subCentre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ancContactNo.includes(searchTerm);

      const subCenterMatch =
        selectedSubCenters.length === 0 || selectedSubCenters.includes(item.subCentre);

      const gravidaMatch =
        selectedGravidas.length === 0 || selectedGravidas.includes(item.gravida);

      const highRiskMatch = !highRiskOnly || item.causeOfHighRisk;

      return searchTermMatch && subCenterMatch && gravidaMatch && highRiskMatch;
    });

    if (sortOption) {
      filtered.sort((a, b) => {
        if (a[sortOption] < b[sortOption]) return -1;
        if (a[sortOption] > b[sortOption]) return 1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, selectedSubCenters, selectedGravidas, highRiskOnly, sortOption]);

  const groupedData = useMemo(() => {
    return filteredAndSortedData.reduce((acc, item) => {
      const group = item.subCentre;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    }, {});
  }, [filteredAndSortedData]);

  return (
    <div className="edd-list-container">
      <Calculator />
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search by ANC Name, Sub-center, Village, or Phone Number"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="buttons-container">
          <button onClick={() => {setShowSortPopup(!showSortPopup); setShowFilterPopup(false)}}>Sort</button>
          <button onClick={() => {setShowFilterPopup(!showFilterPopup); setShowSortPopup(false)}}>Filter</button>
        </div>
      </div>

      {showSortPopup && (
        <div className="popup">
          <h3>Sort By</h3>
          <button onClick={() => {setSortOption('subCentre'); setShowSortPopup(false)}}>Sub-center Name</button>
          <button onClick={() => {setSortOption('ancName'); setShowSortPopup(false)}}>ANC Name</button>
          <button onClick={() => {setSortOption('gravida'); setShowSortPopup(false)}}>Gravida</button>
        </div>
      )}

      {showFilterPopup && (
        <div className="popup">
          <h3>Filter By</h3>
          <div>
            <h4>Sub-center</h4>
            {subCenters.map(center => (
              <div key={center}>
                <input
                  type="checkbox"
                  id={center}
                  name={center}
                  checked={selectedSubCenters.includes(center)}
                  onChange={() => handleSubCenterChange(center)}
                />
                <label htmlFor={center}>{center}</label>
              </div>
            ))}
          </div>
          <div>
            <h4>Gravida</h4>
            {gravidas.map(g => (
              <div key={g}>
                <input
                  type="checkbox"
                  id={g}
                  name={g}
                  checked={selectedGravidas.includes(g)}
                  onChange={() => handleGravidaChange(g)}
                />
                <label htmlFor={g}>{g}</label>
              </div>
            ))}
          </div>
          <div>
            <h4>High Risk</h4>
            <input
              type="checkbox"
              id="high-risk"
              name="high-risk"
              checked={highRiskOnly}
              onChange={() => setHighRiskOnly(!highRiskOnly)}
            />
            <label htmlFor="high-risk">High Risk Only</label>
          </div>
        </div>
      )}

      <div className="anc-list">
        {Object.keys(groupedData).map(group => (
          <div key={group} className="anc-group">
            <h3 onClick={() => toggleGroup(group)} className="group-header">
              {group} ({groupedData[group].length})
            </h3>
            {expandedGroups.includes(group) && (
              <div className="anc-items">
                {groupedData[group].map(item => (
                  <Link to={`/anc/${item.id}`} key={item.id} className="anc-item">
                    <div className="anc-item-details">
                      <span>{item.ancName}</span>
                      <span>Age: {item.ancAge}</span>
                    </div>
                    <span className={`status-tag ${item.status === 'ongoing' ? 'status-ongoing' : 'status-aborted'}`}>
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