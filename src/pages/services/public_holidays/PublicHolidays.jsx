import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import PageHeader from '../../../components/ui/PageHeader';
import './PublicHolidays.css';

const RAW_HOLIDAYS = [
    { id: 1, occasion: "New Year Day", date: "01-01-2026", day: "Thursday", type: "Optional" },
    { id: 2, occasion: "Birthday of Hazrath Ali (R.A)", date: "03-01-2026", day: "Saturday", type: "Optional" },
    { id: 3, occasion: "Bhogi", date: "14-01-2026", day: "Wednesday", type: "General" },
    { id: 4, occasion: "Sankranti / Pongal", date: "15-01-2026", day: "Thursday", type: "General" },
    { id: 5, occasion: "Kanumu", date: "16-01-2026", day: "Friday", type: "Optional" },
    { id: 6, occasion: "Shab-e-Meraj", date: "17-01-2026", day: "Saturday", type: "Optional" },
    { id: 7, occasion: "Sri Panchami", date: "23-01-2026", day: "Friday", type: "Optional" },
    { id: 8, occasion: "Republic Day", date: "26-01-2026", day: "Monday", type: "General" },
    { id: 9, occasion: "Shab-e-Barat", date: "04-02-2026", day: "Wednesday", type: "Optional" },
    { id: 10, occasion: "Maha Shivaratri", date: "15-02-2026", day: "Sunday", type: "General" },
    { id: 11, occasion: "Holi", date: "03-03-2026", day: "Tuesday", type: "General" },
    { id: 12, occasion: "Shahadat Hazrath Ali (R.A)", date: "10-03-2026", day: "Tuesday", type: "Optional" },
    { id: 13, occasion: "Jumatul Wada", date: "13-03-2026", day: "Friday", type: "Optional" },
    { id: 14, occasion: "Shab-e-Qader", date: "17-03-2026", day: "Tuesday", type: "Optional" },
    { id: 15, occasion: "Ugadi", date: "19-03-2026", day: "Thursday", type: "General" },
    { id: 16, occasion: "Eid-ul-Fitr (Ramzan)", date: "21-03-2026", day: "Saturday", type: "General" },
    { id: 17, occasion: "Following Day of Ramzan", date: "22-03-2026", day: "Sunday", type: "General" },
    { id: 18, occasion: "Sri Rama Navami", date: "27-03-2026", day: "Friday", type: "General" },
    { id: 19, occasion: "Mahaveer Jayanti", date: "31-03-2026", day: "Tuesday", type: "Optional" },
    { id: 20, occasion: "Good Friday", date: "03-04-2026", day: "Friday", type: "General" },
    { id: 21, occasion: "Babu Jagjivan Ram Birthday", date: "05-04-2026", day: "Sunday", type: "General" },
    { id: 22, occasion: "Dr. B.R. Ambedkar Birthday", date: "14-04-2026", day: "Tuesday", type: "General" },
    { id: 23, occasion: "Tamil New Year Day", date: "14-04-2026", day: "Tuesday", type: "Optional" },
    { id: 24, occasion: "Basava Jayanti", date: "20-04-2026", day: "Monday", type: "Optional" },
    { id: 25, occasion: "Buddha Purnima", date: "01-05-2026", day: "Friday", type: "Optional" },
    { id: 26, occasion: "Eid-ul-Azha (Bakrid)", date: "27-05-2026", day: "Wednesday", type: "General" },
    { id: 27, occasion: "Eid-e-Ghadeer", date: "04-06-2026", day: "Thursday", type: "Optional" },
    { id: 28, occasion: "9th Moharram", date: "25-06-2026", day: "Thursday", type: "Optional" },
    { id: 29, occasion: "Muharram (Shahadat Imam Hussain)", date: "26-06-2026", day: "Friday", type: "General" },
    { id: 30, occasion: "Ratha Yatra", date: "16-07-2026", day: "Thursday", type: "Optional" },
    { id: 31, occasion: "Arbayein", date: "04-08-2026", day: "Tuesday", type: "Optional" },
    { id: 32, occasion: "Bonalu", date: "10-08-2026", day: "Monday", type: "General" },
    { id: 33, occasion: "Independence Day", date: "15-08-2026", day: "Saturday", type: "General" },
    { id: 34, occasion: "Parsi New Year", date: "15-08-2026", day: "Saturday", type: "Optional" },
    { id: 35, occasion: "Varalakshmi Vratham", date: "21-08-2026", day: "Friday", type: "Optional" },
    { id: 36, occasion: "Eid Milad-un-Nabi", date: "26-08-2026", day: "Wednesday", type: "General" },
    { id: 37, occasion: "Sravana Purnima / Rakhi", date: "28-08-2026", day: "Friday", type: "Optional" },
    { id: 38, occasion: "Sri Krishna Astami", date: "04-09-2026", day: "Friday", type: "General" },
    { id: 39, occasion: "Vinayaka Chavithi", date: "14-09-2026", day: "Monday", type: "General" },
    { id: 40, occasion: "Yaz Dahum Shareef", date: "23-09-2026", day: "Wednesday", type: "Optional" },
    { id: 41, occasion: "Mahatma Gandhi Jayanti", date: "02-10-2026", day: "Friday", type: "General" },
    { id: 42, occasion: "Saddula Bathukamma", date: "18-10-2026", day: "Sunday", type: "General" },
    { id: 43, occasion: "Mahanavami", date: "19-10-2026", day: "Monday", type: "Optional" },
    { id: 44, occasion: "Vijaya Dasami / Dussehra", date: "20-10-2026", day: "Tuesday", type: "General" },
    { id: 45, occasion: "Following Day of Dussehra", date: "21-10-2026", day: "Wednesday", type: "General" },
    { id: 46, occasion: "Birthday of Syed Mohammed Juvanpuri Mahdi", date: "26-10-2026", day: "Monday", type: "Optional" },
    { id: 47, occasion: "Deepavali", date: "08-11-2026", day: "Sunday", type: "General" },
    { id: 48, occasion: "Naraka Chaturdhi", date: "08-11-2026", day: "Sunday", type: "Optional" },
    { id: 49, occasion: "Kartika Purnima / Guru Nanak Jayanti", date: "24-11-2026", day: "Tuesday", type: "General" },
    { id: 50, occasion: "Christmas Eve", date: "24-12-2026", day: "Thursday", type: "Optional" },
    { id: 51, occasion: "Christmas", date: "25-12-2026", day: "Friday", type: "General" },
    { id: 52, occasion: "Following Day of Christmas (Boxing Day)", date: "26-12-2026", day: "Saturday", type: "General" },
    { id: 53, occasion: "Birthday of Hazrath Ali", date: "26-12-2026", day: "Saturday", type: "Optional" }
];

