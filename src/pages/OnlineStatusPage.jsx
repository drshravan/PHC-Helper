import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MaterialIcon from '../components/ui/MaterialIcon';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';

const OnlineStatusPage = () => {
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(prev => onlineUsers.length === 0); // Only show loader if empty or first load? Maybe quiet update is better.
        // Actually, let's keep loading true only on initial mount
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const q = query(
                collection(db, "presence"),
                where("lastActive", ">=", fiveMinutesAgo)
            );

            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => doc.data());

            // Filter locally
            const now = Date.now();
            const activeUsers = users.filter(u => {
                const last = u.lastActive?.toDate ? u.lastActive.toDate().getTime() : new Date(u.updatedAt).getTime();
                return (now - last) < (5 * 60 * 1000);
            });

            setOnlineUsers(activeUsers);
        } catch (err) {
            console.error("Failed to fetch online users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // Poll every 60 seconds instead of listening to every 30s heartbeat
        const interval = setInterval(fetchUsers, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <PageHeader
                title="Online Status"
                subtitle="Active Users"
                backPath="/"
            />

            <div className="animate-enter" style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div className="stats-block" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{onlineUsers.length}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>OPENED APP</span>
                    </div>
                    <div className="stats-block" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--orange-color)' }}>
                            {onlineUsers.filter(u => u.status === 'filling-form').length}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>FILLING FORM</span>
                    </div>
                </div>

                <div className="section-header-row" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Active Members</div>
                        <button onClick={fetchUsers} className="neu-btn" style={{ padding: '4px 8px', minHeight: 'auto', borderRadius: '6px' }}>
                            <MaterialIcon name="refresh" size={16} />
                        </button>
                    </div>
                    <div className="section-badge" style={{ background: 'var(--success-color)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {onlineUsers.length} Online
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div className="spinner" style={{ marginBottom: 10 }}></div>
                        Scanning active sessions...
                    </div>
                ) : onlineUsers.length > 0 ? (
                    <div className="online-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
                        {onlineUsers.map((user, idx) => (
                            <GlassCard key={user.sessionId || idx} className="animate-pop">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                                        }}>
                                            <MaterialIcon
                                                name={user.deviceInfo?.isMobile ? 'smartphone' : user.deviceInfo?.isTab ? 'tablet' : 'computer'}
                                                size={24}
                                                color={user.status === 'filling-form' ? 'var(--orange-color)' : 'var(--success-color)'}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {user.deviceInfo?.browser || 'Unknown'} Browser
                                                {user.status === 'filling-form' && (
                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,152,0,0.2)', color: 'var(--orange-color)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        Filling Form
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                ID: {user.sessionId?.substring(5, 11)} • {user.deviceInfo?.deviceType || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>

                                    {user.location ? (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${user.location.lat},${user.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textAlign: 'right', textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                                <MaterialIcon name="location_on" size={18} />
                                                <span style={{ fontWeight: '600' }}>{user.location.name || 'View Map'}</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                                            </div>
                                        </a>
                                    ) : (
                                        <div style={{ textAlign: 'right', opacity: 0.5 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.8rem' }}>
                                                <MaterialIcon name="location_off" size={18} />
                                                <span>No Location</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem' }}>GPS Disabled</div>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : (
                    <GlassCard>
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            <MaterialIcon name="wifi_off" size={48} style={{ marginBottom: 15, opacity: 0.3 }} />
                            <h3>No Active Users</h3>
                            <p style={{ fontSize: '0.9rem' }}>No other users are currently active on the platform.</p>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};

export default OnlineStatusPage;
