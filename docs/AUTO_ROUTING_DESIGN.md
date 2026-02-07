# Auto-Routing Logic Design

## Overview

The auto-routing system selects avatars when the user does not manually choose one. It uses semantic relevance scoring, handles debate mode, and ensures deterministic results.

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER PROMPT                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ADMIN OVERRIDE CHECK                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  IF forceAvatarId SET → Return forced avatar immediately            │    │
│  │  IF forceMode SET → Use forced mode for selection                   │    │
│  │  IF disabledAvatarIds SET → Exclude from candidate pool             │    │
│  │  IF domainRestrictions SET → Filter by domain                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: INTENT CLASSIFICATION                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  A. Keyword-based domain scoring                                    │    │
│  │     - Primary keywords: +10 points per match                        │    │
│  │     - Secondary keywords: +5 points per match                       │    │
│  │                                                                     │    │
│  │  B. Question type detection (regex patterns)                        │    │
│  │     - how_to, explain, script, opinion, troubleshoot, compare       │    │
│  │                                                                     │    │
│  │  C. Confidence calculation                                          │    │
│  │     - Base: 0.5                                                     │    │
│  │     - Strong primary signal (≥20): +0.2                             │    │
│  │     - Clear separation from secondary (≥15): +0.15                  │    │
│  │     - Clear question type: +0.1                                     │    │
│  │     - Context alignment: +0.05                                      │    │
│  │                                                                     │    │
│  │  D. LLM enhancement (if confidence < 0.45)                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  OUTPUT: IntentClassification {                                              │
│    primaryDomain, secondaryDomains[], questionType, confidence, keywords[]   │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: AVATAR SCORING                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  For each active avatar:                                            │    │
│  │                                                                     │    │
│  │  1. Eligibility Check                                               │    │
│  │     - Is avatar active?                                             │    │
│  │     - Is avatar in disabled list?                                   │    │
│  │     - Does avatar pass domain restrictions?                         │    │
│  │                                                                     │    │
│  │  2. Domain Match Score (0-60 points)                                │    │
│  │     - Primary domain match: +30                                     │    │
│  │     - Secondary domain match: +15 each                              │    │
│  │     - Partial keyword overlap: +8                                   │    │
│  │                                                                     │    │
│  │  3. Question Type Bonus (0-15 points)                               │    │
│  │     - Specific bonuses per avatar/question type combo               │    │
│  │                                                                     │    │
│  │  4. Priority Bonus (2-20 points)                                    │    │
│  │     - avatar.responsePriority × 2                                   │    │
│  │                                                                     │    │
│  │  5. Context Bonus (-5 to +10 points)                                │    │
│  │     - Recent avatar penalty: -5 (encourage variety)                 │    │
│  │     - Follow-up bonus: +10 (continuity)                             │    │
│  │                                                                     │    │
│  │  6. Admin Adjustment (-20 to +20 points)                            │    │
│  │     - Per-avatar priority adjustments                               │    │
│  │                                                                     │    │
│  │  TOTAL SCORE = Domain + QuestionType + Priority + Context + Admin   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: MODE DETERMINATION                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Priority order:                                                    │    │
│  │  1. User-selected mode (if provided)                                │    │
│  │  2. Admin-forced mode (if set)                                      │    │
│  │  3. Auto-determined based on rules:                                 │    │
│  │                                                                     │    │
│  │  RULE 1: Compare questions → DEBATE                                 │    │
│  │    IF questionType == "compare" AND eligibleAvatars ≥ 2             │    │
│  │                                                                     │    │
│  │  RULE 2: Multiple domains with close scores → MULTI                 │    │
│  │    IF secondaryDomains ≥ 1 AND (top - second) ≤ 15                  │    │
│  │                                                                     │    │
│  │  RULE 3: Opinion questions with close scores → DEBATE               │    │
│  │    IF questionType == "opinion" AND (top - second) ≤ 11.25          │    │
│  │                                                                     │    │
│  │  RULE 4: Very close top 3 → MULTI                                   │    │
│  │    IF (top - second) ≤ 15 AND (second - third) ≤ 15                 │    │
│  │                                                                     │    │
│  │  RULE 5: High confidence → Use suggested mode                       │    │
│  │    IF confidence ≥ 0.85 → Use intent.suggestedMode                  │    │
│  │                                                                     │    │
│  │  DEFAULT: SINGLE                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: AVATAR SELECTION                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  SINGLE MODE:                                                       │    │
│  │    - Select highest scoring avatar                                  │    │
│  │    - If score < 50, use default avatar (if configured)              │    │
│  │                                                                     │    │
│  │  MULTI MODE:                                                        │    │
│  │    - Select avatars within score gap of top (≤15 points)            │    │
│  │    - Maximum: 3 avatars                                             │    │
│  │    - Minimum: 2 avatars (pad if needed)                             │    │
│  │                                                                     │    │
│  │  DEBATE MODE:                                                       │    │
│  │    - Select top 2 avatars                                           │    │
│  │    - PREFER different debate styles (diversity)                     │    │
│  │    - Auto-assign opposing stances based on topic                    │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: DEBATE STANCE ASSIGNMENT (if debate mode)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  1. Analyze topic for polarity indicators:                          │    │
│  │     - "vs", "or", "versus", "compared to"                           │    │
│  │     - "best", "should", "better", "which"                           │    │
│  │                                                                     │    │
│  │  2. Assign stances based on debate style:                           │    │
│  │     - aggressive avatars → CHALLENGER stance                        │    │
│  │     - supportive avatars → ADVOCATE stance                          │    │
│  │     - analytical avatars → EVALUATOR stance                         │    │
│  │     - skeptical avatars → DEVIL'S_ADVOCATE stance                   │    │
│  │                                                                     │    │
│  │  3. Ensure stance diversity:                                        │    │
│  │     - Never assign same stance to both avatars                      │    │
│  │     - Flip second avatar's stance if identical                      │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scoring Formula

### Total Avatar Score

```
TotalScore = DomainScore + QuestionTypeBonus + PriorityBonus + ContextBonus + AdminAdjustment
```

### Component Breakdown

```typescript
// Domain Score (0-60 max)
DomainScore =
  (primaryDomainMatch ? 30 : 0) +
  (secondaryDomainMatches × 15) +
  (partialKeywordOverlaps × 8)

// Question Type Bonus (0-15 max)
QuestionTypeBonus = QUESTION_TYPE_MATRIX[questionType][avatarSlug] || 0

// Priority Bonus (2-20)
PriorityBonus = avatar.responsePriority × 2

// Context Bonus (-5 to +10)
ContextBonus =
  (recentlyResponded ? -5 : 0) +
  (isFollowUpAndSameAvatar ? +10 : 0)

// Admin Adjustment (-20 to +20)
AdminAdjustment = clamp(adminOverrides.priorityAdjustments[avatarId], -20, +20)
```

### Score Ranges

| Component         | Min | Max | Notes                              |
|-------------------|-----|-----|------------------------------------|
| Domain Match      | 0   | 60  | Can have multiple matches          |
| Question Type     | 0   | 15  | Specific avatar/question combos    |
| Priority Bonus    | 2   | 20  | Based on avatar.responsePriority   |
| Context Bonus     | -5  | 10  | Variety vs continuity balance      |
| Admin Adjustment  | -20 | 20  | Manual tuning                      |
| **TOTAL**         | -23 | 125 | Theoretical range                  |

---

## Debate Mode Logic

### Automatic Debate Triggers

```typescript
function shouldTriggerDebate(intent: IntentClassification, scores: AvatarScore[]): boolean {
  // Trigger 1: Explicit comparison question
  if (intent.questionType === "compare") {
    return true;
  }

  // Trigger 2: Opinion question with closely matched avatars
  if (intent.questionType === "opinion") {
    const [first, second] = scores;
    if (first && second && (first.totalScore - second.totalScore) <= 11.25) {
      return true;
    }
  }

  // Trigger 3: Multi-domain question with disagreement potential
  if (intent.secondaryDomains.length >= 1) {
    const domains = [intent.primaryDomain, ...intent.secondaryDomains];
    if (hasContradictoryDomains(domains)) {
      return true;
    }
  }

  return false;
}

function hasContradictoryDomains(domains: Domain[]): boolean {
  // Domains that often have differing perspectives
  const contradictoryPairs = [
    ["sales", "compliance"],      // Revenue vs rules
    ["mindset", "compliance"],    // Emotion vs logic
    ["persuasion", "compliance"], // Influence vs ethics
  ];

  return contradictoryPairs.some(([a, b]) =>
    domains.includes(a) && domains.includes(b)
  );
}
```

### Stance Assignment Algorithm

```typescript
enum DebateStance {
  ADVOCATE = "advocate",           // Supports the proposition
  CHALLENGER = "challenger",       // Challenges the proposition
  EVALUATOR = "evaluator",         // Weighs pros and cons
  DEVILS_ADVOCATE = "devils_advocate" // Questions assumptions
}

function assignDebateStances(
  avatar1: AiAvatar,
  avatar2: AiAvatar,
  topic: string
): [DebateStance, DebateStance] {

  // Map debate styles to natural stances
  const styleToStance: Record<string, DebateStance> = {
    "aggressive": DebateStance.CHALLENGER,
    "supportive": DebateStance.ADVOCATE,
    "analytical": DebateStance.EVALUATOR,
    "skeptical": DebateStance.DEVILS_ADVOCATE,
    "empathetic": DebateStance.ADVOCATE,
    "logical": DebateStance.EVALUATOR,
  };

  let stance1 = styleToStance[avatar1.debateStyle] || DebateStance.EVALUATOR;
  let stance2 = styleToStance[avatar2.debateStyle] || DebateStance.EVALUATOR;

  // Ensure diversity - if same stance, flip second avatar
  if (stance1 === stance2) {
    stance2 = getOppositeStance(stance1);
  }

  return [stance1, stance2];
}

function getOppositeStance(stance: DebateStance): DebateStance {
  const opposites: Record<DebateStance, DebateStance> = {
    [DebateStance.ADVOCATE]: DebateStance.CHALLENGER,
    [DebateStance.CHALLENGER]: DebateStance.ADVOCATE,
    [DebateStance.EVALUATOR]: DebateStance.DEVILS_ADVOCATE,
    [DebateStance.DEVILS_ADVOCATE]: DebateStance.EVALUATOR,
  };
  return opposites[stance];
}
```

---

## Determinism Guarantees

The auto-routing system ensures **deterministic results** given the same inputs:

### 1. Stable Sorting

```typescript
// Always sort by score DESC, then by slug ASC for tie-breaking
scores.sort((a, b) => {
  if (b.totalScore !== a.totalScore) {
    return b.totalScore - a.totalScore; // Higher score first
  }
  return a.avatarSlug.localeCompare(b.avatarSlug); // Alphabetical tie-breaker
});
```

### 2. Tie-Breaking Rules

| Priority | Rule                        | Example                              |
|----------|-----------------------------|--------------------------------------|
| 1        | Higher total score          | 85 > 72                              |
| 2        | Higher domain match score   | 45 domain > 30 domain               |
| 3        | Higher response priority    | priority 9 > priority 7              |
| 4        | Alphabetical slug           | "compliance-specialist" < "sales-closer" |

### 3. Deterministic LLM Fallback

When LLM is used for classification enhancement:
- Temperature is set to 0.3 (low randomness)
- Same prompt always produces same classification
- Fallback to rule-based if LLM unavailable

### 4. Seeded Randomness (when needed)

```typescript
// If any randomness is needed, use seeded PRNG
function seededRandom(seed: string): number {
  // Hash the seed to get deterministic "random" value
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100;
}

// Usage: seededRandom(sessionId + prompt) for consistent results
```

---

## Edge Cases

### 1. Ties (Equal Scores)

```typescript
function handleTies(scores: AvatarScore[]): AvatarScore[] {
  // Already sorted by score, apply secondary sort criteria
  return scores.sort((a, b) => {
    // Primary: total score (already done)
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

    // Secondary: domain match component (prefer better domain fit)
    if (b.breakdown.domainMatch !== a.breakdown.domainMatch) {
      return b.breakdown.domainMatch - a.breakdown.domainMatch;
    }

    // Tertiary: avatar response priority (prefer higher priority avatars)
    // Note: This is already in the score, but raw value breaks ties
    const priorityA = getAvatarPriority(a.avatarId);
    const priorityB = getAvatarPriority(b.avatarId);
    if (priorityB !== priorityA) return priorityB - priorityA;

    // Final: alphabetical by slug (guaranteed unique, always breaks tie)
    return a.avatarSlug.localeCompare(b.avatarSlug);
  });
}
```

### 2. Ambiguous Intent

```typescript
function handleAmbiguousIntent(
  intent: IntentClassification,
  scores: AvatarScore[]
): RoutingDecision {
  // Low confidence + no clear winner
  if (intent.confidence < 0.45) {
    const topScore = scores[0]?.totalScore || 0;
    const secondScore = scores[1]?.totalScore || 0;

    // Very close scores = use multi-mode for diverse perspectives
    if (topScore - secondScore < 10) {
      return {
        mode: "multi",
        selectedAvatars: selectTopN(scores, 2),
        reasoning: "Ambiguous intent - providing multiple perspectives",
      };
    }

    // Has default avatar configured = use it
    if (adminOverrides.defaultAvatar) {
      return {
        mode: "single",
        selectedAvatars: [getAvatar(adminOverrides.defaultAvatar)],
        reasoning: "Low confidence - using default avatar",
      };
    }
  }

  // Proceed with normal routing
  return normalRouting(intent, scores);
}
```

### 3. No Eligible Avatars

```typescript
function handleNoEligibleAvatars(): RoutingDecision {
  // Try relaxing constraints
  const allAvatars = await avatarRegistry.getActiveAvatars();

  if (allAvatars.length === 0) {
    throw new Error("No active avatars available in system");
  }

  // Return highest priority active avatar as fallback
  const fallback = allAvatars.sort((a, b) =>
    b.responsePriority - a.responsePriority
  )[0];

  return {
    mode: "single",
    selectedAvatars: [fallback],
    reasoning: "No eligible avatars for query - using highest priority fallback",
    adminOverrideApplied: false,
  };
}
```

### 4. Admin Override Conflicts

```typescript
function resolveAdminOverrideConflicts(overrides: AdminOverrides): AdminOverrides {
  const resolved = { ...overrides };

  // Conflict: Forced avatar is also disabled
  if (resolved.forceAvatarId &&
      resolved.disabledAvatarIds?.includes(resolved.forceAvatarId)) {
    console.warn("Forced avatar is in disabled list - removing from disabled");
    resolved.disabledAvatarIds = resolved.disabledAvatarIds.filter(
      id => id !== resolved.forceAvatarId
    );
  }

  // Conflict: Domain restriction excludes all avatars
  if (resolved.domainRestrictions) {
    for (const [domain, allowedIds] of Object.entries(resolved.domainRestrictions)) {
      const activeAllowed = allowedIds.filter(
        id => !resolved.disabledAvatarIds?.includes(id)
      );
      if (activeAllowed.length === 0) {
        console.warn(`Domain ${domain} has no allowed avatars - removing restriction`);
        delete resolved.domainRestrictions[domain];
      }
    }
  }

  return resolved;
}
```

### 5. Debate with Incompatible Avatars

```typescript
function validateDebateParticipants(
  avatar1: AiAvatar,
  avatar2: AiAvatar
): boolean {
  // Same avatar cannot debate itself
  if (avatar1.id === avatar2.id) {
    return false;
  }

  // Both avatars must be active
  if (!avatar1.isActive || !avatar2.isActive) {
    return false;
  }

  // Prefer different debate styles (warn if same)
  if (avatar1.debateStyle === avatar2.debateStyle) {
    console.warn("Debate participants have same style - may reduce diversity");
    // Don't fail, just warn
  }

  return true;
}

function findAlternativeDebatePartner(
  primaryAvatar: AiAvatar,
  scores: AvatarScore[]
): AiAvatar | null {
  // Find highest-scoring avatar with different debate style
  for (const score of scores) {
    if (score.avatarId === primaryAvatar.id) continue;
    if (!score.eligible) continue;

    const candidate = await avatarRegistry.getAvatarById(score.avatarId);
    if (candidate && candidate.debateStyle !== primaryAvatar.debateStyle) {
      return candidate;
    }
  }

  // No different style found - return second highest scoring
  const second = scores.find(s => s.avatarId !== primaryAvatar.id && s.eligible);
  return second ? await avatarRegistry.getAvatarById(second.avatarId) : null;
}
```

---

## Pseudocode: Complete Routing Flow

```
FUNCTION autoRoute(prompt, context, userMode, userAvatars):

    // ===== PHASE 1: OVERRIDES =====
    IF adminOverrides.forceAvatarId:
        RETURN forcedAvatarResponse(adminOverrides.forceAvatarId)

    IF userAvatars NOT EMPTY:
        RETURN userSelectedResponse(userAvatars, userMode)

    // ===== PHASE 2: CLASSIFICATION =====
    intent = classifyIntent(prompt, context)

    // ===== PHASE 3: SCORING =====
    avatars = getActiveAvatars()
    scores = []

    FOR EACH avatar IN avatars:
        IF NOT isEligible(avatar, intent):
            CONTINUE

        score = calculateScore(avatar, intent, context)
        scores.APPEND(score)

    // ===== PHASE 4: TIE-BREAKING SORT =====
    SORT scores BY:
        1. totalScore DESC
        2. domainMatch DESC
        3. responsePriority DESC
        4. slug ASC

    // ===== PHASE 5: MODE SELECTION =====
    mode = userMode OR adminOverrides.forceMode OR determineMode(intent, scores)

    // ===== PHASE 6: AVATAR SELECTION =====
    SWITCH mode:
        CASE "single":
            IF scores[0].totalScore < THRESHOLD_MIN:
                selected = [getDefaultAvatar()]
            ELSE:
                selected = [scores[0].avatar]

        CASE "multi":
            threshold = scores[0].totalScore - SCORE_GAP
            selected = scores.FILTER(s => s.totalScore >= threshold).TAKE(3)
            IF selected.LENGTH < 2:
                selected = scores.TAKE(2)

        CASE "debate":
            avatar1 = scores[0].avatar
            avatar2 = findDebatePartner(avatar1, scores)
            stances = assignStances(avatar1, avatar2, prompt)
            selected = [(avatar1, stances[0]), (avatar2, stances[1])]

    // ===== PHASE 7: RETURN =====
    RETURN {
        mode: mode,
        selectedAvatars: selected,
        scores: scores,
        intent: intent,
        reasoning: buildReasoning(...)
    }
```

---

## Testing Scenarios

### Scenario 1: Clear Single Avatar Match
```
Input: "What's the difference between term and whole life insurance?"
Expected:
  - Mode: single
  - Avatar: insurance-expert (highest domain match)
  - Confidence: high (0.85+)
```

### Scenario 2: Multi-Domain Question
```
Input: "I'm struggling with call reluctance but also need help closing"
Expected:
  - Mode: multi
  - Avatars: [mindset-coach, sales-closer]
  - Reasoning: Multiple domains detected
```

### Scenario 3: Debate-Worthy Comparison
```
Input: "Should I focus on building rapport or creating urgency?"
Expected:
  - Mode: debate
  - Avatars: [mindset-coach (ADVOCATE), sales-closer (CHALLENGER)]
  - Stances: Assigned based on debate styles
```

### Scenario 4: Ambiguous Low-Confidence
```
Input: "Help me be better"
Expected:
  - Mode: single (or multi if configured)
  - Avatar: Default avatar OR highest priority
  - Confidence: low (< 0.45)
```

### Scenario 5: Admin Override Active
```
Input: Any question
Admin: forceAvatarId = "compliance-specialist"
Expected:
  - Mode: single
  - Avatar: compliance-specialist
  - Override flag: true
```

---

## Configuration Reference

```typescript
const AUTO_ROUTING_CONFIG = {
  // Scoring weights
  scoring: {
    primaryDomainMatch: 30,
    secondaryDomainMatch: 15,
    partialDomainMatch: 8,
    priorityMultiplier: 2,
    recentAvatarPenalty: -5,
    followUpBonus: 10,
    maxAdminAdjustment: 20,
  },

  // Thresholds
  thresholds: {
    highConfidence: 0.85,
    mediumConfidence: 0.65,
    lowConfidence: 0.45,
    singleModeMinScore: 50,
    multiModeScoreGap: 15,
    debateModeMinScore: 40,
  },

  // Mode limits
  limits: {
    multiModeMaxAvatars: 3,
    multiModeMinAvatars: 2,
    debateMaxTurns: 10,
  },

  // Fallback behavior
  fallback: {
    useDefaultOnLowConfidence: true,
    useMultiOnAmbiguous: true,
    defaultAvatarSlug: "insurance-expert",
  },
};
```
