import React, { useState } from 'react';
import MaterialIcon from '../../../../components/ui/MaterialIcon';

const PhcMonthlyDashboard = ({ data }) => {
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
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
                </div>

                <div className="summary-stats-grid">
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.pending}</span>
                        <span className="summary-label"><div className="dot pending"></div> Pending</span>
                    </div>
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.delivered}</span>
                        <span className="summary-label"><div className="dot delivered"></div> Delivered</span>
                    </div>
                    <div className="summary-stat-item">
                        <span className="summary-val">{stats.aborted}</span>
                        <span className="summary-label"><div className="dot aborted"></div> Aborted</span>
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
        </div>
    );
};

export default PhcMonthlyDashboard;
