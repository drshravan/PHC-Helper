import React from 'react';

const GlassButton = ({ children, className = '', variant = 'default', ...props }) => {
    const variantClass = variant === 'primary' ? 'neu-btn-primary' : '';

    return (
        <button
            className={`neu-btn ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default GlassButton;
