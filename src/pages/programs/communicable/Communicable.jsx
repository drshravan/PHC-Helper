import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import '../../../pages/Home.css';

const Communicable = () => {
    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Communicable Diseases"
                subtitle="Vector & Water Borne"
                backPath="/programs"
            />

            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                <ShieldAlert size={48} style={{ marginBottom: '10px' }} />
                <h3>Coming Soon</h3>
                <p>Communicable Diseases module is under development</p>
            </div>
        </div>
    );
};

export default Communicable;
