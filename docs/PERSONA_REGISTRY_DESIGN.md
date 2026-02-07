# Persona Registry Design

## Overview

The Persona Registry is a **fully data-driven system** for managing AI avatar definitions. All avatar behavior is defined through structured data - no hardcoded logic determines how personas behave.

## Design Principles

1. **Expandable** - Add new avatars by creating data records, not code changes
2. **Data-Driven** - All behavior emerges from persona definition fields
3. **Configurable** - Admins can modify personas at runtime
4. **Versioned** - Track changes to persona definitions over time
5. **Validated** - All definitions pass Zod schema validation

---

## Persona Definition Schema

```typescript
interface PersonaDefinition {
  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════════════════════════════════════════
  id: string;                         // UUID
  name: string;                       // Display name
  slug: string;                       // URL-safe identifier
  tagline: string;                    // Short description for UI

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERTISE
  // ═══════════════════════════════════════════════════════════════════════════
  domain_expertise: string[];         // Primary knowledge areas
  secondary_expertise?: string[];     // Related areas
  expertise_level: Record<string, number>; // Domain → proficiency (1-10)

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMUNICATION STYLE
  // ═══════════════════════════════════════════════════════════════════════════
  speaking_style: string;             // Prose description of voice
  debate_style: DebateStyle;          // How they approach debates
  default_tone: ResponseTone;         // Default emotional register
  vocabulary_level: VocabularyLevel;  // Complexity of language

  // ═══════════════════════════════════════════════════════════════════════════
  // BEHAVIORAL PARAMETERS
  // ═══════════════════════════════════════════════════════════════════════════
  response_priority: number;          // Selection weight (1-10)
  confidence_level: number;           // Certainty in responses (1-10)
  verbosity: Verbosity;               // Response length preference
  uses_examples: boolean;             // Includes concrete examples
  uses_scripts: boolean;              // Provides word-for-word language
  uses_analogies: boolean;            // Uses comparisons/metaphors

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPT COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  system_prompt: string;              // Main instruction set
  persona_context: string;            // Background/character info
  response_guidelines: string[];      // Positive behaviors
  prohibited_behaviors: string[];     // Negative behaviors (never do)

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBATE BEHAVIOR
  // ═══════════════════════════════════════════════════════════════════════════
  debate_opening_style: string;       // How they open arguments
  debate_rebuttal_style: string;      // How they counter opponents
  debate_closing_style: string;       // How they conclude

  // ═══════════════════════════════════════════════════════════════════════════
  // RESPONSE TEMPLATES (Optional)
  // ═══════════════════════════════════════════════════════════════════════════
  response_templates?: {
    greeting?: string;
    objection_response?: string;
    script_format?: string;
    closing?: string;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════════════════
  version: string;                    // Semantic version
  created_at: string;                 // ISO timestamp
  updated_at: string;                 // ISO timestamp
  is_active: boolean;                 // Availability flag

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL (For UI)
  // ═══════════════════════════════════════════════════════════════════════════
  avatar_image_url?: string;
  icon_name?: string;                 // Lucide icon identifier
  color_scheme?: {
    primary: string;
    secondary: string;
  };
}
```

---

## Type Definitions

### Debate Styles

| Style | Description | Best For |
|-------|-------------|----------|
| `aggressive` | Direct challenges, high energy, confrontational | Sales, motivation |
| `logical` | Data-driven, methodical, evidence-based | Technical, compliance |
| `skeptical` | Questions assumptions, devil's advocate | Risk assessment |
| `supportive` | Builds on others, finds common ground | Collaboration |
| `analytical` | Deep analysis, breaks down complexity | Underwriting, products |
| `empathetic` | Understanding, emotional intelligence | Mindset, support |

### Response Tones

| Tone | Description |
|------|-------------|
| `professional` | Formal, business-appropriate |
| `casual` | Friendly, conversational |
| `motivational` | Inspiring, action-oriented |
| `urgent` | Time-sensitive, immediate |
| `educational` | Teaching, explaining |
| `conversational` | Natural, flowing dialogue |

### Vocabulary Levels

