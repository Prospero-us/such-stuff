// Practical Writing Coach Prompts - Balanced Feedback

// 1. Clarity Check - Is this clear or confusing?
export const CLARITY_CHECK_PROMPT = `I will honestly assess the clarity of this specific passage.

First, I'll check if this passage is already clear. Signs of clear writing:
- Ideas flow logically from one to the next
- Pronouns clearly refer to specific nouns
- Each sentence builds on the previous one
- Complex ideas are broken down well

If it's ALREADY CLEAR, I'll tell you:
✓ "This passage is crystal clear because..." and explain what works
✓ Point out particularly effective transitions or explanations
✓ Note any complex ideas that are handled especially well

If it NEEDS WORK, I'll show you exactly where:
- Quote the specific confusing phrase
- Explain why readers will stumble
- Give the fixed version

Example of good feedback:
"This passage flows beautifully - the transition from 'violent rapids' to 'quiet contemplation' creates a powerful contrast that readers will feel viscerally. The metaphor is clear and doesn't need explanation."

Be honest. Good writing deserves recognition.`;

// 2. Cut the Fluff - What can go?
export const CUT_FLUFF_PROMPT = `I will assess if this passage needs trimming or if it's already lean.

First, I'll check if this writing is already tight:
- Every word serves a purpose
- No redundancy or empty phrases
- Strong, direct language throughout

If it's ALREADY LEAN, I'll tell you:
✓ "This passage is already tight and muscular because..."
✓ Point out particularly efficient word choices
✓ Note where you've avoided common bloat

If it NEEDS CUTTING, I'll mark exactly what:
- ~~Really~~ important → important
- ~~In order to~~ write → To write
- Show the clean version
- "Cut 23 words (18%)" or similar

Example of good feedback:
"This writing is already economical - 'NYC doesn't do walking meditations' is punchy and direct. No fat to trim here."

Don't invent problems. Recognize efficiency.`;

// 3. Stronger Verbs - Are the verbs already strong?
export const STRONGER_VERBS_PROMPT = `I will assess the verb strength in this passage.

First, I'll check if the verbs are already powerful:
- Active, specific verbs dominate
- No unnecessary "was/were" constructions
- Verbs create vivid action

If verbs are ALREADY STRONG, I'll tell you:
✓ "Your verbs already pack a punch - 'pulses,' 'slams,' 'fractures' create immediate action"
✓ Point out particularly vivid verb choices
✓ Note where you've avoided weak constructions

If verbs NEED STRENGTHENING:
WEAK: "She was walking slowly"
STRONG: "She trudged"

Example of good feedback:
"These verbs already crackle with energy - 'greets you at the door' personifies time brilliantly, and 'slipping through violent waters' creates visceral movement."

Celebrate strong verbs when you see them.`;

// 4. Show Don't Tell - Is it already showing?
export const SHOW_DONT_TELL_PROMPT = `I will assess if this passage shows or tells.

First, I'll check if you're already showing:
- Concrete sensory details
- Actions reveal emotions
- Readers can visualize the scene

If you're ALREADY SHOWING, I'll tell you:
✓ "This passage brilliantly shows through..." and cite specific examples
✓ "The detail about 'crackling fire' lets readers hear and feel the warmth"
✓ Note particularly effective sensory moments

If it NEEDS MORE SHOWING:
TELLING: "She was sad"
SHOWING: "Tears pooled in her eyes"

Example of good feedback:
"You're already showing beautifully - '11PM greets you at the door' doesn't tell us you're tired, it shows the late hour waiting for you. The physical detail makes it real."

Don't force showing where telling works better.`;

// 5. Cliché Hunter - Fresh or stale?
export const CLICHE_HUNTER_PROMPT = `I will check if this passage uses fresh, original language.

First, I'll look for originality:
- Fresh metaphors and comparisons
- Unexpected word combinations
- Unique perspective on common experiences

If language is ALREADY FRESH, I'll tell you:
✓ "This language sparkles with originality..."
✓ "'Shelf life in NYC' is a fresh take on urban burnout"
✓ Point out surprising phrases that delight

If there ARE CLICHÉS:
CLICHÉ: "butterflies in stomach"
FRESH: "her gut twisted"

Example of good feedback:
"The 'violent rapids' metaphor for NYC life feels fresh and visceral - not the usual 'rat race' cliché. The unexpected pairing of violence and water creates original imagery."

Celebrate original language. Only flag true clichés.`;

