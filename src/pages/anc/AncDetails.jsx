import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ancData } from '../edd/anc_data';
import Select from '../../components/Select';
import './AncDetails.css';

export default function AncDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ancRecord, setAncRecord] = useState(null);
  const [errors, setErrors] = useState({});

  const dropdownOptions = useMemo(() => {
    return {
      subCentre: [...new Set(ancData.map(item => item.subCentre))],
      gravida: [...new Set(ancData.map(item => item.gravida))],
      previousDeliveryMode: [...new Set(ancData.map(item => item.previousDeliveryMode))],
      status: ['ongoing', 'aborted'],
      modeOfDeliveryAborted: [...new Set(ancData.map(item => item.modeOfDeliveryAborted))],
    };
  }, []);

  useEffect(() => {
    const record = ancData.find(item => item.id === parseInt(id));
    if (record) {
      setAncRecord(record);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAncRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setAncRecord(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!ancRecord.ancName) tempErrors.ancName = "ANC Name is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Updated ANC Record:', ancRecord);
      // Here you would typically update the data source
      // For now, we'll just navigate back to the list
      navigate('/eddlist');
    }
  };

  if (!ancRecord) {
    return <div>Loading...</div>;
  }

  const renderInput = (key, value) => {
    if (dropdownOptions[key]) {
      return (
        <Select
          options={dropdownOptions[key]}
          selected={value}
          onChange={(val) => handleSelectChange(key, val)}
          placeholder={`Select ${key}`}
        />
      );
    }

    if (['lmp', 'edd', 'dateOfDeliveryAborted'].includes(key)) {
      return (
        <input
          type="date"
          id={key}
          name={key}
          value={value}
          onChange={handleChange}
        />
      );
    }

    return (
      <input
        type={typeof value === 'number' ? 'number' : 'text'}
        id={key}
        name={key}
        value={value}
        onChange={handleChange}
      />
    );
  };

  return (
    <div className="anc-details-container">
      <h2>Edit ANC Details</h2>
      <form onSubmit={handleSubmit} className="anc-details-form">
        <div className="form-grid">
          {Object.keys(ancRecord).map(key => {
            if (ancRecord.status !== 'aborted' && ['dateOfDeliveryAborted', 'addressOfDeliveredAborted', 'modeOfDeliveryAborted'].includes(key)) {
              return null;
            }
            return (
              <div className="form-group" key={key}>
                <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                {renderInput(key, ancRecord[key])}
                {errors[key] && <span className="error">{errors[key]}</span>}
              </div>
            );
          })}
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
