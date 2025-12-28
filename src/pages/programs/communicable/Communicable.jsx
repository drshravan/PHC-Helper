import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import GlassCard from '../../../components/ui/GlassCard';
import PageHeader from '../../../components/ui/PageHeader';
import '../../../pages/Home.css';

const Communicable = () => {
    const navigate = useNavigate();

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Communicable Diseases"
                subtitle="Vector & Water Borne"
                backPath="/programs"
            />

            <div className="dashboard-grid">
                {/* --- TB SECTION --- */}
                <GlassCard className="dashboard-card animate-pop delay-100" onClick={() => navigate('/programs/communicable/tb-active')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#ff9800' }}>
                        <MaterialIcon name="medication" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>TB Active Cases</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-200" onClick={() => navigate('/programs/communicable/tb-completed')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#4caf50' }}>
                        <MaterialIcon name="task_alt" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>TB Treatment Completed</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-300" onClick={() => navigate('/programs/communicable/tb-death')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#f44336' }}>
                        <MaterialIcon name="sentiment_very_dissatisfied" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>TB Death Cases</h3>
                </GlassCard>

                {/* --- LEPROSY SECTION --- */}
                <GlassCard className="dashboard-card animate-pop delay-400" onClick={() => navigate('/programs/communicable/leprosy-suspected')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#2196f3' }}>
                        <MaterialIcon name="search" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>Leprosy Suspected</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-500" onClick={() => navigate('/programs/communicable/leprosy-positive')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#e91e63' }}>
                        <MaterialIcon name="coronavirus" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>Leprosy Positive</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-600" onClick={() => navigate('/programs/communicable/leprosy-death')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#d32f2f' }}>
                        <MaterialIcon name="sentiment_very_dissatisfied" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>Leprosy Death</h3>
                </GlassCard>
            </div>
        </div>
    );
};

export default Communicable;
