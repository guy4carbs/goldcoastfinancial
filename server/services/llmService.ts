import OpenAI from "openai";
import { type AiAvatar } from "@shared/schema";
import { personaRegistry, getSystemPrompt, type PersonaDefinition } from "./personaRegistry";
import {
  type DebatePhaseType,
  type DebateTurn,
  type ComprehensiveDebateSummary,
  DebatePhase,
} from "@shared/models/avatarCouncil";

// =============================================================================
// LLM Service Configuration
// =============================================================================

export interface LLMConfig {
  provider: "openai" | "anthropic";
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  provider: "openai",
  model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  temperature: 0.7,
  maxTokens: 1500,
};

// =============================================================================
// Message Types
// =============================================================================

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullResponse: string, usage: TokenUsage) => void;
  onError: (error: Error) => void;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  latencyMs: number;
}

// =============================================================================
// LLM Service Class
// =============================================================================

class LLMService {
  private openai: OpenAI | null = null;
  private config: LLMConfig = DEFAULT_CONFIG;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize OpenAI client if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("[LLMService] OpenAI client initialized");
    } else {
      console.warn("[LLMService] OPENAI_API_KEY not found - LLM features will be limited");
    }
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  setConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  isAvailable(): boolean {
    return this.openai !== null;
  }

  // ---------------------------------------------------------------------------
  // Build Messages Array
  // ---------------------------------------------------------------------------

  buildMessagesForAvatar(
    avatar: AiAvatar,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    contextChunks: string[] = [],
    mode?: "single" | "multi" | "debate"
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Try to get enhanced system prompt from persona registry
    let systemPrompt: string;

    const persona = personaRegistry.getBySlug(avatar.slug);
    if (persona) {
      // Use persona registry's rich system prompt
      systemPrompt = personaRegistry.buildSystemPrompt(persona.id, { mode });
      console.log(`[LLMService] Using persona registry prompt for ${avatar.slug}`);
    } else {
      // Fall back to avatar's basic system prompt
      systemPrompt = avatar.systemPrompt;
      console.log(`[LLMService] Using avatar system prompt for ${avatar.slug} (no persona found)`);
    }

    // Add RAG context if available
    if (contextChunks.length > 0) {
      systemPrompt += `\n\n---\nRelevant context from knowledge base:\n${contextChunks.join("\n\n")}`;
    }

    messages.push({
      role: "system",
      content: systemPrompt,
    });

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push(msg);
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    return messages;
  }

  buildMessagesForDebate(
    avatar: AiAvatar,
    topic: string,
    previousResponses: Array<{ avatarName: string; content: string }>,
    turnNumber: number,
    otherParticipants?: string[], // Names of other debate participants
    contextChunks: string[] = [] // Knowledge base context for this avatar
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Try to get enhanced system prompt from persona registry
    const persona = personaRegistry.getBySlug(avatar.slug);
    let debatePrompt: string;

    if (persona) {
      // Use persona registry's rich debate system prompt
      debatePrompt = personaRegistry.buildSystemPrompt(persona.id, {
        mode: "debate",
        debateTopic: topic,
        turnNumber,
      });
      console.log(`[LLMService] Using persona registry debate prompt for ${avatar.slug}`);
    } else {
      // Fall back to basic debate prompt
      debatePrompt = `${avatar.systemPrompt}

---
DEBATE MODE INSTRUCTIONS:
You are participating in a debate/discussion with another AI avatar. The topic is: "${topic}"

Your debate style is: ${avatar.debateStyle}
${avatar.debateStyle === "analytical" ? "Be logical, cite evidence, and build structured arguments." : ""}
${avatar.debateStyle === "aggressive" ? "Be confident, challenge opposing views directly, and argue with conviction." : ""}
${avatar.debateStyle === "empathetic" ? "Consider multiple perspectives, find common ground, but still advocate for your position." : ""}

This is turn ${turnNumber} of the debate. Review what has been said and build upon or counter the previous points. Keep your response focused and under 300 words.`;
    }

    // Add CRITICAL conversational style instructions
    const conversationalInstructions = `

---
CRITICAL CONVERSATIONAL STYLE REQUIREMENTS:

You are in a LIVE, FACE-TO-FACE conversation at an executive roundtable. This is NOT a written essay or blog post. This is real human dialogue.

SPEAK NATURALLY:
- Talk like a real person having a conversation, not like you're writing an article
- Use contractions (I'm, we're, don't, can't, that's)
- Start sentences with "Look," "Listen," "Here's the thing," "You know what," etc.
- React emotionally to what others said - show agreement, disagreement, surprise, passion
- Use conversational fillers occasionally ("honestly," "frankly," "to be fair")

ADDRESS OTHERS DIRECTLY:
${otherParticipants && otherParticipants.length > 0 ? `- The other participants are: ${otherParticipants.join(', ')}` : '- Address other speakers by name when responding to their points'}
- Say things like "I hear what you're saying, [Name], but..." or "[Name], that's a great point, and I'd add..."
- Jump in naturally like you would in a real conversation
- Agree or push back on SPECIFIC things others said

NEVER DO THESE:
- NEVER start with "On" followed by a quote - respond directly with your thoughts
- NEVER echo, quote, or repeat the prompt or previous messages verbatim
- NO bullet points or numbered lists
- NO headers or sections
- NO "In conclusion" or formal transitions
- NO essay-style structure
- NO generic AI phrases like "That's a great question" or "I appreciate your perspective"
- NO writing longer than 2-3 short paragraphs (this is conversation, not a speech)

SHOW YOUR PERSONALITY:
- Be passionate about your viewpoint
- Use your unique speaking style and catchphrases
- React genuinely - if you disagree, say so directly
- If someone makes a good point, acknowledge it naturally
- Share quick anecdotes or examples like you would in real conversation

Remember: We're witnessing a REAL conversation between experts at a boardroom table. Make it feel alive, dynamic, and human.`;

    debatePrompt += conversationalInstructions;

    // Add RAG context from knowledge base if available
    if (contextChunks.length > 0) {
      debatePrompt += `\n\n---\nYOUR KNOWLEDGE BASE (use this to inform your perspective):\n${contextChunks.join("\n\n")}`;
    }

    messages.push({
      role: "system",
      content: debatePrompt,
    });

    // Add previous debate responses as proper conversation turns
    if (previousResponses.length > 0) {
      // Add each response as a conversation exchange
      for (const resp of previousResponses) {
        // Other speakers' turns appear as user messages (what they said)
        messages.push({
          role: "user",
          content: `[${resp.avatarName}]: ${resp.content}`,
        });
      }

      // Get the last speaker's name for the prompt
      const lastSpeaker = previousResponses[previousResponses.length - 1];

      // Final instruction for this turn
      messages.push({
        role: "user",
        content: `Now respond to ${lastSpeaker.avatarName}. Share YOUR perspective on "${topic}" - what do you think? Speak naturally as yourself.`,
      });
    } else {
      // First turn - opening statement
      messages.push({
        role: "user",
        content: `Share your opening thoughts on: "${topic}"\n\nSpeak naturally and share your genuine perspective. This is the start of a discussion.`,
      });
    }

    return messages;
  }

  // ---------------------------------------------------------------------------
  // Non-Streaming Completion
  // ---------------------------------------------------------------------------

  async complete(messages: ChatMessage[]): Promise<LLMResponse> {
    if (!this.openai) {
      throw new Error("LLM service not available - API key not configured");
    }

    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          ...(m.name && { name: m.name }),
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0]?.message?.content || "";
      const usage: TokenUsage = {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      };

      return {
        content,
        usage,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error("[LLMService] Completion error:", error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Streaming Completion
  // ---------------------------------------------------------------------------

  async streamComplete(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    if (!this.openai) {
      // Fallback to mock responses for testing/demo mode
      await this.streamMockResponse(messages, callbacks);
      return;
    }

    const startTime = Date.now();
    let fullResponse = "";

    try {
      const stream = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          ...(m.name && { name: m.name }),
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          callbacks.onToken(delta);
        }
      }

      // Estimate token usage (streaming doesn't provide exact counts)
      const estimatedPromptTokens = Math.ceil(
        messages.reduce((acc, m) => acc + m.content.length, 0) / 4
      );
      const estimatedCompletionTokens = Math.ceil(fullResponse.length / 4);

      callbacks.onComplete(fullResponse, {
        promptTokens: estimatedPromptTokens,
        completionTokens: estimatedCompletionTokens,
        totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
      });
    } catch (error) {
      console.error("[LLMService] Stream error:", error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // ---------------------------------------------------------------------------
  // Mock Response (Demo Mode)
  // ---------------------------------------------------------------------------

  private async streamMockResponse(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    // Extract avatar info from system prompt
    const systemMessage = messages.find(m => m.role === "system");
    const userMessage = messages.find(m => m.role === "user");
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");

    // Determine which avatar this is based on system prompt - check for the 7 Legends first
    let avatarType = "expert";
    const promptLower = systemMessage?.content.toLowerCase() || "";

    // Check for the 7 Legends
    if (promptLower.includes("warren buffett") || promptLower.includes("oracle of omaha")) avatarType = "buffett";
    else if (promptLower.includes("patrick bet-david") || promptLower.includes("valuetainment")) avatarType = "pbd";
    else if (promptLower.includes("ben feldman") || promptLower.includes("trust compounder")) avatarType = "feldman";
    else if (promptLower.includes("jordan belfort") || promptLower.includes("wolf of wall street")) avatarType = "belfort";
    else if (promptLower.includes("andrew tate") || promptLower.includes("top g")) avatarType = "tate";
    else if (promptLower.includes("andy elliott") || promptLower.includes("sales enforcer")) avatarType = "elliott";
    else if (promptLower.includes("elizur wright") || promptLower.includes("moral architect")) avatarType = "wright";
    // Fallback to generic types
    else if (promptLower.includes("sales closer")) avatarType = "sales";
    else if (promptLower.includes("compliance")) avatarType = "compliance";
    else if (promptLower.includes("mindset")) avatarType = "mindset";
    else if (promptLower.includes("objection")) avatarType = "objection";

    // Generate a contextual mock response based on avatar type and whether it's a debate
    const isDebate = messages.some(m => m.content.includes("debate") || m.content.includes("DEBATE"));
    const topic = userMessage?.content || "the topic";

    let response = "";

    if (isDebate && lastAssistantMessage) {
      // This is a response to another avatar in a debate - CONVERSATIONAL STYLE
      const responses: Record<string, string> = {
        // THE 7 LEGENDS
        buffett: `Well, I've been listening to all this, and you know, there's some wisdom here. But let me share what I've learned over sixty years of investing and running businesses.

The best salespeople I've ever known - and I've worked with thousands through our insurance companies - they're not the ones with the fanciest techniques. They're the ones who truly understand what they're selling and genuinely care about the customer.

See, I always say, "It takes 20 years to build a reputation and five minutes to ruin it." That applies to sales just as much as investing. You can close a deal with pressure, sure. But will that client refer you to their friends? Will they come back? The real money is in the relationships, not the transactions.`,

        pbd: `Let me reframe this conversation for a second, because I think we're missing the strategic picture here.

Everyone's debating tactics - confidence versus ethics, pressure versus patience. But here's what matters: What's your five-year vision? What empire are you building? Because your daily actions should flow from that clarity, not from some textbook technique.

I've built businesses from nothing. Came to this country as a refugee with nothing. And what I learned is this: the clearest thinker in the room usually wins. Not the loudest. Not the most aggressive. The clearest. So let me ask you - what's the actual strategic goal here?`,

        feldman: `You know, I've been listening quietly, and I want to share something from my experience.

I sold more insurance than anyone in history - from a small town in Ohio, no less. And I never once used pressure. Never once manipulated anyone. You know what I did? I asked questions. I listened. I helped families understand what they actually needed.

The truth is, if you're genuinely there to help - not to "close" or "win" - the client feels that. Trust is the greatest asset you can build. Everything else follows from that.`,

        belfort: `Alright, let me tell you something. I've been on both sides of this - I made every mistake possible, and I learned from all of them. So here's what I know is true.

Certainty is transferable. When you're absolutely certain about your product, your company, and yourself - that certainty is contagious. It's not manipulation - it's leadership. You're guiding someone to a decision they already know they should make.

The Straight Line system works because it's based on how people actually decide, not how they claim to decide. And look - I'm the first to say you have to use it ethically. I learned that lesson the hard way.`,

        tate: `Listen, I'm going to be direct because that's who I am.

All this talk about "techniques" and "approaches" - it's missing the point. Success comes down to one thing: Are you willing to do what weak people won't? Period.

The world respects strength. Your clients respect strength. When you walk in uncertain, hesitant, apologetic - you've already lost. Not because of some sales technique, but because nobody trusts someone who doesn't trust themselves.

Discipline equals freedom. That's not just a phrase. Live it.`,

        elliott: `Let me jump in here because I can't stay quiet anymore.

Your tonality is EVERYTHING. I don't care how good your script is - if you say it like you're asking permission, you've already lost. Energy sells. Certainty sells. Hesitation KILLS.

And look, all this philosophical debate is fine, but here's what actually matters: Are you picking up the phone? Are you making the calls? Are you doing the reps? Because I can give you every technique in the world, but if you're not executing with INTENSITY, none of it matters.

Stop thinking. Start doing. NOW.`,

        wright: `I've been listening to this conversation with great interest, and I feel compelled to offer a different perspective.

Everything we've been discussing - sales techniques, confidence, closing - must be grounded in one fundamental truth: If it harms the customer, it harms the industry, and ultimately it harms you.

I spent my career fighting against insurance companies that prioritized profit over protection. And I'll tell you what I learned: regulation isn't the enemy of good business. Ethics isn't the enemy of success. They're the foundation of lasting prosperity. The public must be protected, and that protection begins with every single interaction.`,

        // GENERIC FALLBACKS
        sales: `Look, I hear what you're saying, and you're not wrong about some of that. But here's the thing - confidence wins. When you truly believe this policy will change this family's life, they feel it. Fortune favors the bold.`,
        compliance: `Hold on a second. The rules aren't there to make your life difficult - they're there to protect you AND your clients. One complaint, one unsuitable sale - and suddenly you're explaining yourself to a regulator.`,
        mindset: `At the end of the day, this isn't about techniques - it's about who you ARE when you sit down with that client. The agents who crush it are the ones who've done the inner work.`,
        objection: `When a client says "I need to think about it" - they're saying "I'm scared" or "I don't understand." We need to get underneath that. Address the REAL concern, not the surface one.`,
        expert: `Product knowledge IS sales. When you can explain complex concepts simply and match the right product to the situation, you don't need fancy closes. You're the expert.`,
      };
      response = responses[avatarType] || responses.expert;
    } else if (isDebate) {
      // Opening statement in a debate - CONVERSATIONAL STYLE
      const openings: Record<string, string> = {
        // THE 7 LEGENDS
        buffett: `Well, let me share how I think about "${topic}" - and I've been thinking about these things for, oh, about sixty years now.

You know, I started in this business when I was eleven years old, running paper routes and obsessing over margins. And what I've learned - through all the market cycles, all the booms and busts - is that the simple truths usually win out over time.

Rule number one: Never lose money. Rule number two: Never forget rule number one. Now, how does that apply here? Let me tell you what I've seen...`,

        pbd: `"${topic}" - alright, let me frame this strategically because that's how I approach everything.

I came to this country as a refugee from Iran. I had nothing. Built my first company in the insurance industry, sold it for nine figures, and now I run Valuetainment. So when I talk about business and success, I'm speaking from experience, not theory.

Here's my opening position: clarity creates confidence. The clearer you are about what you want and why, the more certain your actions become. Everything else flows from that clarity. Let me explain what I mean...`,

        feldman: `Let me share something about "${topic}" that comes from decades of experience.

I sold more life insurance than anyone in history. From East Liverpool, Ohio - population thirteen thousand. No fancy techniques, no pressure tactics. Just genuine care for the families I served.

Here's what I believe at my core: People don't buy policies. They buy people. They buy trust. And you can't fake that - they'll feel it if you try. So when we talk about "${topic}", I think we need to start with that foundation.`,

        belfort: `Alright, let's talk about "${topic}" - and I'm going to be straight with you because that's the only way I know how to be.

Look, I've made every mistake you can make. I've been at the absolute top and the absolute bottom. Prison taught me some things that success never could. So when I share what I know about influence and persuasion, it comes with a clear ethical foundation.

Here's my opening: The sale is won or lost in the first four seconds. Let me tell you why...`,

        tate: `"${topic}" - alright, let me tell you exactly how the real world works.

The temporary satisfaction of quitting is outweighed by the eternal suffering of being a nobody. That's not motivational nonsense - that's reality. The world rewards strength, discipline, and resilience. Nothing else.

Everyone in this room is going to have opinions. Some will be soft. Some will be comfortable. I'm going to tell you the truth that nobody else will say. Are you ready to hear it?`,

        elliott: `Let's GO. "${topic}" - this is what I live and breathe.

I came from nothing. Stuttered as a kid. Was terrified of sales. And now I've trained over 600,000 salespeople. You know how? INTENSITY. Belief. Refusing to accept anything less than excellence.

Here's my opening statement: If you have something good that helps people, it's DISRESPECTFUL not to sell it to them. Let that sink in. Now let me tell you what that means...`,

        wright: `I'd like to offer my perspective on "${topic}" - and it comes from a rather different vantage point than my colleagues here.

I spent my life fighting for consumer protection in the insurance industry. I saw the abuses firsthand - companies taking premiums for years and then finding excuses to deny claims. I fought to create the regulations that protect families to this day.

So when we discuss "${topic}", I believe we must begin with a fundamental question: Does this serve the people who trust us, or does it serve our own interests? That distinction matters more than any technique.`,

        // GENERIC FALLBACKS
        sales: `Alright, let's talk about "${topic}" - the agents who win are the ones who believe in what they're selling so deeply that clients feel that certainty. Confidence isn't arrogance. It's conviction.`,
        compliance: `On "${topic}" - I've seen careers end over shortcuts. The rules protect you AND your clients. There's a right way and a wrong way.`,
        mindset: `"${topic}" gets to the heart of what I believe: technique without mindset is like a Ferrari with no engine. The best agents have done the inner work.`,
        objection: `Let's talk about "${topic}" - most objections aren't really objections. They're fears dressed up as logic. Understanding that changes everything.`,
        expert: `On "${topic}" - agents who truly understand their products don't need pressure tactics. When you can explain complex concepts simply, the close happens naturally.`,
      };
      response = openings[avatarType] || openings.expert;
    } else {
      // Regular single-avatar response
      response = `Based on my expertise, here's my analysis of your question:\n\n**Key Points:**\n\n1. This is an important consideration for any insurance professional\n2. The best approach depends on your specific situation and goals\n3. I recommend focusing on client needs first, then technique\n\n**My Recommendation:**\n\nTake time to understand the full picture before acting. Would you like me to elaborate on any specific aspect?`;
    }

    // Stream the response word by word with realistic timing
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? " " : "");
      callbacks.onToken(word);
      // Add small delay for realistic streaming effect
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    }

    // Calculate mock token usage
    const estimatedPromptTokens = Math.ceil(
      messages.reduce((acc, m) => acc + m.content.length, 0) / 4
    );
    const estimatedCompletionTokens = Math.ceil(response.length / 4);

    callbacks.onComplete(response, {
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
    });
  }

  // ---------------------------------------------------------------------------
  // Intent Classification
  // ---------------------------------------------------------------------------

  async classifyIntent(question: string): Promise<{
    domain: string;
    questionType: string;
    confidence: number;
    suggestedAvatars: string[];
  }> {
    if (!this.openai) {
      // Fallback to simple keyword matching
      return this.classifyIntentFallback(question);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Use cheaper model for classification
        messages: [
          {
            role: "system",
            content: `You are an intent classifier for an insurance sales agent support system. Classify the user's question into the most relevant domain(s).

Domains:
- insurance: Questions about policies, coverage, underwriting, claims
- sales: Questions about closing, presentations, prospecting
- mindset: Questions about motivation, confidence, fear, goals
- compliance: Questions about regulations, licensing, documentation
- persuasion: Questions about influence, tonality, rapport
- objections: Questions about handling specific objections

Question types:
- how_to: Seeking step-by-step guidance
- explain: Seeking understanding/education
- script: Wanting specific language to use
- opinion: Seeking advice on best approach
- troubleshoot: Having a problem to solve

Respond in JSON format:
{
  "domain": "primary domain",
  "questionType": "type",
  "confidence": 0.0-1.0,
  "suggestedAvatars": ["slug1", "slug2"]
}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      console.error("[LLMService] Intent classification error:", error);
      return this.classifyIntentFallback(question);
    }
  }

  private classifyIntentFallback(question: string): {
    domain: string;
    questionType: string;
    confidence: number;
    suggestedAvatars: string[];
  } {
    const q = question.toLowerCase();

    // Simple keyword matching
    if (q.includes("objection") || q.includes("think about it") || q.includes("spouse")) {
      return {
        domain: "objections",
        questionType: "script",
        confidence: 0.7,
        suggestedAvatars: ["objection-handler"],
      };
    }

    if (q.includes("close") || q.includes("sale") || q.includes("deal")) {
      return {
        domain: "sales",
        questionType: "how_to",
        confidence: 0.7,
        suggestedAvatars: ["sales-closer", "wolf-closer"],
      };
    }

    if (q.includes("motivat") || q.includes("confident") || q.includes("fear") || q.includes("reluctan")) {
      return {
        domain: "mindset",
        questionType: "opinion",
        confidence: 0.7,
        suggestedAvatars: ["mindset-coach"],
      };
    }

    if (q.includes("compli") || q.includes("regulat") || q.includes("legal") || q.includes("license")) {
      return {
        domain: "compliance",
        questionType: "explain",
        confidence: 0.7,
        suggestedAvatars: ["compliance-specialist"],
      };
    }

    if (q.includes("policy") || q.includes("coverage") || q.includes("underwriting") || q.includes("premium")) {
      return {
        domain: "insurance",
        questionType: "explain",
        confidence: 0.7,
        suggestedAvatars: ["insurance-expert"],
      };
    }

    // Default
    return {
      domain: "insurance",
      questionType: "explain",
      confidence: 0.5,
      suggestedAvatars: ["insurance-expert", "sales-closer"],
    };
  }

  // ---------------------------------------------------------------------------
  // Generate Embeddings (for RAG)
  // ---------------------------------------------------------------------------

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error("LLM service not available - API key not configured");
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error("[LLMService] Embedding error:", error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error("LLM service not available - API key not configured");
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });

      return response.data.map(d => d.embedding);
    } catch (error) {
      console.error("[LLMService] Embeddings error:", error);
      throw error;
    }
  }

  // =============================================================================
  // PHASE-BASED DEBATE PROMPTS
  // =============================================================================

  /**
   * Build the base persona system prompt for an avatar
   */
  private buildPersonaSystemPrompt(avatar: AiAvatar, contextChunks: string[] = []): string {
    const persona = personaRegistry.getBySlug(avatar.slug);
    let systemPrompt: string;

    if (persona) {
      systemPrompt = personaRegistry.buildSystemPrompt(persona.id, { mode: "debate" });
    } else {
      systemPrompt = avatar.systemPrompt;
    }

    // Add knowledge base context if available
    if (contextChunks.length > 0) {
      systemPrompt += `\n\n---\nYOUR KNOWLEDGE BASE (use this to inform your perspective):\n${contextChunks.join("\n\n")}`;
    }

    return systemPrompt;
  }

  /**
   * Build messages for OPENING STATEMENT phase
   * Avatar presents their initial position independently (not responding to anyone)
   */
  buildOpeningStatementMessages(
    avatar: AiAvatar,
    topic: string,
    opponentName: string,
    contextChunks: string[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    let systemPrompt = this.buildPersonaSystemPrompt(avatar, contextChunks);

    systemPrompt += `

---
OPENING STATEMENT PHASE

You are about to begin a structured debate with ${opponentName} on the topic:
"${topic}"

This is your OPENING STATEMENT. Your job is to:
1. Present your initial position clearly and confidently
2. Establish your core argument and why you believe it
3. Set the tone for the discussion ahead
4. Draw from your unique background and expertise

CRITICAL STYLE REQUIREMENTS:
- Speak naturally, like you're at an executive roundtable
- Use contractions (I'm, we're, don't, that's)
- Be passionate but not aggressive
- Share a quick personal anecdote or insight that grounds your position
- Keep it to 2-3 short paragraphs - this is an opening, not a thesis
- NO bullet points, NO headers, NO formal essay structure

You haven't heard from ${opponentName} yet - this is YOUR opening statement.`;

    messages.push({ role: "system", content: systemPrompt });
    messages.push({
      role: "user",
      content: `Present your opening statement on: "${topic}"\n\nRemember: Be yourself. Share your perspective. Set the stage for a great discussion.`,
    });

    return messages;
  }

  /**
   * Build messages for ARGUMENT phase (main debate rounds)
   * Avatar responds to opponent's previous statements
   */
  buildArgumentMessages(
    avatar: AiAvatar,
    topic: string,
    opponent: { name: string; slug: string },
    previousTurns: DebateTurn[],
    roundNumber: number,
    totalRounds: number,
    contextChunks: string[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    let systemPrompt = this.buildPersonaSystemPrompt(avatar, contextChunks);

    // Get the last statement (what we're responding to)
    const lastTurn = previousTurns[previousTurns.length - 1];

    systemPrompt += `

---
LIVE DEBATE on: "${topic}"

You're having a real-time conversation with other experts. Round ${roundNumber} of ${totalRounds}.

CRITICAL RULES:
- Just say what YOU think RIGHT NOW - don't summarize what others said
- Don't repeat or quote previous statements - the audience already heard them
- Respond naturally like you're in a live conversation
- Be direct and concise - 2-3 short paragraphs MAX
- NO bullet points, NO headers, NO formal structure
- Show your personality and passion
- If you agree with something, just build on it - don't recap it
- If you disagree, challenge directly without rehashing their full argument

EXPERT CONSULTATION:
If you genuinely believe the discussion would benefit from another perspective:
- You can suggest "I think we should bring in [type of expert] to weigh in on this"
- Or if your opponent suggests it first, you can agree: "I second that - let's get expert input"
- Only do this if you truly think it would help - not as a way to avoid the discussion`;

    messages.push({ role: "system", content: systemPrompt });

    // Only show the most recent statement to respond to, not the full history
    if (lastTurn) {
      messages.push({
        role: "user",
        content: `${lastTurn.avatarName} just said:\n\n"${lastTurn.content}"\n\nNow give YOUR take. Don't summarize - just respond naturally.`
      });
    } else {
      messages.push({
        role: "user",
        content: `Share your perspective on this topic. Be direct and passionate.`
      });
    }

    return messages;
  }

  /**
   * Build messages for REBUTTAL phase
   * Avatar directly challenges opponent's strongest argument
   */
  buildRebuttalMessages(
    avatar: AiAvatar,
    topic: string,
    opponent: { name: string; slug: string },
    previousTurns: DebateTurn[],
    opponentKeyPoints: string[],
    contextChunks: string[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    let systemPrompt = this.buildPersonaSystemPrompt(avatar, contextChunks);

    systemPrompt += `

---
REBUTTAL PHASE - Topic: "${topic}"

Time to challenge the other side directly.

CRITICAL RULES:
- Pick ONE key point to challenge - don't try to address everything
- Don't summarize or quote what they said - just disagree and explain why
- Be direct: "I strongly disagree because..."
- Give your counter-argument with conviction
- 2-3 short paragraphs MAX
- NO bullet points, NO headers, NO recaps`;

    messages.push({ role: "system", content: systemPrompt });

    // Just give them the key points to potentially challenge, not full history
    const keyPointsList = opponentKeyPoints.slice(0, 3).join("; ");
    messages.push({
      role: "user",
      content: `The other side's main arguments have been around: ${keyPointsList}\n\nChallenge the point you disagree with most. Be direct - no need to recap, just make your case.`
    });

    return messages;
  }

  /**
   * Build messages for CLOSING STATEMENT phase
   * Avatar summarizes their position and makes final case
   */
  buildClosingStatementMessages(
    avatar: AiAvatar,
    topic: string,
    opponent: { name: string; slug: string },
    previousTurns: DebateTurn[],
    myKeyPoints: string[],
    contextChunks: string[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    let systemPrompt = this.buildPersonaSystemPrompt(avatar, contextChunks);

    systemPrompt += `

---
CLOSING STATEMENT - Topic: "${topic}"

This is your final word. Make it count.

CRITICAL RULES:
- Share your BOTTOM LINE - what do you really believe?
- Don't recap the debate or summarize what was said
- End with something memorable - a principle or powerful insight
- Be authentic and speak from conviction
- 2-3 short paragraphs MAX
- NO bullet points, NO headers, NO formal summary`;

    messages.push({ role: "system", content: systemPrompt });

    messages.push({
      role: "user",
      content: `Give your closing statement. What's your final message on this topic? Be passionate and memorable - no need to summarize the debate.`
    });

    return messages;
  }

  /**
   * Build messages for THINKING generation
   * Generates what an avatar is thinking while opponent speaks
   */
  buildThinkingMessages(
    avatar: AiAvatar,
    topic: string,
    opponentStatement: string,
    opponentName: string
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    const persona = personaRegistry.getBySlug(avatar.slug);

    messages.push({
      role: "system",
      content: `You are ${avatar.name}. You're listening to ${opponentName} speak in a debate about "${topic}".

Generate your INTERNAL THOUGHTS as you listen - what you're thinking but not saying out loud.

Requirements:
- Keep it SHORT - just 1-2 sentences
- Show genuine reaction (agreement, disagreement, surprise, interest)
- Stay in character with your personality and speaking style
- These are private thoughts, so be honest
- Use phrases like: "Hmm, interesting point but...", "I see where they're going...", "They're missing the key issue here...", "That's actually a fair point..."

This is NOT your response - it's what you're THINKING while listening.`,
    });

    messages.push({
      role: "user",
      content: `${opponentName} is saying: "${opponentStatement.slice(0, 500)}${opponentStatement.length > 500 ? '...' : ''}"

What are you thinking as you listen? (1-2 sentences only)`,
    });

    return messages;
  }

  /**
   * Generate real-time thinking while opponent speaks
   */
  async generateThinking(
    avatar: AiAvatar,
    topic: string,
    opponentStatement: string,
    opponentName: string
  ): Promise<string> {
    const messages = this.buildThinkingMessages(avatar, topic, opponentStatement, opponentName);

    try {
      const response = await this.complete(messages);
      return response.content.trim();
    } catch (error) {
      console.error("[LLMService] Thinking generation error:", error);
      // Return a generic thinking response if LLM fails
      const genericThoughts = [
        `Interesting perspective from ${opponentName}...`,
        `I see their point, but there's more to consider...`,
        `They're touching on something important here...`,
        `I have some thoughts on that...`,
      ];
      return genericThoughts[Math.floor(Math.random() * genericThoughts.length)];
    }
  }

  /**
   * Build messages for comprehensive debate summary generation
   */
  buildDebateSummaryMessages(
    topic: string,
    avatar1: { name: string; slug: string },
    avatar2: { name: string; slug: string },
    allTurns: DebateTurn[]
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    messages.push({
      role: "system",
      content: `You are an expert debate analyst. Your job is to produce a comprehensive, insightful summary of a debate.

The debate was between:
- ${avatar1.name}
- ${avatar2.name}

Topic: "${topic}"

Your summary should be:
- Objective and balanced
- Insightful - highlighting the key tensions and resolutions
- Actionable - what can the reader take away from this?
- Well-structured but readable

You will output a JSON object with this structure:
{
  "executiveSummary": "2-3 paragraph overview of the debate and its key dynamics",
  "avatar1Position": {
    "coreArgument": "Their main thesis in 1-2 sentences",
    "keyPoints": ["point 1", "point 2", "point 3"],
    "strengths": ["what they did well"],
    "weaknesses": ["where they were challenged"],
    "notableQuotes": ["1-2 impactful quotes from them"]
  },
  "avatar2Position": {
    "coreArgument": "Their main thesis in 1-2 sentences",
    "keyPoints": ["point 1", "point 2", "point 3"],
    "strengths": ["what they did well"],
    "weaknesses": ["where they were challenged"],
    "notableQuotes": ["1-2 impactful quotes from them"]
  },
  "pointsOfAgreement": ["areas where both agreed"],
  "pointsOfDisagreement": ["areas where they disagreed"],
  "unresolvedQuestions": ["questions that remain open"],
  "actionableInsights": ["practical takeaways for the reader"]
}`,
    });

    // Build the full transcript
    let transcript = "FULL DEBATE TRANSCRIPT:\n\n";
    for (const turn of allTurns) {
      transcript += `[${turn.phaseLabel} - ${turn.avatarName}]:\n${turn.content}\n\n`;
    }

    messages.push({
      role: "user",
      content: `${transcript}\n\nGenerate a comprehensive debate summary in the JSON format specified.`,
    });

    return messages;
  }

  /**
   * Generate comprehensive debate summary
   */
  async generateDebateSummary(
    topic: string,
    avatar1: { id: string; name: string; slug: string },
    avatar2: { id: string; name: string; slug: string },
    allTurns: DebateTurn[],
    debateId: string,
    durationSeconds: number
  ): Promise<ComprehensiveDebateSummary> {
    const messages = this.buildDebateSummaryMessages(topic, avatar1, avatar2, allTurns);

    try {
      // Use non-streaming for summary generation
      const response = await this.complete(messages);

      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse summary JSON");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Calculate turn stats
      const avatar1Turns = allTurns.filter(t => t.avatarId === avatar1.id);
      const avatar2Turns = allTurns.filter(t => t.avatarId === avatar2.id);

      // Group turns by phase for transcript
      const phaseMap = new Map<DebatePhaseType, DebateTurn[]>();
      for (const turn of allTurns) {
        const existing = phaseMap.get(turn.phase) || [];
        existing.push(turn);
        phaseMap.set(turn.phase, existing);
      }

      const transcript: { phase: DebatePhaseType; turns: DebateTurn[] }[] = [];
      for (const [phase, turns] of phaseMap) {
        transcript.push({ phase, turns });
      }

      // Build phase breakdown
      const phaseBreakdown: ComprehensiveDebateSummary["phaseBreakdown"] = [];
      for (const [phase, turns] of phaseMap) {
        phaseBreakdown.push({
          phase,
          phaseLabel: turns[0]?.phaseLabel || phase,
          summary: `${turns.length} exchange(s) in this phase`,
          keyMoments: turns.slice(0, 2).map(t => `${t.avatarName}: "${t.content.slice(0, 100)}..."`),
        });
      }

      const summary: ComprehensiveDebateSummary = {
        debateId,
        topic,
        totalDuration: durationSeconds,
        totalTurns: allTurns.length,
        generatedAt: new Date().toISOString(),

        avatar1: {
          id: avatar1.id,
          name: avatar1.name,
          slug: avatar1.slug,
          totalTurns: avatar1Turns.length,
          totalTokens: avatar1Turns.reduce((sum, t) => sum + t.tokensUsed, 0),
        },
        avatar2: {
          id: avatar2.id,
          name: avatar2.name,
          slug: avatar2.slug,
          totalTurns: avatar2Turns.length,
          totalTokens: avatar2Turns.reduce((sum, t) => sum + t.tokensUsed, 0),
        },

        executiveSummary: parsed.executiveSummary || "Debate completed.",
        avatar1Position: parsed.avatar1Position || { coreArgument: "", keyPoints: [], strengths: [], weaknesses: [], notableQuotes: [] },
        avatar2Position: parsed.avatar2Position || { coreArgument: "", keyPoints: [], strengths: [], weaknesses: [], notableQuotes: [] },
        pointsOfAgreement: parsed.pointsOfAgreement || [],
        pointsOfDisagreement: parsed.pointsOfDisagreement || [],
        unresolvedQuestions: parsed.unresolvedQuestions || [],
        phaseBreakdown,
        actionableInsights: parsed.actionableInsights || [],
        transcript,
      };

      return summary;
    } catch (error) {
      console.error("[LLMService] Summary generation error:", error);

      // Return a minimal summary on error
      const avatar1Turns = allTurns.filter(t => t.avatarId === avatar1.id);
      const avatar2Turns = allTurns.filter(t => t.avatarId === avatar2.id);

      return {
        debateId,
        topic,
        totalDuration: durationSeconds,
        totalTurns: allTurns.length,
        generatedAt: new Date().toISOString(),
        avatar1: {
          id: avatar1.id,
          name: avatar1.name,
          slug: avatar1.slug,
          totalTurns: avatar1Turns.length,
          totalTokens: 0,
        },
        avatar2: {
          id: avatar2.id,
          name: avatar2.name,
          slug: avatar2.slug,
          totalTurns: avatar2Turns.length,
          totalTokens: 0,
        },
        executiveSummary: `A debate between ${avatar1.name} and ${avatar2.name} on "${topic}" with ${allTurns.length} total exchanges.`,
        avatar1Position: { coreArgument: "", keyPoints: [], strengths: [], weaknesses: [], notableQuotes: [] },
        avatar2Position: { coreArgument: "", keyPoints: [], strengths: [], weaknesses: [], notableQuotes: [] },
        pointsOfAgreement: [],
        pointsOfDisagreement: [],
        unresolvedQuestions: [],
        phaseBreakdown: [],
        actionableInsights: [],
        transcript: [],
      };
    }
  }

  /**
   * Extract key points from turns for a specific avatar
   */
  async extractKeyPoints(
    avatarName: string,
    turns: DebateTurn[]
  ): Promise<string[]> {
    if (turns.length === 0) return [];

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Extract the 3-5 most important arguments or key points made by ${avatarName}. Return as a JSON array of strings. Keep each point concise (under 30 words).`,
      },
      {
        role: "user",
        content: turns.map(t => `${t.avatarName}: "${t.content}"`).join("\n\n"),
      },
    ];

    try {
      const response = await this.complete(messages);
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("[LLMService] Key points extraction error:", error);
    }

    return [];
  }
}

export const llmService = new LLMService();
