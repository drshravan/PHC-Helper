import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <div
            className={`neu-card ${hoverEffect ? 'neu-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
