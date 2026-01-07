import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import PageHeader from '../../../../components/ui/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './ReportView.css'; // Reuse existing styles

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
    'Normal': '#4caf50',
    'LSCS': '#ff9800',
    'Aborted': '#f44336',
    'Pending': '#9e9e9e'
};

const AdvancedAnalysis = () => {
    const { monthId } = useParams();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [totalStats, setTotalStats] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'subCenter', direction: 'asc' });

    useEffect(() => {
        loadRecords();
    }, [monthId]);

    const loadRecords = async () => {
        try {
            const q = query(
                collection(db, 'anc_records'),
                where('monthGroup', '==', monthId)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            processStats(data);
            setRecords(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading records:', error);
            setLoading(false);
        }
    };

    const processStats = (data) => {
        const scMap = {};
        const total = {
            subCenter: 'PHC Total',
            total: 0,
            normal: 0,
            lscs: 0,
            aborted: 0,
            pending: 0,
            highRisk: 0,
            govt: 0,
            pvt: 0,
            boy: 0,
            girl: 0
        };

        data.forEach(rec => {
            const sc = rec.subCenter || 'Unknown';
            if (!scMap[sc]) {
                scMap[sc] = {
                    subCenter: sc,
                    total: 0,
                    normal: 0,
                    lscs: 0,
                    aborted: 0,
                    pending: 0,
                    highRisk: 0,
                    govt: 0,
                    pvt: 0,
                    boy: 0,
                    girl: 0
                };
            }

            const stats = scMap[sc];

            // Helper to increment both SC stats and Total stats
            const inc = (key) => {
                stats[key]++;
                total[key]++;
            };

            inc('total');

            const status = (rec.deliveryStatus || 'Pending');
            const mode = (rec.deliveryMode || '');

            if (status === 'Delivered') {
                if (mode === 'Normal') inc('normal');
                else if (mode === 'LSCS') inc('lscs');

                const facility = (rec.facilityType || '').toLowerCase();
                if (facility.includes('govt')) inc('govt');
                else if (facility.includes('pvt') || facility.includes('private')) inc('pvt');

                const gender = (rec.babyGender || '').toLowerCase();
                if (gender === 'male' || gender === 'boy') inc('boy');
                else if (gender === 'female' || gender === 'girl') inc('girl');
            } else if (status === 'Aborted') {
                inc('aborted');
            } else {
                inc('pending');
            }

            if (rec.isHighRisk === true || rec.isHighRisk === "Yes") {
                inc('highRisk');
            }
        });

        // Convert map to array
        const statsArray = Object.values(scMap);
        setStats(statsArray);
        setTotalStats(total);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStats = useMemo(() => {
        if (!sortConfig.key) return stats;
        return [...stats].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [stats, sortConfig]);

    const generateCSV = () => {
        const headers = [
            "Sub Center", "Total EDDs", "Normal", "LSCS", "Abortions", "Pending",
            "High Risk", "Govt Facility", "Pvt Facility", "Boy", "Girl"
        ];

        const rows = sortedStats.map(s => [
            `"${s.subCenter}"`, s.total, s.normal, s.lscs, s.aborted, s.pending,
            s.highRisk, s.govt, s.pvt, s.boy, s.girl
        ]);

        if (totalStats) {
            rows.push([
                `"${totalStats.subCenter}"`, totalStats.total, totalStats.normal, totalStats.lscs,
                totalStats.aborted, totalStats.pending, totalStats.highRisk,
                totalStats.govt, totalStats.pvt, totalStats.boy, totalStats.girl
            ]);
        }

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    };

    const handleShare = async () => {
        if (sortedStats.length === 0) {
            alert("No data to share.");
            return;
        }
        const csvContent = generateCSV();
        const fileName = `Analysis_${monthId}.csv`;
        const file = new File([csvContent], fileName, { type: 'text/csv' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: `Analysis Report - ${monthId}`,
                    text: `Advanced Analysis for ${monthId}`,
                    files: [file]
                });
            } catch (err) {
                console.log("Share cancelled", err);
            }
        } else {
            alert("Sharing not supported. Use Download.");
        }
    };

    const handleDownload = () => {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Analysis_${monthId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    // Chart Data Preparation
    const deliveryTypeData = [
        { name: 'Normal', value: stats.reduce((acc, s) => acc + s.normal, 0), color: STATUS_COLORS.Normal },
        { name: 'LSCS', value: stats.reduce((acc, s) => acc + s.lscs, 0), color: STATUS_COLORS.LSCS },
        { name: 'Aborted', value: stats.reduce((acc, s) => acc + s.aborted, 0), color: STATUS_COLORS.Aborted }
    ].filter(d => d.value > 0);

    const facilityData = [
        { name: 'Govt', value: stats.reduce((acc, s) => acc + s.govt, 0), color: '#2196f3' },
        { name: 'Private', value: stats.reduce((acc, s) => acc + s.pvt, 0), color: '#9c27b0' }
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading Analysis...</div>
        );
    }

    return (
        <div className="home-wrapper report-view-container">
            <PageHeader
                title="Advanced Analysis"
                subtitle={monthId}
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}`}
            />

            <div className="report-controls">
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Detailed Comparison</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Statistics by Sub-Center
                    </p>
                </div>
                <div className="action-buttons">
                    <button className="action-btn share-btn" onClick={handleShare}>
                        <MaterialIcon name="share" size={20} /> Share
                    </button>
                    <button className="action-btn download-btn" onClick={handleDownload}>
                        <MaterialIcon name="download" size={20} /> Download
                    </button>
                </div>
            </div>

            {/* Visual Table */}
            <div className="table-container" style={{ maxHeight: '400px', marginBottom: '30px' }}>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">S.No</th>
                            <SortableHeader label="Sub Center" sortKey="subCenter" className="sticky-col name-col" />
                            <SortableHeader label="Total" sortKey="total" />
                            <SortableHeader label="Normal" sortKey="normal" />
                            <SortableHeader label="LSCS" sortKey="lscs" />
                            <SortableHeader label="Abortions" sortKey="aborted" />
                            <SortableHeader label="Pending" sortKey="pending" />
                            <SortableHeader label="High Risk" sortKey="highRisk" />
                            <SortableHeader label="Govt" sortKey="govt" />
                            <SortableHeader label="Private" sortKey="pvt" />
                            <SortableHeader label="Boy" sortKey="boy" />
                            <SortableHeader label="Girl" sortKey="girl" />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStats.map((s, idx) => (
                            <tr key={s.subCenter}>
                                <td className="sticky-col">{idx + 1}</td>
                                <td className="sticky-col name-col" style={{ fontWeight: 500 }}>{s.subCenter}</td>
                                <td>{s.total}</td>
                                <td style={{ color: s.normal > 0 ? STATUS_COLORS.Normal : 'inherit' }}>{s.normal}</td>
                                <td style={{ color: s.lscs > 0 ? STATUS_COLORS.LSCS : 'inherit' }}>{s.lscs}</td>
                                <td style={{ color: s.aborted > 0 ? STATUS_COLORS.Aborted : 'inherit' }}>{s.aborted}</td>
                                <td>{s.pending}</td>
                                <td style={{ color: '#f44336', fontWeight: s.highRisk > 0 ? 'bold' : 'normal' }}>{s.highRisk}</td>
                                <td>{s.govt}</td>
                                <td>{s.pvt}</td>
                                <td>{s.boy}</td>
                                <td>{s.girl}</td>
                            </tr>
                        ))}
                        {totalStats && (
                            <tr style={{ background: 'var(--neu-bg-dark)', fontWeight: 'bold', borderTop: '2px solid var(--neu-border-color)', position: 'sticky', bottom: 0, zIndex: 25, boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}>
                                <td className="sticky-col" style={{ zIndex: 30, bottom: 0, background: 'var(--neu-bg-dark)' }}>-</td>
                                <td className="sticky-col name-col" style={{ zIndex: 30, bottom: 0, background: 'var(--neu-bg-dark)' }}>PHC Total</td>
                                <td>{totalStats.total}</td>
                                <td>{totalStats.normal}</td>
                                <td>{totalStats.lscs}</td>
                                <td>{totalStats.aborted}</td>
                                <td>{totalStats.pending}</td>
                                <td>{totalStats.highRisk}</td>
                                <td>{totalStats.govt}</td>
                                <td>{totalStats.pvt}</td>
                                <td>{totalStats.boy}</td>
                                <td>{totalStats.girl}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', paddingBottom: '40px' }}>

                {/* Delivery Types Pie */}
                <div className="modern-card" style={{ padding: '20px' }}>
                    <h4 style={{ marginTop: 0, textAlign: 'center' }}>Delivery Outcomes</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deliveryTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {deliveryTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Facility Types Pie */}
                <div className="modern-card" style={{ padding: '20px' }}>
                    <h4 style={{ marginTop: 0, textAlign: 'center' }}>Facility Distribution</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={facilityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {facilityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SubCenter Performance Bar */}
                <div className="modern-card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                    <h4 style={{ marginTop: 0, textAlign: 'center' }}>Sub-Center Performance</h4>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subCenter" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="normal" stackId="a" fill={STATUS_COLORS.Normal} name="Normal" />
                                <Bar dataKey="lscs" stackId="a" fill={STATUS_COLORS.LSCS} name="LSCS" />
                                <Bar dataKey="aborted" stackId="a" fill={STATUS_COLORS.Aborted} name="Aborted" />
                                <Bar dataKey="pending" stackId="a" fill="#e0e0e0" name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdvancedAnalysis;
