import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import './ScAncList.css';

const ScAncList = () => {
    const { monthId, subCenterId } = useParams();
    const navigate = useNavigate();
    // monthId: "jan-2026", subCenterId: "chilpur-sc" (needs formatted back)

    // Format Titles
    const formatTitle = (id) => {
        if (!id) return "";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`; // JAN 2026
    };

    const formatScName = (id) => {
        if (!id) return "Sub-Center";
        // Convert "chilpur-sc" to "Chilpur(SC)" approximation
        // Basic cap logic
        const namePart = id.split('-')[0];
        return namePart.charAt(0).toUpperCase() + namePart.slice(1) + "(SC)";
    };

    const monthTitle = formatTitle(monthId);
    const scTitle = formatScName(subCenterId);

    const [filter, setFilter] = useState('pending'); // 'pending', 'delivered', 'aborted', 'total'

    // Mock Data simulating the screenshot content
    const beneficiaries = [
        {
            id: 1,
            name: "Aluri Pravalika",
            husband: "N/A",
            status: "G? • Unknown Prev Mode",
            asha: "asha",
            missing: "Village, Husband, Gravida"
        },
        {
            id: 2,
            name: "Jyothi",
            husband: "N/A",
            status: "G? • Unknown Prev Mode",
            asha: "Unknown",
            missing: "Village, Husband, ASHA Phone, Gravida"
        },
        {
            id: 3,
            name: "Sampangi Rama devi",
            husband: "N/A",
            status: "G? • Unknown Prev Mode",
            asha: "Unknown",
            missing: "Village, Husband, ASHA Phone, Gravida"
        },
        {
            id: 4,
            name: "Gade Sathvika",
            husband: "N/A",
            status: "G? • Unknown Prev Mode",
            asha: "Unknown",
            missing: "Village, Husband, ASHA Phone, Gravida"
        },
        {
            id: 5,
            name: "Samreen",
            husband: "N/A",
            status: "G? • Unknown Prev Mode",
            asha: "Unknown",
            missing: "Village, Husband, ASHA Phone, Gravida"
        }
    ];

    return (
        <div className="home-wrapper sc-list-wrapper animate-enter">
            {/* Custom Header Text to match screenshot: SC Name on top, Month below */}
            <PageHeader
                title={scTitle}
                subtitle={monthTitle}
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}`}
            />

            {/* --- STATS FILTER BAR --- */}
            <div className="stats-filter-bar">
                <div className={`filter-item ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                    <span className="filter-val">5</span>
                    <span className="filter-lbl">Pending</span>
                </div>
                <div className={`filter-item ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>
                    <span className="filter-val" style={{ color: filter === 'delivered' ? '' : '#26a69a' }}>0</span>
                    <span className="filter-lbl">Delivered</span>
                </div>
                <div className={`filter-item ${filter === 'aborted' ? 'active' : ''}`} onClick={() => setFilter('aborted')}>
                    <span className="filter-val" style={{ color: filter === 'aborted' ? '' : '#ef5350' }}>0</span>
                    <span className="filter-lbl">Aborted</span>
                </div>
                <div className={`filter-item ${filter === 'total' ? 'active' : ''}`} onClick={() => setFilter('total')}>
                    <span className="filter-val" style={{ color: filter === 'total' ? '' : '#4fc3f7' }}>5</span>
                    <span className="filter-lbl">Total</span>
                </div>
            </div>

            {/* --- BENEFICIARIES LIST --- */}
            <div className="beneficiaries-list">
                {beneficiaries.map((b) => (
                    <div
                        key={b.id}
                        className="benef-card animate-pop"
                        onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${subCenterId}/${b.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Main Row */}
                        <div className="benef-main-row">
                            <div className="benef-info-group">
                                <div className="benef-avatar">
                                    <MaterialIcon name="person" size={24} />
                                </div>
                                <div className="benef-details">
                                    <span className="benef-name">{b.name}</span>
                                    <span className="benef-meta" style={{ marginBottom: '2px' }}>Husband: {b.husband}</span>
                                    <span className="benef-meta" style={{ color: '#fff', fontWeight: 500 }}>{b.status}</span>
                                </div>
                            </div>
                            {/* Call Button */}
                            <div className="call-icon-btn">
                                <MaterialIcon name="call" size={20} />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="card-divider"></div>

                        {/* ASHA Row */}
                        <div className="asha-row">
                            <div className="asha-info">
                                <span className="asha-lbl">ASHA Worker</span>
                                <span className="asha-name">{b.asha}</span>
                            </div>
                            <button className="asha-call-btn">
                                <MaterialIcon name="call" size={16} />
                                Call ASHA
                            </button>
                        </div>

                        {/* Warning Box */}
                        <div className="warning-box">
                            <MaterialIcon name="warning" size={18} style={{ color: '#ef5350' }} />
                            <span className="warning-text">{b.missing}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScAncList;
