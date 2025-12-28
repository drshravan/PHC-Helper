import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/ui/GlassCard';
import MaterialIcon from '../components/ui/MaterialIcon';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { theme, isDark, toggleTheme } = useTheme();

    const menuItems = [
        {
            title: 'Programs',
            icon: 'assignment',
            path: '/programs',
            color: 'var(--accent-secondary)'
        },
        {
            title: 'Services',
            icon: 'vaccines',
            path: '/services',
            color: 'var(--accent-primary)'
        },
        {
            title: 'PHC Info',
            icon: 'info',
            path: '/info',
            color: '#fcb045'
        },
        {
            title: 'Reports',
            icon: 'description',
            path: '/reports',
            color: '#e91e63'
        }
    ];

    return (
        <div className="home-wrapper">
            <header className="home-header animate-enter">
                <div>
                    <h1 className="text-h1">PHC Helper</h1>
                    <p className="text-muted">Your digital health assistant</p>
                </div>
                <button onClick={toggleTheme} className="theme-toggle-btn">
                    <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} size={24} color={isDark ? "#fdbb2d" : "#1e293b"} />
                </button>
            </header>

            <main className="dashboard-grid">
                {menuItems.map((item, index) => (
                    <GlassCard
                        key={index}
                        className={`dashboard-card animate-pop delay-${(index + 1) * 100}`}
                        hoverEffect={true}
                        onClick={() => navigate(item.path)}
                    >
                        <div className="icon-circle" style={{ color: item.color }}>
                            <MaterialIcon name={item.icon} size={32} />
                        </div>
                        <h3>{item.title}</h3>
                    </GlassCard>
                ))}
            </main>
        </div>
    );
};

export default Home;
