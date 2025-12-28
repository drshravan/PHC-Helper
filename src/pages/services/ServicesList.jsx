import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/ui/GlassCard';
import '../../pages/Home.css'; // Reuse container styles
import PageHeader from '../../components/ui/PageHeader';
import MaterialIcon from '../../components/ui/MaterialIcon';

const ServicesList = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Services"
                subtitle="Select a service"
                backPath="/"
            />

            <div className="dashboard-grid">
                <GlassCard className="dashboard-card animate-pop delay-100" onClick={() => navigate('/services/dogbite')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#ff5722' }}>
                        <MaterialIcon name="vaccines" size={32} />
                    </div>
                    <h3>Rabies Vaccination</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-200" onClick={() => navigate('/services/pregnancy-calculator')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#4caf50' }}>
                        <MaterialIcon name="calculate" size={32} />
                    </div>
                    <h3>Pregnancy Calculator</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-300" onClick={() => navigate('/services/public-holidays')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#ffb300' }}>
                        <MaterialIcon name="calendar_month" size={32} />
                    </div>
                    <h3>Public Holidays</h3>
                </GlassCard>
            </div>
        </div>
    );
};

export default ServicesList;
