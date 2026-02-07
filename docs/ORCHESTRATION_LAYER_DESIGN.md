# Agent Orchestration Layer Design

## Overview

The Agent Orchestration Layer is the "core brain" of the Avatar Council system. It receives user prompts and makes intelligent routing decisions about which AI avatar(s) should respond and in what mode.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER PROMPT                                        │
│              "How do I handle the 'I need to think about it' objection?"    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        1. INTENT CLASSIFIER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Domain Detection │  │ Question Type   │  │ Confidence Scoring          │  │
│  │                  │  │                 │  │                             │  │
│  │ • Keyword match  │  │ • Pattern match │  │ • Score dominance           │  │
│  │ • Primary domain │  │ • how_to        │  │ • Domain separation         │  │
│  │ • Secondary      │  │ • explain       │  │ • Question type clarity     │  │
│  │                  │  │ • script        │  │ • Context alignment         │  │
│  │ Result:          │  │ • opinion       │  │                             │  │
│  │ objections (85%) │  │ Result: script  │  │ Result: 0.82 confidence     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                              │
│  Output: IntentClassification {                                              │
│    primaryDomain: "objections",                                              │
│    secondaryDomains: ["sales"],                                              │
│    questionType: "script",                                                   │
│    confidence: 0.82,                                                         │
│    keywords: ["objection", "think about it"],                                │
│    suggestedMode: "single"                                                   │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     2. ADMIN OVERRIDE CHECK                                  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Check for:                                                            │   │
│  │ • forceAvatarId?         → Skip to avatar selection                   │   │
│  │ • forceMode?             → Override mode determination                │   │
│  │ • disabledAvatarIds?     → Remove from candidate pool                 │   │
│  │ • domainRestrictions?    → Filter by domain                           │   │
│  │ • priorityAdjustments?   → Apply in scoring phase                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  If admin override: Jump to final selection with override applied           │
│  Otherwise: Continue to scoring                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        3. AVATAR RANKER                                      │
│                                                                              │
│  For each active avatar, calculate:                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  SCORE = domainMatch + questionTypeMatch + priorityBonus               │ │
│  │        + contextBonus + adminAdjustment                                │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Domain Match (max 60 pts)                                       │  │ │
│  │  │ • Primary domain match: +30                                     │  │ │
│  │  │ • Secondary domain match: +15 each                              │  │ │
│  │  │ • Partial keyword overlap: +8 each                              │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Question Type Match (max 15 pts)                                │  │ │
│  │  │ • Script questions: objection-handler +15, closers +10          │  │ │
│  │  │ • Explain questions: insurance-expert +15                       │  │ │
│  │  │ • Opinion questions: mindset-coach +10, sales-closer +10        │  │ │
│  │  │ • Validate questions: compliance-specialist +15                 │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Priority Bonus (max 20 pts)                                     │  │ │
│  │  │ • avatar.responsePriority × 2                                   │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Context Bonus (±15 pts)                                         │  │ │
│  │  │ • Recent avatar penalty: -5 (encourage variety)                 │  │ │
│  │  │ • Follow-up bonus: +10 (keep context)                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Admin Adjustment (±20 pts)                                      │  │ │
│  │  │ • Per-avatar priority adjustment from admin config              │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Example scores for "think about it" objection:                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Objection Handler:  30+15+16+0+0 = 61  ← Selected                 │   │
│  │ 2. Sales Closer:       15+10+16+0+0 = 41                              │   │
│  │ 3. Wolf Closer:        15+10+12+0+0 = 37                              │   │
│  │ 4. Insurance Expert:   0+0+18+0+0 = 18                                │   │
│  │ 5. Compliance:         0+0+18+0+0 = 18                                │   │
│  │ 6. Mindset Coach:      0+0+14+0+0 = 14                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    4. ROUTING DECISION ENGINE                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    DETERMINISTIC ROUTING RULES                       │    │
│  │                                                                      │    │
│  │  Rule 1: Compare Questions → DEBATE                                  │    │
│  │    IF questionType == "compare" AND eligibleAvatars >= 2             │    │
│  │    THEN mode = "debate"                                              │    │
│  │                                                                      │    │
│  │  Rule 2: Multi-Domain Close Scores → MULTI                           │    │
│  │    IF secondaryDomains.length >= 1                                   │    │
│  │    AND (topScore - secondScore) <= 15                                │    │
│  │    THEN mode = "multi"                                               │    │
│  │                                                                      │    │
│  │  Rule 3: Opinion with Close Scores → DEBATE                          │    │
│  │    IF questionType == "opinion"                                      │    │
│  │    AND (topScore - secondScore) <= 11                                │    │
│  │    THEN mode = "debate"                                              │    │
│  │                                                                      │    │
│  │  Rule 4: Three-Way Tie → MULTI                                       │    │
│  │    IF (topScore - secondScore) <= 15                                 │    │
│  │    AND (secondScore - thirdScore) <= 15                              │    │
│  │    THEN mode = "multi" (up to 3 avatars)                             │    │
│  │                                                                      │    │
│  │  Rule 5: High Confidence → Use Suggested Mode                        │    │
│  │    IF confidence >= 0.85                                             │    │
│  │    THEN mode = intent.suggestedMode                                  │    │
│  │                                                                      │    │
│  │  Rule 6: Default → SINGLE                                            │    │
│  │    ELSE mode = "single"                                              │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  For "think about it" objection example:                                     │
│  - questionType = "script" (not compare)        → Rule 1: No               │
│  - secondaryDomains = ["sales"], gap = 20       → Rule 2: No               │
│  - questionType != "opinion"                    → Rule 3: No               │
│  - gap > 15                                     → Rule 4: No               │
│  - confidence = 0.82 < 0.85                     → Rule 5: No               │
│  - Default                                      → Rule 6: SINGLE           │
│                                                                              │
│  Result: mode = "single", selectedAvatar = Objection Handler                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROUTING DECISION                                    │
│  {                                                                           │
│    mode: "single",                                                           │
│    selectedAvatars: [ObjectionHandler],                                      │
│    scores: [...],                                                            │
│    intent: {...},                                                            │
│    reasoning: "Intent: objections (script). Confidence: 82%.                 │
│                Top candidates: Objection Handler(61), Sales Closer(41).      │
│                Mode: single. Selected: Objection Handler."                   │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Intent Classification Strategy

### Domain Detection

The system detects 7 domains with keyword-based scoring:

| Domain | Primary Keywords (10 pts each) | Secondary Keywords (5 pts each) |
|--------|-------------------------------|--------------------------------|
| **insurance** | policy, coverage, underwriting, premium, beneficiary, term life, whole life, iul, final expense, death benefit, cash value, rider | insurance, carrier, product, illustration, face amount |
| **sales** | close, closing, sale, selling, prospect, presentation, deal, pipeline, follow up, appointment, pitch | client, customer, meeting, call, lead, convert |
| **compliance** | compliance, regulation, finra, sec, hipaa, license, audit, documentation, suitability, disclosure | legal, requirement, rule, law, state, ethics |
| **mindset** | motivation, mindset, confidence, fear, reluctance, rejection, burnout, struggle, overwhelm | goal, success, believe, focus, energy, mental |
| **persuasion** | persuade, influence, tonality, straight line, certainty, rapport, convince, belfort | trust, connection, psychology, technique, control |
| **objections** | objection, rebuttal, overcome, handle, think about it, spouse, too expensive | pushback, concern, hesitation, resistance, stall |
| **general** | (fallback when no matches) | |

### Question Type Detection

Pattern-based detection for 8 question types:

| Type | Patterns | Best Suited Avatars |
|------|----------|---------------------|
| **how_to** | "how do I", "what's the way to", "steps to", "walk me through" | Insurance Expert, Compliance |
| **explain** | "what is", "explain", "why does", "tell me about" | Insurance Expert |
| **script** | "what do I say", "give me a script", "exact words" | Objection Handler, Closers |
| **opinion** | "what do you think", "should I", "best approach" | Mindset Coach, Sales Closer |
| **troubleshoot** | "not working", "having trouble", "what am I doing wrong" | Mindset Coach, Objection Handler |
| **compare** | "compare", "versus", "which is better" | Any (debate mode) |
| **validate** | "is this right", "am I correct", "confirm" | Compliance Specialist |
| **general** | (fallback) | Based on domain |

### Confidence Calculation

```
Base confidence: 0.5

+ 0.2  if primary domain score >= 20
+ 0.1  if primary domain score >= 10
+ 0.15 if (primary - secondary) domain gap >= 15
+ 0.08 if domain gap >= 10
+ 0.1  if question type detected (not general)
+ 0.05 if context aligns with recent domains
───────
Max: 1.0
```

---

## 2. Avatar Ranking and Selection Logic

### Scoring Formula

```
TOTAL_SCORE =
    domainMatch          (0-60 points)
  + questionTypeMatch    (0-15 points)
  + priorityBonus        (0-20 points)
  + contextBonus         (-5 to +10 points)
  + adminAdjustment      (-20 to +20 points)
```

### Score Breakdown

#### Domain Match (max 60 pts)
- Primary domain expertise match: **+30 pts**
- Secondary domain match: **+15 pts** each
- Partial keyword overlap: **+8 pts** each

#### Question Type Match (max 15 pts)
| Question Type | Avatar Bonuses |
|---------------|----------------|
| script | objection-handler: +15, sales-closer: +10, wolf-closer: +10 |
| how_to | insurance-expert: +10, compliance-specialist: +10 |
| explain | insurance-expert: +15, compliance-specialist: +10 |
| opinion | mindset-coach: +10, sales-closer: +10 |
| troubleshoot | mindset-coach: +10, objection-handler: +10 |
| compare | insurance-expert: +10 |
| validate | compliance-specialist: +15, insurance-expert: +10 |

#### Priority Bonus (max 20 pts)
```
bonus = avatar.responsePriority × 2
```
Each avatar has a priority 1-10, so this yields 2-20 points.

#### Context Bonus (±15 pts)
- Avatar just responded: **-5 pts** (encourage variety)
- Follow-up question, same avatar: **+10 pts** (maintain context)

---

## 3. Deterministic Routing Rules

The mode selection follows strict, deterministic rules evaluated in order:

### Rule Priority Order

```python
def determine_mode(intent, scores):
    # Rule 1: Compare questions → Debate
    if intent.questionType == "compare" and len(eligible_avatars) >= 2:
        return "debate"

    # Rule 2: Multi-domain with close scores → Multi
    if len(intent.secondaryDomains) >= 1:
        if (top_score - second_score) <= 15:
            return "multi"

    # Rule 3: Opinion with close scores → Debate
    if intent.questionType == "opinion":
        if (top_score - second_score) <= 11:
            return "debate"

    # Rule 4: Three-way tie → Multi
    if (top_score - second_score) <= 15 and (second_score - third_score) <= 15:
        return "multi"

    # Rule 5: High confidence → Use suggested
    if intent.confidence >= 0.85:
        return intent.suggestedMode

    # Rule 6: Default → Single
    return "single"
```

### Avatar Selection by Mode

| Mode | Selection Logic |
|------|-----------------|
| **single** | Top scoring avatar (if score >= 50) or default avatar |
| **multi** | All avatars within 15 points of top score (max 3, min 2) |
| **debate** | Top 2 avatars, preferring different debate styles |

---

## 4. Admin Override Controls

### Available Overrides

```typescript
interface AdminOverrides {
  // Force a specific avatar (bypasses all scoring)
  forceAvatarId?: string;

  // Force a specific mode
  forceMode?: "single" | "multi" | "debate";

  // Disable specific avatars
  disabledAvatarIds?: string[];

  // Restrict domains to specific avatars only
  domainRestrictions?: {
    [domain: string]: string[];  // e.g., "compliance": ["compliance-specialist-id"]
  };

  // Adjust avatar priorities (+/- 20 points max)
  priorityAdjustments?: {
    [avatarId: string]: number;
  };

  // Minimum confidence for auto-routing
  minConfidenceThreshold?: number;

  // Fallback when confidence is too low
  defaultAvatar?: string;
}
```

### Override Precedence

1. **Force Avatar** - Completely bypasses scoring, always uses specified avatar
2. **Force Mode** - Uses scoring but overrides mode determination
3. **Domain Restrictions** - Filters avatar pool before scoring
4. **Disabled Avatars** - Removes from candidate pool
5. **Priority Adjustments** - Applied during scoring phase
6. **Default Avatar** - Used when score/confidence is too low

### Admin API Endpoints

```
POST /api/avatar-council/admin/overrides
PUT  /api/avatar-council/admin/overrides
GET  /api/avatar-council/admin/overrides
DELETE /api/avatar-council/admin/overrides

// Per-avatar adjustments
PUT /api/avatar-council/admin/avatars/:id/priority-adjustment
PUT /api/avatar-council/admin/avatars/:id/disable
PUT /api/avatar-council/admin/avatars/:id/enable
```

---

## 5. Example Routing Scenarios

### Scenario 1: Clear Single-Domain Question

**Prompt:** "What's the difference between term and whole life insurance?"

```
Intent Classification:
  - Primary Domain: insurance (score: 35)
  - Secondary Domains: []
  - Question Type: explain
  - Confidence: 0.88

Avatar Scores:
  1. Insurance Expert: 30+15+18+0+0 = 63
  2. Compliance Specialist: 15+10+18+0+0 = 43
  3. Sales Closer: 0+0+16+0+0 = 16

Routing Decision:
  - Rule 5 applies (confidence >= 0.85)
  - Suggested mode: single
  - Result: Single mode, Insurance Expert
```

### Scenario 2: Multi-Domain Question

**Prompt:** "How do I close a client who has compliance concerns about the product?"

```
Intent Classification:
  - Primary Domain: sales (score: 20)
  - Secondary Domains: [compliance]
  - Question Type: how_to
  - Confidence: 0.72

Avatar Scores:
  1. Sales Closer: 30+0+16+0+0 = 46
  2. Compliance Specialist: 15+10+18+0+0 = 43
  3. Wolf Closer: 15+0+12+0+0 = 27

Routing Decision:
  - Rule 2 applies (secondary domains, gap = 3)
  - Result: Multi mode, [Sales Closer, Compliance Specialist]
```

### Scenario 3: Debate Trigger

**Prompt:** "What's better for building long-term client relationships - the straight line approach or a more consultative style?"

```
Intent Classification:
  - Primary Domain: persuasion (score: 15)
  - Secondary Domains: [sales]
  - Question Type: compare
  - Confidence: 0.78

Avatar Scores:
  1. Wolf Closer: 30+0+12+0+0 = 42
  2. Sales Closer: 15+0+16+0+0 = 31
  3. Mindset Coach: 0+0+14+0+0 = 14

Routing Decision:
  - Rule 1 applies (compare question)
  - Result: Debate mode, [Wolf Closer, Sales Closer]
```

### Scenario 4: Admin Override

**Admin Config:**
```json
{
  "domainRestrictions": {
    "compliance": ["compliance-specialist-id"]
  }
}
```

**Prompt:** "Is this marketing piece compliant with state regulations?"

```
Intent Classification:
  - Primary Domain: compliance
  - Question Type: validate
  - Confidence: 0.90

Avatar Selection:
  - Domain restriction active for "compliance"
  - Only Compliance Specialist eligible
  - Result: Single mode, Compliance Specialist
```

---

## 6. Conversation Context Handling

### Context Building

```typescript
interface ConversationContext {
  recentDomains: Domain[];       // Last 3 domains discussed
  recentAvatarIds: string[];     // Last 3 avatars that responded
  messageCount: number;          // Total messages in session
  isFollowUp: boolean;           // Detected follow-up question
}
```

### Follow-Up Detection

A question is considered a follow-up if:
- Starts with connectors: "and", "also", "what about", "but", "okay"
- Starts with continuation phrases: "can you also", "could you explain"
- Is very short (≤5 words)
- References previous content: "that", "this", "it"

### Context Impact on Scoring

| Situation | Score Adjustment |
|-----------|------------------|
| Same avatar just responded | -5 points (variety) |
| Follow-up, same avatar | +10 points (context) |
| Domain matches recent | +5% confidence |

---

## 7. Low Confidence Fallback

When confidence < 0.45:

1. **LLM Enhancement**: Use LLM to reclassify (if available)
2. **Default Avatar**: Route to `adminOverrides.defaultAvatar`
3. **Highest Priority**: Use avatar with highest `responsePriority`
4. **First Active**: Use first active avatar alphabetically

---

## 8. Performance Considerations

### Caching Strategy

- Domain keyword index: Built once at startup
- Avatar expertise index: Rebuilt when avatars change
- Recent routing decisions: LRU cache (100 entries, 5 min TTL)

### Response Time Targets

| Operation | Target |
|-----------|--------|
| Intent classification | < 10ms (rule-based) |
| LLM enhancement | < 500ms (when needed) |
| Avatar scoring | < 5ms |
| Mode determination | < 1ms |
| Total routing | < 20ms typical, < 600ms with LLM |

---

## 9. Monitoring and Observability

### Logged Metrics

```typescript
{
  eventType: "routing_decision",
  sessionId: string,
  intent: IntentClassification,
  scores: AvatarScore[],
  finalMode: ResponseMode,
  selectedAvatars: string[],
  adminOverrideApplied: boolean,
  latencyMs: number,
  timestamp: Date
}
```

### Alerts

- High percentage of low-confidence classifications
- Single avatar receiving > 50% of traffic
- Routing latency exceeding thresholds
- Admin override usage patterns

---

## 10. Future Enhancements

1. **Machine Learning Model**: Train on routing outcomes to improve classification
2. **User Feedback Loop**: Learn from user satisfaction ratings
3. **A/B Testing**: Test different routing strategies
4. **Personalization**: Learn user preferences over time
5. **Semantic Search**: Vector-based intent matching
