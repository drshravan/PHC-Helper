import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { usePresence } from '../../../../context/PresenceContext';
import { ArrowBack, Home, Call } from '@mui/icons-material';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import './AncEditRecord.css';
import { getMonthGroup, getStatUpdates, updateMonthlySummary } from '../../../../utils/ancStats';

// Extracted Component for better performance and state stability
const CircleStepRequest = ({ stepNum, label, isLast, currentStep, handleStepClick, getStepProgress, hasError }) => {
    const isActive = currentStep === stepNum;
    const progress = getStepProgress(stepNum) || 0; // Default to 0 to avoid NaN
    const isCompleted = progress === 100 && !hasError;
    const isError = hasError;

    // SVG Props
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`circle-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}
            onClick={() => handleStepClick(stepNum)}>

            <div className="step-circle-wrapper">
                {/* Background Ring */}
                <svg className="step-ring-svg" width="32" height="32">
                    <circle className="step-ring-bg" cx="16" cy="16" r={radius} />
                    <circle
                        className="step-ring-progress"
                        cx="16" cy="16" r={radius}
                        style={{ strokeDasharray: circumference, strokeDashoffset: isNaN(strokeDashoffset) ? 0 : strokeDashoffset }}
                    />
                </svg>

                {/* Content: Number, Check, or Error */}
                <div className="step-inner-content">
                    {isError ? (
                        <MaterialIcon name="error" size={16} />
                    ) : (isCompleted && !isActive) ? (
                        <MaterialIcon name="check" size={16} />
                    ) : (
                        stepNum
                    )}
                </div>
            </div>

            <span className="step-label-text">{label}</span>

            {!isLast && <div className="step-connector-line"></div>}
        </div>
    );
};

const AncEditRecord = () => {
    const { recordId } = useParams();
    const navigate = useNavigate();
    const { setStatus } = usePresence();
    const originalDataRef = React.useRef(null);

    // --- Presence Status ---
    useEffect(() => {
        setStatus('filling-form');
        return () => setStatus('online');
    }, [setStatus]);

    // --- STEPS ---
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        // 1. Basic
        motherName: "",
        mobile: "",
        lmpDate: "",
        eddDate: "",
        sNo: "",
        motherId: "",
        district: "",
        phc: "",
        husbandName: "",
        village: "",
        subCenter: "",
        anmName: "",
        anmMobile: "",
        ashaName: "",
        ashaMobile: "",

        // 2. History
        gravida: "Primi",
        historyDetails: [],

        // 3. Present
        isHighRisk: "No",
        highRiskTypes: [],
        deliveryStatus: "Pending",
        deliveryMode: "",
        babyGender: "",
        lscsReason: "",
        deliveredDate: "",
        abortedDate: "",
        facilityType: "",
        facilityName: "",
        facilityAddress: "",
        pvtFacilityReason: "",
        abortionReason: "",
        gestationalWeeks: 0,
        gestationalDays: 0,
        birthPlanning: "CHC Ghanpur Station"
    });

    const [errors, setErrors] = useState({});
    const [stepErrors, setStepErrors] = useState({});

    // --- CALCULATED FIELDS ---
    const [weeksCalc, setWeeksCalc] = useState("");
    const [calcColor, setCalcColor] = useState("");
    const [customRisk, setCustomRisk] = useState("");
    const [isAddingCustom, setIsAddingCustom] = useState(false);

    // --- OPTIONS ---
    const gravidaOptions = ["Primi", "G2", "G3", "G4", "G5", "Multi Gravida"];
    const riskSuggestions = [
        "Anemia", "Hypertension", "Diabetes", "Previous LSCS",
        "Age ≥ 35", "Age < 19", "Rh Negative", "Multiple Gestation",
        "Placental Disorders", "Malpresentation", "Hypothyroidism",
        "Heart Disease", "Bad Obstetric History"
    ];

    // --- LOAD DATA ---
    useEffect(() => {
        const loadRecord = async () => {
            if (!recordId) return;
            try {
                const { db } = await import('../../../../firebase');
                const { doc, getDoc } = await import('firebase/firestore');

                const docRef = doc(db, "anc_records", recordId);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const data = snap.data();
                    originalDataRef.current = data; // Store DB state for stats calculation

                    // --- LOCAL STORAGE RESTORATION ---
                    // Check if there's a locally saved draft for this record
                    const savedDraft = localStorage.getItem(`anc_draft_${recordId}`);
                    let baseData = data;

                    if (savedDraft) {
                        try {
                            const parsedDraft = JSON.parse(savedDraft);
                            // Merge Firestore data with local draft
                            // We prioritize draft data for form fields
                            baseData = { ...data, ...parsedDraft };
                            console.log("Restored draft from local storage");
                        } catch (e) {
                            console.error("Failed to parse local draft", e);
                        }
                    }

                    // Merge with defaults to ensure all fields exist
                    setFormData(prev => ({
                        ...prev,
                        ...baseData,
                        // Normalizing keys if snake_case exists
                        lmpDate: baseData.lmpDate || baseData.lmp_date || "",
                        eddDate: baseData.eddDate || baseData.edd_date || "",
                        // Ensure arrays are initialized if missing
                        highRiskTypes: baseData.highRiskTypes || [],
                        historyDetails: baseData.historyDetails || [],
                        // Ensure risk is string "Yes"/"No" if stored as boolean (legacy check)
                        isHighRisk: baseData.isHighRisk === true || baseData.isHighRisk === "Yes" ? "Yes" : "No",
                        birthPlanning: baseData.birthPlanning || "CHC Ghanpur Station"
                    }));
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

    // --- LOCAL STORAGE AUTO-SAVE ---
    useEffect(() => {
        // Only save if data is loaded and we have a recordId
        if (!isLoading && recordId && formData) {
            // We don't want to save the default empty state if it's still loading
            // or if it was just reset.
            localStorage.setItem(`anc_draft_${recordId}`, JSON.stringify(formData));
        }
    }, [formData, isLoading, recordId]);

    // --- HANDLERS ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Auto-Populate History Rows based on Gravida
    useEffect(() => {
        if (formData.gravida === "Primi") {
            setFormData(prev => ({ ...prev, historyDetails: [] }));
        } else {
            let count = 0;
            if (formData.gravida.startsWith("G")) count = parseInt(formData.gravida.substring(1)) - 1;
            else if (formData.gravida === "Multi Gravida") count = 5;

            setFormData(prev => {
                const currentArr = [...prev.historyDetails];
                // Only modify if length substantially differs to avoid overwriting user edits on load
                // We add a simple check: if we just loaded, we might trust DB. 
                // This effect runs on `gravida` change.

                if (currentArr.length < count) {
                    for (let i = currentArr.length; i < count; i++) {
                        currentArr.push({ mode: "Normal", facility: "Govt", gender: "Male" });
                    }
                    return { ...prev, historyDetails: currentArr };
                } else if (currentArr.length > count) {
                    currentArr.splice(count);
                    return { ...prev, historyDetails: currentArr };
                }
                return prev;
            });
        }
    }, [formData.gravida]);

    const handleHistoryChange = (index, field, value) => {
        const updated = [...formData.historyDetails];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, historyDetails: updated }));

        // Clear row error
        if (errors[`history_${index}`]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[`history_${index}`];
                return next;
            });
        }
    };

    const toggleRiskType = (type) => {
        setFormData(prev => {
            const types = prev.highRiskTypes.includes(type)
                ? prev.highRiskTypes.filter(t => t !== type)
                : [...prev.highRiskTypes, type];
            return { ...prev, highRiskTypes: types };
        });
    };

    const addCustomRisk = () => {
        if (customRisk.trim()) {
            if (!formData.highRiskTypes.includes(customRisk.trim())) {
                setFormData(prev => ({
                    ...prev,
                    highRiskTypes: [...prev.highRiskTypes, customRisk.trim()]
                }));
            }
            setCustomRisk("");
        }
        setIsAddingCustom(false);
    };

    // Calculate Weeks
    // Calculate Weeks
    // Calculate Weeks
    // Calculate Weeks
    useEffect(() => {
        let lmpDate = null;
        let w = 0;
        let d = 0;
        let calc = "";
        let color = "";

        // Determine effective LMP
        if (formData.lmpDate) {
            lmpDate = new Date(formData.lmpDate);
        } else if (formData.eddDate) {
            const edd = new Date(formData.eddDate);
            if (!isNaN(edd)) {
                lmpDate = new Date(edd);
                lmpDate.setDate(edd.getDate() - 280);
            }
        }

        if (formData.deliveryStatus === 'Delivered' && formData.deliveredDate && lmpDate) {
            const del = new Date(formData.deliveredDate);
            if (!isNaN(lmpDate) && !isNaN(del)) {
                const diffTime = del - lmpDate;
                if (diffTime < 0) {
                    calc = "Invalid Date (Before Estimated LMP)";
                    color = "var(--error-color)";
                } else {
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    w = Math.floor(diffDays / 7);
                    d = diffDays % 7;
                    calc = `${w} Weeks ${d} Days`;
                    color = w < 28 ? "var(--error-color)" : "var(--success-color)";
                }
            }
        } else if (formData.deliveryStatus === 'Aborted' && formData.abortedDate && lmpDate) {
            const ab = new Date(formData.abortedDate);
            if (!isNaN(lmpDate) && !isNaN(ab)) {
                const diffTime = ab - lmpDate;
                if (diffTime < 0) {
                    calc = "Invalid Date (Before Estimated LMP)";
                    color = "var(--error-color)";
                } else {
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    w = Math.floor(diffDays / 7);
                    d = diffDays % 7;
                    calc = `${w} Weeks ${d} Days`;
                    color = w > 12 ? "var(--error-color)" : "orange";
                }
            }
        } else if ((formData.deliveryStatus === 'Aborted' && formData.abortedDate) || (formData.deliveryStatus === 'Delivered' && formData.deliveredDate)) {
            calc = "LMP/EDD Missing - Cannot Calculate";
            color = "var(--text-muted)";
        }

        setWeeksCalc(calc);
        setCalcColor(color);

        // Persist numerical values to formData
        if (formData.gestationalWeeks !== w || formData.gestationalDays !== d) {
            setFormData(prev => ({ ...prev, gestationalWeeks: w, gestationalDays: d }));
        }
    }, [formData.deliveredDate, formData.abortedDate, formData.deliveryStatus, formData.lmpDate, formData.eddDate]);


    // --- VALIDATION LOGIC ---
    const validateStep = (step) => {
        const stepErrors = {};
        let filledCount = 0;
        let totalCount = 0;

        if (step === 1) {
            const required = ['husbandName', 'village', 'anmName'];
            const optionalWithFormat = ['anmMobile', 'ashaMobile'];

            totalCount = required.length + (formData.anmMobile ? 1 : 0) + (formData.ashaMobile ? 1 : 0);

            required.forEach(f => {
                if (!formData[f] || formData[f].trim() === "") {
                    stepErrors[f] = `${f.replace(/([A-Z])/g, ' $1')} is required`.replace(/^./, str => str.toUpperCase());
                } else {
                    filledCount++;
                }
            });

            if (formData.anmMobile) {
                if (!/^\d{10}$/.test(formData.anmMobile)) {
                    stepErrors.anmMobile = "Must be exactly 10 digits";
                } else {
                    filledCount++;
                }
            }

            if (formData.ashaMobile) {
                if (!/^\d{10}$/.test(formData.ashaMobile)) {
                    stepErrors.ashaMobile = "Must be exactly 10 digits";
                } else {
                    filledCount++;
                }
            }

            // Adjust filledCount to not exceed totalCount if we haven't started typing optional ones
            const progressTotal = required.length;
            const progressFilled = required.filter(f => formData[f] && formData[f].trim() !== "").length;
            const progress = Math.round((progressFilled / progressTotal) * 100);

            return { isValid: Object.keys(stepErrors).length === 0, errors: stepErrors, progress };
        }

        if (step === 2) {
            if (formData.gravida === 'Primi') return { isValid: true, errors: {}, progress: 100 };

            totalCount = formData.historyDetails.length;
            if (totalCount === 0) return { isValid: true, errors: {}, progress: 100 };

            formData.historyDetails.forEach((d, idx) => {
                const needsGender = d.mode !== 'Aborted';
                if (!d.mode || !d.facility || (needsGender && !d.gender)) {
                    stepErrors[`history_${idx}`] = "Incomplete row";
                } else {
                    filledCount++;
                }
            });

            const progress = Math.round((filledCount / totalCount) * 100);
            return { isValid: Object.keys(stepErrors).length === 0, errors: stepErrors, progress };
        }

        if (step === 3) {
            if (formData.deliveryStatus === 'Pending') {
                return { isValid: true, errors: {}, progress: 100 };
            }

            if (formData.deliveryStatus === 'Delivered') {
                const req = ['deliveryMode', 'deliveredDate', 'facilityType'];
                totalCount = req.length;
                req.forEach(f => {
                    if (!formData[f]) stepErrors[f] = "Required";
                    else filledCount++;
                });
            } else if (formData.deliveryStatus === 'Aborted') {
                const req = ['abortedDate'];
                totalCount = req.length;
                req.forEach(f => {
                    if (!formData[f]) stepErrors[f] = "Required";
                    else filledCount++;
                });
            }

            const progress = Math.round((filledCount / totalCount) * 100);
            return { isValid: Object.keys(stepErrors).length === 0, errors: stepErrors, progress };
        }

        return { isValid: true, errors: {}, progress: 0 };
    };

    const getStepProgress = (step) => {
        return validateStep(step).progress;
    };

    const validateAllSteps = () => {
        const allErrors = {};
        const stepStatus = {};
        let overallValid = true;

        [1, 2, 3].forEach(s => {
            const { isValid, errors: sErrors } = validateStep(s);
            Object.assign(allErrors, sErrors);
            stepStatus[s] = !isValid;
            if (!isValid) overallValid = false;
        });

        setErrors(allErrors);
        setStepErrors(stepStatus);
        return overallValid;
    };

    const validateCurrentStep = () => {
        const { isValid, errors: sErrors } = validateStep(currentStep);
        setErrors(prev => ({ ...prev, ...sErrors }));
        setStepErrors(prev => ({ ...prev, [currentStep]: !isValid }));
        return isValid;
    };

    const saveToFirestore = async () => {
        setIsSaving(true);
        try {
            const { db } = await import('../../../../firebase');
            const { doc, runTransaction } = await import('firebase/firestore');

            // 1. Prepare New Data
            const newData = {
                ...formData,
                isHighRisk: formData.isHighRisk === 'Yes',
                updatedAt: new Date().toISOString()
            };

            // Ensure monthGroup is up to date (in case dates changed)
            const newMonthGroup = getMonthGroup(newData.eddDate, newData.deliveryStatus, newData.abortedDate, newData.deliveredDate);
            if (newMonthGroup) newData.monthGroup = newMonthGroup;

            await runTransaction(db, async (transaction) => {
                const recRef = doc(db, "anc_records", recordId);

                // 2. Calculate Stat Changes
                const oldData = originalDataRef.current;
                const oldMonth = oldData?.monthGroup || getMonthGroup(oldData?.eddDate);
                const newMonth = newData.monthGroup;

                // Scenario A: Month Changed (or Month added)
                if (oldMonth && newMonth && oldMonth !== newMonth) {
                    // Remove from Old
                    const removeDelta = getStatUpdates(oldData, null);
                    await updateMonthlySummary(transaction, db, oldMonth, removeDelta);

                    // Add to New
                    const addDelta = getStatUpdates(null, newData);
                    await updateMonthlySummary(transaction, db, newMonth, addDelta);
                }
                // Scenario B: Same Month (Update)
                else if (newMonth) {
                    const delta = getStatUpdates(oldData, newData);
                    await updateMonthlySummary(transaction, db, newMonth, delta);
                }

                // 3. Write Record
                transaction.set(recRef, newData);
            });

            // Clear local draft upon successful save
            localStorage.removeItem(`anc_draft_${recordId}`);

            navigate(-1);
        } catch (err) {
            console.error("Save Error", err);
            alert("Failed to save. Check console.");
            setIsSaving(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            if (validateCurrentStep()) {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            if (validateAllSteps()) {
                saveToFirestore();
            }
        }
    };

    const handleStepClick = (step) => {
        setCurrentStep(step);
    };

    const inputErrorClass = (field) => errors[field] ? 'green-input error-input' : 'green-input';
    const renderError = (field) => errors[field] && <span className="error-msg">{errors[field]}</span>;

    if (isLoading) {
        return (
            <div className="home-wrapper edd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading Record...</div>
            </div>
        );
    }

    return (
        <Box className="home-wrapper edd-container" sx={{ display: 'flex', flexDirection: 'column' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'var(--neu-bg)',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--neu-border-color)',
                    zIndex: 1100
                }}
            >
                <Toolbar sx={{ minHeight: '80px', px: '20px !important', gap: '15px' }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="neu-btn"
                        sx={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'transparent',
                            boxShadow: 'var(--shadow-flat)',
                            borderRadius: '50%',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ArrowBack />
                    </IconButton>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
                            {formData.motherName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            EDD: {formData.eddDate ? formData.eddDate.split('-').reverse().join('/') : 'N/A'} • {formData.subCenter}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        {formData.mobile && (
                            <IconButton
                                component="a"
                                href={`tel:${formData.mobile}`}
                                className="neu-btn"
                                sx={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'transparent',
                                    boxShadow: 'var(--shadow-flat)',
                                    borderRadius: '50%',
                                    color: 'var(--success-color)'
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
                                backgroundColor: 'transparent',
                                boxShadow: 'var(--shadow-flat)',
                                borderRadius: '50%',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <Home />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <div className="circle-stepper-container">
                {[1, 2, 3].map(step => (
                    <CircleStepRequest
                        key={step}
                        stepNum={step}
                        label={step === 1 ? 'Basic' : step === 2 ? 'History' : 'Current'}
                        currentStep={currentStep}
                        handleStepClick={handleStepClick}
                        getStepProgress={getStepProgress}
                        hasError={stepErrors[step]}
                        isLast={step === 3}
                    />
                ))}
            </div>

            <div className="edit-record-wrapper animate-enter" style={{ paddingTop: '150px' }}>

                {currentStep === 1 && (
                    <div className="form-card animate-enter">
                        <div className="section-title"><MaterialIcon name="family_restroom" size={20} className="title-icon" /> Family Info</div>
                        <div className="input-group">
                            <label className="input-label">Husband Name {errors.husbandName && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                            <div className="input-wrapper">
                                <input type="text" className={inputErrorClass('husbandName')} placeholder="Enter husband's name"
                                    value={formData.husbandName} onChange={(e) => handleChange('husbandName', e.target.value)} />
                                <MaterialIcon name="person" size={18} className="input-icon-right" />
                            </div>
                            {renderError('husbandName')}
                        </div>
                        <div className="input-group">
                            <label className="input-label">Village {errors.village && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                            <div className="input-wrapper">
                                <input type="text" className={inputErrorClass('village')} placeholder="Enter village name"
                                    value={formData.village} onChange={(e) => handleChange('village', e.target.value)} />
                                <MaterialIcon name="location_on" size={18} className="input-icon-right" />
                            </div>
                            {renderError('village')}
                        </div>

                        <div className="section-title" style={{ marginTop: '24px' }}><MaterialIcon name="medical_services" size={20} className="title-icon" /> Health Workers</div>
                        <div className="input-group">
                            <label className="input-label">ANM Name</label>
                            <input type="text" className={inputErrorClass('anmName')} placeholder="Enter ANM Name"
                                value={formData.anmName} onChange={(e) => handleChange('anmName', e.target.value)} />
                            {renderError('anmName')}
                        </div>
                        <div className="input-group">
                            <label className="input-label">ANM Mobile <span className="hint-text">(10-digit number required for calls)</span></label>
                            <div className="input-wrapper">
                                <input type="tel" className={inputErrorClass('anmMobile')} maxLength={10} placeholder="Enter ANM mobile number"
                                    value={formData.anmMobile} onChange={(e) => handleChange('anmMobile', e.target.value)} />
                                <span className="input-suffix">{formData.anmMobile ? formData.anmMobile.length : 0}/10</span>
                            </div>
                            {renderError('anmMobile')}
                        </div>
                        <div className="input-group">
                            <label className="input-label">ASHA Name</label>
                            <input type="text" className="green-input" placeholder="Enter ASHA Name"
                                value={formData.ashaName} onChange={(e) => handleChange('ashaName', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">ASHA Mobile <span className="hint-text">(10-digit number required for calls)</span></label>
                            <div className="input-wrapper">
                                <input type="tel" className={inputErrorClass('ashaMobile')} maxLength={10} placeholder="Enter ASHA mobile number"
                                    value={formData.ashaMobile} onChange={(e) => handleChange('ashaMobile', e.target.value)} />
                                <span className="input-suffix">{formData.ashaMobile ? formData.ashaMobile.length : 0}/10</span>
                            </div>
                            {renderError('ashaMobile')}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="form-card animate-enter">
                        <div className="section-title"><MaterialIcon name="history_edu" size={20} className="title-icon" /> Medical History</div>
                        <div className="input-group">
                            <label className="input-label">Gravida</label>
                            <select className="green-select" value={formData.gravida} onChange={(e) => handleChange('gravida', e.target.value)}>
                                {gravidaOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        {formData.historyDetails.length > 0 && formData.historyDetails.map((details, idx) => (
                            <div key={idx} className="history-card">
                                <div className="history-header">Pregnancy G{idx + 1}</div>

                                <div className="input-group">
                                    <label className="input-label">Delivery Mode</label>
                                    <div className="chips-container">
                                        {['Normal', 'LSCS', 'Aborted'].map(mode => (
                                            <div key={mode}
                                                className={`chip ${details.mode === mode ? 'active' : ''}`}
                                                onClick={() => handleHistoryChange(idx, 'mode', mode)}>
                                                {mode}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {details.mode !== 'Aborted' && (
                                    <div className="input-group animate-pop">
                                        <label className="input-label">Baby Gender</label>
                                        <div className="chips-container">
                                            {['Male', 'Female'].map(gen => (
                                                <div key={gen}
                                                    className={`chip ${details.gender === gen ? 'active' : ''}`}
                                                    onClick={() => handleHistoryChange(idx, 'gender', gen)}>
                                                    <MaterialIcon name={gen === 'Male' ? 'male' : 'female'} size={18} style={{ marginRight: 4 }} />
                                                    {gen}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label">Facility</label>
                                    <div className="chips-container">
                                        {(details.mode === 'Aborted' ? ['Govt', 'Pvt', 'Home', 'Others'] : ['Govt', 'Pvt', 'Others']).map(fac => (
                                            <div key={fac}
                                                className={`chip ${details.facility === fac ? 'active' : ''}`}
                                                onClick={() => handleHistoryChange(idx, 'facility', fac)}>
                                                {fac}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {errors[`history_${idx}`] && <span className="error-msg" style={{ display: 'block', marginTop: 5 }}>Incomplete details</span>}
                            </div>
                        ))}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="form-card animate-enter">
                        <div className="section-title"><MaterialIcon name="warning" size={20} className="title-icon" /> Risk Assessment</div>
                        <div className="input-group">
                            <label className="input-label">Is Now High Risk?</label>
                            <div className="chips-container">
                                {['Yes', 'No'].map(opt => (
                                    <div key={opt}
                                        className={`chip ${formData.isHighRisk === opt ? 'active' : ''}`}
                                        onClick={() => handleChange('isHighRisk', opt)}
                                    >{opt}</div>
                                ))}
                            </div>
                        </div>
                        {formData.isHighRisk === 'Yes' && (
                            <div className="input-group animate-pop">
                                <label className="input-label">High Risk Type</label>
                                <div className="chips-container" style={{ marginBottom: '10px' }}>
                                    {formData.highRiskTypes.map(type => (
                                        <div key={type} className="chip active" onClick={() => toggleRiskType(type)}>
                                            {type} <MaterialIcon name="close" size={14} style={{ marginLeft: 4 }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="input-label" style={{ opacity: 0.7, fontSize: '0.75rem' }}>Quick Add:</div>
                                <div className="chips-container">
                                    {riskSuggestions.filter(s => !formData.highRiskTypes.includes(s)).map(s => (
                                        <div key={s} className="chip-suggestion" onClick={() => toggleRiskType(s)}>{s}</div>
                                    ))}
                                </div>
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    {!isAddingCustom ? (
                                        <div className="chip-dashed" onClick={() => setIsAddingCustom(true)}>
                                            <MaterialIcon name="add" size={16} /> Add Other
                                        </div>
                                    ) : (
                                        <div className="input-wrapper animate-enter">
                                            <input
                                                type="text"
                                                className="green-input"
                                                placeholder="Type reason..."
                                                autoFocus
                                                value={customRisk}
                                                onChange={(e) => setCustomRisk(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addCustomRisk()}
                                                onBlur={() => { if (!customRisk) setIsAddingCustom(false); }}
                                            />
                                            <div className="input-icon-right" onClick={addCustomRisk} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                                                <MaterialIcon name="check_circle" size={24} color="var(--primary-color)" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="section-title" style={{ marginTop: '30px' }}><MaterialIcon name="child_friendly" size={20} className="title-icon" /> Pregnancy Outcome</div>
                        <div className="input-group">
                            <label className="input-label">Delivery Status</label>
                            <div className="chips-container">
                                {['Pending', 'Delivered', 'Aborted'].map(status => (
                                    <div key={status}
                                        className={`chip ${formData.deliveryStatus === status ? 'active' : ''}`}
                                        onClick={() => handleChange('deliveryStatus', status)}>
                                        {status}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {formData.deliveryStatus === 'Pending' && (
                            <div className="input-group animate-pop" style={{ marginTop: '16px' }}>
                                <label className="input-label">Birth Planning</label>
                                <div className="chips-container">
                                    {['PHC Malkapur', 'CHC Ghanpur Station', 'MCH Jangaon'].map(place => (
                                        <div key={place}
                                            className={`chip ${formData.birthPlanning === place ? 'active' : ''}`}
                                            onClick={() => handleChange('birthPlanning', place)}>
                                            {place}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formData.deliveryStatus === 'Delivered' && (
                            <div className="animate-pop">
                                <div className="input-group">
                                    <label className="input-label">Delivery Mode {errors.deliveryMode && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                                    <div className="chips-container">
                                        {['Normal', 'LSCS'].map(mode => (
                                            <div key={mode}
                                                className={`chip ${formData.deliveryMode === mode ? 'active' : ''}`}
                                                onClick={() => handleChange('deliveryMode', mode)}>
                                                {mode}
                                            </div>
                                        ))}
                                    </div>
                                    {renderError('deliveryMode')}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Baby Gender</label>
                                    <div className="chips-container">
                                        {['Male', 'Female'].map(gen => (
                                            <div key={gen}
                                                className={`chip ${formData.babyGender === gen ? 'active' : ''}`}
                                                onClick={() => handleChange('babyGender', gen)}>
                                                <MaterialIcon name={gen === 'Male' ? 'male' : 'female'} size={18} style={{ marginRight: 4 }} />
                                                {gen}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Delivered Date {errors.deliveredDate && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                                    <input type="date" className={inputErrorClass('deliveredDate')} value={formData.deliveredDate} onChange={(e) => handleChange('deliveredDate', e.target.value)} />
                                    {renderError('deliveredDate')}
                                </div>
                                {weeksCalc && (
                                    <div className="calc-box animate-enter" style={{ color: calcColor || 'var(--accent-primary)', borderColor: calcColor || 'var(--accent-primary)' }}>
                                        <MaterialIcon name="calculate" size={16} /> Duration (Delivered): {weeksCalc} from LMP
                                    </div>
                                )}
                                {formData.deliveryMode === 'LSCS' && (
                                    <div className="input-group" style={{ marginTop: '12px' }}>
                                        <label className="input-label">Reason For LSCS</label>
                                        <textarea className="green-input" rows={2} placeholder="Medical indication..."
                                            value={formData.lscsReason} onChange={(e) => handleChange('lscsReason', e.target.value)}></textarea>
                                    </div>
                                )}
                                <div className="section-title" style={{ marginTop: '20px', fontSize: '0.9rem' }}><MaterialIcon name="local_hospital" size={18} className="title-icon" /> Facility Details</div>
                                <div className="input-group">
                                    <label className="input-label">Facility Type {errors.facilityType && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                                    <div className="chips-container">
                                        {['Govt', 'Pvt', 'Others'].map(f => (
                                            <div key={f} className={`chip ${formData.facilityType === f ? 'active' : ''}`}
                                                onClick={() => handleChange('facilityType', f)}>{f}</div>
                                        ))}
                                    </div>
                                    {renderError('facilityType')}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Facility Name</label>
                                    <input type="text" className="green-input" value={formData.facilityName} onChange={(e) => handleChange('facilityName', e.target.value)} />
                                </div>
                                {formData.facilityType === 'Pvt' && (
                                    <div className="input-group">
                                        <label className="input-label">Reason for Private</label>
                                        <textarea className="green-input" rows={2} placeholder="Why private facility?..."
                                            value={formData.pvtFacilityReason} onChange={(e) => handleChange('pvtFacilityReason', e.target.value)}></textarea>
                                    </div>
                                )}
                                <div className="input-group">
                                    <label className="input-label">Facility Address</label>
                                    <textarea className="green-input" rows={2} value={formData.facilityAddress} onChange={(e) => handleChange('facilityAddress', e.target.value)}></textarea>
                                </div>
                            </div>
                        )}
                        {formData.deliveryStatus === 'Aborted' && (
                            <div className="animate-pop">
                                <div className="input-group">
                                    <label className="input-label">Abortion Date {errors.abortedDate && <span style={{ color: 'var(--error-color)' }}>*</span>}</label>
                                    <input type="date" className={inputErrorClass('abortedDate')} value={formData.abortedDate} onChange={(e) => handleChange('abortedDate', e.target.value)} />
                                    {renderError('abortedDate')}
                                </div>
                                {weeksCalc && (
                                    <div className="calc-box animate-enter" style={{ color: calcColor || 'var(--accent-primary)', borderColor: calcColor || 'var(--accent-primary)' }}>
                                        <MaterialIcon name="calculate" size={16} /> Duration (Aborted): {weeksCalc} from LMP
                                    </div>
                                )}
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <label className="input-label">Reason for Abortion</label>
                                    <textarea className="green-input" rows={2} placeholder="Spontaneous / MTP / Other..."
                                        value={formData.abortionReason} onChange={(e) => handleChange('abortionReason', e.target.value)}></textarea>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Facility Type</label>
                                    <div className="chips-container">
                                        {['Govt', 'Pvt', 'Home', 'Others'].map(f => (
                                            <div key={f} className={`chip ${formData.facilityType === f ? 'active' : ''}`}
                                                onClick={() => handleChange('facilityType', f)}>{f}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Facility Name</label>
                                    <input type="text" className="green-input" value={formData.facilityName} onChange={(e) => handleChange('facilityName', e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="action-buttons-container" style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
                    {currentStep > 1 && (
                        <button className="action-btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>
                            <MaterialIcon name="arrow_back" size={20} /> Back
                        </button>
                    )}
                    <button className="action-btn btn-primary" onClick={handleNext} disabled={isSaving}>
                        {isSaving ? 'Saving...' : (currentStep === 3 ? <><MaterialIcon name="save" size={20} /> Save Details</> : <>Next Step <MaterialIcon name="arrow_forward" size={20} /></>)}
                    </button>
                </div>
            </div>
        </Box>
    );
};

export default AncEditRecord;
