import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store';

export const WritingStreak: React.FC = () => {
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { content } = useEditorStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  useEffect(() => {
    // Check if user has written enough today (at least 100 words)
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount >= 100) {
      markTodayAsWritten();
    }
  }, [content]);

  const checkAndUpdateStreak = () => {
    const today = new Date().toDateString();
    const streakData = getStreakData();
    
    // Check if yesterday was written
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (streakData.lastWrittenDate === today) {
      // Already written today
      setStreak(streakData.currentStreak);
    } else if (streakData.lastWrittenDate === yesterdayString) {
      // Streak continues from yesterday
      setStreak(streakData.currentStreak);
    } else if (streakData.lastWrittenDate) {
      // Streak broken
      setStreak(0);
      updateStreakData(0, null);
    } else {
      // First time
      setStreak(0);
    }
  };

  const markTodayAsWritten = () => {
    const today = new Date().toDateString();
    const streakData = getStreakData();
    
    if (streakData.lastWrittenDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      let newStreak = 1;
      if (streakData.lastWrittenDate === yesterdayString) {
        // Continuing streak
        newStreak = streakData.currentStreak + 1;
        
        // Celebrate milestones
        if ([3, 7, 14, 30, 50, 100].includes(newStreak)) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      }
      
      setStreak(newStreak);
      updateStreakData(newStreak, today);
    }
  };

  const getStreakData = () => {
    const data = localStorage.getItem('writingStreak');
    if (data) {
      return JSON.parse(data);
    }
    return { currentStreak: 0, lastWrittenDate: null };
  };

  const updateStreakData = (streak: number, date: string | null) => {
    localStorage.setItem('writingStreak', JSON.stringify({
      currentStreak: streak,
      lastWrittenDate: date
    }));
  };

  if (streak === 0) return null;

  return (
    <>
      <div className={`writing-streak ${showCelebration ? 'celebrating' : ''}`}>
        <span className="streak-icon">🔥</span>
        <span className="streak-number">{streak}</span>
        <span className="streak-label">day{streak > 1 ? 's' : ''}</span>
      </div>
      
      {showCelebration && (
        <div className="streak-celebration">
          <div className="celebration-content">
            <span className="celebration-emoji">🎉</span>
            <h3>{streak} Day Streak!</h3>
            <p>You're on fire! Keep the momentum going.</p>
          </div>
        </div>
      )}
    </>
  );
}; 