import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import PageHeader from '../../../components/ui/PageHeader';
import GlassCard from '../../../components/ui/GlassCard';
import './EddVsDeliveries.css';

const EddVsDeliveries = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'entries'

    // --- Entries Tab State ---
    const [isLocked, setIsLocked] = useState(true);
    const [pin, setPin] = useState(['', '', '', '']);
    const pinRefs = [useRef(), useRef(), useRef(), useRef()];

    // --- Mock Data for Dashboard Tab ---
    const monthsData = [
        { month: 'March', year: '2026', total: 58, stats: { normal: 0, lscs: 0, abortions: 0, govt: 0, private: 0 } },
        { month: 'February', year: '2026', total: 40, stats: { normal: 0, lscs: 0, abortions: 0, govt: 0, private: 0 } },
        { month: 'January', year: '2026', total: 53, stats: { normal: 0, lscs: 0, abortions: 0, govt: 0, private: 0 } },
    ];

    // --- PIN Logic ---
    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next input
        if (value && index < 3) {
            pinRefs[index + 1].current.focus();
        }

        // Checklist check
        if (newPin.join('') === '1234') {
            setTimeout(() => setIsLocked(false), 300); // Small delay for visual feedback
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            pinRefs[index - 1].current.focus();
        }
    };

    const renderDashboardTab = () => (
        <div className="edds-list animate-enter">
            {monthsData.map((data, index) => (
                <GlassCard key={index} className="month-card modern-card">
                    <div className="month-header-modern">
                        <div>
                            <span className="month-name-large">{data.month}</span>
                            <span className="year-label">{data.year}</span>
                        </div>
                        <div className="total-badge-modern">
                            <span className="badge-label">Total EDDs</span>
                            <span className="badge-value">{data.total}</span>
                        </div>
                    </div>

                    <div className="stats-section">
                        <div className="section-label">Outcome</div>
                        <div className="stats-grid-modern">
                            <div className="stat-item">
                                <span className="stat-icon normal"><MaterialIcon name="child_care" size={20} /></span>
                                <div className="stat-text">
                                    <span className="val">{data.stats.normal}</span>
                                    <span className="lbl">Normal</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon lscs"><MaterialIcon name="medical_services" size={20} /></span>
                                <div className="stat-text">
                                    <span className="val">{data.stats.lscs}</span>
                                    <span className="lbl">LSCS</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon abort"><MaterialIcon name="cancel" size={20} /></span>
                                <div className="stat-text">
                                    <span className="val">{data.stats.abortions}</span>
                                    <span className="lbl">Abortions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="stats-section">
                        <div className="section-label">Facility</div>
                        <div className="stats-grid-modern col-2">
                            <div className="stat-item">
                                <span className="stat-icon govt"><MaterialIcon name="account_balance" size={20} /></span>
                                <div className="stat-text">
                                    <span className="val">{data.stats.govt}</span>
                                    <span className="lbl">Govt</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon pvt"><MaterialIcon name="local_hospital" size={20} /></span>
                                <div className="stat-text">
                                    <span className="val">{data.stats.private}</span>
                                    <span className="lbl">Private</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );

    const renderPinInput = () => (
        <div className="lock-screen animate-enter">
            <MaterialIcon name="lock" className="lock-icon" />
            <h2 className="lock-title">Restricted Access</h2>
            <p className="lock-subtitle">Enter PIN to access Data Entry</p>

            <div className="pin-inputs">
                {pin.map((digit, index) => (
                    <input
                        key={index}
                        ref={pinRefs[index]}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        className="pin-digit"
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                ))}
            </div>
        </div>
    );

    const renderImportScreen = () => (
        <div className="import-container animate-enter">
            <h3 className="import-title">Import Data via Copy-Paste</h3>
            <div className="import-steps">
                1. Open your Excel file (XLS or XLSX).<br />
                2. Select the rows you want to import (including headers).<br />
                3. Copy them (Ctrl+C).<br />
                4. Paste them below (Ctrl+V).
            </div>

            <textarea
                className="import-textarea"
                placeholder="Paste your Excel data here..."
                spellCheck="false"
            ></textarea>

            <button className="preview-btn">
                <MaterialIcon name="visibility" size={20} /> Preview Data
            </button>
        </div>
    );

    return (
        <div className="home-wrapper edd-container">
            <PageHeader
                title="EDD & Deliveries"
                backPath="/programs/mch"
            />

            <div style={{ marginBottom: '20px', paddingBottom: '60px' }}>
                {activeTab === 'dashboard' && renderDashboardTab()}
                {activeTab === 'entries' && (isLocked ? renderPinInput() : renderImportScreen())}
            </div>

            {/* Bottom Tabs */}
            <div className="edd-bottom-tabs">
                <button
                    className={`edd-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <MaterialIcon name="dashboard" size={24} />
                    Dashboard
                </button>
                <button
                    className={`edd-tab-btn ${activeTab === 'entries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entries')}
                >
                    <MaterialIcon name="edit_note" size={24} />
                    Entries
                </button>
            </div>
        </div>
    );
};

export default EddVsDeliveries;