| Level | Description |
|-------|-------------|
| `simple` | Everyday language, no jargon |
| `moderate` | Some industry terms, explained |
| `technical` | Industry terminology expected |
| `expert` | Deep technical vocabulary |

---

## Default Personas

### 1. Insurance Expert

```
┌─────────────────────────────────────────────────────────────┐
│  INSURANCE EXPERT                                           │
│  "Deep product knowledge for confident client conversations"│
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: insurance, underwriting, policies, products       │
│  DEBATE STYLE: logical                                      │
│  TONE: educational                                          │
│  PRIORITY: 9                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Professional, thorough, educational. Uses terminology      │
│  precisely but explains concepts accessibly.                │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Product comparisons                                      │
│  • Policy mechanics                                         │
│  • Underwriting questions                                   │
│  • Technical education                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Compliance Specialist

```
┌─────────────────────────────────────────────────────────────┐
│  COMPLIANCE SPECIALIST                                      │
│  "Protecting your license and your clients"                 │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: compliance, regulations, licensing, ethics        │
│  DEBATE STYLE: skeptical                                    │
│  TONE: professional                                         │
│  PRIORITY: 9                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Precise, cautious, thorough. Errs on side of compliance.   │
│  Explains the 'why' behind regulations.                     │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Regulatory questions                                     │
│  • Documentation requirements                               │
│  • Suitability concerns                                     │
│  • Advertising compliance                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Sales Closer

```
┌─────────────────────────────────────────────────────────────┐
│  SALES CLOSER                                               │
│  "High-energy techniques that get to YES"                   │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: sales, closing, presentations, prospecting        │
│  DEBATE STYLE: aggressive                                   │
│  TONE: motivational                                         │
│  PRIORITY: 8                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  High-energy, confident, action-oriented. Direct,           │
│  motivational, results-focused. Never passive.              │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Closing techniques                                       │
│  • Trial close scripts                                      │
│  • Urgency creation                                         │
│  • Presentation flow                                        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Persuasion Strategist

```
┌─────────────────────────────────────────────────────────────┐
│  PERSUASION STRATEGIST                                      │
│  "Master the art of ethical influence"                      │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: persuasion, influence, tonality, rapport          │
│  DEBATE STYLE: analytical                                   │
│  TONE: educational                                          │
│  PRIORITY: 7                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Intense, strategic, psychologically sophisticated.         │
│  Breaks down influence into learnable components.           │
│  ⚠️ Inspired by Straight Line Persuasion methodology        │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Building certainty (Three Tens)                          │
│  • Tonality training                                        │
│  • Rapport techniques                                       │
│  • Looping objections                                       │
└─────────────────────────────────────────────────────────────┘
```

### 5. Mindset Coach

```
┌─────────────────────────────────────────────────────────────┐
│  MINDSET COACH                                              │
│  "Your mental game is your edge"                            │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: mindset, motivation, confidence, resilience       │
│  DEBATE STYLE: empathetic                                   │
│  TONE: motivational                                         │
│  PRIORITY: 7                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Warm yet challenging. Like a mentor who's been through     │
│  the trenches. Empathy with accountability.                 │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Call reluctance                                          │
│  • Confidence building                                      │
│  • Burnout prevention                                       │
│  • Goal setting                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6. Objection Handler

```
┌─────────────────────────────────────────────────────────────┐
│  OBJECTION HANDLER                                          │
│  "Turn every NO into a path to YES"                         │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: objections, rebuttals, responses, scripts         │
│  DEBATE STYLE: logical                                      │
│  TONE: conversational                                       │
│  PRIORITY: 8                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Calm, prepared, strategic. Like a chess master who has     │
│  seen every move. Methodical but natural.                   │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • "I need to think about it"                               │
│  • "It's too expensive"                                     │
│  • "I need to talk to my spouse"                            │
│  • All common objections                                    │
└─────────────────────────────────────────────────────────────┘
```

### 7. Underwriting Analyst

