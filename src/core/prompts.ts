/**
 * Prompt templates for the ACE framework components.
 * 
 * These prompts are based on research from Stanford/SambaNova on
 * Agentic Context Engineering for improved LLM performance.
 */

/**
 * System prompt template for the Generator component.
 * Includes playbook bullets as context and instructions for tracking.
 */
export const GENERATOR_SYSTEM_PROMPT = `You are an AI assistant helping with various tasks. Use the following guidelines from your playbook to provide better assistance:

{bullets}

IMPORTANT INSTRUCTIONS:
1. Follow the guidelines above when relevant to the user's query
2. At the end of your response, add a section called "BULLET TRACKING:"
3. In that section, list any guidelines that were:
   - HELPFUL: Mark with #helpful-[bullet_id] 
   - NOT APPLICABLE or HARMFUL: Mark with #harmful-[bullet_id]

Example bullet tracking:
BULLET TRACKING:
#helpful-abc123 - This guideline about code structure was very relevant
#harmful-def456 - This guideline about testing wasn't applicable here

Provide your response naturally, then add the bullet tracking section.`;

/**
 * Prompt template for the Reflector component.
 * Analyzes trajectories to extract insights and lessons.
 */
export const REFLECTOR_ANALYSIS_PROMPT = `Analyze the following interaction between a user and an AI assistant to extract insights that could improve future interactions.

TRAJECTORY:
Query: {query}
Response: {response}
Bullets Used: {bullets_used}
Bullets Helpful: {bullets_helpful}
Bullets Harmful: {bullets_harmful}

Your task is to identify patterns, lessons learned, and actionable insights from this interaction. Focus on:

1. What worked well in the response?
2. What could have been improved?
3. Are there missing guidelines that would have helped?
4. Are there existing guidelines that proved unhelpful?

For each insight, provide:
- OBSERVATION: What you noticed in the interaction
- LESSON: The actionable lesson learned
- SUGGESTED_BULLET: A concrete guideline that could be added to the playbook
- CONFIDENCE: Your confidence in this insight (0.0 to 1.0)
- SECTION: Which section this bullet should belong to

Respond in JSON format:
{
  "insights": [
    {
      "observation": "...",
      "lesson": "...",
      "suggested_bullet": "...",
      "confidence": 0.8,
      "section": "Code Generation"
    }
  ],
  "quality_assessment": {
    "overall_quality": 0.7,
    "areas_for_improvement": ["..."],
    "strengths": ["..."]
  }
}`;

/**
 * Prompt for iterative refinement in the Reflector.
 */
export const REFLECTOR_REFINEMENT_PROMPT = `Review and refine the following insights from trajectory analysis:

CURRENT INSIGHTS:
{current_insights}

QUALITY FEEDBACK:
{quality_feedback}

Please improve these insights by:
1. Making them more specific and actionable
2. Removing duplicates or overly similar insights
3. Improving confidence scores based on evidence
4. Ensuring suggested bullets are concrete and useful

Respond with the refined insights in the same JSON format, focusing on quality over quantity.`;

/**
 * Prompt template for the Curator component.
 * Synthesizes insights into delta operations for the playbook.
 */
export const CURATOR_SYNTHESIS_PROMPT = `You are a playbook curator. Your job is to synthesize insights into concrete actions for improving the playbook.

CURRENT PLAYBOOK BULLETS:
{current_bullets}

NEW INSIGHTS TO PROCESS:
{insights}

Your task is to determine what changes should be made to the playbook:

1. ADD: Create new bullets from insights that introduce novel guidance
2. UPDATE: Modify existing bullets that could be improved based on insights  
3. DELETE: Remove bullets that have proven consistently harmful or obsolete

For each insight, consider:
- Is this guidance already covered by an existing bullet?
- Would this insight improve an existing bullet?
- Is this insight actionable and specific enough?
- Does this insight have sufficient confidence to act on?

Respond in JSON format:
{
  "operations": [
    {
      "type": "ADD",
      "bullet": {
        "section": "...",
        "content": "...",
        "metadata": {
          "created": "2025-10-28T00:00:00Z",
          "helpful_count": 0,
          "harmful_count": 0
        }
      }
    },
    {
      "type": "UPDATE", 
      "bulletId": "existing-id",
      "updates": {
        "content": "improved content..."
      }
    },
    {
      "type": "DELETE",
      "bulletId": "obsolete-id"
    }
  ],
  "summary": "Added 2 new bullets about error handling, updated 1 bullet about testing, removed 1 obsolete bullet about deprecated practices.",
  "reasoning": "Detailed explanation of why these changes were made..."
}`;

