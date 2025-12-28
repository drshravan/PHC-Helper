import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import './Dogbite.css';

import PageHeader from '../../../components/ui/PageHeader';

export default function Dogbite() {
  // Default to current date formatted as YYYY-MM-DD for the input
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const navigate = useNavigate();

  const [biteDate, setBiteDate] = useState(getTodayString());

  // Standard WHO Intramuscular Schedule: 0, 3, 7, 14, 28
  const offsets = [0, 3, 7, 14, 28];

  const calculateSchedule = () => {
    if (!biteDate) return [];

    const start = new Date(biteDate);

    return offsets.map((offset, index) => {
      const doseDate = new Date(start);
      doseDate.setDate(start.getDate() + offset);

      const dateStr = doseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const weekday = doseDate.toLocaleDateString('en-GB', { weekday: 'short' });

      const today = new Date();
      // Reset hours to compare dates only
      const todayZero = new Date(today.setHours(0, 0, 0, 0));
      const doseZero = new Date(doseDate.setHours(0, 0, 0, 0));

      const isToday = doseZero.getTime() === todayZero.getTime();
      const isPast = doseZero < todayZero;

      let status = 'future';
      if (isToday) status = 'active';
      if (isPast) status = 'past';

      return {
        doseNum: index + 1,
        dayOffset: offset,
        date: dateStr,
        weekday: weekday,
        status: status,
        isToday: isToday,
      };
    });
  };

  const schedule = calculateSchedule();

  return (
    <div className="dog-bite-container animate-enter">
      <PageHeader title="Rabies Schedule" backPath="/services" />

      <div className="date-picker-card animate-pop delay-100">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <MaterialIcon name="vaccines" style={{ color: '#ff5722' }} />
          <h3 className="card-title">Date of Bite / 1st Dose</h3>
        </div>
        <input
          type="date"
          className="date-input"
          value={biteDate}
          onChange={(e) => setBiteDate(e.target.value)}
        />
      </div>

      <div className="schedule-list">
        {schedule.map((dose, i) => (
          <div
            key={i}
            className={`schedule-card ${dose.status} animate-pop`}
            style={{ animationDelay: `${(i + 2) * 100}ms` }}
          >
            {/* Connector Line */}

            <div className="dose-weekday">{item.weekday}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
