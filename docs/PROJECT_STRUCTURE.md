# Project Structure & Architecture

## Stack Choice: Express + Vite + React (Current)

### Why Keep the Current Stack

| Factor | Decision | Reasoning |
|--------|----------|-----------|
| **Framework** | Express + Vite | Already established, battle-tested, full control over WebSocket handling |
| **Frontend** | React 19 + Zustand | Modern React with hooks, Zustand provides simple reactive state for real-time updates |
| **Database** | PostgreSQL + Drizzle | Type-safe ORM, excellent migration support, JSON columns for flexible schemas |
| **Real-time** | Native WebSocket (ws) | Full control over streaming, no Socket.io overhead, direct integration with LLM streaming |

### Why NOT Next.js

| Concern | Express Advantage |
|---------|-------------------|
| WebSocket Control | Native ws library gives fine-grained control for LLM streaming |
| API Routes | Express middleware pattern better for complex orchestration layers |
| Deployment | Already configured for current infrastructure |
| Learning Curve | Team already familiar with current patterns |

---

## Proposed Folder Structure

```
gcf/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn/Radix primitives
│   │   │   ├── agent/               # Agent-facing components
│   │   │   │   ├── avatar-council/  # Avatar Council components (barrel export)
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── AvatarCard.tsx
│   │   │   │   │   ├── AvatarChat.tsx
│   │   │   │   │   ├── DebateView.tsx
│   │   │   │   │   ├── MessageBubble.tsx
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   ├── ModeSelector.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── primitives/      # Reusable agent UI primitives
│   │   │   │   └── forms/           # Form components
│   │   │   ├── admin/               # Admin-facing components
│   │   │   │   ├── avatar-council/  # Admin Avatar Council (barrel export)
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── AdminHeader.tsx
│   │   │   │   │   ├── NetworkGraphPanel.tsx
│   │   │   │   │   ├── AvatarManagementPanel.tsx
│   │   │   │   │   ├── DebateControlPanel.tsx
│   │   │   │   │   ├── ObservabilityPanel.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── public/              # Public-facing website components
│   │   │
│   │   ├── pages/                   # Route pages
│   │   │   ├── agents/              # Agent portal pages
│   │   │   │   ├── AgentAvatarCouncil.tsx
│   │   │   │   └── ...
│   │   │   ├── admin/               # Admin portal pages
│   │   │   │   ├── AdminAvatarCouncil.tsx
│   │   │   │   └── ...
│   │   │   └── public/              # Public website pages
│   │   │
│   │   ├── lib/                     # Client utilities
│   │   │   ├── utils.ts             # General utilities
│   │   │   ├── api.ts               # API client (fetch wrappers)
│   │   │   ├── websocket.ts         # WebSocket connection manager
│   │   │   └── stores/              # Zustand stores
│   │   │       ├── avatarCouncilStore.ts
│   │   │       ├── adminStore.ts
│   │   │       └── ...
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useDebate.ts
│   │   │   ├── useAvatarSelection.ts
│   │   │   └── ...
│   │   │
│   │   ├── contexts/                # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ...
│   │   │
│   │   ├── App.tsx                  # Root component & routing
│   │   └── main.tsx                 # Entry point
│   │
│   └── index.html
│
├── server/                          # Express Backend
│   ├── index.ts                     # Server entry point
│   ├── db.ts                        # Database connection
│   ├── storage.ts                   # Storage abstraction layer
│   │
│   ├── routes/                      # API route handlers
│   │   ├── index.ts                 # Route registration
│   │   ├── avatar-council.ts        # Avatar Council REST APIs
│   │   ├── admin-avatars.ts         # Admin avatar management
│   │   ├── quotes.ts
│   │   └── ...
│   │
│   ├── services/                    # Business logic services
│   │   ├── avatar-council/          # Avatar Council services (modular)
│   │   │   ├── index.ts             # Barrel export
│   │   │   ├── orchestrationEngine.ts
│   │   │   ├── orchestrationLayer.ts
│   │   │   ├── autoRouter.ts
│   │   │   ├── debateModeEngine.ts
│   │   │   ├── avatarRegistry.ts
│   │   │   ├── personaRegistry.ts
│   │   │   └── observabilityService.ts
│   │   │
│   │   ├── llm/                     # LLM abstraction (model swapping)
│   │   │   ├── index.ts             # Barrel export
│   │   │   ├── llmService.ts        # Main service
│   │   │   ├── providers/           # Provider implementations
│   │   │   │   ├── openai.ts
│   │   │   │   ├── anthropic.ts     # Future
│   │   │   │   ├── local.ts         # Future (Ollama, etc.)
│   │   │   │   └── index.ts
│   │   │   └── types.ts             # Provider interface
│   │   │
│   │   ├── voice/                   # Voice synthesis (future-ready)
│   │   │   ├── index.ts
│   │   │   ├── voiceService.ts
│   │   │   └── providers/
│   │   │       ├── elevenlabs.ts    # Future
│   │   │       ├── playht.ts        # Future
│   │   │       └── index.ts
│   │   │
│   │   ├── rag/                     # RAG / Knowledge Base (future-ready)
│   │   │   ├── index.ts
│   │   │   ├── embeddingService.ts
│   │   │   ├── vectorStore.ts
│   │   │   └── retrievalService.ts
│   │   │
│   │   └── ...
│   │
│   ├── websocket/                   # WebSocket handlers (separated)
│   │   ├── index.ts                 # WebSocket server setup
│   │   ├── avatarCouncil.ts         # Avatar Council WS handlers
│   │   ├── adminAvatarCouncil.ts    # Admin WS handlers
│   │   └── types.ts                 # WS event types
│   │
│   ├── middleware/                  # Express middleware
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   │
│   └── scripts/                     # Database scripts
│       ├── migrate-content.ts
│       └── ...
│
├── shared/                          # Shared between client & server
│   ├── schema.ts                    # Drizzle schema (re-exports models)
│   ├── types/                       # Shared TypeScript types
│   │   ├── avatarCouncil.ts
│   │   ├── api.ts
│   │   └── websocket.ts
│   │
│   └── models/                      # Database models (Drizzle schemas)
│       ├── avatarCouncil.ts
│       ├── training.ts
│       ├── crm.ts
│       └── ...
│
├── migrations/                      # Drizzle migrations
│   ├── 0000_*.sql
│   └── meta/
│
├── docs/                            # Documentation
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── AVATAR_COUNCIL_PLAN.md
│   ├── AUTO_ROUTING_DESIGN.md
│   ├── DEBATE_ENGINE_DESIGN.md
│   ├── AGENT_LOUNGE_UI_DESIGN.md
│   ├── ADMIN_LOUNGE_DESIGN.md
│   └── API.md
│
├── config/                          # Configuration files
│   ├── avatars.json                 # Avatar seed data
│   ├── prompts/                     # System prompts (externalized)
│   │   ├── insurance-expert.md
│   │   ├── sales-closer.md
│   │   └── ...
│   └── voice-mappings.json          # Avatar → voice ID mappings (future)
│
├── scripts/                         # Build & utility scripts
│   ├── build.ts
│   ├── seed-avatars.ts
│   └── check-schema.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
└── .env                             # Environment variables
```

