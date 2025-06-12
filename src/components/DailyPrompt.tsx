import React, { useState, useEffect } from 'react';

const WRITING_PROMPTS = [
  "Write about a memory triggered by a smell from your childhood.",
  "Describe a stranger you saw today as if they were the protagonist of a novel.",
  "What would your room say about you if it could speak?",
  "Write about the last time you felt genuinely surprised.",
  "Describe a mundane object as if you're seeing it for the first time.",
  "What conversation do you wish you'd had?",
  "Write about a place that no longer exists.",
  "Describe the texture of an emotion.",
  "What does silence sound like in different places?",
  "Write about something you've lost and where it might be now.",
  "Describe a ritual you didn't know you had.",
  "What story does your favorite piece of clothing tell?",
  "Write about the space between two heartbeats.",
  "Describe the color of a feeling without naming the feeling.",
  "What would your younger self think of you now?",
  "Write about a door you're afraid to open.",
  "Describe the taste of a word.",
  "What happens in the moments just before sleep?",
  "Write about an apology you never received.",
  "Describe home without mentioning any place.",
];

export const DailyPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasUsedToday, setHasUsedToday] = useState(false);

  useEffect(() => {
    // Get today's date
    const today = new Date().toDateString();
    const lastPromptDate = localStorage.getItem('lastPromptDate');
    const lastPromptUsed = localStorage.getItem('lastPromptUsed') === 'true';

    // Check if we need a new prompt
    if (lastPromptDate !== today) {
      // New day, new prompt
      const dayOfYear = getDayOfYear();
      const promptIndex = dayOfYear % WRITING_PROMPTS.length;
      setPrompt(WRITING_PROMPTS[promptIndex]);
      setIsVisible(true);
      setHasUsedToday(false);
      localStorage.setItem('lastPromptDate', today);
      localStorage.setItem('lastPromptUsed', 'false');
    } else if (!lastPromptUsed) {
      // Same day, but prompt hasn't been used yet
      const dayOfYear = getDayOfYear();
      const promptIndex = dayOfYear % WRITING_PROMPTS.length;
      setPrompt(WRITING_PROMPTS[promptIndex]);
      setIsVisible(true);
      setHasUsedToday(false);
    }
  }, []);

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const handleUsePrompt = () => {
    // Copy prompt to clipboard
    navigator.clipboard.writeText(prompt);
    
    // Mark as used
    localStorage.setItem('lastPromptUsed', 'true');
    setHasUsedToday(true);
    
    // Hide after a delay
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="daily-prompt">
      <div className="prompt-header">
        <span className="prompt-icon">✨</span>
        <span>Today's Writing Prompt</span>
      </div>
      
      <p className="prompt-text">
        {prompt}
      </p>
      
      <div className="prompt-actions">
        {!hasUsedToday ? (
          <div className="prompt-action" onClick={handleUsePrompt}>
            <span>Use this prompt</span>
            <span>→</span>
          </div>
        ) : (
          <div className="prompt-success">
            <span>✓ Copied to clipboard!</span>
          </div>
        )}
        
        <button 
          className="prompt-dismiss"
          onClick={handleDismiss}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 