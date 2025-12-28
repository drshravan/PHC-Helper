import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import MaterialIcon from '../../../components/ui/MaterialIcon';

const TbTreatmentCompleted = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="TB Treatment Completed"
                subtitle="Cured & Completed"
                backPath="/programs/communicable"
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', opacity: 0.7 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--neu-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    boxShadow: 'var(--shadow-flat)'
                }}>
                    <MaterialIcon name="task_alt" size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No Records</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No completed treatment records found.</p>
            </div>
        </div>
    );
};
export default TbTreatmentCompleted;
