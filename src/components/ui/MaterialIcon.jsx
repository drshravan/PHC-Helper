import React from 'react';

const MaterialIcon = ({ name, size = 24, color = 'currentColor', style, className = "" }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{
            fontSize: size,
            color: color,
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style
        }}
    >
        {name}
    </span>
);

export default MaterialIcon;
