# Debate Mode Engine Design

## Overview

The Debate Mode Engine orchestrates multi-avatar discussions where 2+ AI personas can engage in structured debate, respond to each other's arguments, and be controlled by administrators in real-time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEBATE ENGINE                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      DEBATE ORCHESTRATOR                            │    │
│  │  - Manages debate lifecycle                                         │    │
│  │  - Coordinates turn-taking                                          │    │
│  │  - Handles admin controls                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │              │              │              │                         │
│       ▼              ▼              ▼              ▼                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────────┐                  │
│  │ Turn    │   │ Memory  │   │ Stream  │   │ Admin       │                  │
│  │ Manager │   │ Manager │   │ Manager │   │ Controller  │                  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────────┘                  │
│       │              │              │              │                         │
│       └──────────────┴──────────────┴──────────────┘                         │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LLM SERVICE                                   │    │
│  │  - Streaming responses                                               │    │
│  │  - Context window management                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      WEBSOCKET LAYER                                 │    │
│  │  - Real-time token streaming                                         │    │
│  │  - Event broadcasting                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Turn-Taking Model

The engine supports multiple turn-taking strategies:

```typescript
enum TurnStrategy {
  ROUND_ROBIN = "round_robin",       // A → B → C → A → B → C
  PING_PONG = "ping_pong",           // A → B → A → B (classic debate)
  MODERATOR_LED = "moderator_led",   // Moderator calls on speakers
  FREE_FORM = "free_form",           // Avatars can interject
  RESPONSE_CHAIN = "response_chain", // Each responds to previous speaker
}
```

#### Round Robin (Default for 3+ avatars)
```
Turn 1: Avatar A (Opening)
Turn 2: Avatar B (Response to A)
Turn 3: Avatar C (Response to A & B)
Turn 4: Avatar A (Response to B & C)
Turn 5: Avatar B (Response to C & A)
...continues...
```

#### Ping-Pong (Default for 2 avatars)
```
Turn 1: Avatar A (Opening)
Turn 2: Avatar B (Counter to A)
Turn 3: Avatar A (Rebuttal to B)
Turn 4: Avatar B (Rebuttal to A)
...continues...
```

#### Response Chain
```
Turn 1: Avatar A (Opening)
Turn 2: Avatar B (Direct response to A only)
Turn 3: Avatar C (Direct response to B only)
Turn 4: Avatar A (Direct response to C only)
...continues...
```

### Turn Manager Implementation

```typescript
interface TurnState {
  currentTurn: number;
  currentSpeaker: string;          // Avatar ID
  turnOrder: string[];             // Avatar IDs in order
  speakingHistory: TurnRecord[];   // Who spoke when
  strategy: TurnStrategy;

  // For moderator-led mode
  pendingSpeakers: string[];       // Queue of avatars wanting to speak
  moderatorId?: string;            // Admin or AI moderator
}

interface TurnRecord {
  turnNumber: number;
  avatarId: string;
  timestamp: Date;
  duration: number;                // milliseconds
  tokenCount: number;
  wasInterrupted: boolean;
}

class TurnManager {
  private state: TurnState;

  getNextSpeaker(): string {
    switch (this.state.strategy) {
      case TurnStrategy.ROUND_ROBIN:
        return this.getNextRoundRobin();

      case TurnStrategy.PING_PONG:
        return this.getNextPingPong();

      case TurnStrategy.RESPONSE_CHAIN:
        return this.getNextInChain();

      case TurnStrategy.MODERATOR_LED:
        return this.getModeratorChoice();

      case TurnStrategy.FREE_FORM:
        return this.getMostRelevantSpeaker();
    }
  }

  private getNextRoundRobin(): string {
    const index = (this.state.currentTurn - 1) % this.state.turnOrder.length;
    return this.state.turnOrder[index];
  }

  private getNextPingPong(): string {
    const index = (this.state.currentTurn - 1) % 2;
    return this.state.turnOrder[index];
  }

  private getNextInChain(): string {
    // Response chain: each avatar responds to whoever spoke before them
    const lastSpeaker = this.state.speakingHistory[this.state.speakingHistory.length - 1];
    const lastIndex = this.state.turnOrder.indexOf(lastSpeaker?.avatarId || '');
    const nextIndex = (lastIndex + 1) % this.state.turnOrder.length;
    return this.state.turnOrder[nextIndex];
  }
}
```

---

### 2. Memory Scoping Rules

Memory management ensures avatars have appropriate context without overwhelming the LLM.

