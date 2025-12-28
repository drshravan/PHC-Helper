import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import MaterialIcon from '../../../components/ui/MaterialIcon';

const TbActiveCases = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="TB Active Cases"
                subtitle="Ongoing Treatments"
                backPath="/programs/communicable"
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', opacity: 0.7 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--neu-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    boxShadow: 'var(--shadow-flat)'
                }}>
                    <MaterialIcon name="medication" size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No Active Cases</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active TB cases listed for this period.</p>
            </div>
        </div>
    );
};
export default TbActiveCases;
