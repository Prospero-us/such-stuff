import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store';

interface WritingPrompt {
  text: string;
  type: 'question' | 'challenge' | 'scenario' | 'technique';
}

const FALLBACK_PROMPTS: WritingPrompt[] = [
  { text: "What sensory detail could make this scene come alive?", type: 'question' },
  { text: "Try writing the next paragraph from a different character's perspective.", type: 'challenge' },
  { text: "What if the opposite of what you just wrote was true?", type: 'question' },
  { text: "Add a surprising twist or revelation in the next sentence.", type: 'challenge' },
  { text: "Describe the emotional atmosphere using only physical sensations.", type: 'technique' },
  { text: "What memory would this moment trigger for your character?", type: 'question' },
  { text: "Write the next paragraph using only short, punchy sentences.", type: 'technique' },
  { text: "Introduce a small conflict or tension, even if subtle.", type: 'challenge' },
  { text: "What's the one detail readers will remember from this scene?", type: 'question' },
  { text: "Connect this moment to a universal human experience.", type: 'technique' }
];

export const WritingSpark: React.FC = () => {
  const { vibe, sessionStats, content } = useEditorStore();
  const [showSpark, setShowSpark] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [lastWritingTime, setLastWritingTime] = useState(Date.now());
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Check if writer might be stuck
  useEffect(() => {
    const checkIfStuck = () => {
      const now = Date.now();
      const timeSinceLastWrite = now - lastWritingTime;
      const isStuck = timeSinceLastWrite > 120000; // 2 minutes of no writing
      const hasLowVibe = vibe && vibe.score < -0.2;
      
      if ((isStuck || hasLowVibe) && !showSpark) {
        generatePrompt();
        setShowSpark(true);
      }
    };

    const interval = setInterval(checkIfStuck, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastWritingTime, vibe, showSpark]);

  // Update last writing time when content changes
  useEffect(() => {
    setLastWritingTime(Date.now());
  }, [content]);

  const generatePrompt = async () => {
    // For now, use fallback prompts
    // In the future, this could call an AI API for context-aware prompts
    const randomPrompt = FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
    setCurrentPrompt(randomPrompt);
  };

  const refreshPrompt = async () => {
    setIsGeneratingPrompt(true);
    await generatePrompt();
    setTimeout(() => setIsGeneratingPrompt(false), 300);
  };

  const dismissSpark = () => {
    setShowSpark(false);
    setCurrentPrompt(null);
  };

  if (!showSpark || !currentPrompt) return null;

  return (
    <div className="writing-spark">
      <div className="spark-header">
        <div className="spark-icon">✨</div>
        <span className="spark-title">Writing Spark</span>
        <button 
          className="spark-close"
          onClick={dismissSpark}
          title="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className={`spark-content ${isGeneratingPrompt ? 'generating' : ''}`}>
        <p className="spark-prompt">{currentPrompt.text}</p>
        <div className="spark-type">{currentPrompt.type}</div>
      </div>

      <button 
        className="spark-refresh"
        onClick={refreshPrompt}
        disabled={isGeneratingPrompt}
        title="Get another prompt"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={isGeneratingPrompt ? 'spinning' : ''}
        >
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        New spark
      </button>
    </div>
  );
}; 