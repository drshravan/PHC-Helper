import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import PhcMonthlyDashboard from './PhcMonthlyDashboard';
import PhcSubCentersList from './PhcSubCentersList';
import './PhcMonthlyInput.css';

const PhcMonthlyInput = () => {
    const { monthId } = useParams(); // e.g., "jan-2026"
    const navigate = useNavigate();
    const location = useLocation();

    // Extract readable name from route or state
    // For now, let's format the ID: 'jan-2026' -> 'JAN 2026'
    const formatTitle = (id) => {
        if (!id) return "JAN 2026";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`;
    };

    const title = formatTitle(monthId);

    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'subcenters'
    const [subCenters, setSubCenters] = useState([]);
    const [rawRecords, setRawRecords] = useState([]);

    // State for dashboard data
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState({
        monthName: title,
        total: 0,
        pending: 0,
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
    });

    useEffect(() => {
        const fetchMonthData = async () => {
            if (!monthId) return;

            setLoading(true);
            try {
                // Parse monthId (e.g., "jan-2026")
                const [mStr, yStr] = monthId.split('-');
                const monthIndex = new Date(`${mStr} 1, 2000`).getMonth(); // 0-11
                const year = parseInt(yStr);

                // Create date range for the entire month
                const startStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
                const endDateObj = new Date(year, monthIndex + 1, 0); // Last day of month
                const endStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

                const { db } = await import('../../../../firebase');
                const { collection, query, where, getDocs } = await import('firebase/firestore');

                const q = query(
                    collection(db, 'anc_records'),
                    where('eddDate', '>=', startStr),
                    where('eddDate', '<=', endStr)
                );

                const querySnapshot = await getDocs(q);

                // Initialize stats
                const stats = {
                    monthName: formatTitle(monthId),
                    total: 0,
                    pending: 0,
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
                    },
                    subCenters: {}
                };

                const records = [];

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    records.push(data); // Capture raw data

                    stats.total++;

                    const scName = data.subCenter || "Unknown";
                    if (!stats.subCenters[scName]) {
                        stats.subCenters[scName] = { name: scName, total: 0, pending: 0, delivered: 0, aborted: 0 };
                    }
                    stats.subCenters[scName].total++;

                    // 1. Delivery Status
                    const status = data.deliveryStatus || 'Pending';
                    if (status === 'Delivered') {
                        stats.delivered++;
                        stats.subCenters[scName].delivered++;
                    }
                    else if (status === 'Aborted') {
                        stats.aborted++;
                        stats.subCenters[scName].aborted++;
                    }
                    else {
                        stats.pending++;
                        stats.subCenters[scName].pending++;
                    }

                    // 2. Gravida / History Stats
                    const gravida = data.gravida || 'Primi';
                    if (gravida === 'Primi') {
                        stats.primi++;
                    } else {
                        const history = data.historyDetails || [];
                        const hasNormal = history.some(h => h.mode === 'Normal');
                        const hasLscs = history.some(h => h.mode === 'LSCS');
                        if (hasNormal) stats.prevNormal++;
                        if (hasLscs) stats.prevLscs++;
                    }

                    // 3. Delivered Stats
                    if (status === 'Delivered') {
                        const mode = data.deliveryMode || 'Normal';
                        let fac = (data.facilityType || 'Others').toLowerCase();
                        if (fac === 'government' || fac === 'govt') fac = 'govt';
                        else if (fac === 'private' || fac === 'pvt') fac = 'pvt';
                        else fac = 'other';

                        if (mode === 'Normal') {
                            if (stats.normal[fac] !== undefined) stats.normal[fac]++;
                        } else if (mode === 'LSCS') {
                            if (stats.lscs[fac] !== undefined) stats.lscs[fac]++;
                        }
                    }

                    // 4. Aborted Stats
                    if (status === 'Aborted') {
                        let fac = (data.facilityType || 'Others').toLowerCase();
                        if (fac === 'government' || fac === 'govt') fac = 'govt';
                        else if (fac === 'private' || fac === 'pvt') fac = 'pvt';
                        else fac = 'home';

                        let weeks = 0;
                        let lmp = data.lmpDate ? new Date(data.lmpDate) : null;

                        if (!lmp && data.eddDate) {
                            const edd = new Date(data.eddDate);
                            if (!isNaN(edd)) {
                                lmp = new Date(edd);
                                lmp.setDate(edd.getDate() - 280);
                            }
                        }

                        if (data.abortedDate && lmp && !isNaN(lmp)) {
                            const abDate = new Date(data.abortedDate);
                            const diffTime = abDate - lmp;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            weeks = Math.floor(diffDays / 7);
                        }

                        if (weeks < 0) weeks = 0;

                        if (weeks < 8) stats.abortions.lt8[fac]++;
                        else if (weeks >= 8 && weeks < 12) stats.abortions.b8to12[fac]++;
                        else if (weeks >= 12 && weeks <= 20) stats.abortions.b12to20[fac]++;
                        else stats.abortions.mt20[fac]++;
                    }
                });

                // Convert Map to Array for SC List
                const subCentersList = Object.values(stats.subCenters).sort((a, b) => a.name.localeCompare(b.name));
                setSubCenters(subCentersList);
                setMonthData(stats);
                setRawRecords(records);

            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthData();
    }, [monthId]);

    return (
        <div className="home-wrapper phc-wrapper">
            <PageHeader
                title={`PHC Malkapur - ${title}`}
                backPath="/programs/mch/edd-vs-deliveries"
            />

            <div className="phc-content animate-enter">
                {activeTab === 'dashboard' ? (
                    <PhcMonthlyDashboard
                        data={monthData}
                        rawRecords={rawRecords}
                        subCenters={subCenters}
                    />
                ) : (
                    <PhcSubCentersList centers={subCenters} />
                )}
            </div>

            {/* --- BOTTOM TABS --- */}
            <div className="edd-bottom-tabs">
                <button
                    className={`edd-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <MaterialIcon name="dashboard" size={24} />
                    Dashboard
                </button>
                <button
                    className={`edd-tab-btn ${activeTab === 'subcenters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subcenters')}
                >
                    <MaterialIcon name="domain" size={24} />
                    Sub-Centers
                </button>
            </div>
        </div>
    );
};

export default PhcMonthlyInput;
