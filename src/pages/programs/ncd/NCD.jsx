import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import '../../../pages/Home.css';

const NCD = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="NCD Program"
                subtitle="Non-Communicable Diseases"
                backPath="/programs"
            />

            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                <Activity size={48} style={{ marginBottom: '10px' }} />
                <h3>Coming Soon</h3>
                <p>NCD module is under development</p>
            </div>
        </div>
    );
};

export default NCD;
