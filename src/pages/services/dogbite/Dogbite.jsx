import React, { useState } from 'react';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import PageHeader from '../../../components/ui/PageHeader';
import './Dogbite.css';

export default function Dogbite() {
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [biteDate, setBiteDate] = useState(getTodayString());

  // WHO Intramuscular Schedule: 0, 3, 7, 14, 28
  const offsets = [0, 3, 7, 14, 28];

  const calculateSchedule = () => {
    if (!biteDate) return [];

    const start = new Date(biteDate);

    return offsets.map((offset, index) => {
      const doseDate = new Date(start);
      doseDate.setDate(start.getDate() + offset);

      const dateStr = doseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const weekday = doseDate.toLocaleDateString('en-GB', { weekday: 'long' });

      // Compare dates without time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const doseMidnight = new Date(doseDate);
      doseMidnight.setHours(0, 0, 0, 0);

      let status = 'future-dose';
      if (doseMidnight.getTime() === today.getTime()) status = 'active-dose';
      else if (doseMidnight < today) status = 'past-dose';

      return {
        doseNum: index + 1,
        dayOffset: offset,
        date: dateStr,
        weekday: weekday,
        status: status,
      };
    });
  };

  const schedule = calculateSchedule();

  return (
    <div className="home-wrapper animate-enter">
      <PageHeader title="Rabies Schedule" backPath="/services" />

      <div className="date-picker-card animate-pop delay-100">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
          <div className="icon-circle" style={{ width: 40, height: 40, margin: 0, color: '#ff5722' }}>
            <MaterialIcon name="vaccines" size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Date of Bite</h3>
        </div>
        <input
          type="date"
          className="neu-input"
          value={biteDate}
          onChange={(e) => setBiteDate(e.target.value)}
          style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        />
      </div>

      <div className="schedule-list">
        {schedule.map((dose, i) => (
          <div
            key={i}
            className={`schedule-item ${dose.status} animate-pop`}
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            {/* Connector Line (except for last item) */}
            {i !== schedule.length - 1 && <div className="timeline-connector"></div>}

            {/* Badge */}
            <div className="dose-number-badge">
              {dose.status === 'past-dose' ? <MaterialIcon name="check" size={24} /> : dose.doseNum}
            </div>

            {/* Info */}
            <div className="dose-info">
              <span className="dose-title">Dose {dose.doseNum} ({dose.dayOffset === 0 ? 'Day 0' : `Day ${dose.dayOffset}`})</span>
              <span className="dose-date">{dose.date}</span>
            </div>

            {/* Weekday */}
            <div className="dose-weekday">{dose.weekday}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
