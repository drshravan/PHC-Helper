import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Fab, Divider, Chip } from '@mui/material';
import {
    ArrowBack, Home, Call, Edit, LocationOn, Person, MedicalServices,
    Warning, ChildFriendly, HistoryEdu, Business, Event, Badge as BadgeIcon,
    LocalHospital, Assignment, Notes, Info, VerifiedUser
} from '@mui/icons-material';
import './AncProfile.css';

const AncProfile = () => {
    const { monthId, subCenterId, recordId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [ancData, setAncData] = useState(null);

    useEffect(() => {
        const loadRecord = async () => {
            if (!recordId) return;
            try {
                const { db } = await import('../../../../firebase');
                const { doc, getDoc } = await import('firebase/firestore');

                const docRef = doc(db, "anc_records", recordId);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const rawData = snap.data();

                    // --- ADVANCED DATA NORMALIZATION (Top Coder Style) ---
                    const norm = {
                        ...rawData,
                        motherName: rawData.motherName || rawData.mother_name || "Unknown Patient",
                        husbandName: rawData.husbandName || rawData.husband_name || "N/A",
                        motherId: rawData.motherId || rawData.mother_id || rawData.mcts_id || "N/A",
                        mobile: rawData.mobile || rawData.mother_mobile || "",
                        sNo: rawData.sNo || rawData.s_no || "N/A",

                        // Geography
                        village: rawData.village || "N/A",
                        subCenter: rawData.subCenter || rawData.sub_center || "N/A",
                        phc: rawData.phc || "N/A",
                        district: rawData.district || "N/A",

                        // Dates
                        lmpDate: rawData.lmpDate || rawData.lmp_date || "",
                        eddDate: rawData.eddDate || rawData.edd_date || "",
                        deliveredDate: rawData.deliveredDate || rawData.delivery_date || "",
                        abortedDate: rawData.abortedDate || rawData.abortion_date || "",

                        // Clinical State
                        isHighRisk: (rawData.isHighRisk === true || rawData.isHighRisk === "Yes") ? "Yes" : "No",
                        highRiskTypes: rawData.highRiskTypes || [],
                        gravida: rawData.gravida || "N/A",
                        historyDetails: rawData.historyDetails || [],

                        // Outcome & Reasons
                        deliveryStatus: rawData.deliveryStatus || "Pending",
                        deliveryMode: rawData.deliveryMode || "",
                        babyGender: rawData.babyGender || "",
                        lscsReason: rawData.lscsReason || "",
                        abortionReason: rawData.abortionReason || "",
                        pvtFacilityReason: rawData.pvtFacilityReason || "",

                        // Health Team
                        anmName: rawData.anmName || "Not Assigned",
                        anmMobile: rawData.anmMobile || "",
                        ashaName: rawData.ashaName || "Not Assigned",
                        ashaMobile: rawData.ashaMobile || "",

                        // Facility & Planning
                        facilityType: rawData.facilityType || "N/A",
                        facilityName: rawData.facilityName || "N/A",
                        facilityAddress: rawData.facilityAddress || "",
                        birthPlanning: rawData.birthPlanning || "CHC Ghanpur Station",

                        // Persistence values
                        gestationalWeeks: rawData.gestationalWeeks || 0,
                        gestationalDays: rawData.gestationalDays || 0,
                        updatedAt: rawData.updatedAt || null
                    };

                    setAncData(norm);
                } else {
                    alert("Record not found!");
                    navigate(-1);
                }
            } catch (err) {
                console.error("Load Error", err);
                alert("Failed to load record.");
            } finally {
                setIsLoading(false);
            }
        };
        loadRecord();
    }, [recordId, navigate]);

    if (isLoading) {
        return (
            <div className="home-wrapper edd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Opening Patient Chart...</div>
            </div>
        );
    }

    if (!ancData) return null;

    const formatDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return 'N/A';
        return dateStr.split('-').reverse().join('/');
    };

    const getGestationLabel = () => {
        if (ancData.gestationalWeeks || ancData.gestationalDays) {
            return `${ancData.gestationalWeeks} Weeks ${ancData.gestationalDays} Days`;
        }

        // Dynamic calc fallback
        let lmp = ancData.lmpDate ? new Date(ancData.lmpDate) : null;
        if (!lmp && ancData.eddDate) {
            lmp = new Date(ancData.eddDate);
            lmp.setDate(lmp.getDate() - 280);
        }
        const end = ancData.deliveredDate ? new Date(ancData.deliveredDate) : ancData.abortedDate ? new Date(ancData.abortedDate) : null;

        if (lmp && end && !isNaN(lmp) && !isNaN(end)) {
            const diff = end - lmp;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            return `${Math.floor(days / 7)} Weeks ${days % 7} Days`;
        }
        return 'N/A';
    };

    return (
        <Box className="home-wrapper edd-container" sx={{ display: 'flex', flexDirection: 'column', pb: 10 }}>
            <AppBar
                position="fixed"
                className="glass-appbar"
                elevation={0}
                sx={{
                    zIndex: 1100
                }}
            >
                <Toolbar sx={{ minHeight: '88px', px: '20px !important', gap: '15px' }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="neu-btn"
                        sx={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50% !important',
                            boxShadow: 'var(--shadow-flat)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ArrowBack />
                    </IconButton>

                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {ancData.motherName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {ancData.subCenter}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        {ancData.mobile && (
                            <IconButton
                                component="a" href={`tel:${ancData.mobile}`}
                                className="neu-btn"
                                sx={{
                                    color: '#00ea98',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50% !important',
                                    boxShadow: 'var(--shadow-flat)'
                                }}
                            >
                                <Call />
                            </IconButton>
                        )}
                        <IconButton
                            onClick={() => navigate('/')}
                            className="neu-btn"
                            sx={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50% !important',
                                boxShadow: 'var(--shadow-flat)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <Home />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <div className="medical-profile-container" style={{ paddingTop: '95px' }}>
                <div className="medical-card animate-enter">

                    {/* --- TOP STATUS BAR --- */}
                    <div className={`status-ribbon ${ancData.deliveryStatus.toLowerCase()}`}>
                        <div className="ribbon-content">
                            <Info sx={{ fontSize: 16 }} />
                            <span>CLINICAL STATUS: {ancData.deliveryStatus.toUpperCase()}</span>
                        </div>
                        {ancData.isHighRisk === 'Yes' && (
                            <div className="risk-chip-pulse">
                                <Warning sx={{ fontSize: 16 }} />
                                HIGH RISK
                            </div>
                        )}
                    </div>

                    {/* --- PATIENT SUMMARY HEADER --- */}
                    <div className="patient-summary">
                        <div className="patient-core">
                            <div className="patient-row-primary">
                                <span className="patient-alias" style={{ fontSize: '1.1rem', fontWeight: 800 }}>w/o {ancData.husbandName}</span>
                            </div>
                            <div className="patient-loc-strip">
                                <LocationOn sx={{ fontSize: 14 }} />
                                <span>{ancData.village}, {ancData.subCenter}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- VITALS / KEY STATS --- */}
                    <div className="clinical-vitals-grid">
                        <div className="vital-box blue-t">
                            <label>GRAVIDA</label>
                            <span className="vital-val">{ancData.gravida}</span>
                        </div>
                        <div className="vital-box orange-t">
                            <label>LMP DATE</label>
                            <span className="vital-val">{formatDate(ancData.lmpDate)}</span>
                        </div>
                        <div className="vital-box green-t">
                            <label>EDD DATE</label>
                            <span className="vital-val">{formatDate(ancData.eddDate)}</span>
                        </div>
                    </div>

                    <Divider sx={{ my: 3, opacity: 0.5 }} />

                    {/* --- MAIN CLINICAL SECTIONS --- */}
                    <div className="medical-body">

                        {/* 1. High Risk Details (Enhanced) */}
                        {ancData.isHighRisk === 'Yes' && (
                            <section className="chart-section risk-section">
                                <div className="chart-section-header">
                                    <Warning className="header-icon" />
                                    <h3>Clinical Risk Profile</h3>
                                </div>
                                <div className="risk-tag-list animate-stagger">
                                    {ancData.highRiskTypes.length > 0 ? (
                                        ancData.highRiskTypes.map((t, idx) => (
                                            <span key={idx} className="risk-tag animate-pop">{t}</span>
                                        ))
                                    ) : (
                                        <span className="risk-tag-empty">System Flag: No specific factors documented.</span>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* 2. Obstetric History (Timeline Style) */}
                        {ancData.historyDetails.length > 0 && (
                            <section className="chart-section history-section">
                                <div className="chart-section-header">
                                    <HistoryEdu className="header-icon" />
                                    <h3>Past Obstetric History</h3>
                                </div>
                                <div className="history-timeline animate-stagger">
                                    {ancData.historyDetails.map((h, i) => (
                                        <div key={i} className="timeline-item animate-pop">
                                            <div className="timeline-marker">G{i + 1}</div>
                                            <div className="timeline-content">
                                                <div className="tm-header">
                                                    <span className={`tm-mode-pill ${h.mode.toLowerCase()}`}>{h.mode}</span>
                                                    {h.gender && <span className="tm-gender-tag">{h.gender}</span>}
                                                </div>
                                                <div className="tm-facility">
                                                    <LocalHospital sx={{ fontSize: 13, mr: 0.5 }} />
                                                    {h.facility}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. Care Team (Card Style) */}
                        <section className="chart-section team-section">
                            <div className="chart-section-header">
                                <BadgeIcon className="header-icon" />
                                <h3>Health Care Providers</h3>
                            </div>
                            <div className="team-grid animate-stagger">
                                <div className="team-card animate-pop">
                                    <div className="team-info">
                                        <label>ANM DESIGNATION</label>
                                        <p>{ancData.anmName}</p>
                                    </div>
                                    {ancData.anmMobile && (
                                        <a href={`tel:${ancData.anmMobile}`} className="team-call-btn"><Call sx={{ fontSize: 18 }} /></a>
                                    )}
                                </div>
                                <div className="team-card animate-pop">
                                    <div className="team-info">
                                        <label>ASHA WORKER</label>
                                        <p>{ancData.ashaName}</p>
                                    </div>
                                    {ancData.ashaMobile && (
                                        <a href={`tel:${ancData.ashaMobile}`} className="team-call-btn"><Call sx={{ fontSize: 18 }} /></a>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 4. Birth Planning & Outcomes (Consolidated) */}
                        <section className="chart-section outcome-section">
                            <div className="chart-section-header">
                                <Assignment className="header-icon" />
                                <h3>Pregnancy Event Record</h3>
                            </div>

                            <div className="outcome-details-sheet">
                                <div className="detail-row">
                                    <div className="detail-col">
                                        <label>STATUS</label>
                                        <p className={`status-indicator ${ancData.deliveryStatus.toLowerCase()}`}>
                                            {ancData.deliveryStatus}
                                        </p>
                                    </div>
                                    <div className="detail-col">
                                        <label>GESTATION</label>
                                        <p>{getGestationLabel()}</p>
                                    </div>
                                </div>

                                {ancData.deliveryStatus === 'Pending' ? (
                                    <div className="planning-box">
                                        <label>BIRTH PLANNING</label>
                                        <div className="pb-content">
                                            <Business sx={{ fontSize: 18 }} />
                                            <span>Planned at: <strong>{ancData.birthPlanning}</strong></span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="event-box">
                                        <div className="detail-row">
                                            <div className="detail-col">
                                                <label>EVENT DATE</label>
                                                <p>{formatDate(ancData.deliveredDate || ancData.abortedDate)}</p>
                                            </div>
                                            <div className="detail-col">
                                                <label>MODE / GENDER</label>
                                                <p>{ancData.deliveryMode || 'N/A'} {ancData.babyGender ? `• ${ancData.babyGender}` : ''}</p>
                                            </div>
                                        </div>

                                        <div className="facility-record">
                                            <label>FACILITY DETAILS</label>
                                            <p className="f-main">{ancData.facilityType} - {ancData.facilityName}</p>
                                            {ancData.facilityAddress && <p className="f-sub">{ancData.facilityAddress}</p>}
                                        </div>

                                        {/* Reasons Section - Top Coder Addition */}
                                        {(ancData.lscsReason || ancData.abortionReason || ancData.pvtFacilityReason) && (
                                            <div className="clinical-notes">
                                                <label><Notes sx={{ fontSize: 14 }} /> CLINICAL NOTES & REASONS</label>
                                                {ancData.lscsReason && (
                                                    <div className="note-item">
                                                        <strong>LSCS Reason:</strong> {ancData.lscsReason}
                                                    </div>
                                                )}
                                                {ancData.abortionReason && (
                                                    <div className="note-item">
                                                        <strong>Abortion Reason:</strong> {ancData.abortionReason}
                                                    </div>
                                                )}
                                                {ancData.pvtFacilityReason && (
                                                    <div className="note-item">
                                                        <strong>Private Facility Reason:</strong> {ancData.pvtFacilityReason}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 5. Supplemental Info */}
                        <section className="chart-section meta-section animate-stagger">
                            <div className="meta-stack">
                                <div className="meta-pill animate-pop">
                                    <label>DISTRICT</label>
                                    <p>{ancData.district}</p>
                                </div>
                                <div className="meta-pill animate-pop">
                                    <label>PHC CENTER</label>
                                    <p>{ancData.phc}</p>
                                </div>
                                <div className="meta-pill animate-pop">
                                    <label>DATA LAST SYNCED</label>
                                    <p>{ancData.updatedAt ? new Date(ancData.updatedAt).toLocaleString() : 'Live'}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="medical-footer">
                        <Divider sx={{ mb: 2 }} />
                        <div className="footer-copyright">
                            <VerifiedUser sx={{ fontSize: 14 }} />
                            <span>Digital Maternal Health Record • Official Copy</span>
                        </div>
                    </div>
                </div>
            </div>

            <Fab
                variant="extended"
                color="primary"
                onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${subCenterId}/${recordId}/edit`)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    px: 3,
                    backgroundColor: 'var(--accent-primary)',
                    '&:hover': { backgroundColor: 'var(--accent-secondary)' },
                    boxShadow: '0 8px 30px rgba(0, 188, 212, 0.4)',
                    textTransform: 'none',
                    fontWeight: 800,
                    gap: 1
                }}
            >
                <Edit />
                Edit Record
            </Fab>
        </Box >
    );
};

export default AncProfile;
