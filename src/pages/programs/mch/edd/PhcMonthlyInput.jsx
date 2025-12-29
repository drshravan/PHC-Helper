import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import PhcMonthlyDashboard from './PhcMonthlyDashboard';
import PhcSubCentersList from './PhcSubCentersList';
import './PhcMonthlyInput.css';

const PhcMonthlyInput = () => {
    const { monthId } = useParams(); // e.g., "jan-2026"
    const navigate = useNavigate();
    const location = useLocation();

    // Extract readable name from route or state
    // For now, let's format the ID: 'jan-2026' -> 'JAN 2026'
    const formatTitle = (id) => {
        if (!id) return "JAN 2026";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`;
    };

    const title = formatTitle(monthId);

    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'subcenters'

    // Mock Data based on the logic that we touched a month card
    // Ideally this would fetch from Firebase or Context based on monthId
    const mockMonthData = {
        monthName: title,
        total: 53,
        pending: 53,
        delivered: 0,
        aborted: 0,
        primi: 0,
        prevNormal: 0,
        prevLscs: 0,
        normal: { govt: 0, pvt: 0, other: 0 },
        lscs: { govt: 0, pvt: 0, other: 0 },
        abortions: {
            lt8: { govt: 0, pvt: 0, home: 0 },
            b8to12: { govt: 0, pvt: 0, home: 0 },
            b12to20: { govt: 0, pvt: 0, home: 0 },
            mt20: { govt: 0, pvt: 0, home: 0 },
        }
    };

    return (
        <div className="home-wrapper phc-wrapper">
            <PageHeader
                title={`PHC Malkapur - ${title}`}
                backPath="/programs/mch/edd-vs-deliveries"
            // Right side icons could be added here if PageHeader supports children or actions
            />

            <div className="phc-content animate-enter">
                {activeTab === 'dashboard' ? (
                    <PhcMonthlyDashboard data={mockMonthData} />
                ) : (
                    <PhcSubCentersList />
                )}
            </div>

            {/* --- BOTTOM TABS --- */}
            <div className="edd-bottom-tabs">
                <button
                    className={`edd-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <MaterialIcon name="dashboard" size={24} />
                    Dashboard
                </button>
                <button
                    className={`edd-tab-btn ${activeTab === 'subcenters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subcenters')}
                >
                    <MaterialIcon name="domain" size={24} />
                    Sub-Centers
                </button>
            </div>
        </div>
    );
};

export default PhcMonthlyInput;
