import React from 'react';

export const PregnantWoman = ({ size = 24, color = 'currentColor', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M11 4C11 2.9 11.9 2 13 2C14.1 2 15 2.9 15 4C15 5.1 14.1 6 13 6C11.9 6 11 5.1 11 4Z" fill={color} stroke="none" />
        <path d="M16 13C16 11.3 14.7 10 13 10C11.3 10 10 11.3 10 13V22H12V18H14V22H16V13Z" stroke={color} fill="none" />
        <path d="M9 13H10" />
        <path d="M16 13H17" />
        <path d="M13 10C14.657 10 16 11.343 16 13" stroke="none" />
        {/* Custom simplified path for pregnant silhouette */}
        <path d="M9 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0" stroke={color} fill="none" />
        <path d="M15 11a3 3 0 0 0-3-3 3 3 0 0 0-3 3v8h2v3h2v-3h2v-8Z" stroke={color} fill="none" />
    </svg>
);

// Google Material Symbols Outlined 'pregnant_woman'
export const PregnantWomanIcon = ({ size = 24, color = 'currentColor', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 -960 960 960"
        fill={color}
        {...props}
    >
        <path d="M360-120v-80h80v-200q-54-13-87-57t-33-99q0-10 1-19.5t4-19.5l135 60v135h160v-226l-132-58q-18-9-38.5-13t-42.5-4q-95 0-158.5 68T223-568q0 86 49.5 152T400-328v208h-40v80h80Zm120-680q17 0 28.5-11.5T520-840q0-17-11.5-28.5T480-880q-17 0-28.5 11.5T440-840q0 17 11.5 28.5T480-800Z" />
    </svg>
);
// Simple Woman Silhouette
export const WomanIcon = ({ size = 24, color = 'currentColor', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v14" strokeWidth="0" />
        <path d="M9 22h6" />
        <path d="M6 12c0-3 2-5 6-5s6 2 6 5v5c0 1.5-.5 2-1 2h-10c-.5 0-1-.5-1-2v-5Z" />
    </svg>
);
