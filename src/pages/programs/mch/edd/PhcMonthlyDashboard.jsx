import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../../../../firebase';
import MaterialIcon from '../../../../components/ui/MaterialIcon';

const PhcMonthlyDashboard = ({ data, rawRecords, subCenters, monthId }) => {
    const navigate = useNavigate();

    // data prop would contain the stats for the selected month
    // Using mock defaults if data is missing
    // Mock defaults if data is missing
    const stats = data || {
        total: 53,
        pending: 53,
        delivered: 0,
        aborted: 0,
        primi: 0,
        prevNormal: 0,
        prevLscs: 0,
        highRisk: 0,
        normal: { govt: 0, pvt: 0, other: 0 },
        lscs: { govt: 0, pvt: 0, other: 0 },
        abortions: {
            lt8: { govt: 0, pvt: 0, home: 0 },
            b8to12: { govt: 0, pvt: 0, home: 0 },
            b12to20: { govt: 0, pvt: 0, home: 0 },
            mt20: { govt: 0, pvt: 0, home: 0 },
        }
    };

    // Tabs for Delivered
    const [delTab, setDelTab] = useState('Normal'); // 'Normal' or 'LSCS'

    // Tabs for Aborted
    const [abortTab, setAbortTab] = useState('lt8'); // 'lt8', 'b8to12', 'b12to20', 'mt20'

    // Helper for Abortion Label
    const getAbortLabel = (tab) => {
        switch (tab) {
            case 'lt8': return '< 8 Weeks';
            case 'b8to12': return '8 - 12 Weeks';
            case 'b12to20': return '12 - 20 Weeks';
            case 'mt20': return '> 20 Weeks';
            default: return '';
        }
    };

    // --- REPORTS STATE & LOGIC ---
    const [scModalOpen, setScModalOpen] = useState(false);

    const generateCSV = (records) => {
        // defined headers matching formData fields
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

        const rows = records.map((r, i) => {
            // Helper for cleaning strings for CSV (handling commas, quotes)
            const clean = (val) => {
                const s = String(val || '').replace(/"/g, '""');
                return `"${s}"`;
            };

            // Helpers for complex fields
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

    const handleDownload = async (records, filenameTitle) => {
        if (!records || records.length === 0) {
            alert("No records to generate report.");
            return;
        }

        const csvContent = generateCSV(records);
        const fileName = `${filenameTitle}_Report.csv`;
        const file = new File([csvContent], fileName, { type: 'text/csv' });

        // Share if supported (Mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: filenameTitle,
                    text: `Here is the ${filenameTitle} report.`,
                    files: [file]
                });
                return;
            } catch (err) {
                console.log("Share failed or cancelled, falling back to download", err);
            }
        }

        // Fallback to Download (Browser/Desktop)
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

    const handlePhcReport = () => {
        handleDownload(rawRecords, `PHC_${stats.monthName.replace(' ', '_')}`);
    };

    const handleSubCenterReport = (scName) => {
        const filtered = rawRecords.filter(r => (r.subCenter || 'Unknown') === scName);
        handleDownload(filtered, `SC_${scName.replace(/ /g, '_')}_${stats.monthName.replace(' ', '_')}`);
        setScModalOpen(false);
    };

    const handleAdvancedXlsxReport = () => {
        if (!rawRecords || rawRecords.length === 0) {
            alert("No records to generate report.");
            return;
        }

        const subCenterStats = subCenters.map(sc => {
            const records = rawRecords.filter(r => r.subCenter === sc.name);
            const s = calculateRecordsStats(records);
            return {
                "Sub Center": sc.name,
                "Total ANC": records.length,
                "Pending": s.pending,
                "Delivered": s.delivered,
                "Aborted": s.aborted,
                "Normal (Govt)": s.normalGovt,
                "Normal (Pvt)": s.normalPvt,
                "LSCS (Govt)": s.lscsGovt,
                "LSCS (Pvt)": s.lscsPvt,
                "High Risk": s.highRisk
            };
        });

        // Add PHC Total
        const phcStats = calculateRecordsStats(rawRecords);
        const totalsRow = {
            "Sub Center": "PHC TOTAL (Cumulative)",
            "Total ANC": rawRecords.length,
            "Pending": phcStats.pending,
            "Delivered": phcStats.delivered,
            "Aborted": phcStats.aborted,
            "Normal (Govt)": phcStats.normalGovt,
            "Normal (Pvt)": phcStats.normalPvt,
            "LSCS (Govt)": phcStats.lscsGovt,
            "LSCS (Pvt)": phcStats.lscsPvt,
            "High Risk": phcStats.highRisk
        };

        const data = [...subCenterStats, totalsRow];

        // Create Workbook
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MCH Statistics");

        // Download
        const fileName = `PHC_Advanced_Stats_${stats.monthName.replace(' ', '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const calculateRecordsStats = (records) => {
        const s = {
            pending: 0, delivered: 0, aborted: 0,
            normalGovt: 0, normalPvt: 0, lscsGovt: 0, lscsPvt: 0,
            highRisk: 0
        };
        records.forEach(r => {
            if (r.isHighRisk === true || r.isHighRisk === "Yes") s.highRisk++;
            const status = r.deliveryStatus || r.status || 'Pending';
            if (status === 'Pending') s.pending++;
            else if (status === 'Aborted') s.aborted++;
            else if (status === 'Delivered') {
                s.delivered++;
                if (r.deliveryMode === 'Normal') {
                    if (r.facilityType === 'Govt') s.normalGovt++;
                    else if (r.facilityType === 'Pvt') s.normalPvt++;
                } else if (r.deliveryMode === 'LSCS') {
                    if (r.facilityType === 'Govt') s.lscsGovt++;
                    else if (r.facilityType === 'Pvt') s.lscsPvt++;
                }
            }
        });
        return s;
    };

    const handleSummaryCardClick = () => {
        // Navigate to the sub-centers list route
        navigate(`/programs/mch/edd-vs-deliveries/${monthId}/subcenters`);
    };



    return (
        <div className="animate-enter">
            {/* ... (Previous Sections Unchanged) ... */}

            {/* REPEATED HEADER SECTIONS TO MAINTAIN FILE STRUCTURE ... */}
            {/* --- TOP SUMMARY CARD --- */}
            <div
                className="summary-card-dark"
                onClick={handleSummaryCardClick}
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div className="summary-header-row">
                    <div className="summary-title">
                        <MaterialIcon name="calendar_today" size={16} />
                        {stats.monthName || "JAN 2026"} EDDS
                    </div>
                    <div className="summary-total-large">{stats.total}</div>
                </div>

                {/* Progress Bar */}
                <div className="progress-track" style={{ display: 'flex', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                    <div className="progress-fill" style={{ width: `${(stats.pending / stats.total) * 100}%`, background: '#FFC107', borderRadius: '0' }}></div>
                    <div className="progress-fill" style={{ width: `${(stats.delivered / stats.total) * 100}%`, background: '#2196F3', borderRadius: '0' }}></div>
                    <div className="progress-fill" style={{ width: `${(stats.aborted / stats.total) * 100}%`, background: '#F44336', borderRadius: '0' }}></div>
                </div>

                <div className="summary-stats-grid">
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.pending}</span>
                        <span className="summary-label"><div className="dot" style={{ background: '#FFC107' }}></div> Pending</span>
                    </div>
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.delivered}</span>
                        <span className="summary-label"><div className="dot" style={{ background: '#2196F3' }}></div> Delivered</span>
                    </div>
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.aborted}</span>
                        <span className="summary-label"><div className="dot" style={{ background: '#F44336' }}></div> Aborted</span>
                    </div>
                </div>
            </div>

            {/* --- PENDING DELIVERIES --- */}
            <div className="section-header-row hover-scale" onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/compare/pending`)} style={{ cursor: 'pointer' }}>
                <div className="section-title">Pending Deliveries <MaterialIcon name="chevron_right" size={20} /></div>
                <div className="section-badge">{stats.pending} Total</div>
            </div>

            <div className="details-card-dark" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="stats-block">
                    <span className="stats-block-val val-teal">{stats.primi}</span>
                    <span className="stats-block-lbl">PRIMI</span>
                </div>
                <div className="stats-block">
                    <span className="stats-block-val val-blue">{stats.prevNormal}</span>
                    <span className="stats-block-lbl">PREV NORMAL</span>
                </div>
                <div className="stats-block">
                    <span className="stats-block-val val-orange">{stats.prevLscs}</span>
                    <span className="stats-block-lbl">PREV LSCS</span>
                </div>
                <div className="stats-block">
                    <span className="stats-block-val val-red">{stats.highRisk}</span>
                    <span className="stats-block-lbl">HIGH RISK</span>
                </div>
            </div>

            {/* --- DELIVERED STATISTICS --- */}
            <div className="section-header-row hover-scale" onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/compare/delivered`)} style={{ cursor: 'pointer' }}>
                <div className="section-title">Delivered Statistics <MaterialIcon name="chevron_right" size={20} /></div>
                <div className="section-badge">{stats.delivered} Total</div>
            </div>

            <div className="details-card-dark">
                {/* Segment Control */}
                <div className="segment-control">
                    <button
                        className={`segment-btn ${delTab === 'Normal' ? 'active' : ''}`}
                        onClick={() => setDelTab('Normal')}
                    >
                        Normal
                    </button>
                    <button
                        className={`segment-btn ${delTab === 'LSCS' ? 'active' : ''}`}
                        onClick={() => setDelTab('LSCS')}
                    >
                        LSCS
                    </button>
                </div>

                {/* Blocks */}
                <div className="stats-blocks-grid">
                    <div className="stats-block">
                        <span className="stats-block-val val-blue">
                            {delTab === 'Normal' ? stats.normal.govt : stats.lscs.govt}
                        </span>
                        <span className="stats-block-lbl">GOVT</span>
                    </div>
                    <div className="stats-block">
                        <span className="stats-block-val val-purple">
                            {delTab === 'Normal' ? stats.normal.pvt : stats.lscs.pvt}
                        </span>
                        <span className="stats-block-lbl">PRIVATE</span>
                    </div>
                    <div className="stats-block">
                        <span className="stats-block-val val-teal">
                            {delTab === 'Normal' ? stats.normal.other : stats.lscs.other}
                        </span>
                        <span className="stats-block-lbl">OTHER</span>
                    </div>
                </div>

                <div className="card-footer-row">
                    <span className="footer-lbl">Total {delTab} Deliveries</span>
                    <span className="footer-val">
                        {delTab === 'Normal'
                            ? (stats.normal.govt + stats.normal.pvt + stats.normal.other)
                            : (stats.lscs.govt + stats.lscs.pvt + stats.lscs.other)
                        }
                    </span>
                </div>
            </div>


            {/* --- ABORTED STATISTICS --- */}
            <div className="section-header-row hover-scale" onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/compare/aborted`)} style={{ cursor: 'pointer' }}>
                <div className="section-title">Aborted Statistics <MaterialIcon name="chevron_right" size={20} /></div>
                <div className="section-badge">{stats.aborted} Total</div>
            </div>

            <div className="details-card-dark">
                <div className="segment-control">
                    <button className={`segment-btn ${abortTab === 'lt8' ? 'active' : ''}`} onClick={() => setAbortTab('lt8')}>&lt; 8 Wks</button>
                    <button className={`segment-btn ${abortTab === 'b8to12' ? 'active' : ''}`} onClick={() => setAbortTab('b8to12')}>8-12 Wks</button>
                    <button className={`segment-btn ${abortTab === 'b12to20' ? 'active' : ''}`} onClick={() => setAbortTab('b12to20')}>12-20 Wks</button>
                    <button className={`segment-btn ${abortTab === 'mt20' ? 'active' : ''}`} onClick={() => setAbortTab('mt20')}>&gt; 20 Wks</button>
                </div>

                <div className="stats-blocks-grid">
                    <div className="stats-block">
                        <span className="stats-block-val val-blue">
                            {stats.abortions[abortTab].govt}
                        </span>
                        <span className="stats-block-lbl">GOVT</span>
                    </div>
                    <div className="stats-block">
                        <span className="stats-block-val val-purple">
                            {stats.abortions[abortTab].pvt}
                        </span>
                        <span className="stats-block-lbl">PRIVATE</span>
                    </div>
                    <div className="stats-block">
                        <span className="stats-block-val val-red">
                            {stats.abortions[abortTab].home}
                        </span>
                        <span className="stats-block-lbl">HOME</span>
                    </div>
                </div>

                <div className="card-footer-row">
                    <span className="footer-lbl">Total Abortions ({getAbortLabel(abortTab)})</span>
                    <span className="footer-val">
                        {stats.abortions[abortTab].govt + stats.abortions[abortTab].pvt + stats.abortions[abortTab].home}
                    </span>
                </div>
            </div>

            {/* --- REPORTS SECTION --- */}
            <div className="section-header-row">
                <div className="section-title">Reports</div>
                <div className="section-badge">Export CSV</div>
            </div>

            <div className="details-card-dark" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                    className="neu-btn"
                    style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    onClick={handlePhcReport}
                >
                    <MaterialIcon name="description" size={20} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '0.8rem' }}>PHC Report</span>
                </button>
                <button
                    className="neu-btn"
                    style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setScModalOpen(true)}
                >
                    <MaterialIcon name="domain" size={20} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '0.8rem' }}>Sub-Center</span>
                </button>
                <button
                    className="neu-btn"
                    style={{
                        height: '60px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gridColumn: 'span 2',
                        marginTop: '8px',
                        gap: '12px',
                        color: 'var(--success-color)'
                    }}
                    onClick={handleAdvancedXlsxReport}
                >
                    <MaterialIcon name="summarize" size={24} />
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Advanced Analysis Report (XLSX)</span>
                </button>
            </div>



            {/* --- SC SELECTION MODAL --- */}
            {scModalOpen && (
                <div className="dialog-overlay" onClick={() => setScModalOpen(false)}>
                    <div className="dialog-card" onClick={e => e.stopPropagation()}>
                        <div className="dialog-header">
                            <h3 className="dialog-title">Select Sub-Center</h3>
                            <button className="dialog-close-btn" onClick={() => setScModalOpen(false)}>
                                <MaterialIcon name="close" size={20} />
                            </button>
                        </div>

                        <div className="dialog-content">
                            {subCenters && subCenters.length > 0 ? (
                                subCenters.map(sc => (
                                    <button
                                        key={sc.name}
                                        className="dialog-list-item"
                                        onClick={() => handleSubCenterReport(sc.name)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <MaterialIcon name="apartment" size={20} className="list-item-icon" />
                                            <span>{sc.name}</span>
                                        </div>
                                        <MaterialIcon name="download" size={20} style={{ opacity: 0.5 }} />
                                    </button>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                    <MaterialIcon name="domain_disabled" size={48} style={{ marginBottom: 10, opacity: 0.2 }} />
                                    <p>No Sub-Centers Found</p>
                                </div>
                            )}
                        </div>

                        <div className="dialog-footer">
                            <button className="dialog-cancel-btn" onClick={() => setScModalOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default PhcMonthlyDashboard;
