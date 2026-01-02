import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import './ScAncList.css';

const ScAncList = () => {
    const { monthId, subCenterId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation(); // Get passed filter state

    // Format Titles
    const formatTitle = (id) => {
        if (!id) return "";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`; // JAN 2026
    };

    const monthTitle = formatTitle(monthId);
    const realScId = decodeURIComponent(subCenterId);

    // Initialize filter from navigation state or default to pending
    const [filter, setFilter] = useState(state?.filter || 'pending');
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            try {
                const { db } = await import('../../../../firebase');
                const { collection, query, where, onSnapshot } = await import('firebase/firestore');

                const q = query(
                    collection(db, "anc_records"),
                    where("monthGroup", "==", monthId),
                    where("subCenter", "==", realScId)
                );

                const unsubscribe = onSnapshot(q, (snap) => {
                    const list = [];
                    snap.forEach(doc => {
                        const d = doc.data();

                        // Calculate Missing Fields
                        const missing = [];
                        if (!d.husbandName) missing.push("Husband");
                        if (!d.village) missing.push("Village");
                        if (!d.ashaMobile) missing.push("ASHA Phone");
                        if (!d.gravida) missing.push("Gravida");

                        list.push({
                            id: d.motherId,
                            name: d.motherName,
                            husband: d.husbandName || "N/A",
                            status: d.deliveryStatus || 'Pending',
                            gravida: d.gravida || "G?",
                            prevHistoryDisplay: (d.historyDetails && d.historyDetails.length > 0) ? `${d.historyDetails.length} Prev` : "Unknown History",
                            asha: d.ashaName || "Unknown",
                            ashaMobile: d.ashaMobile,
                            mobile: d.mobile,
                            missing: missing.join(", "),
                            isHighRisk: d.isHighRisk,
                            // Raw fields for filtering
                            historyDetails: d.historyDetails || [],
                            deliveryMode: d.deliveryMode,
                            facilityType: d.facilityType,
                            lmpDate: d.lmpDate,
                            eddDate: d.eddDate,
                            abortedDate: d.abortedDate
                        });
                    });
                    setBeneficiaries(list);
                    setLoading(false);
                });
                return () => unsubscribe();
            } catch (err) {
                console.error("List Fetch Error:", err);
                setLoading(false);
            }
        };

        if (monthId && realScId) fetchList();
    }, [monthId, realScId]);

    // Filtering Logic
    const filteredList = beneficiaries.filter(b => {
        if (filter === 'total') return true;
        if (filter === 'pending') return b.status === 'Pending';
        if (filter === 'delivered') return b.status === 'Delivered';
        if (filter === 'aborted') return b.status === 'Aborted';

        // Deep Filters (from Dashboard)

        // Pending Sub-filters
        if (filter === 'primi') return b.status === 'Pending' && b.gravida === 'Primi';

        if (filter === 'prevNormal') {
            return b.status === 'Pending' && b.historyDetails.some(h => h.mode === 'Normal');
        }
        if (filter === 'prevLscs') {
            return b.status === 'Pending' && b.historyDetails.some(h => h.mode === 'LSCS');
        }
        if (filter === 'highRisk') return b.status === 'Pending' && b.isHighRisk;

        // Delivered Sub-filters (e.g. Normal-govt)
        if (filter.startsWith('Normal-') || filter.startsWith('LSCS-')) {
            if (b.status !== 'Delivered') return false;
            const [mode, facKey] = filter.split('-');

            if (b.deliveryMode !== mode) return false;

            const fac = (b.facilityType || 'Others').toLowerCase();
            if (facKey === 'govt') return fac === 'government' || fac === 'govt';
            if (facKey === 'pvt') return fac === 'private' || fac === 'pvt';
            return fac !== 'government' && fac !== 'govt' && fac !== 'private' && fac !== 'pvt';
        }

        // Aborted Sub-filters (e.g. lt8-govt)
        if (['lt8', 'b8to12', 'b12to20', 'mt20'].some(k => filter.startsWith(k))) {
            if (b.status !== 'Aborted') return false;

            const [weekKey, facKey] = filter.split('-');

            // Calculate Weeks
            let weeks = 0;
            let lmp = b.lmpDate ? new Date(b.lmpDate) : null;
            if (!lmp && b.eddDate) {
                const edd = new Date(b.eddDate);
                if (!isNaN(edd)) { lmp = new Date(edd); lmp.setDate(edd.getDate() - 280); }
            }
            if (b.abortedDate && lmp && !isNaN(lmp)) {
                const abDate = new Date(b.abortedDate);
                weeks = Math.floor((abDate - lmp) / (1000 * 60 * 60 * 24 * 7));
            }
            if (weeks < 0) weeks = 0;

            // Check Week Range
            let matchTime = false;
            if (weekKey === 'lt8' && weeks < 8) matchTime = true;
            else if (weekKey === 'b8to12' && weeks >= 8 && weeks < 12) matchTime = true;
            else if (weekKey === 'b12to20' && weeks >= 12 && weeks <= 20) matchTime = true;
            else if (weekKey === 'mt20' && weeks > 20) matchTime = true;

            if (!matchTime) return false;

            // Check Facility
            const fac = (b.facilityType || 'Others').toLowerCase();
            if (facKey === 'govt') return fac === 'government' || fac === 'govt';
            if (facKey === 'pvt') return fac === 'private' || fac === 'pvt';
            return fac !== 'government' && fac !== 'govt' && fac !== 'private' && fac !== 'pvt'; // Home/Other
        }

        return b.status.toLowerCase() === filter.toLowerCase();
    });

    const getCounts = () => {
        const total = beneficiaries.length;
        const pending = beneficiaries.filter(b => b.status === 'Pending').length;
        const delivered = beneficiaries.filter(b => b.status === 'Delivered').length;
        const aborted = beneficiaries.filter(b => b.status === 'Aborted').length;
        return { total, pending, delivered, aborted };
    };

    const counts = getCounts();

    return (
        <>
            <PageHeader
                title={realScId}
                subtitle={monthTitle}
                backPath={state?.backPath || `/programs/mch/edd-vs-deliveries/${monthId}/subcenters`}
            />

            <div className="home-wrapper sc-list-wrapper animate-enter">

                {/* --- STATS FILTER BAR --- */}
                <div className="stats-filter-bar">
                    <div className={`filter-item ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        <span className="filter-val">{counts.pending}</span>
                        <span className="filter-lbl">Pending</span>
                    </div>
                    <div className={`filter-item ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>
                        <span className="filter-val" style={{ color: filter === 'delivered' ? '' : '#26a69a' }}>{counts.delivered}</span>
                        <span className="filter-lbl">Delivered</span>
                    </div>
                    <div className={`filter-item ${filter === 'aborted' ? 'active' : ''}`} onClick={() => setFilter('aborted')}>
                        <span className="filter-val" style={{ color: filter === 'aborted' ? '' : '#ef5350' }}>{counts.aborted}</span>
                        <span className="filter-lbl">Aborted</span>
                    </div>
                    <div className={`filter-item ${filter === 'total' ? 'active' : ''}`} onClick={() => setFilter('total')}>
                        <span className="filter-val" style={{ color: filter === 'total' ? '' : '#4fc3f7' }}>{counts.total}</span>
                        <span className="filter-lbl">Total</span>
                    </div>
                </div>

                {/* --- BENEFICIARIES LIST --- */}
                {/* --- BENEFICIARIES LIST --- */}
                <div className="beneficiaries-list" style={{ minHeight: '50vh' }}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div className="spinner" style={{ marginBottom: 10 }}></div>
                            Loading records for {realScId}...
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <MaterialIcon name="folder_off" size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <h3>No {filter} records found</h3>
                            <p>No beneficiaries match the current filter in {realScId}.</p>
                        </div>
                    ) : (
                        filteredList.map((b) => (
                            <div
                                key={b.id}
                                className="benef-card animate-pop"
                                onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(realScId)}/${b.id}`)}
                                style={{ cursor: 'pointer', borderLeft: b.isHighRisk ? '4px solid #ef5350' : 'none' }}
                            >
                                {/* Main Row */}
                                <div className="benef-main-row">
                                    <div className="benef-info-group">
                                        <div className="benef-avatar">
                                            <MaterialIcon name="person" size={24} />
                                        </div>
                                        <div className="benef-details">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="benef-name">{b.name}</span>
                                                {b.isHighRisk && <MaterialIcon name="warning" size={16} style={{ color: '#ef5350' }} />}
                                            </div>
                                            <span className="benef-meta" style={{ marginBottom: '2px' }}>Husband: {b.husband}</span>
                                            <span className="benef-meta" style={{ fontWeight: 500 }}>
                                                {b.gravida} • {b.prevHistory}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Call Button */}
                                    {b.mobile && (
                                        <a href={`tel:${b.mobile}`} className="call-icon-btn" onClick={(e) => e.stopPropagation()}>
                                            <MaterialIcon name="call" size={20} />
                                        </a>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="card-divider"></div>

                                {/* ASHA Row */}
                                <div className="asha-row">
                                    <div className="asha-info">
                                        <span className="asha-lbl">ASHA Worker</span>
                                        <span className="asha-name">{b.asha}</span>
                                    </div>
                                    {b.ashaMobile && (
                                        <a href={`tel:${b.ashaMobile}`} className="asha-call-btn" onClick={(e) => e.stopPropagation()}>
                                            <MaterialIcon name="call" size={16} />
                                            Call ASHA
                                        </a>
                                    )}
                                </div>

                                {/* Warning Box */}
                                {b.missing && (
                                    <div className="warning-box">
                                        <MaterialIcon name="warning" size={18} style={{ color: '#ffb74d' }} />
                                        <span className="warning-text">Missing: {b.missing}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ScAncList;