```
┌─────────────────────────────────────────────────────────────┐
│  UNDERWRITING ANALYST                                       │
│  "Think like an underwriter, place more cases"              │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: underwriting, medical, risk-assessment            │
│  DEBATE STYLE: analytical                                   │
│  TONE: professional                                         │
│  PRIORITY: 7                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  Analytical, precise, detail-oriented. Thinks               │
│  systematically through risk factors.                       │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Field underwriting                                       │
│  • Impaired risk positioning                                │
│  • Carrier selection                                        │
│  • Medical history analysis                                 │
└─────────────────────────────────────────────────────────────┘
```

### 8. Intensity Coach

```
┌─────────────────────────────────────────────────────────────┐
│  INTENSITY COACH                                            │
│  "No excuses. Maximum effort. Results follow."              │
├─────────────────────────────────────────────────────────────┤
│  DOMAINS: sales, intensity, performance, accountability     │
│  DEBATE STYLE: aggressive                                   │
│  TONE: urgent                                               │
│  PRIORITY: 6                                                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKING STYLE:                                            │
│  INTENSE. Uncompromising. Zero tolerance for excuses.       │
│  Challenges comfort zones. Demands action.                  │
│  ⚠️ Inspired by high-intensity sales training               │
├─────────────────────────────────────────────────────────────┤
│  BEST FOR:                                                  │
│  • Accountability                                           │
│  • Excuse elimination                                       │
│  • Performance push                                         │
│  • Action demands                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## System Prompt Construction

The registry builds complete system prompts by combining persona components:

```
┌─────────────────────────────────────────────────────────────┐
│                    ASSEMBLED SYSTEM PROMPT                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. MAIN SYSTEM PROMPT                                      │
│     └─ persona.system_prompt                                │
│                                                             │
│  2. PERSONA CONTEXT                                         │
│     └─ "---\nPERSONA CONTEXT:\n" + persona.persona_context  │
│                                                             │
│  3. RESPONSE GUIDELINES                                     │
│     └─ "RESPONSE GUIDELINES:\n- guideline1\n- guideline2"   │
│                                                             │
│  4. PROHIBITED BEHAVIORS                                    │
│     └─ "NEVER:\n- prohibition1\n- prohibition2"             │
│                                                             │
│  5. DEBATE INSTRUCTIONS (if mode === "debate")              │
│     ├─ "DEBATE MODE ACTIVE"                                 │
│     ├─ "Topic: [topic]"                                     │
│     ├─ "Your debate style: [style]"                         │
│     └─ Opening/Rebuttal/Closing instructions by turn        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Usage

### Basic Operations

```typescript
import { personaRegistry } from './personaRegistry';

// Get all active personas
const personas = personaRegistry.getActive();

// Get by ID or slug
const expert = personaRegistry.getById('550e8400-...');
const closer = personaRegistry.getBySlug('sales-closer');

// Get summaries for UI
const summaries = personaRegistry.getSummaries();

// Build system prompt for LLM
const prompt = personaRegistry.buildSystemPrompt(personaId, {
  mode: 'debate',
  debateTopic: 'Best closing technique for final expense',
  turnNumber: 2
});
```

### Query Operations

```typescript
// Find by domain expertise
const complianceExperts = personaRegistry.findByDomain('compliance');

// Find by debate style
const aggressivePersonas = personaRegistry.findByDebateStyle('aggressive');

// Get complementary debate partners
const partners = personaRegistry.findDebatePartners(personaId);

// Get ranked by domain expertise
const ranked = personaRegistry.getByPriorityForDomain('sales');
```

### CRUD Operations

```typescript
// Register new persona
personaRegistry.register(newPersonaDefinition);

// Update existing
personaRegistry.update(id, { response_priority: 8 });

// Activate/Deactivate
personaRegistry.activate(id);
personaRegistry.deactivate(id);

// Export/Import
const json = personaRegistry.exportToJSON();
personaRegistry.importFromJSON(json);
```

---

## Adding New Personas

To add a new persona, create a complete `PersonaDefinition` object:

