import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Chip } from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import './CompareSectionPage.css';

const CompareSectionPage = () => {
    const { monthId, sectionType } = useParams(); // sectionType: 'pending', 'delivered', 'aborted'
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [scData, setScData] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'Total';

    // Wrapper to update URL params
    const setFilter = (newFilter) => {
        setSearchParams({ filter: newFilter }, { replace: true });
    };
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

    // Helper: Title
    const formatTitle = (id) => {
        if (!id) return "";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`;
    };

    // Helper: Aborts Label
    const getAbortLabel = (tab) => {
        switch (tab) {
            case 'lt8': return '< 8 Weeks';
            case 'b8to12': return '8 - 12 Weeks';
            case 'b12to20': return '12 - 20 Weeks';
            case 'mt20': return '> 20 Weeks';
            default: return '';
        }
    };

    const sectionTitle = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch logic similar to PhcMonthlyInput
                const [mStr, yStr] = monthId.split('-');
                const monthIndex = new Date(`${mStr} 1, 2000`).getMonth();
                const year = parseInt(yStr);

                const startStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
                const endDateObj = new Date(year, monthIndex + 1, 0);
                const endStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

                const { db } = await import('../../../../firebase');
                const { collection, query, where, getDocs } = await import('firebase/firestore');

                const q = query(
                    collection(db, 'anc_records'),
                    where('eddDate', '>=', startStr),
                    where('eddDate', '<=', endStr)
                );

                const snap = await getDocs(q);

                // Aggregators
                const globalStats = {
                    total: 0,
                    // Pending
                    primi: 0, prevNormal: 0, prevLscs: 0, highRisk: 0,
                    // Delivered
                    normal: { govt: 0, pvt: 0, other: 0 },
                    lscs: { govt: 0, pvt: 0, other: 0 },
                    // Aborted (by weeks)
                    abortions: {
                        lt8: { govt: 0, pvt: 0, home: 0 },
                        b8to12: { govt: 0, pvt: 0, home: 0 },
                        b12to20: { govt: 0, pvt: 0, home: 0 },
                        mt20: { govt: 0, pvt: 0, home: 0 },
                    }
                };

                const scMap = {};

                snap.forEach(doc => {
                    const d = doc.data();
                    const scName = d.subCenter || "Unknown";
                    if (!scMap[scName]) {
                        scMap[scName] = {
                            name: scName,
                            total: 0,
                            // Pending
                            primi: 0, prevNormal: 0, prevLscs: 0, highRisk: 0,
                            // Delivered
                            normal: { govt: 0, pvt: 0, other: 0 },
                            lscs: { govt: 0, pvt: 0, other: 0 },
                            // Aborted
                            abortions: {
                                lt8: { govt: 0, pvt: 0, home: 0 },
                                b8to12: { govt: 0, pvt: 0, home: 0 },
                                b12to20: { govt: 0, pvt: 0, home: 0 },
                                mt20: { govt: 0, pvt: 0, home: 0 },
                            }
                        };
                    }

                    const status = d.deliveryStatus || 'Pending';

                    // Filter by requested section type
                    let relevant = false;
                    if (sectionType === 'pending' && status === 'Pending') relevant = true;
                    if (sectionType === 'delivered' && status === 'Delivered') relevant = true;
                    if (sectionType === 'aborted' && status === 'Aborted') relevant = true;

                    if (relevant) {
                        globalStats.total++;
                        scMap[scName].total++;

                        if (sectionType === 'pending') {
                            const gravida = d.gravida || 'Primi';
                            if (gravida === 'Primi') { globalStats.primi++; scMap[scName].primi++; }
                            else {
                                const history = d.historyDetails || [];
                                const hasNormal = history.some(h => h.mode === 'Normal');
                                const hasLscs = history.some(h => h.mode === 'LSCS');
                                if (hasNormal) { globalStats.prevNormal++; scMap[scName].prevNormal++; }
                                if (hasLscs) { globalStats.prevLscs++; scMap[scName].prevLscs++; }
                            }
                            if (d.isHighRisk) { globalStats.highRisk++; scMap[scName].highRisk++; }
                        }
                        else if (sectionType === 'delivered') {
                            const mode = d.deliveryMode || 'Normal';
                            let fac = (d.facilityType || 'Others').toLowerCase();
                            if (fac === 'government' || fac === 'govt') fac = 'govt';
                            else if (fac === 'private' || fac === 'pvt') fac = 'pvt';
                            else fac = 'other';

                            if (mode === 'Normal') {
                                if (globalStats.normal[fac] !== undefined) {
                                    globalStats.normal[fac]++;
                                    scMap[scName].normal[fac]++;
                                }
                            } else if (mode === 'LSCS') {
                                if (globalStats.lscs[fac] !== undefined) {
                                    globalStats.lscs[fac]++;
                                    scMap[scName].lscs[fac]++;
                                }
                            }
                        }
                        else if (sectionType === 'aborted') {
                            let fac = (d.facilityType || 'Others').toLowerCase();
                            if (fac === 'government' || fac === 'govt') fac = 'govt';
                            else if (fac === 'private' || fac === 'pvt') fac = 'pvt';
                            else fac = 'home';

                            let weeks = 0;
                            let lmp = d.lmpDate ? new Date(d.lmpDate) : null;
                            // Basic LMP fallback logic (simplified)
                            if (!lmp && d.eddDate) {
                                const edd = new Date(d.eddDate);
                                if (!isNaN(edd)) { lmp = new Date(edd); lmp.setDate(edd.getDate() - 280); }
                            }
                            if (d.abortedDate && lmp && !isNaN(lmp)) {
                                const abDate = new Date(d.abortedDate);
                                weeks = Math.floor((abDate - lmp) / (1000 * 60 * 60 * 24 * 7));
                            }
                            if (weeks < 0) weeks = 0;

                            let weekKey = 'mt20';
                            if (weeks < 8) weekKey = 'lt8';
                            else if (weeks < 12) weekKey = 'b8to12';
                            else if (weeks <= 20) weekKey = 'b12to20';

                            if (globalStats.abortions[weekKey][fac] !== undefined) {
                                globalStats.abortions[weekKey][fac]++;
                                scMap[scName].abortions[weekKey][fac]++;
                            }
                        }
                    }
                });

                setStats(globalStats);
                setScData(Object.values(scMap));

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [monthId, sectionType]);

    // Helpers to access nested values safely
    const getValue = (obj, filterKey) => {
        if (!filterKey || filterKey === 'Total') return obj.total;

        // Pending keys
        if (['primi', 'prevNormal', 'prevLscs', 'highRisk'].includes(filterKey)) return obj[filterKey];

        // Delivered keys: 'Normal-govt'
        if (filterKey.startsWith('Normal-')) return obj.normal[filterKey.split('-')[1]];
        if (filterKey.startsWith('LSCS-')) return obj.lscs[filterKey.split('-')[1]];

        // Aborted keys: 'lt8-govt'
        if (filterKey.includes('-')) {
            const [time, fac] = filterKey.split('-');
            if (obj.abortions[time]) return obj.abortions[time][fac];
        }

        return 0;
    };

    // Filter & Sort Logic
    // 1. Map to array with current value
    const processedScs = scData.map(sc => {
        const val = getValue(sc, filter);
        return { ...sc, currentVal: val };
    });

    // 2. Sort by value DESC, then Name ASC
    processedScs.sort((a, b) => {
        if (b.currentVal !== a.currentVal) {
            return sortOrder === 'desc' ? b.currentVal - a.currentVal : a.currentVal - b.currentVal;
        }
        return a.name.localeCompare(b.name);
    });

    // 3. Find Max Value for Bar Width
    const maxValue = Math.max(...processedScs.map(s => s.currentVal), 1);

    // --- RENDER COMPACT CARDS --
    const renderPendingCard = () => (
        <div className="compare-dashboard-card">
            <div className="compact-card-header">
                <div className="compact-title">Pending</div>
                <div className="compact-total" onClick={() => setFilter('Total')}>{stats.total} Total</div>
            </div>

            <div className="compact-stats-grid">
                <div className={`compact-stat-item ${filter === 'primi' ? 'active-filter' : ''}`} onClick={() => setFilter('primi')}>
                    <span className="compact-val val-teal">{stats.primi}</span>
                    <span className="compact-lbl">PRIMI</span>
                </div>
                <div className={`compact-stat-item ${filter === 'prevNormal' ? 'active-filter' : ''}`} onClick={() => setFilter('prevNormal')}>
                    <span className="compact-val val-blue">{stats.prevNormal}</span>
                    <span className="compact-lbl">NORMAL</span>
                </div>
                <div className={`compact-stat-item ${filter === 'prevLscs' ? 'active-filter' : ''}`} onClick={() => setFilter('prevLscs')}>
                    <span className="compact-val val-orange">{stats.prevLscs}</span>
                    <span className="compact-lbl">LSCS</span>
                </div>
                <div className={`compact-stat-item ${filter === 'highRisk' ? 'active-filter' : ''}`} onClick={() => setFilter('highRisk')}>
                    <span className="compact-val val-red">{stats.highRisk}</span>
                    <span className="compact-lbl">RISK</span>
                </div>
            </div>
        </div>
    );

    const [delTab, setDelTab] = useState('Normal');
    const renderDeliveredCard = () => (
        <div className="compare-dashboard-card">
            <div className="compact-card-header">
                <div className="compact-title">Delivered</div>
                <div className="compact-total" onClick={() => setFilter('Total')}>{stats.total} Total</div>
            </div>

            <div className="compact-segment">
                <button className={`compact-segment-btn ${delTab === 'Normal' ? 'active' : ''}`} onClick={() => setDelTab('Normal')}>Normal</button>
                <button className={`compact-segment-btn ${delTab === 'LSCS' ? 'active' : ''}`} onClick={() => setDelTab('LSCS')}>LSCS</button>
            </div>

            <div className="compact-stats-grid grid-3">
                <div className={`compact-stat-item ${filter === `${delTab}-govt` ? 'active-filter' : ''}`} onClick={() => setFilter(`${delTab}-govt`)}>
                    <span className="compact-val val-blue">{delTab === 'Normal' ? stats.normal.govt : stats.lscs.govt}</span>
                    <span className="compact-lbl">GOVT</span>
                </div>
                <div className={`compact-stat-item ${filter === `${delTab}-pvt` ? 'active-filter' : ''}`} onClick={() => setFilter(`${delTab}-pvt`)}>
                    <span className="compact-val val-purple">{delTab === 'Normal' ? stats.normal.pvt : stats.lscs.pvt}</span>
                    <span className="compact-lbl">PRIVATE</span>
                </div>
                <div className={`compact-stat-item ${filter === `${delTab}-other` ? 'active-filter' : ''}`} onClick={() => setFilter(`${delTab}-other`)}>
                    <span className="compact-val val-teal">{delTab === 'Normal' ? stats.normal.other : stats.lscs.other}</span>
                    <span className="compact-lbl">OTHER</span>
                </div>
            </div>
        </div>
    );

    const [abortTab, setAbortTab] = useState('lt8');
    const renderAbortedCard = () => (
        <div className="compare-dashboard-card">
            <div className="compact-card-header">
                <div className="compact-title">Aborted</div>
                <div className="compact-total" onClick={() => setFilter('Total')}>{stats.total} Total</div>
            </div>

            <div className="compact-segment">
                <button className={`compact-segment-btn ${abortTab === 'lt8' ? 'active' : ''}`} onClick={() => setAbortTab('lt8')}>&lt;8</button>
                <button className={`compact-segment-btn ${abortTab === 'b8to12' ? 'active' : ''}`} onClick={() => setAbortTab('b8to12')}>8-12</button>
                <button className={`compact-segment-btn ${abortTab === 'b12to20' ? 'active' : ''}`} onClick={() => setAbortTab('b12to20')}>12-20</button>
                <button className={`compact-segment-btn ${abortTab === 'mt20' ? 'active' : ''}`} onClick={() => setAbortTab('mt20')}>&gt;20</button>
            </div>

            <div className="compact-stats-grid grid-3">
                <div className={`compact-stat-item ${filter === `${abortTab}-govt` ? 'active-filter' : ''}`} onClick={() => setFilter(`${abortTab}-govt`)}>
                    <span className="compact-val val-blue">{stats.abortions[abortTab].govt}</span>
                    <span className="compact-lbl">GOVT</span>
                </div>
                <div className={`compact-stat-item ${filter === `${abortTab}-pvt` ? 'active-filter' : ''}`} onClick={() => setFilter(`${abortTab}-pvt`)}>
                    <span className="compact-val val-purple">{stats.abortions[abortTab].pvt}</span>
                    <span className="compact-lbl">PRIVATE</span>
                </div>
                <div className={`compact-stat-item ${filter === `${abortTab}-home` ? 'active-filter' : ''}`} onClick={() => setFilter(`${abortTab}-home`)}>
                    <span className="compact-val val-red">{stats.abortions[abortTab].home}</span>
                    <span className="compact-lbl">HOME</span>
                </div>
            </div>
        </div>
    );


    if (loading) return <div className="home-wrapper"><div className="spinner"></div></div>;

    const getColor = () => {
        if (filter === 'primi') return 'val-teal';
        if (filter.toLowerCase().includes('normal')) return 'val-blue';
        if (filter.toLowerCase().includes('lscs')) return 'val-orange';
        if (filter === 'highRisk') return 'val-red';
        if (filter.includes('govt')) return 'val-blue';
        if (filter.includes('pvt')) return 'val-purple';
        if (filter.includes('home')) return 'val-red';
        return 'val-blue'; // Default
    };

    const getFilterDisplay = (f) => {
        if (f === 'Total') return 'ALL RECORDS';

        // Pending Mappings
        if (f === 'primi') return 'PRIMI GRAVIDA';
        if (f === 'prevNormal') return 'PREVIOUS NORMAL';
        if (f === 'prevLscs') return 'PREVIOUS LSCS';
        if (f === 'highRisk') return 'HIGH RISK';

        // Complex Keys (Abortion/Delivered)
        let label = f.toUpperCase();

        // Weeks
        label = label.replace('LT8', '< 8 WKS');
        label = label.replace('B8TO12', '8-12 WKS');
        label = label.replace('B12TO20', '12-20 WKS');
        label = label.replace('MT20', '> 20 WKS');

        // Facilities
        label = label.replace('PVT', 'PRIVATE');
        label = label.replace('GOVT', 'GOVERNMENT');

        return label.replace(/-/g, ' • ');
    };

    const colorClass = getColor(); // Compute once for list

    return (
        <Box className="compare-main-container">
            {/* MUI AppBar - Fixed at Top */}
            <AppBar
                position="fixed"
                elevation={20}
                sx={{
                    backgroundColor: 'var(--neu-bg)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {/* Toolbar with Back, Title, Home */}
                <Toolbar sx={{ minHeight: '64px', px: 2 }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}`)}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Compare {sectionTitle}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {formatTitle(monthId)} • PHC Malkapur
                        </Typography>
                    </Box>

                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => navigate('/')}
                    >
                        <Home />
                    </IconButton>
                </Toolbar>

                {/* Dashboard Cards Container */}
                <Box className="compare-appbar-content">
                    {sectionType === 'pending' && renderPendingCard()}
                    {sectionType === 'delivered' && renderDeliveredCard()}
                    {sectionType === 'aborted' && renderAbortedCard()}

                    {/* Filter Info */}
                    <div className="section-filter-title" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} style={{ cursor: 'pointer', marginBottom: 0 }}>
                        <div>
                            <span style={{ opacity: 0.7 }}>FILTERING:</span> {getFilterDisplay(filter)}
                        </div>
                        <div className="sort-indicator" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                            <MaterialIcon name={sortOrder === 'desc' ? "arrow_downward" : "arrow_upward"} size={16} />
                        </div>
                    </div>
                </Box>
            </AppBar>

            {/* Scrollable SubCenters List Container */}
            <Box className="compare-scrollable-content">
                <div className="compare-sc-list">
                    {processedScs.map((sc, index) => {
                        const val = sc.currentVal;
                        const percentage = Math.min((val / maxValue) * 100, 100);

                        return (
                            <div key={sc.name} className={`sc-compare-card ${val === 0 ? 'zero-val' : ''} ${colorClass}`}
                                onClick={() => {
                                    // Determine filter to pass: if 'Total', use the broad section type (pending/delivered/aborted)
                                    const targetFilter = filter === 'Total' ? sectionType : filter;
                                    navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(sc.name)}`, {
                                        state: {
                                            filter: targetFilter,
                                            backPath: location.pathname + location.search // Allow returning here
                                        }
                                    });
                                }}>

                                <div className="sc-rank">#{index + 1}</div>

                                <div className="sc-name-group">
                                    <div className="sc-title">{sc.name}</div>
                                    <div className="sc-bar-bg">
                                        <div className="sc-bar-fill" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>

                                <div className="sc-value-display">{val}</div>
                            </div>
                        );
                    })}
                </div>
            </Box>
        </Box>
    );
};

export default CompareSectionPage;
