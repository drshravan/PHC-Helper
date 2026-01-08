import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import GlassCard from '../../../components/ui/GlassCard';
import '../../../pages/Home.css';
import PageHeader from '../../../components/ui/PageHeader';
import { useFavorites } from '../../../hooks/useFavorites';

const MCH = () => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const programs = [
        {
            id: 'anc-reg',
            title: 'ANC Registration',
            path: '/programs/mch/anc',
            icon: 'how_to_reg',
            color: '#9c27b0'
        },
        {
            id: 'edd-delivery',
            title: 'EDD vs Deliveries',
            path: '/programs/mch/edd-vs-deliveries',
            icon: 'pregnant_woman',
            color: '#e91e63'
        },
        {
            id: 'mat-death',
            title: 'Maternal Death Audit',
            path: '/programs/mch/maternal-death-audit',
            icon: 'medical_services',
            color: '#f44336'
        },
        {
            id: 'child-death',
            title: 'Child Death Audit',
            path: '/programs/mch/child-death-audit',
            icon: 'baby_changing_station',
            color: '#ff9800'
        },
        {
            id: 'aefi-audit',
            title: 'AEFI Audit',
            path: '/programs/mch/aefi-audit',
            icon: 'vaccines',
            color: '#90a4ae'
        }
    ];

    const handleFavorite = (e, item) => {
        e.stopPropagation();
        toggleFavorite(item);
    };

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="MCH Program"
                subtitle="Maternal & Child Health"
                backPath="/programs"
            />

            <div className="dashboard-grid">
                {programs.map((item, index) => {
                    const fav = isFavorite(item.path);
                    return (
                        <GlassCard
                            key={item.id}
                            className={`dashboard-card animate-pop delay-${(index + 1) * 100}`}
                            onClick={() => navigate(item.path)}
                            hoverEffect={true}
                            style={{ position: 'relative' }} // For absolute star
                        >
                            {/* Favorite Star */}
                            <div
                                onClick={(e) => handleFavorite(e, item)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    color: fav ? '#FFD700' : 'var(--neu-border-color)',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    padding: '5px',
                                    borderRadius: '50%',
                                    background: 'var(--neu-bg)',
                                    boxShadow: fav ? 'var(--shadow-flat)' : 'none'
                                }}
                            >
                                <MaterialIcon name={fav ? "star" : "star_border"} size={24} />
                            </div>

                            <div className="icon-circle" style={{ color: item.color }}>
                                <MaterialIcon name={item.icon} size={32} />
                            </div>
                            <h3 style={{ whiteSpace: 'normal' }}>{item.title}</h3>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};

export default MCH;
