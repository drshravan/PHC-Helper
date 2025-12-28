import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import PageHeader from '../../../components/ui/PageHeader';
import './PregnancyCalculator.css';

// --- Medical Schedule Data ---
const PREGNANCY_SCHEDULE = [
    { range: [4, 9], stage: "Early Pregnancy", scans: ["Dating / Viability Scan (6-9 weeks)"], tests: ["Complete Blood Count (CBC)", "Blood Grouping & Rh", "Thyroid (TSH)", "Rubella IgG", "HIV, HBsAg, VDRL", "Urine Routine"], advice: "Confirm pregnancy location and heartbeat. Start Folic Acid." },
    { range: [11, 14], stage: "First Trimester Screening", scans: ["Nuchal Translucency (NT) Scan (11-13.6 weeks)"], tests: ["Double Marker Test (Dual Screen)", "NIPT (if advised)"], advice: "Critical for screening chromosomal abnormalities like Down Syndrome." },
    { range: [15, 20], stage: "Second Trimester", scans: ["Anomaly Scan / TIFFA (18-20 weeks)"], tests: ["Quadruple Marker (if NT missed)", "Urine Culture"], advice: "Detailed scan to check baby's structural development." },
    { range: [24, 28], stage: "Glucose Screening", scans: ["Fetal Echo (if advised, 24 weeks)"], tests: ["Glucose Challenge Test (GCT/OGTT)", "Hemoglobin check", "Antibody screening (if Rh negative)"], advice: "Screening for Gestational Diabetes." },
    { range: [28, 36], stage: "Third Trimester Growth", scans: ["Growth Scan / Doppler (28-32 weeks)", "Follow-up Growth Scan (36 weeks)"], tests: ["Repeat CBC", "Urine Routine"], advice: "Monitor baby's growth and fluid levels. Tdap vaccination." },
    { range: [37, 42], stage: "Full Term", scans: ["Biophysical Profile (BPP) (if overdue)"], tests: ["Group B Strep (35-37 weeks)"], advice: "Weekly checkups. Watch for labor signs." }
];

const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};

const DateInput = ({ date, setDate, field, label, max, min = 1, handleDateChange }) => (
    <div className={`date-field-wrapper ${field === 'year' ? 'year-field' : ''} `}>
        <label className="field-label">{label}</label>
        <div className="date-input-group">
            <button className="arrow-button" onClick={() => handleDateChange(field, -1)}>◄</button>
            <input
                type="number"
                value={date[field]}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 0; // Allow typing to clear, handled via state usually or clamp on blur. 
                    // Better UX: Allow partial typing but clamp max.
                    if (val > max) val = max;
                    // Dont strictly clamp min while typing or backspace becomes impossible. 
                    // But for setDate state we usually want valid numbers. 
                    // We'll let the parent handler deal with it or just pass raw.
                    setDate(field, val);
                }}
                onBlur={(e) => {
                    // Clamp on blur
                    let val = parseInt(e.target.value) || min;
                    if (val < min) val = min;
                    if (val > max) val = max;
                    setDate(field, val);
                }}
                className="date-box"
                placeholder={label}
            />
            <button className="arrow-button" onClick={() => handleDateChange(field, 1)}>►</button>
        </div>
    </div>
);