```typescript
interface MemoryConfig {
  // What each avatar can "see"
  scope: MemoryScope;

  // Maximum turns to include in context
  maxTurnsInContext: number;

  // Maximum tokens for context
  maxContextTokens: number;

  // Whether to include summarization
  enableSummarization: boolean;

  // Turns before summarization kicks in
  summarizationThreshold: number;
}

enum MemoryScope {
  FULL = "full",           // See all messages from all avatars
  RECENT = "recent",       // See last N turns only
  RELEVANT = "relevant",   // See messages mentioning this avatar + recent
  MINIMAL = "minimal",     // See only the last message
}
```

#### Memory Scoping Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MEMORY SCOPE: FULL                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Turn 1: [Avatar A] Opening statement about term vs whole life...    │    │
│  │ Turn 2: [Avatar B] I disagree with A because...                     │    │
│  │ Turn 3: [Avatar C] Both A and B have valid points, however...       │    │
│  │ Turn 4: [Avatar A] Responding to B's criticism...                   │    │
│  │ Turn 5: [Avatar B] Building on what C mentioned...                  │    │
│  │ ...all messages visible to current speaker...                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       MEMORY SCOPE: RECENT (N=3)                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [Summary of turns 1-4: Key points discussed...]                     │    │
│  │ Turn 5: [Avatar B] Building on what C mentioned...                  │    │
│  │ Turn 6: [Avatar C] I want to add that...                            │    │
│  │ Turn 7: [Avatar A] Circling back to the main question...            │    │
│  │ → Current speaker sees summary + last 3 turns                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      MEMORY SCOPE: RELEVANT                                  │
│  (For Avatar B speaking at Turn 8)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [Summary of debate so far]                                          │    │
│  │ Turn 3: [Avatar C] "I agree with B that..." (mentions B)            │    │
│  │ Turn 4: [Avatar A] "B's point about..." (mentions B)                │    │
│  │ Turn 6: [Avatar C] Recent statement...                              │    │
│  │ Turn 7: [Avatar A] Most recent statement...                         │    │
│  │ → B sees: summary + messages that mention B + last 2 turns          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Memory Manager Implementation

```typescript
class MemoryManager {
  private config: MemoryConfig;
  private debateHistory: DebateMessage[];
  private summaries: Map<number, string>; // Turn number -> summary

  /**
   * Build context for the current speaker
   */
  buildContextForSpeaker(
    speakerId: string,
    currentTurn: number,
    topic: string
  ): DebateContext {
    switch (this.config.scope) {
      case MemoryScope.FULL:
        return this.buildFullContext(topic);

      case MemoryScope.RECENT:
        return this.buildRecentContext(currentTurn, topic);

      case MemoryScope.RELEVANT:
        return this.buildRelevantContext(speakerId, currentTurn, topic);

      case MemoryScope.MINIMAL:
        return this.buildMinimalContext(currentTurn, topic);
    }
  }

  private buildFullContext(topic: string): DebateContext {
    // Check if summarization is needed
    if (this.shouldSummarize()) {
      return {
        topic,
        summary: this.generateSummary(),
        recentMessages: this.debateHistory.slice(-this.config.maxTurnsInContext),
        fullHistory: false,
      };
    }

    return {
      topic,
      messages: this.debateHistory,
      fullHistory: true,
    };
  }

  private buildRecentContext(currentTurn: number, topic: string): DebateContext {
    const recentMessages = this.debateHistory.slice(-this.config.maxTurnsInContext);
    const olderMessages = this.debateHistory.slice(0, -this.config.maxTurnsInContext);

    return {
      topic,
      summary: olderMessages.length > 0 ? this.summarizeMessages(olderMessages) : undefined,
      recentMessages,
      fullHistory: false,
    };
  }

  private buildRelevantContext(
    speakerId: string,
    currentTurn: number,
    topic: string
  ): DebateContext {
    // Find messages that mention this speaker
    const speakerName = this.getAvatarName(speakerId);
    const relevantMessages = this.debateHistory.filter(msg =>
      msg.content.toLowerCase().includes(speakerName.toLowerCase()) ||
      msg.content.includes(`@${speakerId}`)
    );

    // Always include last N messages
    const recentMessages = this.debateHistory.slice(-2);

    // Merge and deduplicate
    const contextMessages = this.mergeUnique(relevantMessages, recentMessages);

    return {
      topic,
      summary: this.generateSummary(),
      recentMessages: contextMessages,
      fullHistory: false,
    };
  }

  private shouldSummarize(): boolean {
    return this.debateHistory.length > this.config.summarizationThreshold;
  }

  /**
   * Generate or retrieve a summary of the debate so far
   */
  private generateSummary(): string {
    const lastSummaryTurn = Math.max(...Array.from(this.summaries.keys()), 0);

    if (this.debateHistory.length - lastSummaryTurn < 3) {
      // Use existing summary
      return this.summaries.get(lastSummaryTurn) || '';
    }

    // Generate new summary (async in real implementation)
    // This would call the LLM to summarize
    return this.buildSummaryFromMessages(this.debateHistory);
  }

  private buildSummaryFromMessages(messages: DebateMessage[]): string {
    // Template-based summary for sync operation
    const keyPoints = messages.map(m =>
      `- ${m.avatarName}: ${this.extractKeyPoint(m.content)}`
    ).join('\n');

    return `DEBATE SUMMARY (${messages.length} turns):\n${keyPoints}`;
  }

  private extractKeyPoint(content: string): string {
    // Take first sentence or first 100 chars
    const firstSentence = content.split(/[.!?]/)[0];
    return firstSentence.slice(0, 100) + (firstSentence.length > 100 ? '...' : '');
  }
}
```

