import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import './AncEditRecord.css';

// Extracted Component for better performance and state stability
const CircleStepRequest = ({ stepNum, label, isLast, currentStep, handleStepClick, getStepProgress, hasError }) => {
    const isActive = currentStep === stepNum;
    const progress = getStepProgress(stepNum) || 0; // Default to 0 to avoid NaN
    const isCompleted = progress === 100;

    // SVG Props
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`circle-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'error' : ''}`}
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

                {/* Content: Number or Check */}
                <div className="step-inner-content">
                    {isCompleted && !isActive ? <MaterialIcon name="check" size={14} /> : stepNum}
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
                    // Merge with defaults to ensure all fields exist
                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        // Normalizing keys if snake_case exists
                        lmpDate: data.lmpDate || data.lmp_date || "",
                        eddDate: data.eddDate || data.edd_date || "",
                        // Ensure arrays are initialized if missing
                        highRiskTypes: data.highRiskTypes || [],
                        historyDetails: data.historyDetails || [],
                        // Ensure risk is string "Yes"/"No" if stored as boolean (legacy check)
                        isHighRisk: data.isHighRisk === true || data.isHighRisk === "Yes" ? "Yes" : "No",
                        birthPlanning: data.birthPlanning || "CHC Ghanpur Station"
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


    const getStepProgress = (step) => {
        let total = 0;
        let filled = 0;

        if (step === 1) {
            const fields = ['husbandName', 'village', 'anmName', 'anmMobile', 'ashaName', 'ashaMobile'];
            total = fields.length;
            fields.forEach(f => { if (formData[f] && formData[f].length > 0) filled++; });
            return total === 0 ? 0 : Math.round((filled / total) * 100);
        }
        if (step === 2) {
            if (formData.gravida === 'Primi') return 100;
            const totalRows = formData.historyDetails.length;
            if (totalRows === 0) return 0;
            let rowsValid = 0;
            formData.historyDetails.forEach(d => {
                const needsGender = d.mode !== 'Aborted';
                if (d.mode && d.facility && (!needsGender || d.gender)) rowsValid++;
            });
            return Math.round((rowsValid / totalRows) * 100);
        }
        if (step === 3) {
            if (formData.deliveryStatus === 'Pending') return 50;
            if (formData.deliveryStatus === 'Delivered') {
                const fields = ['deliveryMode', 'deliveredDate', 'facilityType', 'facilityName', 'facilityAddress'];
                total = fields.length;
                fields.forEach(f => { if (formData[f]) filled++; });
                return total === 0 ? 0 : Math.round((filled / total) * 100);
            }
            if (formData.deliveryStatus === 'Aborted') {
                const fields = ['abortedDate', 'facilityType', 'facilityName'];
                total = fields.length;
                fields.forEach(f => { if (formData[f]) filled++; });
                return total === 0 ? 0 : Math.round((filled / total) * 100);
            }
            return 0;
        }
        return 0;
    };

    const validateAllSteps = () => {
        const newErrors = {};
        const newStepErrors = {};
        let isValid = true;

        // --- STEP 1 CHECKS ---
        let step1Valid = true;
        if (!formData.husbandName) { newErrors.husbandName = "Husband Name is required"; step1Valid = false; }
        if (!formData.village) { newErrors.village = "Village is required"; step1Valid = false; }
        if (!formData.anmName) { newErrors.anmName = "ANM Name is required"; step1Valid = false; }
        if (formData.anmMobile && !/^\d{10}$/.test(formData.anmMobile)) { newErrors.anmMobile = "Must be 10 digits"; step1Valid = false; }
        if (formData.ashaMobile && !/^\d{10}$/.test(formData.ashaMobile)) { newErrors.ashaMobile = "Must be 10 digits"; step1Valid = false; }
        newStepErrors[1] = !step1Valid;
        if (!step1Valid) isValid = false;
        if (!step1Valid) isValid = false;

        // --- STEP 2 CHECKS ---
        let step2Valid = true;
        if (formData.gravida !== 'Primi') {
            formData.historyDetails.forEach((d, idx) => {
                const needsGender = d.mode !== 'Aborted';
                if (!d.mode || !d.facility || (needsGender && !d.gender)) {
                    newErrors[`history_${idx}`] = "Incomplete history";
                    step2Valid = false;
                }
            });
        }
        newStepErrors[2] = !step2Valid;
        if (!step2Valid) isValid = false;

        // --- STEP 3 CHECKS ---
        let step3Valid = true;
        if (formData.deliveryStatus === 'Delivered') {
            if (!formData.deliveryMode) { newErrors.deliveryMode = "Required"; step3Valid = false; }
            if (!formData.deliveredDate) { newErrors.deliveredDate = "Required"; step3Valid = false; }
            if (!formData.facilityType) { newErrors.facilityType = "Required"; step3Valid = false; }
        }
        if (formData.deliveryStatus === 'Aborted') {
            if (!formData.abortedDate) { newErrors.abortedDate = "Required"; step3Valid = false; }
        }
        newStepErrors[3] = !step3Valid;
        if (!step3Valid) isValid = false;

        setErrors(newErrors);
        setStepErrors(newStepErrors);

        return isValid;
    };

    const validateCurrentStep = () => {
        const step = currentStep;
        const newErrors = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.husbandName) newErrors.husbandName = "Husband Name is required";
            if (!formData.village) newErrors.village = "Village is required";
            if (!formData.anmName) newErrors.anmName = "ANM Name is required";
            if (formData.anmMobile && !/^\d{10}$/.test(formData.anmMobile)) newErrors.anmMobile = "Must be 10 digits";
            if (formData.ashaMobile && !/^\d{10}$/.test(formData.ashaMobile)) newErrors.ashaMobile = "Must be 10 digits";
        }
        if (step === 2) {
            if (formData.gravida !== 'Primi') {
                formData.historyDetails.forEach((d, idx) => {
                    const needsGender = d.mode !== 'Aborted';
                    if (!d.mode || !d.facility || (needsGender && !d.gender)) {
                        newErrors[`history_${idx}`] = "Incomplete history";
                        isValid = false;
                    }
                });
            }
        }
        if (step === 3) {
            if (formData.deliveryStatus === 'Delivered') {
                if (!formData.deliveryMode) newErrors.deliveryMode = "Required";
                if (!formData.deliveredDate) newErrors.deliveredDate = "Required";
                if (!formData.facilityType) newErrors.facilityType = "Required";
            }
            if (formData.deliveryStatus === 'Aborted') {
                if (!formData.abortedDate) newErrors.abortedDate = "Required";
            }
        }

        if (Object.keys(newErrors).length > 0) isValid = false;

        // Merge with existing errors to avoid clearing other steps' errors if we were multi-step validating
        // But for local next, we might want to just set. 
        // Let's just setErrors(newErrors) for current step focus.
        // Actually, if we want to keep "red steppers" persistent, we shouldn't clear stepErrors for others.
        // But here we are just validating current step to proceed.

        setErrors(prev => ({ ...prev, ...newErrors }));
        setStepErrors(prev => ({ ...prev, [step]: !isValid }));

        return isValid;
    };

    const saveToFirestore = async () => {
        setIsSaving(true);
        try {
            const { db } = await import('../../../../firebase');
            const { doc, updateDoc } = await import('firebase/firestore');

            const dataToSave = {
                ...formData,
                isHighRisk: formData.isHighRisk === 'Yes',
                updatedAt: new Date().toISOString()
            };

            await updateDoc(doc(db, "anc_records", recordId), dataToSave);
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
            // Validate ALL before saving
            if (validateAllSteps()) {
                saveToFirestore();
            } else {
                // Determine first invalid step to maybe jump to?
                // Or just show toast? For now, the steppers turn red.
                // Optionally jump to first error:
                // if (stepErrors[1]) setCurrentStep(1); ...
            }
        }
    };

    const handleStepClick = (step) => {
        // Optional: Validate before jumping? Or allow free navigation?
        // Usually safer to validate "Current" before leaving if going forward.
        // For now, allow clicks for flexibility, but Save checks validation.
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
        <div className="home-wrapper edd-container">
            <PageHeader
                title={formData.motherName}
                subtitle={`EDD: ${formData.eddDate ? formData.eddDate.split('-').reverse().join('/') : 'N/A'} • ${formData.subCenter}`}
                actions={
                    <a href={`tel:${formData.mobile}`} className="header-action-btn">
                        <MaterialIcon name="call" size={24} />
                    </a>
                }
            />

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

            <div className="edit-record-wrapper animate-enter" style={{ paddingTop: '90px' }}>

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
                                    <label className="input-label">Delivery Mode {errors.deliveryMode && '*'}</label>
                                    <div className="chips-container">
                                        {['Normal', 'LSCS'].map(mode => (
                                            <div key={mode}
                                                className={`chip ${formData.deliveryMode === mode ? 'active' : ''}`}
                                                onClick={() => handleChange('deliveryMode', mode)}>
                                                {mode}
                                            </div>
                                        ))}
                                    </div>
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
                                    <label className="input-label">Delivered Date {errors.deliveredDate && '*'}</label>
                                    <input type="date" className={inputErrorClass('deliveredDate')} value={formData.deliveredDate} onChange={(e) => handleChange('deliveredDate', e.target.value)} />
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
                                    <label className="input-label">Facility Type {errors.facilityType && '*'}</label>
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
                                    <label className="input-label">Abortion Date {errors.abortedDate && '*'}</label>
                                    <input type="date" className={inputErrorClass('abortedDate')} value={formData.abortedDate} onChange={(e) => handleChange('abortedDate', e.target.value)} />
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
        </div>
    );
};

export default AncEditRecord;
