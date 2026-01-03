import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import './IncompleteAncList.css';

const IncompleteAncList = () => {
    const navigate = useNavigate();
    const { monthId } = useParams();
    const [groupedRecords, setGroupedRecords] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);

    const checkIncomplete = (d) => {
        const missing = [];
        if (!d.husbandName || d.husbandName.trim() === "") missing.push("Husband");
        if (!d.village || d.village.trim() === "") missing.push("Village");
        if (!d.ashaMobile || !/^\d{10}$/.test(d.ashaMobile)) missing.push("ASHA Mobile");
        if (!d.anmMobile || !/^\d{10}$/.test(d.anmMobile)) missing.push("ANM Mobile");
        if (!d.gravida || d.gravida === "") missing.push("Gravida");

        // If it's multi-gravida but has no history details
        if (d.gravida !== 'Primi' && (!d.historyDetails || d.historyDetails.length === 0)) {
            missing.push("History Details");
        }

        return missing;
    };

    useEffect(() => {
        const fetchIncompleteRecords = async () => {
            setLoading(true);
            try {
                const [mStr, yStr] = monthId.split('-');
                const monthIndex = new Date(`${mStr} 1, 2000`).getMonth();
                const year = parseInt(yStr);

                // Start and End dates for the month
                const startStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
                const endDateObj = new Date(year, monthIndex + 1, 0);
                const endStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

                const { db } = await import('../../../../firebase');
                const { collection, query, where, getDocs } = await import('firebase/firestore');

                const q = query(
                    collection(db, "anc_records"),
                    where("eddDate", ">=", startStr),
                    where("eddDate", "<=", endStr)
                );

                const snap = await getDocs(q);
                const groups = {};

                snap.forEach(doc => {
                    const data = doc.data();

                    // Filter for Pending status in memory (Safer, no composite index needed)
                    const status = data.deliveryStatus || 'Pending';
                    if (status !== 'Pending') return;

                    const missingFields = checkIncomplete(data);

                    if (missingFields.length > 0) {
                        const sc = data.subCenter || "Unknown Sub-Center";
                        if (!groups[sc]) groups[sc] = [];

                        groups[sc].push({
                            id: doc.id,
                            ...data,
                            missingFields
                        });
                    }
                });

                setGroupedRecords(groups);

                // Initially collapse all groups
                const initialExpanded = {};
                Object.keys(groups).forEach(key => {
                    initialExpanded[key] = false;
                });
                setExpandedGroups(initialExpanded);

            } catch (err) {
                console.error("Fetch Incomplete Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchIncompleteRecords();
    }, [monthId]);

    const toggleGroup = (sc) => {
        setExpandedGroups(prev => {
            const isCurrentlyExpanded = prev[sc];

            // If clicking on an already expanded group, collapse it
            if (isCurrentlyExpanded) {
                return { ...prev, [sc]: false };
            }

            // Otherwise, collapse all and expand only the clicked one
            const newState = {};
            Object.keys(prev).forEach(key => {
                newState[key] = key === sc;
            });
            return newState;
        });
    };

    const formatTitle = (id) => {
        if (!id) return "ALL";
        const parts = id.split('-');
        if (parts.length < 2) return id.toUpperCase();
        return `${parts[0].toUpperCase()} ${parts[1]}`;
    };

    const handleRecordClick = (record) => {
        // Use the monthId from params to stay in context
        navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(record.subCenter)}/${record.id}`);
    };

    return (
        <div className="home-wrapper incomplete-list-wrapper">
            <PageHeader
                title="Incomplete Records"
                subtitle={`${formatTitle(monthId)} Audit`}
                backPath={monthId ? `/programs/mch/edd-vs-deliveries/${monthId}` : '/programs/mch/edd-vs-deliveries'}
            />

            <div className="animate-enter">

                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                        <p>Scanning records for missing data...</p>
                    </div>
                ) : Object.keys(groupedRecords).length === 0 ? (
                    <div className="empty-state animate-pop">
                        <MaterialIcon name="check_circle" size={80} className="empty-icon" style={{ color: 'var(--success-color)' }} />
                        <p className="empty-text">All pending records are complete!</p>
                        <p style={{ marginTop: 10, opacity: 0.7 }}>Great job maintaining the data quality.</p>
                    </div>
                ) : (
                    <div className="groups-list">
                        {Object.keys(groupedRecords).sort().map(sc => (
                            <div key={sc} className="incomplete-section">
                                <button
                                    className={`sc-group-header ${expandedGroups[sc] ? 'active' : ''}`}
                                    onClick={() => toggleGroup(sc)}
                                >
                                    <div className="sc-info">
                                        <MaterialIcon
                                            name={expandedGroups[sc] ? "expand_more" : "chevron_right"}
                                            size={24}
                                            style={{ color: expandedGroups[sc] ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                                        />
                                        <span className="sc-name">{sc}</span>
                                    </div>
                                    <span className="sc-badge">{groupedRecords[sc].length}</span>
                                </button>

                                {expandedGroups[sc] && (
                                    <div className="records-container animate-enter">
                                        {groupedRecords[sc].map(record => (
                                            <div
                                                key={record.id}
                                                className="incomplete-record-card animate-pop"
                                                onClick={() => handleRecordClick(record)}
                                            >
                                                <div className="record-main">
                                                    <div className="mother-info">
                                                        <span className="mother-name">{record.motherName}</span>
                                                        <span className="edd-info">
                                                            EDD: {record.eddDate ? record.eddDate.split('-').reverse().join('/') : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="status-pills">
                                                        {record.isHighRisk === "Yes" && <span className="pill pill-highrisk">High Risk</span>}
                                                    </div>
                                                </div>

                                                <div className="warning-list">
                                                    {record.missingFields.map(field => (
                                                        <div key={field} className="warning-item">
                                                            <MaterialIcon name="warning" size={14} />
                                                            <span>{field}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncompleteAncList;