const PregnancyCalculator = () => {
    const navigate = useNavigate();
    const getToday = () => ({
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [lmpDate, setLmpDate] = useState(getToday());
    const [tillDate, setTillDate] = useState(getToday());
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // --- Validation & Clamping Logic ---
    // Ensure day is valid whenever month/year changes
    useEffect(() => {
        const maxDaysLmp = getDaysInMonth(lmpDate.month, lmpDate.year);
        if (lmpDate.day > maxDaysLmp) {
            setLmpDate(prev => ({ ...prev, day: maxDaysLmp }));
        }

        const maxDaysTill = getDaysInMonth(tillDate.month, tillDate.year);
        if (tillDate.day > maxDaysTill) {
            setTillDate(prev => ({ ...prev, day: maxDaysTill }));
        }
    }, [lmpDate.month, lmpDate.year, tillDate.month, tillDate.year]);


    const getDateObj = (d) => new Date(d.year, d.month - 1, d.day);
    const formatDate = (dateObj) => dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Arrow Button Logic (Keeps rollover for ease of use)
    const handleDateChange = (type, field, amount) => {
        const setDate = type === 'lmp' ? setLmpDate : setTillDate;
        setDate(prev => {
            const newDate = new Date(prev.year, prev.month - 1, prev.day);
            if (field === 'day') newDate.setDate(newDate.getDate() + amount);
            if (field === 'month') newDate.setMonth(newDate.getMonth() + amount);
            if (field === 'year') newDate.setFullYear(newDate.getFullYear() + amount);
            return { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() };
        });
    };

    // Direct Input Change (Strict)
    const handleInputChange = (type, field, value) => {
        const setDate = type === 'lmp' ? setLmpDate : setTillDate;
        const current = type === 'lmp' ? lmpDate : tillDate;

        let newData = { ...current, [field]: value };

        // Dynamic Max Days check for Day input
        if (field === 'day') {
            const maxDays = getDaysInMonth(newData.month, newData.year);
            if (value > maxDays) newData.day = maxDays;
        }

        setDate(newData);
    };

    useEffect(() => {
        try {
            const lmp = getDateObj(lmpDate);
            const till = getDateObj(tillDate);

            if (lmp > till) {
                setError("LMP cannot be in the future relative to Till Date.");
                setResult(null);
                return;
            }

            const diffTime = Math.abs(till - lmp);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(diffDays / 7);
            const days = diffDays % 7;

            const eddDate = new Date(lmp);
            eddDate.setDate(lmp.getDate() + 280);

            const today = new Date();
            const timeToEdd = eddDate - today;
            const daysToEdd = Math.ceil(timeToEdd / (1000 * 60 * 60 * 24));
            let remWeeks = Math.floor(daysToEdd / 7);
            let remDays = daysToEdd % 7;

            if (daysToEdd < 0) {
                remWeeks = 0; remDays = 0;
            }

            setError(null);
            setResult({
                weeks,
                days,
                edd: formatDate(eddDate),
                remaining: `${remWeeks} Weeks, ${remDays} days`
            });
        } catch (e) {
            setError("Invalid Date Calculation");
        }
    }, [lmpDate, tillDate]);

    const getScheduleStatus = (range) => {
        if (!result) return 'upcoming';
        const currentWeek = result.weeks;
        if (currentWeek > range[1]) return 'completed';
        if (currentWeek >= range[0] && currentWeek <= range[1]) return 'current';
        return 'upcoming';
    };

    return (
        <div className="pc-body">
            <div className="pc-container animate-enter">
                <PageHeader title="Pregnancy Calculator" backPath="/services" />

                <div className="pc-content">
                    <div className="date-card animate-pop delay-100">
                        <div className="card-header-row">
                            <label>LMP Date</label>
                        </div>
                        <div className="inputs-row">
                            <DateInput
                                date={lmpDate}
                                setDate={(f, v) => handleInputChange('lmp', f, v)}
                                field="day" label="Day" max={getDaysInMonth(lmpDate.month, lmpDate.year)}
                                handleDateChange={(f, a) => handleDateChange('lmp', f, a)}
                            />
                            <DateInput
                                date={lmpDate}
                                setDate={(f, v) => handleInputChange('lmp', f, v)}
                                field="month" label="Month" max={12}
                                handleDateChange={(f, a) => handleDateChange('lmp', f, a)}
                            />
                            <DateInput
                                date={lmpDate}
                                setDate={(f, v) => handleInputChange('lmp', f, v)}
                                field="year" label="Year" max={2100} min={1900}
                                handleDateChange={(f, a) => handleDateChange('lmp', f, a)}
                            />
                        </div>
                    </div>

                    <div className="date-card animate-pop delay-200">
                        <div className="card-header-row">
                            <label>Till Date</label>
                            <span className="refresh-icon" onClick={() => setTillDate(getToday())} title="Reset to Today"><MaterialIcon name="refresh" size={24} /></span>
                        </div>
                        <div className="inputs-row">
                            <DateInput
                                date={tillDate}
                                setDate={(f, v) => handleInputChange('till', f, v)}
                                field="day" label="Day" max={getDaysInMonth(tillDate.month, tillDate.year)}
                                handleDateChange={(f, a) => handleDateChange('till', f, a)}
                            />
                            <DateInput
                                date={tillDate}
                                setDate={(f, v) => handleInputChange('till', f, v)}
                                field="month" label="Month" max={12}
                                handleDateChange={(f, a) => handleDateChange('till', f, a)}
                            />
                            <DateInput
                                date={tillDate}
                                setDate={(f, v) => handleInputChange('till', f, v)}
                                field="year" label="Year" max={2100} min={1900}
                                handleDateChange={(f, a) => handleDateChange('till', f, a)}
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {result && !error && (
                        <div className="result-section animate-pop">
                            <h1 className="main-weeks">{result.weeks} Weeks, {result.days} days</h1>
                            <p className="sub-info">EDD: {result.edd}</p>
                            <p className="sub-info">Remaining: {result.remaining}</p>
                        </div>
                    )}

                    <div className="schedule-section">
                        <h3><MaterialIcon name="timeline" size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Medical Roadmap</h3>
                        <div className="logical-timeline">
                            {PREGNANCY_SCHEDULE.map((item, index) => {
                                const status = getScheduleStatus(item.range);
                                return (
                                    <div key={index} className={`logical-item ${status} animate-pop delay-${(index % 5 + 3) * 100}`}>
                                        <div className="roadmap-card">
                                            {/* Card Header: Week & Stage */}
                                            <div className="rm-header">
                                                <div className="rm-week-badge">
                                                    <MaterialIcon name="date_range" size={14} />
                                                    <span>Weeks {item.range[0]} - {item.range[1]}</span>
                                                </div>
                                                <div className="rm-stage-title">
                                                    {item.stage}
                                                </div>
                                            </div>

                                            {/* Card Body: Scans & Tests Chips */}
                                            <div className="rm-body">
                                                {item.scans.length > 0 && (
                                                    <div className="rm-group scan-group">
                                                        <div className="rm-label"><MaterialIcon name="radiology" size={16} /> Scans</div>
                                                        <div className="rm-chips-container">
                                                            {item.scans.map((s, i) => <span key={i} className="rm-chip scan-chip">{s}</span>)}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.tests.length > 0 && (
                                                    <div className="rm-group test-group">
                                                        <div className="rm-label"><MaterialIcon name="biotech" size={16} /> Lab Tests</div>
                                                        <div className="rm-chips-container">
                                                            {item.tests.map((t, i) => <span key={i} className="rm-chip test-chip">{t}</span>)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer: Advice (Highlighted for Current) */}
                                            <div className="rm-footer">
                                                <div className="rm-advice-icon"><MaterialIcon name="tips_and_updates" size={18} /></div>
                                                <div className="rm-advice-text">{item.advice}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PregnancyCalculator;