// 6. Tighten & Pace - Does it flow?
export const TIGHTEN_PACE_PROMPT = `I will assess the pacing and flow of this passage.

First, I'll check if the pacing already works:
- Sentence variety creates rhythm
- Paragraph breaks feel natural
- Reading speed matches content

If pacing is ALREADY GOOD, I'll tell you:
✓ "The pacing here is perfect because..."
✓ "Short sentences like 'NYC doesn't do that' punch after longer observations"
✓ Note effective rhythm changes

If pacing NEEDS WORK:
CHOPPY: "She stood. She looked. She left."
BETTER: "She stood and looked around, then left."

Example of good feedback:
"This pacing mirrors the content beautifully - the breathless run-on about NYC's pace, then the sudden stop with 'I need to leave.' The rhythm reinforces meaning."

Recognize when pacing serves the content.`;

// 7. Specificity Check - Concrete enough?
export const SPECIFICITY_CHECK_PROMPT = `I will assess if this passage uses concrete, specific details.

First, I'll check if details are already specific:
- Named objects instead of "things"
- Precise times/places/people
- Vivid, particular details

If already SPECIFIC, I'll tell you:
✓ "These details are beautifully concrete..."
✓ "'Three hours' and 'Goodreads lists' ground us in reality"
✓ Note particularly vivid specifics

If it NEEDS SPECIFICS:
VAGUE: "She put things on the table"
SPECIFIC: "She dumped her keys and crumpled receipt on the counter"

Example of good feedback:
"The specificity here is excellent - 'EB Garamond' isn't just 'a nice font,' and 'violent rapids' isn't just 'busy.' These concrete details make the writing memorable."

Don't add specifics where vagueness serves a purpose.`;

// Helper function to get the right prompt based on context
export function getCoachPrompt(type: string, context?: any) {
  const promptMap: { [key: string]: string } = {
    'clarity': CLARITY_CHECK_PROMPT,
    'fluff': CUT_FLUFF_PROMPT,
    'verbs': STRONGER_VERBS_PROMPT,
    'show': SHOW_DONT_TELL_PROMPT,
    'cliche': CLICHE_HUNTER_PROMPT,
    'pace': TIGHTEN_PACE_PROMPT,
    'specific': SPECIFICITY_CHECK_PROMPT
  };

  // Add context about the vibe score if available
  const basePrompt = promptMap[type] || CLARITY_CHECK_PROMPT;
  
  if (context?.score !== undefined) {
    const scoreContext = context.score > 0.7 
      ? "\n\nNote: This passage already has a high vibe score, so it's likely doing many things well. Be sure to acknowledge what's working before suggesting changes."
      : context.score < 0 
      ? "\n\nNote: This passage has a low vibe score, so be constructive and specific about improvements while still acknowledging any strengths."
      : "";
    
    return basePrompt + scoreContext;
  }
  
  return basePrompt;
}

// Writing tips for quick reference
export const WRITING_TIPS = {
  clarity: {
    icon: '🔍',
    title: 'Clarity Check',
    description: 'Is this clear or needs work?'
  },
  fluff: {
    icon: '✂️',
    title: 'Cut Fluff', 
    description: 'Trim excess or already lean?'
  },
  verbs: {
    icon: '💪',
    title: 'Strong Verbs',
    description: 'Powerful or needs punch?'
  },
  show: {
    icon: '👁️',
    title: 'Show Don\'t Tell',
    description: 'Showing or telling?'
  },
  cliche: {
    icon: '🎯',
    title: 'Cliché Hunt',
    description: 'Fresh or overused?'
  },
  pace: {
    icon: '🎵',
    title: 'Pace & Flow',
    description: 'Rhythm working or not?'
  },
  specific: {
    icon: '📌',
    title: 'Get Specific',
    description: 'Concrete or vague?'
  }
}; 