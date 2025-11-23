import React, { useState } from 'react';
import './Select.css';

const Select = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-select">
      <div className="select-header" onClick={() => setIsOpen(!isOpen)}>
        {selected || placeholder}
      </div>
      {isOpen && (
        <div className="select-options">
          {options.map(option => (
            <div key={option} className="select-option" onClick={() => handleSelect(option)}>
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
