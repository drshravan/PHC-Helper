import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import PageHeader from '../../../../components/ui/PageHeader';
import GlassCard from '../../../../components/ui/GlassCard';
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
                <GlassCard
                    key={index}
                    className="month-card modern-card"
                    onClick={() => navigate(`/programs/mch/edd-vs-deliveries/${data.month.toLowerCase().substring(0, 3)}-${data.year}`)}
                    hoverEffect={true}
                >
                    {/* Header */}
                    <div className="month-header-modern">
                        <div>
                            <span className="month-name-large">{data.month}</span>
                            <span className="year-label">{data.year}</span>
                        </div>
                        <div className="total-badge-modern">
                            <span className="badge-label">TOTAL EDDS</span>
                            <span className="badge-value">{data.total}</span>
                        </div>
                    </div>

                    {/* Outcome Row (Compact) */}
                    <div className="section-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>OUTCOME</div>
                    <div className="stats-compact-row">
                        <div className="stat-pill">
                            <div className="stat-pill-icon normal"><MaterialIcon name="child_care" size={18} /></div>
                            <span className="stat-val">{data.stats.normal}</span>
                            <span className="stat-lbl">Normal</span>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-pill-icon lscs"><MaterialIcon name="medical_services" size={18} /></div>
                            <span className="stat-val">{data.stats.lscs}</span>
                            <span className="stat-lbl">LSCS</span>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-pill-icon abort"><MaterialIcon name="cancel" size={18} /></div>
                            <span className="stat-val">{data.stats.abortions}</span>
                            <span className="stat-lbl">Abortions</span>
                        </div>
                    </div>

                    <div className="section-divider"></div>

                    {/* Facility Row (Compact) */}
                    <div className="section-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>FACILITY</div>
                    <div className="stats-compact-row">
                        <div className="stat-pill">
                            <div className="stat-pill-icon govt"><MaterialIcon name="account_balance" size={18} /></div>
                            <span className="stat-val">{data.stats.govt}</span>
                            <span className="stat-lbl">Govt</span>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-pill-icon pvt"><MaterialIcon name="local_hospital" size={18} /></div>
                            <span className="stat-val">{data.stats.private}</span>
                            <span className="stat-lbl">Private</span>
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

    // --- Import & Upload State ---
    const [importText, setImportText] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'

    // --- Parsing Logic ---
    const handlePreview = () => {
        if (!importText.trim()) return;

        const lines = importText.split('\n').filter(line => line.trim() !== '');

        // Find Header Row (Metadata might be present at top)
        let headerIndex = -1;
        const requiredHeaders = ["S.No", "MotherId", "District", "Phc", "SubCenter", "Mother Name", "Mobile", "EDD Date"];

        for (let i = 0; i < lines.length; i++) {
            // Excel copy-paste uses tabs. We split by tab.
            const row = lines[i].split('\t').map(cell => cell.trim());

            // Check if this row contains all required headers
            const hasAllHeaders = requiredHeaders.every(h => row.includes(h));
            if (hasAllHeaders) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) {
            alert("Invalid Format! Could not find the required table headers: " + requiredHeaders.join(", "));
            return;
        }

        // Map Headers to indices
        const headers = lines[headerIndex].split('\t').map(h => h.trim());
        const headerMap = {};
        requiredHeaders.forEach(req => {
            headerMap[req] = headers.indexOf(req);
        });

        // Parse Rows
        const data = [];
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const row = lines[i].split('\t').map(cell => cell.trim());
            // Skip invalid/empty rows
            if (row.length < requiredHeaders.length) continue;

            // Construct Object
            const obj = {
                sNo: row[headerMap["S.No"]],
                motherId: row[headerMap["MotherId"]],
                district: row[headerMap["District"]],
                phc: row[headerMap["Phc"]],
                subCenter: row[headerMap["SubCenter"]],
                motherName: row[headerMap["Mother Name"]],
                mobile: row[headerMap["Mobile"]],
                eddDate: row[headerMap["EDD Date"]],
                status: 'Pending' // Default status
            };
            data.push(obj);
        }

        if (data.length === 0) {
            alert("No valid data rows found after the header.");
            return;
        }

        setParsedData(data);
        setPreviewMode(true);
    };

    const handleUpload = async () => {
        setUploading(true);
        // Here we would normally import { db } from '../../../firebase' and addDoc
        // Since I cannot modify external files safely in this step, I will mock the alert or you can uncomment below.

        try {
            // Dynamically import to avoid build errors if file missing
            const { db } = await import('../../../../firebase');
            const { collection, addDoc } = await import('firebase/firestore');

            const batchPromises = parsedData.map(item => {
                return addDoc(collection(db, "edd_entries"), {
                    ...item,
                    createdAt: new Date()
                });
            });

            await Promise.all(batchPromises);

            setUploadStatus('success');
            setParsedData([]);
            setImportText('');
            setPreviewMode(false);
            setTimeout(() => setUploadStatus(null), 3000);
            alert("Successfully uploaded " + parsedData.length + " records to Firebase!");

        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload Failed: " + error.message);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const renderImportScreen = () => {
        if (previewMode) {
            return (
                <div className="import-container animate-enter">
                    <h3 className="import-title">Preview Data ({parsedData.length} records)</h3>
                    <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '50vh', border: '1px solid var(--neu-border-color)', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            <thead style={{ background: 'var(--neu-bg)', position: 'sticky', top: 0 }}>
                                <tr>
                                    {["S.No", "ID", "Name", "Mobile", "EDD", "SubCenter"].map(h => (
                                        <th key={h} style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--neu-border-color)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px' }}>{row.sNo}</td>
                                        <td style={{ padding: '8px' }}>{row.motherId}</td>
                                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.motherName}</td>
                                        <td style={{ padding: '8px' }}>{row.mobile}</td>
                                        <td style={{ padding: '8px', color: 'var(--accent-primary)' }}>{row.eddDate}</td>
                                        <td style={{ padding: '8px' }}>{row.subCenter}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button className="neu-btn" onClick={() => setPreviewMode(false)} style={{ flex: 1, color: '#f44336' }}>
                            Cancel
                        </button>
                        <button className="preview-btn" onClick={handleUpload} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Confirm & Upload'}
                            <MaterialIcon name="cloud_upload" size={20} />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="import-container animate-enter">
                <h3 className="import-title">Import Data</h3>
                <div className="import-card">
                    <div className="import-steps">
                        <strong>1.</strong> Copy rows from your Excel sheet (including headers).<br />
                        <strong>2.</strong> Paste them below.
                    </div>

                    <textarea
                        className="import-textarea"
                        placeholder="Paste Excel data here..."
                        spellCheck="false"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                    ></textarea>

                    <div style={{ marginTop: '20px' }}>
                        <button className="preview-btn" onClick={handlePreview}>
                            <MaterialIcon name="visibility" size={24} />
                            Preview Data
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                    Monthly EDDs
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
