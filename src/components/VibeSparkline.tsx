import React, { useEffect, useRef } from 'react';
import { VibeRecord } from '@/types';

interface VibeSparklineProps {
  history: VibeRecord[];
}

export const VibeSparkline: React.FC<VibeSparklineProps> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the sparkline whenever history changes
  useEffect(() => {
    if (!canvasRef.current || history.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get the scores (max 10)
    const scores = history.slice(0, 10).map((record) => record.score).reverse();
    
    // Set up the drawing parameters
    const width = canvas.width;
    const height = canvas.height;
    const padding = 10;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const pointSpacing = scores.length > 1 ? innerWidth / (scores.length - 1) : innerWidth;
    
    // Draw the midline (score 0)
    ctx.beginPath();
    ctx.strokeStyle = '#E5E7EB'; // gray-200
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.moveTo(padding, height / 2);
    ctx.lineTo(width - padding, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Don't draw the line if we only have one point
    if (scores.length <= 1) {
      if (scores.length === 1) {
        const y = padding + innerHeight / 2 - scores[0] * (innerHeight / 2);
        ctx.beginPath();
        ctx.arc(width / 2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = scores[0] >= 0 ? '#48BB78' : '#E53E3E';
        ctx.fill();
      }
      return;
    }
    
    // Draw the line connecting points
    ctx.beginPath();
    ctx.strokeStyle = '#38B2AC'; // primary
    ctx.lineWidth = 2;
    
    scores.forEach((score, index) => {
      // Convert score (-1 to 1) to y coordinate
      // -1 is at the bottom, 1 is at the top
      const x = padding + index * pointSpacing;
      const y = padding + innerHeight / 2 - score * (innerHeight / 2);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    scores.forEach((score, index) => {
      const x = padding + index * pointSpacing;
      const y = padding + innerHeight / 2 - score * (innerHeight / 2);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = score >= 0 ? '#48BB78' : '#E53E3E'; // positive or negative color
      ctx.fill();
    });
  }, [history]);
  
  return (
    <div className="mt-4">
      <h3 className="font-medium text-sm text-gray-600 mb-1">Vibe History</h3>
      <canvas ref={canvasRef} className="sparkline" width="300" height="56" />
    </div>
  );
}; 