/**
 * Prompt for duplicate detection in the Curator.
 */
export const CURATOR_DEDUP_PROMPT = `Compare the following bullet content to existing bullets to detect duplicates or very similar content:

NEW BULLET CONTENT:
{new_bullet_content}

EXISTING BULLETS:
{existing_bullets}

Determine if the new bullet is:
1. DUPLICATE: Nearly identical to an existing bullet
2. SIMILAR: Covers similar ground but adds value
3. UNIQUE: Introduces new guidance not covered elsewhere

If DUPLICATE or SIMILAR, identify which existing bullets are related and suggest how to handle the overlap.

Respond in JSON format:
{
  "assessment": "DUPLICATE|SIMILAR|UNIQUE",
  "related_bullets": ["bullet-id-1", "bullet-id-2"],
  "recommendation": "merge|update|keep_separate|discard",
  "reasoning": "Explanation of the assessment and recommendation"
}`;

/**
 * Quality assessment prompt for the Reflector.
 */
export const QUALITY_ASSESSMENT_PROMPT = `Assess the quality of the following insights extracted from a trajectory:

INSIGHTS:
{insights}

Rate each insight on:
1. SPECIFICITY: Is the insight concrete and actionable? (0.0-1.0)
2. RELEVANCE: Is it relevant to the trajectory analyzed? (0.0-1.0)  
3. NOVELTY: Does it provide new information? (0.0-1.0)
4. CONFIDENCE: How confident are you in this insight? (0.0-1.0)

Also provide an overall quality score and suggestions for improvement.

Respond in JSON format:
{
  "insight_scores": [
    {
      "insight_index": 0,
      "specificity": 0.8,
      "relevance": 0.9,
      "novelty": 0.7,
      "confidence": 0.8,
      "overall": 0.8
    }
  ],
  "overall_quality": 0.75,
  "improvement_suggestions": ["Make insight 2 more specific", "..."],
  "should_refine": true
}`;

/**
 * Helper function to format bullets for prompts.
 */
export function formatBulletsForPrompt(bullets: Array<{ id: string; section: string; content: string }>): string {
  if (bullets.length === 0) {
    return "No guidelines available yet.";
  }

  const bulletsBySection = bullets.reduce((acc, bullet) => {
    if (!acc[bullet.section]) {
      acc[bullet.section] = [];
    }
    acc[bullet.section].push(bullet);
    return acc;
  }, {} as Record<string, typeof bullets>);

  let formatted = "";
  for (const [section, sectionBullets] of Object.entries(bulletsBySection)) {
    formatted += `\n## ${section}\n`;
    for (const bullet of sectionBullets) {
      formatted += `- [${bullet.id}] ${bullet.content}\n`;
    }
  }

  return formatted.trim();
}

/**
 * Helper function to extract bullet tracking from LLM response.
 */
export function extractBulletTracking(response: string): { helpful: string[]; harmful: string[] } {
  const helpful: string[] = [];
  const harmful: string[] = [];

  // Look for bullet tracking section
  const trackingMatch = response.match(/BULLET TRACKING:([\s\S]*?)(?:\n\n|$)/i);
  if (!trackingMatch) {
    return { helpful, harmful };
  }

  const trackingSection = trackingMatch[1];

  // Extract helpful bullets
  const helpfulMatches = trackingSection.match(/#helpful-([a-zA-Z0-9-]+)/g);
  if (helpfulMatches) {
    helpful.push(...helpfulMatches.map(match => match.replace('#helpful-', '')));
  }

  // Extract harmful bullets
  const harmfulMatches = trackingSection.match(/#harmful-([a-zA-Z0-9-]+)/g);
  if (harmfulMatches) {
    harmful.push(...harmfulMatches.map(match => match.replace('#harmful-', '')));
  }

  return { helpful, harmful };
}

/**
 * Default ACE configuration values.
 */
export const DEFAULT_ACE_CONFIG = {
  maxPlaybookSize: 1000,
  dedupThreshold: 0.85,
  maxReflectorIterations: 5,
  defaultSections: [
    'Code Generation',
    'Testing',
    'Debugging',
    'Documentation',
    'Error Handling',
    'Performance',
    'Security',
    'Best Practices'
  ]
};
