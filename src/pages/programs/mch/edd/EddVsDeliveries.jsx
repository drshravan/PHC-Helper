import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import MaterialIcon from '../../../../components/ui/MaterialIcon';
import GlassCard from '../../../../components/ui/GlassCard';
import PageHeader from '../../../../components/ui/PageHeader';
import './EddVsDeliveries.css';
import { getMonthGroup, getStatUpdates, updateMonthlySummary } from '../../../../utils/ancStats';

const EddVsDeliveries = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'entries'

    // --- DASHBOARD STATE ---
    const [dashboardData, setDashboardData] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    // --- ENTRIES STATE ---
    const [isLocked, setIsLocked] = useState(true);
    const [pin, setPin] = useState(['', '', '', '']);
    const pinRefs = [useRef(), useRef(), useRef(), useRef()];

    // --- UPLOAD STATE ---
    const [importText, setImportText] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    // --- DELETE MODAL STATE ---
    const [deleteModal, setDeleteModal] = useState({ visible: false, monthId: null, monthTitle: '', step: 'confirm' });
    const [modalPin, setModalPin] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // --- LONG PRESS LOGIC ---
    const longPressTimer = useRef(null);
    const isLongPress = useRef(false);

    const startPress = (month) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setDeleteModal({ visible: true, monthId: month.id, monthTitle: month.title, step: 'confirm' });
            setModalPin('');
            // Vibrate if on mobile
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const cancelPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleCardClick = (monthId) => {
        if (isLongPress.current) return;
        navigate(`/programs/mch/edd-vs-deliveries/${monthId}`);
    };

    const handleDeleteMonth = async () => {
        if (!deleteModal.monthId) return;
        setIsDeleting(true);
        try {
            const { db } = await import('../../../../firebase');
            const { collection, query, where, getDocs, writeBatch, doc } = await import('firebase/firestore');

            // 1. Get all records for this monthGroup
            const q = query(collection(db, 'anc_records'), where('monthGroup', '==', deleteModal.monthId));
            const snapshot = await getDocs(q);

            const batch = writeBatch(db);

            // Delete records
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete summary
            batch.delete(doc(db, "anc_monthly_summaries", deleteModal.monthId));

            await batch.commit();

            // 3. Close Modal
            setDeleteModal({ visible: false, monthId: null, monthTitle: '', step: 'confirm' });
        } catch (error) {
            console.error("Delete Error", error);
            alert("Failed to delete records.");
        } finally {
            setIsDeleting(false);
            setModalPin('');
        }
    };

    const verifyAndExpandDelete = () => {
        if (modalPin === '1234') {
            handleDeleteMonth();
        } else {
            alert("Incorrect PIN");
            setModalPin('');
        }
    };

    // --- EFFECT: Load Dashboard Data ---
    // --- EFFECT: Load Dashboard Data ---
    useEffect(() => {
        let unsubscribe = null;

        const loadDashboard = async () => {
            try {
                const { db } = await import('../../../../firebase');
                const { collection, onSnapshot, query } = await import('firebase/firestore');

                // NEW: Listen to summaries instead of raw records
                const q = query(collection(db, "anc_monthly_summaries"));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(doc => doc.data());
                    // Sort by sortDate
                    data.sort((a, b) => a.sortDate - b.sortDate);

                    setDashboardData(data);
                    setLoadingDashboard(false);
                });
            } catch (err) {
                console.error("Dashboard Load Error", err);
                setLoadingDashboard(false);
            }
        };

        if (activeTab === 'dashboard') {
            loadDashboard();
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeTab]);

    // --- PIN Logic ---
    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 3) {
            pinRefs[index + 1].current.focus();
        }

        if (newPin.join('') === '1234') {
            setTimeout(() => setIsLocked(false), 300);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            pinRefs[index - 1].current.focus();
        }
    };

    // --- Parsing Logic ---
    const handlePreview = () => {
        if (!importText.trim()) return;
        const lines = importText.split('\n').filter(line => line.trim() !== '');

        let headerIndex = -1;
        const requiredHeaders = ["MotherId", "SubCenter", "Mother Name", "EDD Date"];

        for (let i = 0; i < lines.length; i++) {
            const row = lines[i].split('\t').map(cell => cell.trim());
            const hasHeaders = requiredHeaders.every(h => row.some(cell => cell.toLowerCase().includes(h.toLowerCase())));
            if (hasHeaders) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) {
            alert("Invalid Format! Could not find headers: MotherId, SubCenter, Mother Name, EDD Date");
            return;
        }

        const headers = lines[headerIndex].split('\t').map(h => h.trim());
        const getIdx = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const idxMap = {
            sNo: getIdx("S.No"),
            motherId: getIdx("MotherId"),
            district: getIdx("District"),
            phc: getIdx("Phc"),
            subCenter: getIdx("SubCenter"),
            motherName: getIdx("Mother Name"),
            mobile: getIdx("Mobile"),
            eddDate: getIdx("EDD Date")
        };

        if (idxMap.motherId === -1 || idxMap.eddDate === -1) {
            alert("Critial headers missing (MotherId or EDD Date).");
            return;
        }

        const data = [];
        const seenIds = new Set();
        const duplicates = [];
        const invalidRecords = [];

        for (let i = headerIndex + 1; i < lines.length; i++) {
            const row = lines[i].split('\t').map(cell => cell.trim());
            if (row.length < 5) continue;

            const mId = row[idxMap.motherId];
            if (!mId) continue;

            if (seenIds.has(mId)) {
                duplicates.push(mId);
                continue;
            }
            seenIds.add(mId);

            const rawDate = row[idxMap.eddDate];
            let isoDate = "";
            let lmpDate = "";
            let monthGroup = "";

            if (rawDate) {
                // Handle various separators (-, ., /)
                const cleanDate = rawDate.replace(/[-.]/g, '/');
                const parts = cleanDate.split('/');

                if (parts.length === 3) {
                    let d, m, y;
                    // Check for YYYY/MM/DD vs DD/MM/YYYY
                    if (parts[0].length === 4) {
                        [y, m, d] = parts;
                    } else {
                        [d, m, y] = parts;
                    }

                    // Basic validation
                    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                        d = d.padStart(2, '0');
                        m = m.padStart(2, '0');

                        // Fix 2-digit years if necessary (assume 20xx)
                        if (y.length === 2) y = '20' + y;

                        isoDate = `${y}-${m}-${d}`;
                        try {
                            const dateObj = new Date(isoDate);
                            // Validate date object validity
                            if (!isNaN(dateObj.getTime())) {
                                monthGroup = dateObj.toLocaleString('default', { month: 'short' }).toLowerCase() + '-' + y;

                                // Calculate LMP: EDD - 280 days
                                const lmpObj = new Date(dateObj);
                                lmpObj.setDate(dateObj.getDate() - 280);
                                const lYear = lmpObj.getFullYear();
                                const lMonth = String(lmpObj.getMonth() + 1).padStart(2, '0');
                                const lDay = String(lmpObj.getDate()).padStart(2, '0');
                                lmpDate = `${lYear}-${lMonth}-${lDay}`;
                            }
                        } catch (e) { console.error("Date parse error", e); }
                    }
                }
            }

            if (!monthGroup) {
                invalidRecords.push(`${mId} (Date: ${rawDate})`);
                continue; // Skip invalid date records to prevent issues
            }

            // Default facility type guessing logic (optional)
            // or we assume user enters it in Edit Record later.
            // Import sets status Pending so facility/mode are empty initially.

            const obj = {
                motherId: mId,
                sNo: idxMap.sNo > -1 ? row[idxMap.sNo] : "",
                district: idxMap.district > -1 ? row[idxMap.district] : "",
                phc: idxMap.phc > -1 ? row[idxMap.phc] : "",
                subCenter: row[idxMap.subCenter] || "Unknown",
                motherName: row[idxMap.motherName] || "Unknown",
                mobile: idxMap.mobile > -1 ? row[idxMap.mobile] : "",
                lmpDate: lmpDate,
                eddDate: isoDate,
                monthGroup: monthGroup,
                deliveryStatus: 'Pending',
                isHighRisk: false,
                highRiskTypes: [],
                anmName: "",
                anmMobile: "",
                ashaName: "",
                ashaMobile: "",
                gestationalWeek: 0,
                createdAt: new Date().toISOString()
            };
            data.push(obj);
        }

        if (data.length === 0) {
            let msg = "No valid data rows found.";
            if (invalidRecords.length > 0) msg += `\n${invalidRecords.length} records skipped due to invalid EDD dates.`;
            alert(msg);
            return;
        }

        let warningMsg = "";
        if (duplicates.length > 0) {
            warningMsg += `Skipped ${duplicates.length} duplicates.\n`;
        }
        if (invalidRecords.length > 0) {
            warningMsg += `Skipped ${invalidRecords.length} records with invalid dates:\n${invalidRecords.slice(0, 5).join('\n')}${invalidRecords.length > 5 ? '...' : ''}`;
        }

        if (warningMsg) alert(warningMsg);

        setParsedData(data);
        setPreviewMode(true);
    };

    const handleUpload = async () => {
        setUploading(true);
        try {
            const { db } = await import('../../../../firebase');
            const { doc, runTransaction, getDoc } = await import('firebase/firestore');

            // 1. Group by month to minimize transactions
            const groups = {};
            const skippedIds = [];

            // Pre-check for duplicates (optional but good for feedback)
            // Ideally we check inside transaction, but for bulk speed we might do a read first or just overwrite?
            // Existing logic checked getDoc(docRef).

            // Let's do it transactionally per month
            parsedData.forEach(item => {
                // Ensure monthGroup is set
                if (!item.monthGroup) {
                    item.monthGroup = getMonthGroup(item.eddDate);
                }
                const mg = item.monthGroup;
                if (!mg) return; // Skip invalid dates

                if (!groups[mg]) groups[mg] = [];
                groups[mg].push(item);
            });

            let totalAdded = 0;

            for (const mg of Object.keys(groups)) {
                await runTransaction(db, async (transaction) => {
                    const groupRecords = groups[mg];

                    // 1. Prepare Reads
                    // We need to read the summary AND all individual records to check existence
                    const summaryRef = doc(db, 'anc_monthly_summaries', mg);
                    const recordRefs = groupRecords.map(rec => doc(db, "anc_records", rec.motherId));

                    // Execute all reads in parallel
                    const [summarySnap, ...recordSnaps] = await Promise.all([
                        transaction.get(summaryRef),
                        ...recordRefs.map(ref => transaction.get(ref))
                    ]);

                    const delta = getStatUpdates(null, null); // Zero start for this batch

                    // 2. Process Reads & Queue Writes
                    recordSnaps.forEach((snap, index) => {
                        if (!snap.exists()) {
                            const rec = groupRecords[index];
                            const ref = recordRefs[index];

                            // Write: Create Record
                            transaction.set(ref, rec);

                            // Calculate Stats
                            const recDelta = getStatUpdates(null, rec);
                            Object.keys(recDelta).forEach(k => delta[k] += recDelta[k]);
                            totalAdded++;
                        }
                    });

                    // 3. Update Summary (Write)
                    // Pass existing summarySnap so it doesn't try to read again
                    await updateMonthlySummary(transaction, db, mg, delta, summarySnap);
                });
            }

            alert(`Upload Complete! Added ${totalAdded} records.`);
            setUploadStatus('success');
            setParsedData([]);
            setImportText('');
            setPreviewMode(false);

        } catch (error) {
            console.error("Upload Critical Error:", error);
            alert("Upload Failed: " + error.message);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    // --- REBUILD STATS (DEV TOOL / DATA REPAIR) ---
    const rebuildStats = async () => {
        if (!window.confirm("DOCTOR FIX: This will repair all records, fix month groupings (Strict EDD), and rebuild the dashboard. This resolves the 'Dec 2025' issue.\n\nContinue?")) return;

        setLoadingDashboard(true);
        try {
            const { db } = await import('../../../../firebase');
            const { collection, getDocs, writeBatch, doc } = await import('firebase/firestore');

            const batch = writeBatch(db);

            // 1. CLEAR OLD SUMMARIES (To remove phantom months like Dec 2025 if empty)
            const summarySnap = await getDocs(collection(db, "anc_monthly_summaries"));
            summarySnap.docs.forEach(d => {
                batch.delete(d.ref);
            });

            // 2. SCAN & REPAIR RECORDS
            const q = collection(db, "anc_records");
            const snapshot = await getDocs(q);

            const statsMap = {};
            let fixedRecordsCount = 0;

            snapshot.docs.forEach(d => {
                const data = d.data();

                // FORCE Recalculate using new strict EDD logic
                // We do NOT trust data.monthGroup as it might be corrupted by the previous bug
                const realMg = getMonthGroup(data.eddDate, data.deliveryStatus, data.abortedDate, data.deliveredDate);

                if (realMg) {
                    // Update Record if it's in the wrong group
                    if (data.monthGroup !== realMg) {
                        batch.update(d.ref, { monthGroup: realMg });
                        fixedRecordsCount++;
                    }

                    // Accumulate Stats
                    if (!statsMap[realMg]) statsMap[realMg] = getStatUpdates(null, null);

                    const delta = getStatUpdates(null, data);
                    Object.keys(delta).forEach(k => statsMap[realMg][k] += delta[k]);
                }
            });

            // 3. WRITE NEW SUMMARIES
            Object.keys(statsMap).forEach(mg => {
                const [m, y] = mg.split('-');
                const cleanTitle = m.charAt(0).toUpperCase() + m.slice(1) + " " + y;
                const sortDate = new Date(`${m} 1, ${y}`).getTime();

                const summaryData = {
                    id: mg,
                    title: cleanTitle,
                    sortDate: isNaN(sortDate) ? Date.now() : sortDate,
                    ...statsMap[mg]
                };
                // Ensure no negative (safety)
                Object.keys(summaryData).forEach(k => { if (typeof summaryData[k] === 'number' && summaryData[k] < 0) summaryData[k] = 0; });

                batch.set(doc(db, "anc_monthly_summaries", mg), summaryData);
            });

            await batch.commit();
            alert(`Doctor Fix Complete!\n\n- Fixed ${fixedRecordsCount} records (moved to correct EDD Month)\n- Rebuilt System Stats\n- Removed empty/phantom dashboards.`);

            // Reload dashboard manually
            window.location.reload();

        } catch (e) {
            console.error(e);
            alert("Repair Failed: " + e.message);
        } finally {
            setLoadingDashboard(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderDashboardTab = () => (
        <div className="edd-dashboard animate-enter">
            {loadingDashboard ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard...</div>
            ) : dashboardData.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MaterialIcon name="folder_open" size={48} style={{ opacity: 0.5, marginBottom: 10 }} />
                    <p>No Records Found</p>
                    <small>Import data in "Entries" tab</small>
                </div>
            ) : (
                dashboardData.map((month, index) => {
                    // Extract Month Name and Year for new Header Style
                    const [mName, mYear] = month.title.split(' ');

                    return (

                        <div
                            key={month.id}
                            className="month-card modern-card"
                            onMouseDown={() => startPress(month)}
                            onMouseUp={cancelPress}
                            onMouseLeave={cancelPress}
                            onTouchStart={() => startPress(month)}
                            onTouchEnd={cancelPress}
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={() => handleCardClick(month.id)}
                            style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
                        >

                            {/* Header: Month Year | Total Badge */}
                            <div className="month-header-modern">
                                <div>
                                    <span className="month-name-large">{index + 1}. {mName}</span>
                                    <span className="year-label">{mYear}</span>
                                </div>
                                <div className="total-badge-modern">
                                    <span className="badge-label">Total EDDs</span>
                                    <span className="badge-value">{month.total}</span>
                                </div>
                            </div>

                            {/* Outcome Section */}
                            <div className="stat-section-label">OUTCOME</div>
                            <div className="stats-compact-row">
                                <div className="stat-pill">
                                    <div className="stat-pill-icon normal">
                                        <MaterialIcon name="sentiment_satisfied" />
                                    </div>
                                    <div className="stat-val">{month.normal || 0}</div>
                                    <div className="stat-lbl">Normal</div>
                                </div>
                                <div className="stat-pill">
                                    <div className="stat-pill-icon lscs">
                                        <MaterialIcon name="medical_services" />
                                    </div>
                                    <div className="stat-val">{month.lscs || 0}</div>
                                    <div className="stat-lbl">LSCS</div>
                                </div>
                                <div className="stat-pill">
                                    <div className="stat-pill-icon abort">
                                        <MaterialIcon name="cancel" />
                                    </div>
                                    <div className="stat-val">{month.aborted || 0}</div>
                                    <div className="stat-lbl">Abortions</div>
                                </div>
                            </div>

                            <div className="section-divider"></div>

                            {/* Facility Section */}
                            <div className="stat-section-label">FACILITY</div>
                            <div className="stats-compact-row" style={{ justifyContent: 'flex-start', gap: '16px' }}>
                                <div className="stat-pill">
                                    <div className="stat-pill-icon govt">
                                        <MaterialIcon name="account_balance" />
                                    </div>
                                    <div className="stat-val">{month.govt || 0}</div>
                                    <div className="stat-lbl">Govt</div>
                                </div>
                                <div className="stat-pill">
                                    <div className="stat-pill-icon pvt">
                                        <MaterialIcon name="local_hospital" />
                                    </div>
                                    <div className="stat-val">{month.pvt || 0}</div>
                                    <div className="stat-lbl">Private</div>
                                </div>
                            </div>

                        </div>
                    )
                })
            )}
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

    const renderImportScreen = () => {
        if (previewMode) {
            return (
                <div className="import-container animate-enter">
                    <h3 className="import-title">Preview Data ({parsedData.length} records)</h3>
                    <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '50vh', border: '1px solid var(--neu-border-color)', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            <thead style={{ background: 'var(--neu-bg)', position: 'sticky', top: 0 }}>
                                <tr>
                                    {["S.No", "ID", "Name", "Mobile", "LMP", "EDD", "SubCenter"].map(h => (
                                        <th key={h} style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--neu-border-color)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--neu-border-color)' }}>
                                        <td style={{ padding: '8px' }}>{row.sNo}</td>
                                        <td style={{ padding: '8px' }}>{row.motherId}</td>
                                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.motherName}</td>
                                        <td style={{ padding: '8px' }}>{row.mobile}</td>
                                        <td style={{ padding: '8px', color: 'var(--accent-primary)' }}>{row.lmpDate}</td>
                                        <td style={{ padding: '8px', color: 'var(--accent-primary)' }}>{row.eddDate}</td>
                                        <td style={{ padding: '8px' }}>{row.subCenter}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button className="neu-btn" onClick={() => setPreviewMode(false)} style={{ flex: 1, color: 'var(--error-color)' }}>
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

    const renderDeleteModal = () => {
        if (!deleteModal.visible) return null;

        const isPinStep = deleteModal.step === 'pin';

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(5px)'
            }}>
                <div className="glass-card animate-pop" style={{ width: '90%', maxWidth: '350px', padding: '24px', border: '1px solid rgba(255,50,50,0.3)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,50,50,0.1)',
                            color: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px auto'
                        }}>
                            <MaterialIcon name="delete_forever" size={32} />
                        </div>
                        <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>{isPinStep ? "Enter PIN" : "Delete Records?"}</h3>
                        {!isPinStep ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                                This will permanently delete ALL records for <strong>{deleteModal.monthTitle}</strong>.
                                This action cannot be undone.
                            </p>
                        ) : (
                            <div style={{ marginTop: '15px' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                                    Enter security PIN to confirm deletion.
                                </p>
                                <input
                                    type="password"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    className="green-input"
                                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                    maxLength={4}
                                    placeholder="••••"
                                    value={modalPin}
                                    onChange={(e) => setModalPin(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="neu-btn"
                            style={{ flex: 1 }}
                            onClick={() => setDeleteModal({ visible: false, monthId: null, monthTitle: '', step: 'confirm' })}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        {!isPinStep ? (
                            <button
                                className="neu-btn"
                                style={{ flex: 1, background: 'rgba(255,50,50,0.15)', color: '#ff4444', border: '1px solid rgba(255,50,50,0.3)' }}
                                onClick={() => setDeleteModal(prev => ({ ...prev, step: 'pin' }))}
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                className="neu-btn"
                                style={{ flex: 1, background: 'rgba(255,50,50,0.15)', color: '#ff4444', border: '1px solid rgba(255,50,50,0.3)' }}
                                onClick={verifyAndExpandDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Box className="home-wrapper edd-container" sx={{ display: 'flex', flexDirection: 'column' }}>
            {renderDeleteModal()}
            <PageHeader
                title="EDD & Deliveries"
                subtitle="MCH Management"
                backPath="/programs/mch"
            />

            <Box sx={{ height: '15px' }} />

            <div style={{ marginBottom: '20px', paddingBottom: '60px' }}>
                {activeTab === 'dashboard' && renderDashboardTab()}
                {activeTab === 'entries' && (isLocked ? renderPinInput() : renderImportScreen())}

                {/* Dev Tool: Rebuild Stats */}
                {activeTab === 'entries' && !isLocked && (
                    <div style={{ textAlign: 'center', marginTop: '30px', opacity: 0.5 }}>
                        <small onClick={rebuildStats} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                            Stats Desynchronized? Click to Rebuild
                        </small>
                    </div>
                )}
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
        </Box>
    );
};

export default EddVsDeliveries;
