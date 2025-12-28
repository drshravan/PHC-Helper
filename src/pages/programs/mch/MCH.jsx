import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import GlassCard from '../../../components/ui/GlassCard';
import '../../../pages/Home.css';
import PageHeader from '../../../components/ui/PageHeader';

const MCH = () => {
    const navigate = useNavigate();

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="MCH Program"
                subtitle="Maternal & Child Health"
                backPath="/programs"
            />

            <div className="dashboard-grid">
                <GlassCard className="dashboard-card animate-pop delay-100" onClick={() => navigate('/programs/mch/anc')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#9c27b0' }}>
                        <MaterialIcon name="how_to_reg" size={32} />
                    </div>
                    <h3>ANC Registration</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-200" onClick={() => navigate('/programs/mch/edd-vs-deliveries')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#e91e63' }}>
                        <MaterialIcon name="pregnant_woman" size={32} />
                    </div>
                    <h3>EDD vs Deliveries</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-300" onClick={() => navigate('/programs/mch/maternal-death-audit')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#f44336' }}>
                        <MaterialIcon name="medical_services" size={32} />
                    </div>
                    {/* Allow text wrap */}
                    <h3 style={{ whiteSpace: 'normal' }}>Maternal Death Audit</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-400" onClick={() => navigate('/programs/mch/child-death-audit')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#ff9800' }}>
                        <MaterialIcon name="baby_changing_station" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>Child Death Audit</h3>
                </GlassCard>

                <GlassCard className="dashboard-card animate-pop delay-500" onClick={() => navigate('/programs/mch/aefi-audit')} hoverEffect={true}>
                    <div className="icon-circle" style={{ color: '#90a4ae' }}>
                        <MaterialIcon name="vaccines" size={32} />
                    </div>
                    <h3 style={{ whiteSpace: 'normal' }}>AEFI Audit</h3>
                </GlassCard>
            </div>
        </div>
    );
};

export default MCH;
