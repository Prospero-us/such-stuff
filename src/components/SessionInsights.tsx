import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store';

export const SessionInsights: React.FC = () => {
  const { sessionStats, vibe, vibeHistory } = useEditorStore();
  const [showInsights, setShowInsights] = useState(false);
  const [flowMinutes, setFlowMinutes] = useState(0);

  useEffect(() => {
    if (!sessionStats) return;

    // Calculate flow time (time spent with vibe > 0.2)
    let flowTime = 0;
    const now = new Date();
    const sessionDuration = (now.getTime() - sessionStats.startTime.getTime()) / 1000 / 60; // in minutes

    if (vibe && vibe.score > 0.2) {
      // Currently in flow
      flowTime = sessionStats.flowDuration + 1;
    } else {
      flowTime = sessionStats.flowDuration;
    }

    setFlowMinutes(Math.round(flowTime));

    // Show insights if session is at least 5 minutes old
    if (sessionDuration >= 5 && !showInsights) {
      setShowInsights(true);
    }
  }, [sessionStats, vibe, showInsights]);

  if (!sessionStats || !showInsights) return null;

  const getSessionDuration = () => {
    const now = sessionStats.endTime || new Date();
    const duration = (now.getTime() - sessionStats.startTime.getTime()) / 1000 / 60;
    return Math.round(duration);
  };

  const getAverageVibe = () => {
    if (vibeHistory.length === 0) return '0';
    const sum = vibeHistory.reduce((acc, record) => acc + record.score, 0);
    return (sum / vibeHistory.length).toFixed(2);
  };

  const getVibeEmoji = (score: number) => {
    if (score >= 0.5) return '🔥';
    if (score >= 0.2) return '✨';
    if (score >= -0.2) return '😐';
    if (score >= -0.5) return '😔';
    return '💤';
  };

  const getFlowPercentage = () => {
    const duration = getSessionDuration();
    if (duration === 0) return 0;
    return Math.round((flowMinutes / duration) * 100);
  };

  return (
    <div className={`session-insights ${showInsights ? 'show' : ''}`}>
      <button 
        className="insights-close"
        onClick={() => setShowInsights(false)}
        title="Close insights"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <h3 className="insights-title">Session Insights</h3>
      
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">⏱️</div>
          <div className="insight-value">{getSessionDuration()}</div>
          <div className="insight-label">minutes writing</div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">📝</div>
          <div className="insight-value">
            {sessionStats.wordCount > 0 
              ? `+${sessionStats.wordCount}` 
              : sessionStats.wordCount}
          </div>
          <div className="insight-label">words added</div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">{getVibeEmoji(parseFloat(getAverageVibe()))}</div>
          <div className="insight-value">{getAverageVibe()}</div>
          <div className="insight-label">average vibe</div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🌊</div>
          <div className="insight-value">{getFlowPercentage()}%</div>
          <div className="insight-label">time in flow</div>
        </div>
      </div>

      <div className="vibe-journey">
        <h4>Your Vibe Journey</h4>
        <div className="vibe-graph">
          <svg viewBox="0 0 300 100" className="vibe-sparkline-large">
            {vibeHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#vibeGradient)"
                strokeWidth="2"
                points={vibeHistory
                  .slice(-30) // Show last 30 points
                  .map((record, i, arr) => {
                    const x = (i / (arr.length - 1)) * 280 + 10;
                    const y = 50 - (record.score * 40); // Scale -1 to 1 into 90 to 10
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
            <defs>
              <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {flowMinutes > 10 && (
        <div className="flow-achievement">
          <span className="achievement-icon">🏆</span>
          <span className="achievement-text">
            {flowMinutes} minutes in flow state! Keep it up!
          </span>
        </div>
      )}
    </div>
  );
}; 