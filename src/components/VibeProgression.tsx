import React, { useEffect, useState, useRef } from 'react';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

interface SentenceVibe {
  text: string;
  score: number;
  delta: number;
  startPos: number;
  endPos: number;
  reason?: string;
}

interface VibeProgressionProps {
  sentences: SentenceVibe[];
  enabled: boolean;
}

export const VibeProgression: React.FC<VibeProgressionProps> = ({ 
  sentences, 
  enabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Draw the vibe progression graph
  useEffect(() => {
    if (!enabled || !canvasRef.current || sentences.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw axis
    ctx.strokeStyle = 'rgba(139, 134, 128, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(10, rect.height / 2);
    ctx.lineTo(rect.width - 10, rect.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Calculate points
    const points: { x: number; y: number; score: number }[] = [];
    const padding = 15;
    const graphWidth = rect.width - padding * 2;
    const graphHeight = rect.height - padding * 2;
    
    sentences.forEach((sentence, index) => {
      const x = padding + (index / Math.max(1, sentences.length - 1)) * graphWidth;
      const y = padding + (1 - (sentence.score + 1) / 2) * graphHeight;
      points.push({ x, y, score: sentence.score });
    });
    
    // Draw gradient fill
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, rect.height / 2);
      points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.lineTo(points[points.length - 1].x, rect.height / 2);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, 'rgba(92, 206, 167, 0.15)');
      gradient.addColorStop(0.5, 'rgba(139, 134, 128, 0.05)');
      gradient.addColorStop(1, 'rgba(228, 132, 107, 0.15)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw smooth curve instead of straight lines
    if (points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#7C63D8';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        const xMid = (points[i].x + points[i - 1].x) / 2;
        const yMid = (points[i].y + points[i - 1].y) / 2;
        const cp1x = (xMid + points[i - 1].x) / 2;
        const cp2x = (xMid + points[i].x) / 2;
        ctx.quadraticCurveTo(cp1x, points[i - 1].y, xMid, yMid);
        ctx.quadraticCurveTo(cp2x, points[i].y, points[i].x, points[i].y);
      }
      
      ctx.stroke();
    }
    
    // Draw points with glow effect
    points.forEach((point, index) => {
      const isHovered = hoveredSentence === index;
      const radius = isHovered ? 6 : 4;
      const color = getVibeColor(point.score);
      
      // Glow effect
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = color + '20';
        ctx.fill();
      }
      
      // Main point
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [enabled, sentences, hoveredSentence]);
  
  const getVibeColor = (score: number): string => {
    if (score >= 0.5) return '#5CCEA7';
    if (score >= 0.2) return '#60A5FA';
    if (score >= -0.2) return '#8B8680';
    if (score >= -0.5) return '#E4846B';
    return '#F87171';
  };
  
  const getDeltaSymbol = (delta: number): string => {
    if (Math.abs(delta) < 0.05) return '→';
    return delta > 0 ? '↑' : '↓';
  };
  
  const getVibeLabel = (score: number): string => {
    if (score >= 0.5) return 'Vibing';
    if (score >= 0.2) return 'Flowing';
    if (score >= -0.2) return 'Steady';
    if (score >= -0.5) return 'Drifting';
    return 'Struggling';
  };
  
  return (
    <>
      {/* Progression Graph */}
      {enabled && (
        <div className="vibe-progression-graph">
          <div className="vibe-graph-title">Emotional Arc</div>
          <div className="vibe-graph-canvas">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const progress = x / rect.width;
                const index = Math.round(progress * Math.max(0, sentences.length - 1));
                if (index >= 0 && index < sentences.length) {
                  setHoveredSentence(index);
                  setShowTooltip(true);
                }
              }}
              onMouseLeave={() => {
                setHoveredSentence(null);
                setShowTooltip(false);
              }}
            />
            
            {/* Tooltip */}
            {showTooltip && hoveredSentence !== null && sentences[hoveredSentence] && (
              <div 
                className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-xs pointer-events-none z-50"
                style={{
                  left: '50%',
                  bottom: '100%',
                  transform: 'translateX(-50%) translateY(-8px)',
                  whiteSpace: 'nowrap'
                }}
              >
                <div className="font-semibold">
                  {getVibeLabel(sentences[hoveredSentence].score)}
                </div>
                <div className="opacity-80">
                  Score: {sentences[hoveredSentence].score.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <div>
                <div className="text-gray-500 uppercase tracking-wider mb-1">Current</div>
                <div className="font-semibold" style={{ color: getVibeColor(sentences[sentences.length - 1]?.score || 0) }}>
                  {getVibeLabel(sentences[sentences.length - 1]?.score || 0)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 uppercase tracking-wider mb-1">Trend</div>
                <div className="font-semibold">
                  {sentences.length > 1 && sentences[sentences.length - 1].delta > 0 ? (
                    <span className="text-green-500">↑ Rising</span>
                  ) : sentences.length > 1 && sentences[sentences.length - 1].delta < 0 ? (
                    <span className="text-orange-500">↓ Falling</span>
                  ) : (
                    <span className="text-gray-500">→ Steady</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 