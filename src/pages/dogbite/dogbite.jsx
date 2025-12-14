import React, { useState } from 'react';
import './Dogbite.css'; // Make sure to create this file

export default function Dogbite() {
  // Default to current date formatted as YYYY-MM-DD for the input
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [biteDate, setBiteDate] = useState(getTodayString());

  // Standard WHO Intramuscular Schedule: 0, 3, 7, 14, 28
  const offsets = [0, 3, 7, 14, 28];

  const calculateSchedule = () => {
    if (!biteDate) return [];

    const start = new Date(biteDate);
    
    return offsets.map((offset, index) => {
      const doseDate = new Date(start);
      doseDate.setDate(start.getDate() + offset);

      const dateStr = doseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'numeric', year: 'numeric' });
      const weekday = doseDate.toLocaleDateString('en-GB', { weekday: 'long' });

      const today = new Date();
      const isToday = doseDate.toDateString() === today.toDateString();
      const isPast = doseDate < new Date(today.setHours(0,0,0,0));

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
    <div className="dog-bite-container">
        <div className="db-header">
            <span className="back-arrow" onClick={() => window.history.back()}>←</span>
            <h2>Rabies PEP Schedule</h2>
        </div>

      <div className="date-picker-card">
        <label htmlFor="bite-date">Date of Bite (Day 0):</label>
        <div className='date-picker-input'>
        <input
          type="date" 
          id="bite-date" 
          value={biteDate} 
          onChange={(e) => setBiteDate(e.target.value)}
        />
        </div>
      </div>

      <div className="schedule-list">
        {schedule.map((item) => (
          <div key={item.doseNum} className={`schedule-item ${item.status}-dose`}>
            <div className="dose-number-badge">
                <span>{item.doseNum}</span>
            </div>
            <div className="dose-info">
                <div className="dose-title">Day {item.dayOffset}</div>
                <div className="dose-date">{item.date}</div>
            </div>
            <div className="dose-weekday">{item.weekday}</div>
            {item.isToday && <div className="today-marker"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
