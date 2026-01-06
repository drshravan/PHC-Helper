import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';

const PresenceContext = createContext();

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider = ({ children }) => {
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem('presence_session_id');
        if (saved) return saved;
        const newId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('presence_session_id', newId);
        return newId;
    });

    const [status, setStatus] = useState('online'); // online, filling-form
    const [location, setLocation] = useState(null);

    const fetchLocationName = async (lat, lng) => {
        try {
            // Nominatim requires a User-Agent header
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`, {
                headers: { 'Accept-Language': 'en' }
            });
            const data = await response.json();
            if (!data.address) return 'Unknown Area';

            const addr = data.address;
            // More comprehensive check for village/area names
            const name = addr.village || addr.suburb || addr.hamlet || addr.neighbourhood || addr.residential || addr.town || addr.city || addr.district || addr.county || 'Search Area';
            return name;
        } catch (err) {
            console.error('Reverse Geocoding Error', err);
            return 'Unknown Area';
        }
    };

    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        let deviceType = 'Computer';
        if (/tablet|ipad|playbook|silk/i.test(ua)) deviceType = 'Tablet';
        else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) deviceType = 'Mobile';

        const getBrowser = () => {
            if (ua.includes('Chrome')) return 'Chrome';
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Safari')) return 'Safari';
            if (ua.includes('Edge')) return 'Edge';
            return 'Other';
        };

        return {
            deviceType,
            browser: getBrowser(),
            isMobile: deviceType === 'Mobile',
            isTab: deviceType === 'Tablet',
            isComputer: deviceType === 'Computer'
        };
    };

    useEffect(() => {
        let watchId = null;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const name = await fetchLocationName(latitude, longitude);
                    setLocation({
                        lat: latitude,
                        lng: longitude,
                        name: name,
                        timestamp: Date.now()
                    });
                },
                (err) => console.log('Location access error:', err.message),
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 1000
                }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(() => {
        const docRef = doc(db, 'presence', sessionId);

        const updatePresence = async () => {
            await setDoc(docRef, {
                sessionId,
                status,
                lastActive: serverTimestamp(),
                deviceInfo: getDeviceInfo(),
                location: location,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        };

        updatePresence();
        const interval = setInterval(updatePresence, 30000); // Heartbeat every 30s

        // Cleanup on unmount/close
        const handleUnload = () => {
            // navigator.sendBeacon would be better but requires more setup
            // For now, we'll rely on the heartbeat timeout for cleanup in the dashboard
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [sessionId, status, location]);

    return (
        <PresenceContext.Provider value={{ status, setStatus, sessionId }}>
            {children}
        </PresenceContext.Provider>
    );
};