---

## Key Architectural Decisions

### 1. Barrel Exports for Clean Imports

Every module folder has an `index.ts` that exports public APIs:

```typescript
// server/services/avatar-council/index.ts
export { orchestrationEngine } from "./orchestrationEngine";
export { autoRouter } from "./autoRouter";
export { debateModeEngine } from "./debateModeEngine";
export type { DebateConfig, DebateState } from "./debateModeEngine";
```

Usage:
```typescript
// Clean import
import { orchestrationEngine, autoRouter } from "@/services/avatar-council";

// Instead of
import { orchestrationEngine } from "@/services/avatar-council/orchestrationEngine";
import { autoRouter } from "@/services/avatar-council/autoRouter";
```

### 2. LLM Provider Abstraction (Model Swapping)

```typescript
// server/services/llm/types.ts
export interface LLMProvider {
  name: string;

  complete(params: CompletionParams): Promise<CompletionResponse>;

  stream(params: CompletionParams): AsyncIterable<StreamChunk>;

  countTokens(text: string): Promise<number>;
}

export interface CompletionParams {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
```

```typescript
// server/services/llm/providers/openai.ts
export class OpenAIProvider implements LLMProvider {
  name = "openai";

  async *stream(params: CompletionParams): AsyncIterable<StreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield {
        content: chunk.choices[0]?.delta?.content || "",
        done: chunk.choices[0]?.finish_reason === "stop",
      };
    }
  }
}
```

