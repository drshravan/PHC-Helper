
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DateInput = ({ date, setDate, field, handleDateChange }) => (
    <div className="date-input-group">
        <button className="arrow-button" onClick={() => handleDateChange(field, 1)}>▲</button>
        <input
            type="number"
            value={date[field]}
            onChange={(e) => setDate({ ...date, [field]: parseInt(e.target.value) || 0 })}
            className="date-box"
            placeholder={field.toUpperCase()}
        />
        <button className="arrow-button" onClick={() => handleDateChange(field, -1)}>▼</button>
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

    const getDateObj = (d) => new Date(d.year, d.month - 1, d.day);
    const formatDate = (dateObj) => dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

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

    useEffect(() => {
        const lmp = getDateObj(lmpDate);
        const till = getDateObj(tillDate);

        if (lmp > till) {
            setError("LMP date cannot be after the 'Till Date'.");
            setResult(null);
            return;
        }
        setError(null);

        const diffTime = till - lmp;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;

        const eddDate = new Date(lmp);
        eddDate.setDate(lmp.getDate() + 280);

        const remainingTime = eddDate - till;
        const remainingTotalDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const remWeeks = Math.floor(remainingTotalDays / 7);
        const remDays = remainingTotalDays % 7;

        setResult({ weeks, days, edd: formatDate(eddDate), remaining: `${remWeeks} Weeks, ${remDays} days` });
    }, [lmpDate, tillDate]);

    const getScheduleStatus = (range) => {
        if (!result) return 'pending';
        const currentWeek = result.weeks;
        if (currentWeek >= range[0] && currentWeek <= range[1]) return 'current';
        if (currentWeek > range[1]) return 'completed';
        return 'upcoming';
    };

    return (
        <div className="pc-container">
            <header className="pc-header">
                <span className="back-arrow" onClick={() => navigate('/')}>←</span>
                <h2>Pregnancy Calculator</h2>
            </header>

            <div className="pc-content">
                <div className="date-card">
                    <div className="card-header-row">
                        <label>LMP Date</label>
                    </div>
                    <div className="inputs-row">
                        <DateInput date={lmpDate} setDate={setLmpDate} field="day" handleDateChange={(field, amount) => handleDateChange('lmp', field, amount)} />
                        <DateInput date={lmpDate} setDate={setLmpDate} field="month" handleDateChange={(field, amount) => handleDateChange('lmp', field, amount)} />
                        <DateInput date={lmpDate} setDate={setLmpDate} field="year" handleDateChange={(field, amount) => handleDateChange('lmp', field, amount)} />
                    </div>
                </div>

                <div className="date-card">
                    <div className="card-header-row">
                        <label>Till Date</label>
                        <span className="refresh-icon" onClick={() => setTillDate(getToday())}>↻</span>
                    </div>
                    <div className="inputs-row">
                        <DateInput date={tillDate} setDate={setTillDate} field="day" handleDateChange={(field, amount) => handleDateChange('till', field, amount)} />
                        <DateInput date={tillDate} setDate={setTillDate} field="month" handleDateChange={(field, amount) => handleDateChange('till', field, amount)} />
                        <DateInput date={tillDate} setDate={setTillDate} field="year" handleDateChange={(field, amount) => handleDateChange('till', field, amount)} />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {result && !error && (
                    <div className="result-section">
                        <h1 className="main-weeks">{result.weeks} Weeks, {result.days} days</h1>
                        <p className="sub-info">EDD: {result.edd}</p>
                        <p className="sub-info">Remaining: {result.remaining}</p>
                    </div>
                )}

                <div className="schedule-section">
                    <h3>Medical Roadmap</h3>
                    <div className="timeline">
                        {PREGNANCY_SCHEDULE.map((item, index) => {
                            const status = getScheduleStatus(item.range);
                            return (
                                <div key={index} className={`timeline-item ${status}`}>
                                    <div className="timeline-header">
                                        <span className="week-range">Weeks {item.range[0]} - {item.range[1]}</span>
                                        <span className="status-badge">{status.toUpperCase()}</span>
                                    </div>
                                    <h4>{item.stage}</h4>
                                    <div className="details-grid">
                                        <div className="detail-col">
                                            <strong>🩺 Scans:</strong>
                                            <ul>{item.scans.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                        </div>
                                        <div className="detail-col">
                                            <strong>🩸 Lab Tests:</strong>
                                            <ul>{item.tests.map((t, i) => <li key={i}>{t}</li>)}</ul>
                                        </div>
                                    </div>
                                    {status === 'current' && <div className="advice-box"><strong>💡 Advice:</strong> {item.advice}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PregnancyCalculator;
