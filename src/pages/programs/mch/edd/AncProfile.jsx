import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, CircularProgress } from '@mui/material';
import {
    ArrowBack, Edit, Call, Warning, CheckCircle,
    Person, LocationOn, LocalHospital, Event,
    MedicalServices, Phone, Badge, ReportProblem,
    ArrowBackIos, ArrowForwardIos
} from '@mui/icons-material';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import { useSwipeable } from 'react-swipeable';
import AncAiSummary from './AncAiSummary';
import './AncProfile.css';

const AncProfile = () => {
    const { monthId, subCenterId, recordId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [recordList, setRecordList] = useState([]);
    const [ancData, setAncData] = useState(null);

    // Load the specific record immediately
    useEffect(() => {
        const loadSingleRecord = async () => {
            if (!recordId) return;
            setIsLoading(true);
            try {
                const { db } = await import('../../../../firebase');
                const { doc, getDoc } = await import('firebase/firestore');

                const docRef = doc(db, "anc_records", recordId);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    processData({ id: snap.id, ...snap.data() });
                } else {
                    console.error("Record not found");
                    // Optionally handle not found state
                }
            } catch (err) {
                console.error("Single Record Load Error", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSingleRecord();
    }, [recordId]);

    // Load context list for navigation in background
    useEffect(() => {
        const loadContextData = async () => {
            if (!subCenterId || !monthId) return;
            try {
                const { db } = await import('../../../../firebase');
                const { collection, query, where, getDocs } = await import('firebase/firestore');

                // Decode explicitly to match ScAncList logic
                const realScId = decodeURIComponent(subCenterId);

                const q = query(
                    collection(db, "anc_records"),
                    where("monthGroup", "==", monthId),
                    where("subCenter", "==", realScId)
                );

                const querySnapshot = await getDocs(q);
                const records = [];
                querySnapshot.forEach((doc) => {
                    records.push({ id: doc.id, ...doc.data() });
                });

                // Optional: Sort by name to match default list expectation?
                // records.sort((a, b) => (a.motherName || '').localeCompare(b.motherName || ''));

                setRecordList(records);
            } catch (err) {
                console.error("Context Load Error", err);
            }
        };

        loadContextData();
    }, [subCenterId, monthId]);

    // Update index when list or recordId changes
    useEffect(() => {
        if (recordList.length > 0 && recordId) {
            const index = recordList.findIndex(r => r.id === recordId);
            setCurrentIndex(index);
        }
    }, [recordList, recordId]);

    const processData = (rawData) => {
        const norm = {
            ...rawData,
            motherName: rawData.motherName || rawData.mother_name || "Unknown Patient",
            husbandName: rawData.husbandName || rawData.husband_name || "N/A",
            mobile: rawData.mobile || rawData.mother_mobile || "",
            subCenter: rawData.subCenter || rawData.sub_center || "N/A",
            village: rawData.village || "N/A",
            district: rawData.district || "N/A",
            phc: rawData.phc || "N/A",

            lmpDate: rawData.lmpDate || rawData.lmp_date || "",
            eddDate: rawData.eddDate || rawData.edd_date || "",

            isHighRisk: (rawData.high_risk === "Yes" || rawData.isHighRisk === "Yes" || rawData.isHighRisk === true) ? "Yes" : "No",
            highRiskReason: rawData.highRiskReason || rawData.high_risk_reason || "Severe Anemia (Hb < 7g/dl)",

            deliveryStatus: rawData.deliveryStatus || "Pending",

            anmName: rawData.anmName || "Sunita Devi",
            anmMobile: rawData.anmMobile || "+91 90000 00000",
            ashaName: rawData.ashaName || "Rekha Singh",
            ashaMobile: rawData.ashaMobile || "+91 90000 00000",

            gestationalWeeks: rawData.gestationalWeeks || 28,
            gestationalDays: rawData.gestationalDays || 3,

            historySummary: rawData.historySummary || "No history recorded.",
            historyDetails: Array.isArray(rawData.historyDetails) ? rawData.historyDetails : [],
            gravida: rawData.gravida || "N/A",
            deliveryMode: rawData.deliveryMode || "N/A",
            deliveredDate: rawData.deliveredDate || "N/A",
            babyGender: rawData.babyGender || "N/A",

            birthPlanning: rawData.birthPlanning || "Not Planned",

            planTransport: rawData.planTransport || "Not Planned",
            planCompanion: rawData.planCompanion || "Not Planned",
            facilityType: rawData.facilityType || "Not Selected",
            facilityName: rawData.facilityName || "N/A",
            facilityAddress: rawData.facilityAddress || "",
        };
        setAncData(norm);
    };

    const handleSwipe = (direction) => {
        if (currentIndex === -1 || recordList.length === 0) return;

        let newIndex = currentIndex;
        if (direction === 'LEFT') {
            // Next
            newIndex = currentIndex + 1;
        } else if (direction === 'RIGHT') {
            // Previous
            newIndex = currentIndex - 1;
        }

        if (newIndex >= 0 && newIndex < recordList.length) {
            const nextRecord = recordList[newIndex];
            // Ensure we encode the subCenterId again for the URL
            navigate(
                `/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(subCenterId)}/${nextRecord.id}`,
                { replace: true }
            );
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('LEFT'),
        onSwipedRight: () => handleSwipe('RIGHT'),
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    if (isLoading || !ancData) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1f2c' }}>
                <CircularProgress sx={{ color: '#00d4ff' }} />
            </Box>
        );
    }

    return (
        <div className="anc-profile-screen" {...handlers}>
            {/* Header */}
            <div className="glass-header">
                <IconButton onClick={() => navigate(-1)} className="glass-back-btn">
                    <ArrowBack />
                </IconButton>
                <div className="header-title">{ancData.motherName}</div>
                <div className="header-action">
                    <button
                        className="glass-action-btn"
                        onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${subCenterId}/${recordId}/edit`)}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="anc-content-scroll">
                {/* 1. Updated Top Status Display - Hero Card */}
                {/* 1. Updated Top Status Display - Hero Card */}
                <div className="hero-status-card">
                    <div className="hero-row">
                        <div className={`hero-icon-box ${ancData.deliveryStatus === 'Pending' ? 'orange' : ancData.deliveryStatus === 'Aborted' ? 'red' : 'green'}`}>
                            {ancData.deliveryStatus === 'Pending' ? <Event fontSize="medium" /> :
                                ancData.deliveryStatus === 'Aborted' ? <ReportProblem fontSize="medium" /> :
                                    <CheckCircle fontSize="medium" />}
                        </div>
                        <div className="hero-info">
                            <span className="hero-label">CURRENT STATUS</span>
                            <span className={`hero-value ${ancData.deliveryStatus === 'Pending' ? 'orange' :
                                ancData.deliveryStatus === 'Aborted' ? 'red' : 'green'
                                }`}>
                                {ancData.deliveryStatus}
                            </span>
                        </div>
                        <div className="hero-extra">
                            {ancData.deliveryStatus === 'Pending' ? (
                                <div className="edd-badge">
                                    <span>EDD</span>
                                    <strong>{ancData.eddDate ? ancData.eddDate.split('-').reverse().join('/') : 'N/A'}</strong>
                                </div>
                            ) : (
                                <div className="edd-badge completed">
                                    <CheckCircle fontSize="small" />
                                    <span>Done</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Conditional High Risk Banner */}
                {ancData.isHighRisk === 'Yes' && (
                    <div className="high-risk-banner animate-pulse-red">
                        <div className="banner-icon">
                            <ReportProblem />
                        </div>
                        <div className="banner-content">
                            <div className="banner-title">HIGH RISK PREGNANCY DETECTED</div>
                            <div className="banner-tags">
                                {(ancData.highRiskTypes && ancData.highRiskTypes.length > 0) ? (
                                    ancData.highRiskTypes.map((type, idx) => (
                                        <span key={idx} className="risk-tag">{type}</span>
                                    ))
                                ) : (
                                    <span className="risk-tag">{ancData.highRiskReason}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Details */}
                <div className="glass-section">
                    <div className="section-header">
                        <div className="dot blue"></div>
                        <span>PERSONAL DETAILS</span>
                    </div>

                    <div className="detail-row">
                        <div className="field-group">
                            <label>Mother Name</label>
                            <div className="value-lg">{ancData.motherName}</div>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="field-group">
                            <label>Husband Name</label>
                            <div className="value-lg">{ancData.husbandName}</div>
                        </div>
                    </div>

                    <div className="glass-input-box">
                        <div className="box-content">
                            <label>Mobile</label>
                            <div className="box-value">{ancData.mobile}</div>
                        </div>
                        <div className="box-action">
                            <IconButton href={`tel:${ancData.mobile}`} className="neon-phone-btn">
                                <Phone fontSize="small" />
                            </IconButton>
                        </div>
                    </div>

                    <div className="detail-grid-2">
                        <div className="field-group">
                            <label>Village</label>
                            <div className="value-md">{ancData.village}</div>
                        </div>
                        <div className="field-group">
                            <label>Sub Center</label>
                            <div className="value-md">{ancData.subCenter}</div>
                        </div>
                        <div className="field-group">
                            <label>District</label>
                            <div className="value-md">{ancData.district}</div>
                        </div>
                        <div className="field-group">
                            <label>PHC</label>
                            <div className="value-md">{ancData.phc}</div>
                        </div>
                    </div>
                </div>

                {/* Health Worker */}
                <div className="glass-section">
                    <div className="section-header">
                        <div className="dot purple"></div>
                        <span>HEALTH WORKER</span>
                    </div>

                    <div className="worker-box">
                        <div className="worker-info">
                            <label>ANM Name</label>
                            <div className="worker-name">{ancData.anmName}</div>
                            <div className="worker-sub">{ancData.anmMobile}</div>
                        </div>
                        <IconButton href={`tel:${ancData.anmMobile}`} className="neon-phone-btn sm">
                            <Phone fontSize="small" />
                        </IconButton>
                    </div>

                    <div className="worker-box">
                        <div className="worker-info">
                            <label>ASHA Name</label>
                            <div className="worker-name">{ancData.ashaName}</div>
                            <div className="worker-sub">{ancData.ashaMobile}</div>
                        </div>
                        <IconButton href={`tel:${ancData.ashaMobile}`} className="neon-phone-btn sm">
                            <Phone fontSize="small" />
                        </IconButton>
                    </div>
                </div>

                {/* Past Delivery Details */}
                <div className="glass-section">
                    <div className="section-header">
                        <div className="dot cyan"></div>
                        <span>PAST DELIVERY DETAILS</span>
                    </div>

                    <div className="detail-row" style={{ marginBottom: 15 }}>
                        <div className="field-group">
                            <label>Gravida (Total Pregnancies)</label>
                            <div className="value-lg">{ancData.gravida}</div>
                        </div>
                    </div>

                    {ancData.historyDetails && ancData.historyDetails.length > 0 ? (
                        <div className="history-list">
                            {ancData.historyDetails.map((item, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '10px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                                            PREGNANCY {index + 1}
                                        </span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: item.mode === 'Aborted' ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
                                            color: item.mode === 'Aborted' ? '#f87171' : '#34d399',
                                            border: item.mode === 'Aborted' ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(52,211,153,0.2)'
                                        }}>
                                            {item.mode}
                                        </span>
                                    </div>

                                    <div className="detail-grid-2">
                                        {item.mode !== 'Aborted' && item.gender && (
                                            <div className="field-group">
                                                <label>Gender</label>
                                                <div className="value-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {item.gender}
                                                </div>
                                            </div>
                                        )}
                                        <div className="field-group">
                                            <label>Facility</label>
                                            <div className="value-sm">{item.facility}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-inset-box">
                            <label>Summary</label>
                            <p>{ancData.historySummary}</p>
                        </div>
                    )}
                </div>

                {/* 3. Present High Risk Section - Only if Yes */}
                {ancData.isHighRisk === 'Yes' && (
                    <div className="glass-section">
                        <div className="section-header">
                            <div className="dot red"></div>
                            <span>PRESENT PREGNANCY DETAILS</span>
                        </div>



                        <div className="risk-alert-box display-list">
                            <div className="risk-title-sm">IDENTIFIED RISKS:</div>
                            <div className="risk-chips-wrap">
                                {(ancData.highRiskTypes && ancData.highRiskTypes.length > 0) ? (
                                    ancData.highRiskTypes.map((type, idx) => (
                                        <span key={idx} className="risk-chip-item">
                                            <ReportProblem style={{ fontSize: 14, marginRight: 6 }} /> {type}
                                        </span>
                                    ))
                                ) : (
                                    <span className="risk-chip-item">
                                        <ReportProblem style={{ fontSize: 14, marginRight: 6 }} /> {ancData.highRiskReason}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fallback for Normal Pregnancy Details if NO risk */}
                {ancData.isHighRisk !== 'Yes' && (
                    <div className="glass-section">
                        <div className="section-header">
                            <div className="dot green"></div>
                            <span>PRESENT PREGNANCY DETAILS</span>
                        </div>

                        <div className="status-pill green mt-3" style={{ textAlign: 'center', width: '100%', display: 'block' }}>
                            NO HIGH RISK FACTORS DETECTED
                        </div>
                    </div>
                )}

                {/* Birth Planning - Only if Pending */}
                {ancData.deliveryStatus === 'Pending' && (
                    <div className="glass-section">
                        <div className="section-header">
                            <div className="dot blue"></div>
                            <span>BIRTH PLANNING</span>
                        </div>

                        <div className="worker-box" style={{ marginBottom: 0 }}>
                            <div className="worker-info">
                                <label>Planned Facility</label>
                                <div className="worker-name">{ancData.birthPlanning}</div>
                            </div>
                            <MaterialIcon name="business" size={24} style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                )}

                {/* Delivery Outcome */}
                <div className="glass-section mb-extra">
                    <div className="section-header">
                        <div className="dot green"></div>
                        <span>DELIVERY OUTCOME</span>
                    </div>

                    <div className="field-group">
                        <label>Delivery Status</label>
                        <span className={`status-pill ${ancData.deliveryStatus === 'Aborted' ? 'red' : 'green'}`}>
                            {ancData.deliveryStatus}
                        </span>
                    </div>

                    {/* Gestation Duration for Completed Pregnancies */}
                    {ancData.deliveryStatus !== 'Pending' && (
                        <div className="detail-grid-2 mt-3">
                            <div className="field-group">
                                <label>Duration at {ancData.deliveryStatus}</label>
                                <div className="value-md">{ancData.gestationalWeeks} Weeks, {ancData.gestationalDays} Days</div>
                            </div>
                        </div>
                    )}

                    {ancData.deliveryStatus === 'Aborted' && (
                        <>
                            <div className="detail-grid-2 mt-3">
                                <div className="field-group">
                                    <label>Aborted Date</label>
                                    <div className="value-sm">{ancData.abortedDate.split('-').reverse().join('/')}</div>
                                </div>
                                <div className="field-group">
                                    <label>Abortion Reason</label>
                                    <div className="value-sm">{ancData.abortionReason}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {ancData.deliveryStatus === 'Delivered' && (
                        <>
                            <div className="detail-grid-2 mt-3">
                                <div className="field-group">
                                    <label>Delivered Date</label>
                                    <div className="value-sm">{ancData.deliveredDate.split('-').reverse().join('/')}</div>
                                </div>
                                <div className="field-group">
                                    <label>Baby Gender</label>
                                    <div className="value-sm">{ancData.babyGender}</div>
                                </div>
                            </div>

                            <div className="field-group mt-3">
                                <label>Delivery Mode</label>
                                <div className="value-md">{ancData.deliveryMode}</div>
                            </div>
                        </>
                    )}

                    {/* Facility Details for both Delivered and Aborted (if available) */}
                    {ancData.deliveryStatus !== 'Pending' && (
                        <div className="glass-inset-box mt-3">
                            <div className="section-header" style={{ marginBottom: 10, fontSize: '0.65rem' }}>
                                <span>ACTUAL FACILITY DETAILS</span>
                            </div>
                            <div className="field-group">
                                <label>Facility Name</label>
                                <div className="value-md highlight">{ancData.facilityName}</div>
                            </div>
                            <div className="detail-grid-2 mt-2">
                                <div className="field-group">
                                    <label>Type</label>
                                    <div className="value-sm">{ancData.facilityType}</div>
                                </div>
                                <div className="field-group">
                                    <label>Address</label>
                                    <div className="value-sm opacity-70" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ancData.facilityAddress}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                <AncAiSummary ancData={ancData} />
            </div>

            {/* Navigation Hints */}
            <div className={`nav-hint left ${currentIndex > 0 ? 'visible' : ''}`}>
                <ArrowBackIos />
            </div>
            <div className={`nav-hint right ${currentIndex < recordList.length - 1 ? 'visible' : ''}`}>
                <ArrowForwardIos />
            </div>
        </div>
    );
};

export default AncProfile;