const MONTH_COLORS = [
    '#FF6B6B', // Jan - Red
    '#4ECDC4', // Feb - Teal
    '#45B7D1', // Mar - Blue
    '#96CEB4', // Apr - Green
    '#FFEEAD', // May - Yellow
    '#D4A5A5', // Jun - Pink
    '#9B59B6', // Jul - Purple
    '#3498DB', // Aug - Blue
    '#E67E22', // Sep - Orange
    '#2ECC71', // Oct - Green
    '#F1C40F', // Nov - Yellow
    '#E74C3C'  // Dec - Red
];

export default function PublicHolidays() {
    const navigate = useNavigate();

    // 1. Parse and Process Data
    const holidays = useMemo(() => {
        return RAW_HOLIDAYS.map(h => {
            const [d, m, y] = h.date.split('-');
            const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            const day = dateObj.getDate();
            const weekday = dateObj.getDay(); // 0=Sun, 6=Sat
            const monthIndex = parseInt(m) - 1;

            let overlap = null;
            // 2nd Saturday Check (Generic rule, can be refined)
            if (weekday === 6) {
                if (day >= 8 && day <= 14) overlap = "2nd Saturday";
            }
            // Sunday Check
            if (weekday === 0) overlap = "Sunday";

            return { ...h, dateObj, monthName: dateObj.toLocaleString('default', { month: 'long' }), monthShort: dateObj.toLocaleString('default', { month: 'short' }), monthIndex, dayVal: day, overlap };
        });
    }, []);

    const groupedHolidays = useMemo(() => {
        const groups = {};
        holidays.forEach(h => {
            if (!groups[h.monthName]) groups[h.monthName] = { name: h.monthName, index: h.monthIndex, color: MONTH_COLORS[h.monthIndex % 12], items: [] };
            groups[h.monthName].items.push(h);
        });
        return Object.values(groups);
    }, [holidays]);

    const [upcoming, setUpcoming] = useState(null);
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = holidays.filter(h => h.dateObj >= today);
        setUpcoming(future.length > 0 ? future[0] : holidays[0]);
    }, [holidays]);

    const getDaysLeft = (targetDate) => {
        if (!targetDate) return 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diff = targetDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} Days to go` : "Happening Now";
    };

    return (
        <div className="holidays-container animate-enter">
            <div className="ph-fixed-section">
                <PageHeader title="Public Holidays 2026" backPath="/services" />

                {upcoming && (
                    <div className="upcoming-card">
                        <div className="upcoming-left">
                            <div className="upcoming-label">NEXT EVENT</div>
                            <div className="upcoming-date">
                                <span className="u-day">{upcoming.dayVal}</span>
                                <span className="u-month">{upcoming.monthShort}</span>
                            </div>
                        </div>

                        <div className="upcoming-right">
                            <div className="upcoming-name">{upcoming.occasion}</div>

                            <div className="upcoming-row">
                                <span className={`h-type-badge type-${upcoming.type.toLowerCase()}`}>
                                    {upcoming.type}
                                </span>
                                <div className="upcoming-timer">
                                    {getDaysLeft(upcoming.dateObj)}
                                </div>
                            </div>

                            {upcoming.overlap && (
                                <div className="upcoming-warning">
                                    <MaterialIcon name="warning" size={16} /> {upcoming.overlap}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="holidays-list">
                {groupedHolidays.map((group, gIndex) => (
                    <div key={group.name} className="month-section animate-enter" style={{ animationDelay: `${gIndex * 100}ms` }}>
                        <div
                            className="month-header"
                            style={{ borderLeftColor: group.color, color: group.color }}
                        >
                            {group.name} <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: 5 }}>2026</span>
                        </div>
                        <div className="group-items">
                            {group.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="holiday-card"
                                    style={{ borderLeftColor: group.color, marginBottom: '16px' }}
                                >
                                    {item.overlap && (
                                        <div className="overlap-indicator" title={`Overlaps with ${item.overlap}`}>
                                            <MaterialIcon name="warning" size={14} />
                                        </div>
                                    )}

                                    <div className="h-date-box">
                                        <span className="h-day">{item.dayVal}</span>
                                        <span className="h-month">{item.monthShort}</span>
                                    </div>

                                    <div className="h-info">
                                        <div className="h-title">{item.occasion}</div>
                                        <div className="h-weekday">{item.day} {item.overlap && <span style={{ color: 'var(--error-color)', fontSize: '0.75rem' }}>• {item.overlap}</span>}</div>
                                    </div>

                                    <div className={`h-type-badge type-${item.type.toLowerCase()}`}>
                                        {item.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
