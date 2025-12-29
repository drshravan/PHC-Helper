import React from 'react';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import GlassCard from '../../../../components/ui/GlassCard';

const ChildDeathAudit = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Child Death Audit"
                subtitle="Review and Report Cases"
                backPath="/programs/mch"
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', opacity: 0.7 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--neu-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    boxShadow: 'var(--shadow-flat)'
                }}>
                    <MaterialIcon name="baby_changing_station" size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No Audit Records</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No child death audit records found for this period.</p>
            </div>
        </div>
    );
};

export default ChildDeathAudit;
