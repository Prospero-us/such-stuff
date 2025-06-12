/**
 * Converts a sentiment score (-1 to +1) to a hue value
 * Green (140) for positive, Red (0) for negative, with blue-gray (240) for neutral
 */
export function scoreToHue(score: number): number {
  return score <= 0 
    ? 240 - (240 * Math.abs(score)) // Map -1..0 to 0..240 (red to blue)
    : 240 - (100 * score);          // Map 0..1 to 240..140 (blue to green)
}

/**
 * Sets the CSS variables for vibe styling based on the score
 */
export const setVibeVars = (score: number, alpha = 0.22) => {
  // Map score from -1...+1 to hue values
  const hue = scoreToHue(score);
  
  // Adjust saturation and lightness based on score intensity
  const saturation = 30 + (25 * Math.abs(score)); // 30-55%
  const lightness = 94 - (9 * Math.abs(score));   // 94-85%
  
  // Set CSS variables
  document.documentElement.style.setProperty('--vibe-h', hue.toString());
  document.documentElement.style.setProperty('--vibe-s', `${saturation}%`);
  document.documentElement.style.setProperty('--vibe-l', `${lightness}%`);
  document.documentElement.style.setProperty('--vibe-alpha', alpha.toString());
}; 