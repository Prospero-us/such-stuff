import React, { useEffect, useState } from 'react';
import { setVibeVars } from '@/lib/vibeUtils';

interface VibeMeterProps {
  score: number;
  reason?: string;
  isSelection?: boolean;
}

export const VibeMeter: React.FC<VibeMeterProps> = ({ score, reason, isSelection = false }) => {
  const [previousScore, setPreviousScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate position (0-100)
  const position = ((score + 1) / 2) * 100;
  
  // Determine vibe label and color based on score
  const getVibeDetails = () => {
    if (score >= 0.5) return { label: 'Inspiring', color: '#10B981' };
    if (score >= 0.2) return { label: 'Engaging', color: '#3B82F6' };
    if (score >= -0.2) return { label: 'Neutral', color: '#6B7280' };
    if (score >= -0.5) return { label: 'Flat', color: '#F59E0B' };
    return { label: 'Disconnected', color: '#EF4444' };
  };
  
  const { label, color } = getVibeDetails();
  
  // Set CSS variables for vibe-based theming
  useEffect(() => {
    if (!isSelection) {
      setVibeVars(score);
      document.documentElement.style.setProperty('--indicator-color', color);
    }
  }, [score, color, isSelection]);
  
  // Trigger animation when score changes significantly
  useEffect(() => {
    if (Math.abs(score - previousScore) > 0.1) {
      setIsAnimating(true);
      setPreviousScore(score);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [score, previousScore]);
  
  return (
    <div className={`vibe-meter-horizontal ${isSelection ? 'selection-meter' : ''}`}>
      <div className="vibe-meter-top">
        <div className="vibe-meter-info">
          <div className="vibe-meter-score" style={{ color }}>
            {score > 0 ? '+' : ''}{score.toFixed(2)}
          </div>
          <div className="vibe-meter-label">
            {label}
          </div>
        </div>
        
        <div className="vibe-meter-track">
          <div 
            className={`vibe-meter-indicator ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ 
              left: `${position}%`,
              borderColor: color,
              boxShadow: `0 2px 8px ${color}40, 0 1px 3px rgba(0, 0, 0, 0.1)`
            }}
          />
        </div>
      </div>
      
      {reason && reason.trim() && (
        <div className="vibe-meter-reason">
          {reason}
        </div>
      )}
    </div>
  );
}; 