---

### 3. Admin Control Hooks

Administrators have real-time control over debates:

```typescript
interface AdminControls {
  // Debate lifecycle
  pause(): Promise<void>;
  resume(): Promise<void>;
  terminate(reason: string): Promise<void>;

  // Turn manipulation
  skipTurn(avatarId: string): Promise<void>;
  extendTurns(additionalTurns: number): Promise<void>;
  reassignTurn(fromAvatarId: string, toAvatarId: string): Promise<void>;

  // Content injection
  injectMessage(content: string, asAvatarId?: string): Promise<void>;
  injectModeratorNote(note: string): Promise<void>;

  // Avatar management
  muteAvatar(avatarId: string): Promise<void>;
  unmuteAvatar(avatarId: string): Promise<void>;
  addAvatar(avatarId: string, position?: number): Promise<void>;
  removeAvatar(avatarId: string): Promise<void>;

  // Configuration changes
  changeStrategy(strategy: TurnStrategy): Promise<void>;
  adjustMemoryScope(scope: MemoryScope): Promise<void>;
  setMaxTokensPerTurn(maxTokens: number): Promise<void>;
}
```

#### Control State Machine

```
                    ┌──────────────────┐
                    │    CREATED       │
                    └────────┬─────────┘
                             │ start()
                             ▼
            ┌──────────────────────────────────┐
            │            ACTIVE                 │
            │  ┌─────────────────────────────┐ │
            │  │ Turn 1 → Turn 2 → Turn 3... │ │
            │  └─────────────────────────────┘ │
            └───────┬──────────┬───────────────┘
                    │          │
         pause()    │          │  terminate()
                    ▼          │
            ┌───────────────┐  │
            │    PAUSED     │  │
            └───────┬───────┘  │
                    │          │
         resume()   │          │
                    ▼          ▼
            ┌──────────────────────────────────┐
            │          TERMINATED              │
            │  - completed (max turns)         │
            │  - interrupted (admin)           │
            │  - error (system failure)        │
            └──────────────────────────────────┘
```

#### Admin Controller Implementation