```typescript
// server/services/llm/index.ts
const providers: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
  // anthropic: new AnthropicProvider(),  // Future
  // ollama: new OllamaProvider(),         // Future
};

export function getLLMProvider(name: string = "openai"): LLMProvider {
  return providers[name] || providers.openai;
}
```

### 3. Voice Service Abstraction (Future-Ready)

```typescript
// server/services/voice/types.ts
export interface VoiceProvider {
  name: string;

  synthesize(params: SynthesisParams): Promise<AudioBuffer>;

  streamSynthesize(params: SynthesisParams): AsyncIterable<AudioChunk>;

  getVoices(): Promise<Voice[]>;
}

export interface SynthesisParams {
  text: string;
  voiceId: string;
  speed?: number;
  pitch?: number;
}
```

```typescript
// server/services/voice/index.ts
export class VoiceService {
  private provider: VoiceProvider;

  constructor(providerName: string = "elevenlabs") {
    this.provider = getVoiceProvider(providerName);
  }

  async synthesizeForAvatar(avatarId: string, text: string): Promise<Buffer> {
    const voiceId = await this.getVoiceIdForAvatar(avatarId);
    return this.provider.synthesize({ text, voiceId });
  }
}
```

### 4. WebSocket Separation

```typescript
// server/websocket/index.ts
import { WebSocketServer } from "ws";
import { setupAvatarCouncilWS } from "./avatarCouncil";
import { setupAdminWS } from "./adminAvatarCouncil";

export function setupWebSockets(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const path = req.url;

    if (path?.startsWith("/ws/avatar-council")) {
      setupAvatarCouncilWS(ws, req);
    } else if (path?.startsWith("/ws/admin")) {
      setupAdminWS(ws, req);
    }
  });

  return wss;
}
```

### 5. Configuration Externalization

System prompts in markdown files for easy editing:

```markdown
<!-- config/prompts/insurance-expert.md -->
# Insurance Expert

You are an Insurance Expert AI assistant for Heritage Life Solutions.

## Expertise
- Life insurance policies (term, whole, universal)
- Underwriting guidelines
- Compliance and regulations

## Communication Style
- Professional and thorough
- Uses precise terminology
- Provides citations when relevant

## Guidelines
- Always verify policy details before quoting
- Recommend compliance review for complex cases
- Never guarantee coverage without underwriting
```

Loaded at runtime:
```typescript
// server/services/avatar-council/personaRegistry.ts
function loadPromptFromFile(slug: string): string {
  const promptPath = path.join(process.cwd(), "config/prompts", `${slug}.md`);
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, "utf-8");
  }
  return DEFAULT_PROMPTS[slug] || "";
}
```

---

## Environment Variables

```bash
# .env
# Server
PORT=4500
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/heritage

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...         # Future
OLLAMA_BASE_URL=http://localhost:11434  # Future

# Voice Providers (Future)
ELEVENLABS_API_KEY=...
PLAYHT_API_KEY=...

# Feature Flags
ENABLE_VOICE=false
ENABLE_RAG=false
ENABLE_ANIMATIONS=true
DEBUG_LLM=false
DEBUG_WEBSOCKET=false
```

---

## Local Development Setup

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start database (if using Docker)
docker-compose up -d postgres

# 4. Run migrations
npm run db:push

# 5. Seed avatars
npm run seed:avatars

