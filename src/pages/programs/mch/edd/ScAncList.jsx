import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
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

    const monthTitle = formatTitle(monthId);
    // Decode subcenter ID back to likely name if needed, or pass it raw if stored raw.
    // In Import we stored: "Kistajigudem (SC)"
    // URL param likely: "kistajigudem-(sc)" (slugified) or we should pass raw ID?
    // Let's assume for now we match somewhat loosely or exactly if we were careful in Dashboard.
    // Dashboard passes: `month.id` (jan-2026). SubCenter list?
    // Dashboard doesn't link to list yet? Ah, Dashboard links to Month Details? 
    // Wait, EddVsDeliveries.jsx links to `/programs/mch/edd-vs-deliveries/${month.id}` which is `PhcSubCentersList`.
    // Then THAT links here. We need to ensure `PhcSubCentersList` passes the correct ID.
    // For this file, let's assume `subCenterId` is the exact string stored in DB if possible, or we decode.

    // Actually, likely the user clicks a card with "Kistajigudem (SC)" which navigates to /.../Kistajigudem (SC)
    // URL params might be encoded. decodeURIComponent(subCenterId).
    const realScId = decodeURIComponent(subCenterId);

    const [filter, setFilter] = useState('pending'); // 'pending', 'delivered', 'aborted', 'total'
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            try {
                const { db } = await import('../../../../firebase');
                const { collection, query, where, onSnapshot } = await import('firebase/firestore');

                // Query: monthGroup == monthId AND subCenter == realScId
                // Note: realScId needs to match what was saved in "SubCenter" column exactly.
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
                            id: d.motherId, // Document ID
                            name: d.motherName,
                            husband: d.husbandName || "N/A",
                            // Use deliveryStatus field; default to 'Pending' if missing
                            status: d.deliveryStatus || 'Pending',
                            gravida: d.gravida || "G?",
                            prevHistory: (d.historyDetails && d.historyDetails.length > 0) ? `${d.historyDetails.length} Prev` : "Unknown History",
                            asha: d.ashaName || "Unknown",
                            ashaMobile: d.ashaMobile,
                            mobile: d.mobile,
                            missing: missing.join(", "),
                            isHighRisk: d.isHighRisk
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
        <div className="home-wrapper sc-list-wrapper animate-enter">
            {/* Custom Header Text */}
            <PageHeader
                title={realScId}
                subtitle={monthTitle}
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}`}
            />

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
    );
};

export default ScAncList;
