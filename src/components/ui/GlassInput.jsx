import React from 'react';

const GlassInput = ({ className = '', ...props }) => {
    return (
        <input
            className={`neu-input ${className}`}
            {...props}
        />
    );
};

export default GlassInput;
