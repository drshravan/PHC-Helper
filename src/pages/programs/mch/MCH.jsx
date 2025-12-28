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
            </div>
        </div>
    );
};

export default MCH;
