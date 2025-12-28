import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import MaterialIcon from '../../../components/ui/MaterialIcon';

const LeprosyDeath = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Leprosy Death"
                subtitle="Death Reporting"
                backPath="/programs/communicable"
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', opacity: 0.7 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--neu-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    boxShadow: 'var(--shadow-flat)'
                }}>
                    <MaterialIcon name="sentiment_very_dissatisfied" size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No Death Cases</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No leprosy-related deaths reported.</p>
            </div>
        </div>
    );
};
export default LeprosyDeath;
