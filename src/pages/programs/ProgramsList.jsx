import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/ui/MaterialIcon';
import GlassCard from '../../components/ui/GlassCard';
import '../../pages/Home.css'; // Reuse container styles
import PageHeader from '../../components/ui/PageHeader';

const ProgramsList = () => {
    const navigate = useNavigate();

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="National Programs"
                subtitle="Select a program category"
                backPath="/"
            />

            <div className="dashboard-grid">
                <GlassCard className="dashboard-card animate-pop delay-100" onClick={() => navigate('/programs/mch')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#e91e63' }}>
                        <MaterialIcon name="woman" size={32} />
                    </div>
                    <h3>MCH</h3>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>Maternal & Child Health</p>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-200" onClick={() => navigate('/programs/ncd')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#f44336' }}>
                        <MaterialIcon name="monitor_heart" size={32} />
                    </div>
                    <h3>NCD</h3>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>Non-Communicable Diseases</p>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-300" onClick={() => navigate('/programs/communicable')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#ff9800' }}>
                        <MaterialIcon name="health_and_safety" size={32} />
                    </div>
                    {/* Updated Title */}
                    <h3>Communicable Diseases</h3>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>Diseases & Vectors</p>
                </GlassCard>
            </div>
        </div>
    );
};

export default ProgramsList;