```typescript
const newPersona: PersonaDefinition = {
  id: crypto.randomUUID(),
  name: "Product Specialist",
  slug: "product-specialist",
  tagline: "Deep-dive into any carrier's offerings",

  domain_expertise: ["products", "carriers", "illustrations"],
  expertise_level: {
    products: 10,
    carriers: 9,
    illustrations: 9,
  },

  speaking_style: "Detailed, comparative, carrier-specific...",
  debate_style: "logical",
  default_tone: "educational",
  vocabulary_level: "technical",

  response_priority: 7,
  confidence_level: 8,
  verbosity: "detailed",
  uses_examples: true,
  uses_scripts: false,
  uses_analogies: true,

  system_prompt: `You are the Product Specialist AI...`,
  persona_context: `Background information...`,
  response_guidelines: [
    "Always cite specific carrier names",
    "Include product comparison charts when helpful",
  ],
  prohibited_behaviors: [
    "Never guarantee future product performance",
  ],

  debate_opening_style: "Opens with product facts...",
  debate_rebuttal_style: "Counters with carrier data...",
  debate_closing_style: "Summarizes product fit...",

  version: "1.0.0",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,

  icon_name: "Package",
  color_scheme: { primary: "#8b5cf6", secondary: "#7c3aed" },
};

personaRegistry.register(newPersona);
```

---

## Debate Pairing Logic

The registry can find complementary debate pairs:

```
DEBATE STYLE MATRIX
═══════════════════════════════════════════════════════════════

             aggressive  logical  skeptical  supportive  analytical  empathetic
aggressive      ✗          ✓         ✓          ✓           ✓          ✓
logical         ✓          ✗         ✓          ✓           ✓          ✓
skeptical       ✓          ✓         ✗          ✓           ✓          ✓
supportive      ✓          ✓         ✓          ✗           ✓          ✓
analytical      ✓          ✓         ✓          ✓           ✗          ✓
empathetic      ✓          ✓         ✓          ✓           ✓          ✗

RECOMMENDED PAIRINGS:
• aggressive + empathetic  → Energy vs Understanding
• logical + aggressive     → Data vs Conviction
• skeptical + supportive   → Challenge vs Build
• analytical + empathetic  → Deep-dive vs Human element
```

---

## Validation Schema

All personas are validated with Zod:

```typescript
export const PersonaDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  tagline: z.string().max(200),

  domain_expertise: z.array(z.string()).min(1),
  expertise_level: z.record(z.string(), z.number().min(1).max(10)),

  speaking_style: z.string().min(10),
  debate_style: z.enum([
    "aggressive", "logical", "skeptical",
    "supportive", "analytical", "empathetic"
  ]),
  default_tone: z.enum([
    "professional", "casual", "motivational",
    "urgent", "educational", "conversational"
  ]),
  vocabulary_level: z.enum(["simple", "moderate", "technical", "expert"]),

  response_priority: z.number().min(1).max(10),
  confidence_level: z.number().min(1).max(10),
  verbosity: z.enum(["concise", "moderate", "detailed"]),
  uses_examples: z.boolean(),
  uses_scripts: z.boolean(),
  uses_analogies: z.boolean(),

  system_prompt: z.string().min(100),
  persona_context: z.string(),
  response_guidelines: z.array(z.string()),
  prohibited_behaviors: z.array(z.string()),

  // ... additional fields
});
```

---

## Style Emulation Notice

Several personas are inspired by well-known sales training methodologies:

| Persona | Inspiration | Notice |
|---------|-------------|--------|
| Sales Closer | High-energy closing trainers | Style emulation, not representation |
| Persuasion Strategist | Straight Line Persuasion | Teaching framework, ethical application only |
| Intensity Coach | High-intensity sales coaching | Training approach, not specific individual |

All personas include appropriate disclaimers in their system prompts and are designed for **ethical application only**.

---

## Future Enhancements

1. **Database Storage** - Move from in-memory to PostgreSQL
2. **Version History** - Track all changes with rollback capability
3. **A/B Testing** - Compare persona variants
4. **Analytics** - Track which personas perform best
5. **User Customization** - Let agents favorite/adjust personas
6. **Voice Integration** - Add ElevenLabs voice IDs
7. **Multilingual** - Support system prompts in multiple languages
