import React, { useRef, useState, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

const PageHeader = ({ title, subtitle, backPath, onBack, actions, incompleteCount }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Dynamic Height Calculation
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(100); // Safe default

    useLayoutEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, [title, subtitle, actions]);

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <>
            <header
                ref={headerRef}
                className="page-header fixed-app-header"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    // Fixed Styles
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1000,
                    padding: '20px', // Maintain padding
                    background: 'var(--neu-bg)', // Opaque bg
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Subtle shadow
                    backdropFilter: 'blur(10px)'
                }}
            >
                <button
                    onClick={handleBack}
                    className="neu-btn"
                    style={{
                        padding: 0,
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                    aria-label="Go Back"
                >
                    <MaterialIcon name="arrow_back" size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 className="text-h2" style={{ margin: 0, lineHeight: 1.2 }}>{title}</h2>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {subtitle ? `${subtitle} • PHC Malkapur` : 'PHC Malkapur'}
                    </p>
                </div>
                {actions}
                {location.pathname.match(/^\/programs\/mch\/edd-vs-deliveries\/[^\/]+$/) && (() => {
                    const monthId = location.pathname.split('/').pop();
                    return (
                        <button
                            onClick={() => navigate(`/incomplete-anc/${monthId}`)}
                            className="neu-btn"
                            style={{
                                padding: 0,
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                position: 'relative'
                            }}
                            aria-label="Incomplete Records"
                        >
                            <MaterialIcon name="notifications" size={24} />
                            {incompleteCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#ef5350',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {incompleteCount > 99 ? '99+' : incompleteCount}
                                </span>
                            )}
                        </button>
                    );
                })()}
                <button
                    onClick={() => navigate('/')}
                    className="neu-btn"
                    style={{
                        padding: 0,
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                    aria-label="Go Home"
                >
                    <MaterialIcon name="home" size={24} />
                </button>
            </header>

            {/* Spacer to prevent content from jumping up */}
            <div style={{ height: `${headerHeight + 20}px`, width: '100%', transition: 'height 0.2s ease' }}></div>
        </>
    );
};

export default PageHeader;