```typescript
class AdminController {
  private debateId: string;
  private eventEmitter: EventEmitter;
  private state: DebateState;

  /**
   * Pause the debate immediately after current turn completes
   */
  async pause(): Promise<void> {
    if (this.state.status !== 'active') {
      throw new Error(`Cannot pause debate in ${this.state.status} state`);
    }

    this.state.status = 'pausing'; // Transitional state
    this.eventEmitter.emit('admin:pause_requested', { debateId: this.debateId });

    // Wait for current turn to complete (if in progress)
    await this.waitForTurnCompletion();

    this.state.status = 'paused';
    this.state.pausedAt = new Date();

    await this.persistState();
    this.eventEmitter.emit('debate:paused', {
      debateId: this.debateId,
      pausedAtTurn: this.state.currentTurn
    });
  }

  /**
   * Resume a paused debate
   */
  async resume(): Promise<void> {
    if (this.state.status !== 'paused') {
      throw new Error(`Cannot resume debate in ${this.state.status} state`);
    }

    this.state.status = 'active';
    this.state.resumedAt = new Date();

    await this.persistState();
    this.eventEmitter.emit('debate:resumed', {
      debateId: this.debateId,
      resumedAtTurn: this.state.currentTurn,
      pauseDuration: Date.now() - this.state.pausedAt!.getTime()
    });

    // Trigger next turn
    this.eventEmitter.emit('turn:ready', {
      debateId: this.debateId,
      turnNumber: this.state.currentTurn
    });
  }

  /**
   * Terminate the debate immediately
   */
  async terminate(reason: string): Promise<void> {
    const previousStatus = this.state.status;
    this.state.status = 'terminated';
    this.state.terminationReason = reason;
    this.state.terminatedAt = new Date();

    // Cancel any in-progress generation
    this.eventEmitter.emit('generation:cancel', { debateId: this.debateId });

    await this.persistState();
    this.eventEmitter.emit('debate:terminated', {
      debateId: this.debateId,
      reason,
      previousStatus,
      finalTurn: this.state.currentTurn
    });
  }

  /**
   * Inject a message into the debate
   */
  async injectMessage(content: string, asAvatarId?: string): Promise<void> {
    if (this.state.status === 'terminated') {
      throw new Error('Cannot inject into terminated debate');
    }

    const message: DebateMessage = {
      id: generateId(),
      debateId: this.debateId,
      turnNumber: this.state.currentTurn,
      avatarId: asAvatarId || 'system',
      content,
      isInjected: true,
      injectedBy: 'admin',
      timestamp: new Date()
    };

    await this.saveMessage(message);

    this.eventEmitter.emit('message:injected', {
      debateId: this.debateId,
      message
    });
  }

  /**
   * Add a new avatar to the debate mid-stream
   */
  async addAvatar(avatarId: string, position?: number): Promise<void> {
    if (this.state.turnOrder.includes(avatarId)) {
      throw new Error('Avatar already in debate');
    }

    const avatar = await avatarRegistry.getAvatarById(avatarId);
    if (!avatar || !avatar.isActive) {
      throw new Error('Invalid or inactive avatar');
    }

    // Insert at position or end
    if (position !== undefined && position >= 0) {
      this.state.turnOrder.splice(position, 0, avatarId);
    } else {
      this.state.turnOrder.push(avatarId);
    }

    this.state.avatars.set(avatarId, avatar);

    await this.persistState();
    this.eventEmitter.emit('avatar:added', {
      debateId: this.debateId,
      avatarId,
      position: position ?? this.state.turnOrder.length - 1
    });
  }

  /**
   * Mute an avatar (skip their turns)
   */
  async muteAvatar(avatarId: string): Promise<void> {
    if (!this.state.turnOrder.includes(avatarId)) {
      throw new Error('Avatar not in debate');
    }

    this.state.mutedAvatars.add(avatarId);

    await this.persistState();
    this.eventEmitter.emit('avatar:muted', {
      debateId: this.debateId,
      avatarId
    });
  }
}
```

---

### 4. Streaming Strategy

Real-time streaming with backpressure handling and error recovery:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STREAMING ARCHITECTURE                                │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────┐ │
│  │   LLM API   │────▶│   Stream    │────▶│   Buffer    │────▶│ WebSocket │ │
│  │  (OpenAI)   │     │   Parser    │     │   Queue     │     │  Clients  │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     └───────────┘ │
│        │                   │                   │                    │       │
│        │                   ▼                   ▼                    │       │
│        │            ┌─────────────┐     ┌─────────────┐            │       │
│        │            │   Token     │     │ Backpressure│            │       │
│        │            │   Counter   │     │   Handler   │            │       │
│        │            └─────────────┘     └─────────────┘            │       │
│        │                                       │                    │       │
│        ▼                                       ▼                    ▼       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ERROR RECOVERY LAYER                             │   │
│  │  - Retry logic (exponential backoff)                                │   │
│  │  - Partial response caching                                         │   │
│  │  - Client reconnection handling                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Stream Manager Implementation

