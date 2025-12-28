import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check stored preference, default to 'system' if none
        return localStorage.getItem('app-theme') || 'system';
    });



    const [isDark, setIsDark] = useState(() => {
        if (theme === 'system') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            // Determine actual visual theme
            let effectiveDark = false;
            if (theme === 'system') {
                effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                root.classList.remove('light-mode', 'dark-mode');
                localStorage.removeItem('app-theme');
            } else {
                effectiveDark = theme === 'dark';
                root.classList.remove('light-mode', 'dark-mode');
                root.classList.add(`${theme}-mode`);
                localStorage.setItem('app-theme', theme);
            }
            setIsDark(effectiveDark);

            // Update Meta Theme Color for Mobile Browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', effectiveDark ? '#292d32' : '#e0e5ec');
            }
        };

        applyTheme();

        // Listen for system changes if mode is system
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme();
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            if (prev === 'system') {
                // If system is dark, toggle to light. If system is light, toggle to dark.
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isSystemDark ? 'light' : 'dark';
            }
            return prev === 'dark' ? 'light' : 'dark';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
