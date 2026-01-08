import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/ui/GlassCard';
import MaterialIcon from '../components/ui/MaterialIcon';
import './Home.css';
import { useFavorites } from '../hooks/useFavorites';

const Home = () => {
    const navigate = useNavigate();
    const { theme, isDark, toggleTheme } = useTheme();
    const { favorites } = useFavorites();

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
        },
        {
            title: 'Online Status',
            icon: 'wifi',
            path: '/online-status',
            color: '#00e676'
        }
    ];

    return (
        <div className="home-wrapper">
            <header className="home-header animate-enter" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                background: 'var(--neu-bg)',
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                margin: 0, // Override CSS margin
                boxSizing: 'border-box'
            }}>
                <div>
                    <h1 className="text-h1">PHC Helper</h1>
                    <p className="text-muted">Your digital health assistant</p>
                </div>
                <button onClick={toggleTheme} className="theme-toggle-btn">
                    <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} size={24} color={isDark ? "#fdbb2d" : "#1e293b"} />
                </button>
            </header>

            {/* Spacer for Fixed Header (Approx height) */}
            <div style={{ height: '100px', width: '100%' }}></div>

            {/* QUICK ACCESS FAVORITES */}
            {favorites.length > 0 && (
                <div className="animate-enter" style={{ marginBottom: '25px' }}>
                    <h2 className="text-h2" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Quick Access</h2>
                    <div className="dashboard-grid">
                        {favorites.map((item, index) => (
                            <GlassCard
                                key={item.path}
                                className="dashboard-card"
                                hoverEffect={true}
                                onClick={() => navigate(item.path)}
                            >
                                <div className="icon-circle" style={{ color: item.color, width: '48px', height: '48px', marginBottom: '8px' }}>
                                    <MaterialIcon name={item.icon} size={28} />
                                </div>
                                <h3 style={{ fontSize: '0.9rem' }}>{item.title}</h3>
                            </GlassCard>
                        ))}
                    </div>
                    <div style={{ height: '1px', background: 'var(--neu-border-color)', margin: '25px 0' }}></div>
                </div>
            )}

            <div style={{ marginBottom: '10px' }}>
                <h2 className="text-h2" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Home</h2>
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
        </div>
    );
};

export default Home;