```typescript
interface StreamConfig {
  // Token batching for efficiency
  batchSize: number;              // Send tokens in batches of N
  batchDelayMs: number;           // Max delay before flushing batch

  // Backpressure
  maxBufferSize: number;          // Max tokens to buffer
  highWaterMark: number;          // Slow down at this buffer size
  lowWaterMark: number;           // Resume at this buffer size

  // Timeouts
  turnTimeoutMs: number;          // Max time for a turn
  tokenTimeoutMs: number;         // Max time between tokens

  // Recovery
  maxRetries: number;
  retryDelayMs: number;
}

class StreamManager {
  private config: StreamConfig;
  private buffer: string[] = [];
  private isPaused: boolean = false;
  private currentStream: AsyncIterator<string> | null = null;

  /**
   * Stream a turn's response to all connected clients
   */
  async streamTurn(
    debateId: string,
    avatarId: string,
    turnNumber: number,
    llmStream: AsyncIterator<string>
  ): Promise<StreamResult> {
    this.currentStream = llmStream;

    const result: StreamResult = {
      avatarId,
      turnNumber,
      tokens: [],
      totalTokens: 0,
      startTime: Date.now(),
      endTime: 0,
      wasInterrupted: false,
      error: null
    };

    const turnTimeout = setTimeout(() => {
      this.handleTurnTimeout(debateId, turnNumber);
    }, this.config.turnTimeoutMs);

    let tokenTimeout: NodeJS.Timeout | null = null;

    try {
      let batch: string[] = [];
      let lastTokenTime = Date.now();

      for await (const token of llmStream) {
        // Check if cancelled
        if (this.currentStream === null) {
          result.wasInterrupted = true;
          break;
        }

        // Reset token timeout
        if (tokenTimeout) clearTimeout(tokenTimeout);
        tokenTimeout = setTimeout(() => {
          this.handleTokenTimeout(debateId, turnNumber);
        }, this.config.tokenTimeoutMs);

        // Add to batch
        batch.push(token);
        result.tokens.push(token);
        result.totalTokens++;

        // Check backpressure
        if (this.buffer.length >= this.config.highWaterMark) {
          await this.waitForBufferDrain();
        }

        // Flush batch if ready
        if (batch.length >= this.config.batchSize ||
            Date.now() - lastTokenTime > this.config.batchDelayMs) {
          await this.flushBatch(debateId, avatarId, turnNumber, batch);
          batch = [];
          lastTokenTime = Date.now();
        }
      }

      // Flush remaining tokens
      if (batch.length > 0) {
        await this.flushBatch(debateId, avatarId, turnNumber, batch);
      }

      result.endTime = Date.now();

    } catch (error) {
      result.error = error as Error;

      // Attempt recovery
      if (this.shouldRetry(error)) {
        return this.retryStreamTurn(debateId, avatarId, turnNumber, result);
      }

    } finally {
      clearTimeout(turnTimeout);
      if (tokenTimeout) clearTimeout(tokenTimeout);
      this.currentStream = null;
    }

    return result;
  }

  /**
   * Send token batch to all clients
   */
  private async flushBatch(
    debateId: string,
    avatarId: string,
    turnNumber: number,
    tokens: string[]
  ): Promise<void> {
    const message: StreamMessage = {
      type: 'tokens',
      debateId,
      avatarId,
      turnNumber,
      tokens,
      timestamp: Date.now()
    };

    // Add to buffer
    this.buffer.push(...tokens);

    // Broadcast to clients
    await this.broadcast(debateId, message);

    // Clear from buffer after successful send
    this.buffer.splice(0, tokens.length);
  }

  /**
   * Handle backpressure by waiting for buffer to drain
   */
  private async waitForBufferDrain(): Promise<void> {
    this.isPaused = true;

    while (this.buffer.length > this.config.lowWaterMark) {
      await new Promise(r => setTimeout(r, 10));
    }

    this.isPaused = false;
  }

  /**
   * Cancel current stream (for admin interrupt)
   */
  cancelStream(): void {
    this.currentStream = null;
  }
}
```

---

## WebSocket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `debate:join` | `{ debateId }` | Join debate room |
| `debate:leave` | `{ debateId }` | Leave debate room |
| `admin:pause` | `{ debateId }` | Admin pauses debate |
| `admin:resume` | `{ debateId }` | Admin resumes debate |
| `admin:terminate` | `{ debateId, reason }` | Admin terminates |
| `admin:inject` | `{ debateId, content, asAvatarId? }` | Inject message |
| `admin:mute` | `{ debateId, avatarId }` | Mute avatar |
| `admin:skip` | `{ debateId, avatarId }` | Skip avatar's turn |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `debate:started` | `{ debateId, topic, avatars, maxTurns }` | Debate begins |
| `turn:start` | `{ debateId, avatarId, turnNumber }` | Turn begins |
| `turn:token` | `{ debateId, avatarId, tokens[] }` | Token batch |
| `turn:complete` | `{ debateId, avatarId, content, turnNumber }` | Turn ends |
| `debate:paused` | `{ debateId, atTurn }` | Debate paused |
| `debate:resumed` | `{ debateId, atTurn }` | Debate resumed |
| `debate:complete` | `{ debateId, summary }` | Debate finished |
| `debate:terminated` | `{ debateId, reason }` | Debate stopped |
| `message:injected` | `{ debateId, message }` | Admin message |
| `avatar:muted` | `{ debateId, avatarId }` | Avatar muted |
| `error` | `{ debateId, error }` | Error occurred |