# 6. Start development server
npm run dev
# → Server running at http://localhost:4500
# → Vite HMR enabled
# → WebSocket at ws://localhost:4500/ws/avatar-council
```

### Debug Mode

```bash
# Enable debug logging
DEBUG_LLM=true DEBUG_WEBSOCKET=true npm run dev

# Or use VS Code debugger with launch.json
```

### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "server/index.ts"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG_LLM": "true",
        "DEBUG_WEBSOCKET": "true"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ Pages   │──│Components│──│ Hooks   │──│ Stores  │                │
│  └────┬────┘  └─────────┘  └────┬────┘  └────┬────┘                │
│       │                         │            │                       │
│       └─────────────────────────┼────────────┘                       │
│                                 │                                    │
│                           WebSocket / API                            │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────┐
│                           SERVER                                     │
│                                 │                                    │
│  ┌──────────────────────────────┴───────────────────────────────┐   │
│  │                      WebSocket Handlers                       │   │
│  │   avatarCouncil.ts  ←→  adminAvatarCouncil.ts                │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                    │
│  ┌──────────────────────────────┴───────────────────────────────┐   │
│  │                      Avatar Council Services                  │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │   │
│  │  │ Orchestration │  │  Auto Router  │  │ Debate Engine │     │   │
│  │  │    Engine     │──│               │──│               │     │   │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘     │   │
│  │          │                  │                  │              │   │
│  │          └──────────────────┼──────────────────┘              │   │
│  │                             │                                 │   │
│  │  ┌───────────────┐  ┌──────┴──────┐  ┌───────────────┐       │   │
│  │  │ Persona       │  │ Observability│  │ Avatar        │       │   │
│  │  │ Registry      │  │ Service     │  │ Registry      │       │   │
│  │  └───────────────┘  └─────────────┘  └───────────────┘       │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                    │
│  ┌──────────────────────────────┴───────────────────────────────┐   │
│  │                      Core Services                            │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │   │
│  │  │  LLM Service  │  │ Voice Service │  │  RAG Service  │     │   │
│  │  │  (providers)  │  │  (providers)  │  │  (embeddings) │     │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘     │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                    │
│                           ┌─────┴─────┐                             │
│                           │  Storage  │                             │
│                           │ (Drizzle) │                             │
│                           └─────┬─────┘                             │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                            ┌─────┴─────┐
                            │ PostgreSQL│
                            └───────────┘
```

---

## Future Extensions

### Voice Integration
1. Add `ELEVENLABS_API_KEY` to `.env`
2. Implement `server/services/voice/providers/elevenlabs.ts`
3. Map avatars to voice IDs in `config/voice-mappings.json`
4. Add WebSocket events for audio streaming
5. Update `VoicePlaybackControl` component

### Animation System
1. Add Framer Motion variants per avatar
2. Store animation configs in `config/animations/`
3. Create `AnimatedAvatar` component wrapper
4. Hook into streaming events for lip-sync (future)

### Model Swapping
1. Add provider to `server/services/llm/providers/`
2. Implement `LLMProvider` interface
3. Register in provider map
4. Switch via environment variable or admin UI

### RAG / Knowledge Base
1. Set up vector database (pgvector or Pinecone)
2. Implement `server/services/rag/`
3. Add document upload API
4. Integrate with avatar system prompts

---

## Debugging Checklist

| Issue | Check |
|-------|-------|
| WebSocket not connecting | Check `ws://localhost:4500/ws/avatar-council` in browser devtools |
| LLM not responding | Set `DEBUG_LLM=true`, check API key |
| Database errors | Run `npm run db:push`, check `DATABASE_URL` |
| Type errors | Run `npm run check` (tsc) |
| Build failures | Check `npm run build` output |
| HMR not working | Restart Vite dev server |

---

## Performance Considerations

1. **LLM Streaming**: Use `AsyncIterable` for token-by-token streaming
2. **WebSocket Batching**: Batch tokens every 50ms to reduce overhead
3. **Database**: Use connection pooling (already via Drizzle/pg)
4. **Client State**: Zustand selectors prevent unnecessary re-renders
5. **Code Splitting**: Dynamic imports for admin components (future)
