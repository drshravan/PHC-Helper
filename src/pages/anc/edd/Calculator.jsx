import React, { useState } from 'react';
import './Calculator.css';

export default function Calculator() {
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState('');

  const handleLmpChange = (e) => {
    const lmpDate = e.target.value;
    setLmp(lmpDate);
    if (lmpDate) {
      const date = new Date(lmpDate);
      date.setDate(date.getDate() + 280);
      setEdd(date.toISOString().split('T')[0]);
    } else {
      setEdd('');
    }
  };

  const handleEddChange = (e) => {
    const eddDate = e.target.value;
    setEdd(eddDate);
    if (eddDate) {
      const date = new Date(eddDate);
      date.setDate(date.getDate() - 280);
      setLmp(date.toISOString().split('T')[0]);
    } else {
      setLmp('');
    }
  };

  return (
    <div className="calculator-container">
      <h3>EDD & LMP Calculator</h3>
      <div className="calculator-inputs">
        <div className="form-group">
          <label htmlFor="lmp">LMP (Last Menstrual Period)</label>
          <input type="date" id="lmp" value={lmp} onChange={handleLmpChange} />
        </div>
        <div className="form-group">
          <label htmlFor="edd">EDD (Expected Date of Delivery)</label>
          <input type="date" id="edd" value={edd} onChange={handleEddChange} />
        </div>
      </div>
    </div>
  );
}