---

## State Persistence

The debate state must be persistable for:
- Server restarts
- Pause/resume across sessions
- Historical analysis

```typescript
interface PersistedDebateState {
  // Identity
  id: string;
  sessionId: string;

  // Configuration
  topic: string;
  strategy: TurnStrategy;
  memoryScope: MemoryScope;
  maxTurns: number;

  // Participants
  avatarIds: string[];
  turnOrder: string[];
  mutedAvatars: string[];

  // Progress
  status: DebateStatus;
  currentTurn: number;

  // Timing
  createdAt: Date;
  startedAt: Date | null;
  pausedAt: Date | null;
  terminatedAt: Date | null;

  // Content (stored separately in messages table)
  messageCount: number;
  totalTokens: number;

  // Metadata
  terminationReason: string | null;
  adminActions: AdminAction[];
}

interface AdminAction {
  type: string;
  timestamp: Date;
  adminId: string;
  details: Record<string, any>;
}
```

---

## Error Handling

```typescript
enum DebateError {
  // Lifecycle errors
  INVALID_STATE_TRANSITION = "invalid_state_transition",
  DEBATE_NOT_FOUND = "debate_not_found",

  // Avatar errors
  AVATAR_NOT_FOUND = "avatar_not_found",
  AVATAR_INACTIVE = "avatar_inactive",
  AVATAR_NOT_IN_DEBATE = "avatar_not_in_debate",

  // LLM errors
  LLM_TIMEOUT = "llm_timeout",
  LLM_ERROR = "llm_error",
  LLM_RATE_LIMITED = "llm_rate_limited",

  // Stream errors
  STREAM_INTERRUPTED = "stream_interrupted",
  STREAM_TIMEOUT = "stream_timeout",
  CLIENT_DISCONNECTED = "client_disconnected",

  // Admin errors
  UNAUTHORIZED = "unauthorized",
  INVALID_OPERATION = "invalid_operation",
}

class DebateErrorHandler {
  handleError(error: DebateError, context: ErrorContext): ErrorResponse {
    switch (error) {
      case DebateError.LLM_TIMEOUT:
        return this.handleLLMTimeout(context);

      case DebateError.LLM_RATE_LIMITED:
        return this.handleRateLimit(context);

      case DebateError.CLIENT_DISCONNECTED:
        // Continue debate, client can reconnect
        return { action: 'continue', notify: false };

      default:
        return { action: 'terminate', reason: error };
    }
  }

  private handleLLMTimeout(context: ErrorContext): ErrorResponse {
    // Retry with shorter max_tokens
    if (context.retryCount < 3) {
      return {
        action: 'retry',
        modifications: { maxTokens: context.maxTokens * 0.5 }
      };
    }

    // Skip this turn after max retries
    return {
      action: 'skip_turn',
      reason: 'LLM timeout after multiple retries'
    };
  }
}
```

---

## Configuration Reference

```typescript
const DEFAULT_DEBATE_CONFIG: DebateEngineConfig = {
  // Turn management
  turn: {
    defaultStrategy: TurnStrategy.ROUND_ROBIN,
    maxTurnsDefault: 6,
    maxTurnsLimit: 20,
    turnDelayMs: 500,
  },

  // Memory
  memory: {
    defaultScope: MemoryScope.RECENT,
    maxTurnsInContext: 6,
    maxContextTokens: 4000,
    enableSummarization: true,
    summarizationThreshold: 5,
  },

  // Streaming
  streaming: {
    batchSize: 5,
    batchDelayMs: 50,
    maxBufferSize: 100,
    highWaterMark: 80,
    lowWaterMark: 20,
    turnTimeoutMs: 60000,
    tokenTimeoutMs: 5000,
  },

  // Recovery
  recovery: {
    maxRetries: 3,
    retryDelayMs: 1000,
    enablePartialRecovery: true,
  },

  // Limits
  limits: {
    maxAvatars: 5,
    minAvatars: 2,
    maxTokensPerTurn: 500,
    maxDebateDurationMs: 600000, // 10 minutes
  },
};
```
