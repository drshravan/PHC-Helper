import React, { useState } from 'react';
import MaterialIcon from '../../../../components/ui/MaterialIcon';

const PhcMonthlyDashboard = ({ data, rawRecords, subCenters }) => {
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
        // Header
        const headers = ["S.No", "Mother ID", "Name", "Spouse", "Age", "Mobile", "LMP", "EDD", "Address", "SubCenter", "Status", "Delivery Mode", "Result", "Remarks"];
        const rows = records.map((r, i) => {
            const age = r.age || ''; // Assuming age field exists or can be derived
            const spouse = r.husbandName || '';
            const address = `${r.village || ''} ${r.district || ''}`.trim();
            const remarks = r.highRiskTypes ? r.highRiskTypes.join(', ') : '';

            // Clean fields to avoid CSV issues
            const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            return [
                i + 1,
                clean(r.motherId),
                clean(r.motherName),
                clean(spouse),
                clean(age),
                clean(r.mobile),
                clean(r.lmpDate),
                clean(r.eddDate),
                clean(address),
                clean(r.subCenter),
                clean(r.deliveryStatus || r.status || 'Pending'),
                clean(r.deliveryMode),
                clean(r.babyGender || r.abortionReason || ''),
                clean(remarks)
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

    return (
        <div className="animate-enter">
            {/* ... (Previous Sections Unchanged) ... */}

            {/* REPEATED HEADER SECTIONS TO MAINTAIN FILE STRUCTURE ... */}
            {/* --- TOP SUMMARY CARD --- */}
            <div className="summary-card-dark">
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
            <div className="section-header-row">
                <div className="section-title">Pending Deliveries</div>
                <div className="section-badge">{stats.pending} Total</div>
            </div>

            <div className="details-card-dark" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
            </div>

            {/* --- DELIVERED STATISTICS --- */}
            <div className="section-header-row">
                <div className="section-title">Delivered Statistics</div>
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
            <div className="section-header-row">
                <div className="section-title">Aborted Statistics</div>
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
            </div>

            {/* --- SC SELECTION MODAL --- */}
            {scModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setScModalOpen(false)}>
                    <div className="glass-card animate-pop"
                        style={{ width: '90%', maxWidth: '350px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--neu-border-color)', background: 'var(--neu-bg)' }}>
                            <h3 style={{ margin: 0 }}>Select Sub-Center</h3>
                        </div>
                        <div style={{ overflowY: 'auto', padding: '16px', display: 'grid', gap: '10px' }}>
                            {subCenters && subCenters.length > 0 ? (
                                subCenters.map(sc => (
                                    <button
                                        key={sc.name}
                                        className="neu-btn"
                                        style={{ justifyContent: 'space-between', padding: '12px' }}
                                        onClick={() => handleSubCenterReport(sc.name)}
                                    >
                                        <span>{sc.name}</span>
                                        <MaterialIcon name="download" size={18} />
                                    </button>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No Sub-Centers Found</p>
                            )}
                        </div>
                        <div style={{ padding: '12px', borderTop: '1px solid var(--neu-border-color)' }}>
                            <button className="neu-btn" style={{ width: '100%', color: 'var(--error-color)' }} onClick={() => setScModalOpen(false)}>
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
