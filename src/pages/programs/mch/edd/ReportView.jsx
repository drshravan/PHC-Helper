import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import PageHeader from '../../../../components/ui/PageHeader';
import './ReportView.css';

const ReportView = () => {
    const { monthId, reportType } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubCenter, setSelectedSubCenter] = useState('all');
    const [subCenters, setSubCenters] = useState([]);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        loadRecords();
    }, [monthId, reportType]);

    const loadRecords = async () => {
        try {
            const q = query(
                collection(db, 'anc_records'),
                where('monthGroup', '==', monthId)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Extract unique sub-centers
            const uniqueSC = [...new Set(data.map(r => r.subCenter))].filter(Boolean);
            setSubCenters(uniqueSC);

            setRecords(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading records:', error);
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedRecords = (filtered) => {
        if (!sortConfig.key) return filtered;

        return [...filtered].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Handle date sorting
            if (sortConfig.key.includes('Date')) {
                aVal = new Date(aVal || '1900-01-01');
                bVal = new Date(bVal || '1900-01-01');
            }
            // Case insensitive string sort
            else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const getFilteredRecords = () => {
        let filtered = records;

        // Filter by sub-center
        if (selectedSubCenter !== 'all') {
            filtered = filtered.filter(r => r.subCenter === selectedSubCenter);
        }

        return getSortedRecords(filtered);
    };

    const generateCSV = (records) => {
        const headers = [
            "Mother ID", "S.No", "Mother Name", "Husband Name", "Mobile",
            "Village", "Sub Center", "District", "PHC",
            "ANM Name", "ANM Mobile", "ASHA Name", "ASHA Mobile",
            "LMP Date", "EDD Date",
            "Gravida", "History Summary",
            "High Risk", "High Risk Types",
            "Delivery Status", "Delivery Mode", "Delivered Date", "Aborted Date",
            "Baby Gender", "Facility Type", "Facility Name", "Facility Address",
            "LSCS Reason", "Abortion Reason", "Pvt Facility Reason",
            "Gestational Weeks", "Gestational Days", "Birth Planning"
        ];

        const rows = records.map(r => {
            const clean = (val) => {
                const s = String(val || '').replace(/"/g, '""');
                return `"${s}"`;
            };

            const historySummary = (r.historyDetails || []).map((h, idx) =>
                `G${idx + 1}:${h.mode || '?'}${h.facility ? '-' + h.facility : ''}`
            ).join('; ');

            const riskTypes = (r.highRiskTypes || []).join(', ');
            const isHighRisk = (r.isHighRisk === true || r.isHighRisk === "Yes") ? "Yes" : "No";

            return [
                clean(r.motherId),
                clean(r.sNo),
                clean(r.motherName),
                clean(r.husbandName),
                clean(r.mobile),
                clean(r.village),
                clean(r.subCenter),
                clean(r.district),
                clean(r.phc),
                clean(r.anmName),
                clean(r.anmMobile),
                clean(r.ashaName),
                clean(r.ashaMobile),
                clean(r.lmpDate || r.lmp_date),
                clean(r.eddDate || r.edd_date),
                clean(r.gravida),
                clean(historySummary),
                clean(isHighRisk),
                clean(riskTypes),
                clean(r.deliveryStatus || r.status || 'Pending'),
                clean(r.deliveryMode),
                clean(r.deliveredDate),
                clean(r.abortedDate),
                clean(r.babyGender),
                clean(r.facilityType),
                clean(r.facilityName),
                clean(r.facilityAddress),
                clean(r.lscsReason),
                clean(r.abortionReason),
                clean(r.pvtFacilityReason),
                clean(r.gestationalWeeks),
                clean(r.gestationalDays),
                clean(r.birthPlanning || "CHC Ghanpur Station")
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    };

    const handleShare = async () => {
        const filtered = getFilteredRecords();
        if (filtered.length === 0) {
            alert("No records to share.");
            return;
        }

        const csvContent = generateCSV(filtered);
        const fileName = `${reportType}_${selectedSubCenter}_${monthId}.csv`;
        const file = new File([csvContent], fileName, { type: 'text/csv' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: `${reportType} Report`,
                    text: `Report for ${monthId}`,
                    files: [file]
                });
            } catch (err) {
                console.log("Share cancelled or failed", err);
            }
        } else {
            alert("Sharing is not supported on this device. Use Download instead.");
        }
    };

    const handleDownload = () => {
        const filtered = getFilteredRecords();
        if (filtered.length === 0) {
            alert("No records to download.");
            return;
        }

        const csvContent = generateCSV(filtered);
        const fileName = `${reportType}_${selectedSubCenter}_${monthId}.csv`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading Report...</div>
            </div>
        );
    }

    const filteredRecords = getFilteredRecords();

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span style={{ opacity: 0.2, fontSize: '0.8em', marginLeft: 4 }}>⇅</span>;
        return <span style={{ marginLeft: 4 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const SortableHeader = ({ label, sortKey, className }) => (
        <th className={className} onClick={() => handleSort(sortKey)} style={{ cursor: 'pointer', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {label} <SortIcon column={sortKey} />
            </div>
        </th>
    );

    return (
        <div className="home-wrapper report-view-container">
            <PageHeader
                title={`${reportType} Report`}
                subtitle={monthId}
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}`}
            />

            <div className="report-controls">
                <div className="filter-section">
                    <label>Sub-Center Filter:</label>
                    <select
                        className="filter-select"
                        value={selectedSubCenter}
                        onChange={(e) => setSelectedSubCenter(e.target.value)}
                    >
                        <option value="all">All Sub-Centers</option>
                        {subCenters.map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                        ))}
                    </select>
                </div>

                <div className="action-buttons">
                    <button className="action-btn share-btn" onClick={handleShare}>
                        <MaterialIcon name="share" size={20} />
                        Share
                    </button>
                    <button className="action-btn download-btn" onClick={handleDownload}>
                        <MaterialIcon name="download" size={20} />
                        Download
                    </button>
                </div>
            </div>

            <div className="report-stats">
                <div className="stat-badge">
                    <MaterialIcon name="folder" size={16} />
                    {filteredRecords.length} Records
                </div>
            </div>

            <div className="table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">S.No</th>
                            <SortableHeader label="Mother Name" sortKey="motherName" className="sticky-col name-col" />
                            <SortableHeader label="Mother ID" sortKey="motherId" />
                            <SortableHeader label="Husband Name" sortKey="husbandName" />
                            <th>Mobile</th>
                            <SortableHeader label="Village" sortKey="village" />
                            <SortableHeader label="Sub Center" sortKey="subCenter" />
                            <th>District</th>
                            <th>PHC</th>
                            <SortableHeader label="ANM Name" sortKey="anmName" />
                            <th>ANM Mobile</th>
                            <SortableHeader label="ASHA Name" sortKey="ashaName" />
                            <th>ASHA Mobile</th>
                            <SortableHeader label="LMP Date" sortKey="lmpDate" />
                            <SortableHeader label="EDD Date" sortKey="eddDate" />
                            <SortableHeader label="Gravida" sortKey="gravida" />
                            <th>History Summary</th>
                            <SortableHeader label="High Risk" sortKey="isHighRisk" />
                            <th>High Risk Types</th>
                            <SortableHeader label="Delivery Status" sortKey="deliveryStatus" />
                            <SortableHeader label="Delivery Mode" sortKey="deliveryMode" />
                            <SortableHeader label="Delivered Date" sortKey="deliveredDate" />
                            <SortableHeader label="Aborted Date" sortKey="abortedDate" />
                            <th>Baby Gender</th>
                            <SortableHeader label="Facility Type" sortKey="facilityType" />
                            <SortableHeader label="Facility Name" sortKey="facilityName" />
                            <th>Facility Address</th>
                            <th>LSCS Reason</th>
                            <th>Abortion Reason</th>
                            <th>Pvt Facility Reason</th>
                            <th>Gestational Weeks</th>
                            <th>Gestational Days</th>
                            <th>Birth Planning</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.map((record, index) => {
                            const historySummary = (record.historyDetails || []).map((h, idx) =>
                                `G${idx + 1}:${h.mode || '?'}${h.facility ? '-' + h.facility : ''}`
                            ).join('; ');
                            const riskTypes = (record.highRiskTypes || []).join(', ');
                            const isHighRisk = (record.isHighRisk === true || record.isHighRisk === "Yes") ? "Yes" : "No";

                            return (
                                <tr
                                    key={record.id}
                                    onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(record.subCenter)}/${record.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="sticky-col">{index + 1}</td>
                                    <td className="sticky-col name-col name-cell">{record.motherName}</td>
                                    <td>{record.motherId || '-'}</td>
                                    <td>{record.husbandName || '-'}</td>
                                    <td>{record.mobile || '-'}</td>
                                    <td>{record.village || '-'}</td>
                                    <td>{record.subCenter || '-'}</td>
                                    <td>{record.district || '-'}</td>
                                    <td>{record.phc || '-'}</td>
                                    <td>{record.anmName || '-'}</td>
                                    <td>{record.anmMobile || '-'}</td>
                                    <td>{record.ashaName || '-'}</td>
                                    <td>{record.ashaMobile || '-'}</td>
                                    <td>{record.lmpDate || '-'}</td>
                                    <td>{record.eddDate || '-'}</td>
                                    <td>{record.gravida || '-'}</td>
                                    <td>{historySummary || '-'}</td>
                                    <td>
                                        {isHighRisk === 'Yes' ? (
                                            <MaterialIcon name="warning" size={18} style={{ color: '#f44336' }} />
                                        ) : (
                                            <MaterialIcon name="check_circle" size={18} style={{ color: '#4caf50' }} />
                                        )}
                                    </td>
                                    <td>{riskTypes || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${(record.deliveryStatus || 'Pending').toLowerCase()}`}>
                                            {record.deliveryStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{record.deliveryMode || '-'}</td>
                                    <td>{record.deliveredDate || '-'}</td>
                                    <td>{record.abortedDate || '-'}</td>
                                    <td>{record.babyGender || '-'}</td>
                                    <td>{record.facilityType || '-'}</td>
                                    <td>{record.facilityName || '-'}</td>
                                    <td>{record.facilityAddress || '-'}</td>
                                    <td>{record.lscsReason || '-'}</td>
                                    <td>{record.abortionReason || '-'}</td>
                                    <td>{record.pvtFacilityReason || '-'}</td>
                                    <td>{record.gestationalWeeks || '-'}</td>
                                    <td>{record.gestationalDays || '-'}</td>
                                    <td>{record.birthPlanning || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportView;
