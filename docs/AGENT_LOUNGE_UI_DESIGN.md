# Agent Lounge UI Design - Component Skeleton

## Overview

The Agent Lounge is the user-facing interface where insurance agents interact with AI avatars. This document defines the component structure, boundaries, and data flow.

---

## Page Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT LOUNGE LAYOUT                                │
│  (Provides navigation, auth context, layout shell)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         PAGE HEADER                                     │ │
│  │  ┌──────────────────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │ Title + Description          │  │ Connection Status | Refresh Btn │ │ │
│  │  └──────────────────────────────┘  └─────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────┬──────────────────────────────────────────────────┐ │
│  │   LEFT PANEL        │            MAIN CONTENT AREA                     │ │
│  │   (Collapsible)     │                                                  │ │
│  │                     │  ┌────────────────────────────────────────────┐  │ │
│  │  ┌───────────────┐  │  │                                            │  │ │
│  │  │ Mode Selector │  │  │                                            │  │ │
│  │  │ Tabs:         │  │  │          CHAT VIEW                         │  │ │
│  │  │ - Single      │  │  │            or                              │  │ │
│  │  │ - Multi       │  │  │          DEBATE VIEW                       │  │ │
│  │  │ - Debate      │  │  │                                            │  │ │
│  │  └───────────────┘  │  │       (Switches based on mode)             │  │ │
│  │                     │  │                                            │  │ │
│  │  ┌───────────────┐  │  │                                            │  │ │
│  │  │ Selection Bar │  │  └────────────────────────────────────────────┘  │ │
│  │  │ N/Max + Clear │  │                                                  │ │
│  │  └───────────────┘  │                                                  │ │
│  │                     │                                                  │ │
│  │  ┌───────────────┐  │                                                  │ │
│  │  │               │  │                                                  │ │
│  │  │   AVATAR      │  │                                                  │ │
│  │  │   GRID        │  │                                                  │ │
│  │  │               │  │                                                  │ │
│  │  │  (Scrollable) │  │                                                  │ │
│  │  │               │  │                                                  │ │
│  │  └───────────────┘  │                                                  │ │
│  └─────────────────────┴──────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
AgentAvatarCouncil (Page)
├── AgentLoungeLayout (Shell)
│   └── [Navigation, Auth Context]
│
├── PageHeader
│   ├── TitleSection
│   │   ├── Icon
│   │   ├── Title
│   │   └── Description
│   └── StatusSection
│       ├── ConnectionBadge
│       └── RefreshButton
│
├── LeftPanel (Collapsible)
│   ├── ModeSelector
│   │   ├── TabsList
│   │   │   ├── SingleTab
│   │   │   ├── MultiTab
│   │   │   └── DebateTab
│   │   └── ModeDescription
│   │
│   ├── SelectionBar
│   │   ├── SelectionCount
│   │   ├── ClearButton
│   │   └── AutoRoutingHint (conditional)
│   │
│   └── AvatarGrid (ScrollArea)
│       └── AvatarCard[] (mapped)
│
├── PanelToggle (Button)
│
└── MainContent
    ├── AvatarChat (when mode = single/multi)
    │   ├── ChatHeader
    │   ├── MessageList
    │   └── ChatInput
    │
    └── DebateView (when mode = debate)
        ├── DebateHeader
        ├── DebateArena
        └── DebateControls
```

---

## Component Specifications

### 1. AvatarCard

Visual representation of an AI avatar for selection.

```typescript
interface AvatarCardProps {
  // Data
  avatar: Avatar;

  // State
  isSelected: boolean;
  isDisabled: boolean;
  isActive: boolean;        // Currently responding

  // Callbacks
  onSelect: () => void;
  onDeselect: () => void;

  // Variants
  variant: "compact" | "full";
}
```

**Structure (Full Variant):**
```
┌─────────────────────────────────────────────────┐
│ ┌─────────┐                          [✓] │
│ │  ICON   │  Avatar Name                       │
│ │ (color) │  [debate-style badge]              │
│ └─────────┘                                    │
│                                                │
│ Speaking style description text that           │
│ may span multiple lines...                     │
│                                                │
│ [domain1] [domain2] [domain3] [domain4]        │
│                                                │
│ Priority: ████████░░                           │
└─────────────────────────────────────────────────┘
```

**Structure (Compact Variant):**
```
┌────────────────────────────────┐
│ [ICON] Avatar Name       [✓]  │
└────────────────────────────────┘
```

### 2. AvatarChat

Main chat interface for single/multi avatar interactions.

```typescript
interface AvatarChatProps {
  className?: string;
}

// Internal State (from store)
interface ChatState {
  messages: AvatarMessage[];
  streaming: {
    avatarId: string | null;
    content: string;
  };
  isLoading: boolean;
  error: string | null;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ CHAT HEADER                                                     │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ "Chat"                   [connected] [🗑️]                 │  │
│ └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ MESSAGE LIST (ScrollArea)                                       │
│                                                                 │
│   ┌──────────────────────────────────────────────────┐         │
│   │                                    [USER ICON]  │         │
│   │         User message aligned right              │         │
│   │                                    12:34 PM     │         │
│   └──────────────────────────────────────────────────┘         │
│                                                                 │
│   ┌──────────────────────────────────────────────────┐         │
│   │ [AVATAR ICON]                                    │         │
│   │ Avatar Name                                      │         │
│   │ Avatar response with **markdown** support        │         │
│   │ - Bullet points                                  │         │
│   │ - More content                                   │         │
│   │ 12:35 PM · 245 tokens                           │         │
│   └──────────────────────────────────────────────────┘         │
│                                                                 │
│   ┌──────────────────────────────────────────────────┐         │
│   │ [AVATAR ICON]   ⟳ streaming...                   │         │
│   │ Avatar Name                                      │         │
│   │ Partial response being streamed█                 │         │
│   └──────────────────────────────────────────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ERROR BAR (conditional)                                         │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ ⚠️ Error message here                                      │  │
│ └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ INPUT AREA                                                      │
│ ┌─────────────────────────────────────────────────────┐ ┌────┐ │
│ │ Ask a question...                                   │ │ ➤  │ │
│ │ (auto-resize textarea)                              │ │    │ │
│ └─────────────────────────────────────────────────────┘ └────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3. MessageBubble

Individual message display with avatar attribution.

```typescript
interface MessageBubbleProps {
  message: AvatarMessage;
  avatars: Avatar[];

  // Streaming state
  isStreaming?: boolean;
  streamingContent?: string;

  // Display options
  showTimestamp?: boolean;
  showTokenCount?: boolean;
}
```

**Structure (Avatar Message):**
```
┌──────────────────────────────────────────────────────────────┐
│ [ICON]  Avatar Name                                          │
│         ────────────────────────────────────────────────     │
│         Message content with **markdown** rendering.         │
│                                                              │
│         - Lists are supported                                │
│         - Multiple items                                     │
│                                                              │
│         > Blockquotes too                                    │
│                                                              │
│         `inline code` and code blocks                        │
│         ────────────────────────────────────────────────     │
│         12:34 PM · 156 tokens                                │
└──────────────────────────────────────────────────────────────┘
```

### 4. DebateView

Specialized view for debate mode with turn tracking.

```typescript
interface DebateViewProps {
  className?: string;
}

// Internal State
interface DebateState {
  topic: string;
  status: "idle" | "active" | "paused" | "completed";
  currentTurn: number;
  maxTurns: number;
  participants: DebateParticipant[];
  turns: DebateTurn[];
  streaming: {
    avatarId: string | null;
    content: string;
  };
}

interface DebateParticipant {
  avatar: Avatar;
  stance?: string;
  turnsTaken: number;
  totalTokens: number;
}

interface DebateTurn {
  turnNumber: number;
  avatarId: string;
  content: string;
  tokens: number;
  timestamp: Date;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ DEBATE HEADER                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ "Debate Mode"              [ACTIVE] Turn 3/6              │  │
│ └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TOPIC DISPLAY                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 💬 "Should agents focus on volume or quality of leads?"   │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PARTICIPANT CARDS                                               │
│ ┌────────────────────────┐  ┌────────────────────────┐         │
│ │ [ICON]                 │  │                 [ICON] │         │
│ │ Sales Closer           │  │       Mindset Coach    │         │
│ │ Stance: Challenger     │  │     Stance: Advocate   │         │
│ │ Turns: 2 | 380 tokens  │  │ 1 turn | 245 tokens   │         │
│ │      ◀── SPEAKING      │  │                        │         │
│ └────────────────────────┘  └────────────────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DEBATE ARENA (ScrollArea)                                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ TURN 1 - Sales Closer                                   │  │
│   │ ───────────────────────────────────────────────────     │  │
│   │ Opening statement content...                            │  │
│   │                                                         │  │
│   │                                         12:30 PM        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ TURN 2 - Mindset Coach                                  │  │
│   │ ───────────────────────────────────────────────────     │  │
│   │ Response to Sales Closer's points...                    │  │
│   │                                                         │  │
│   │                                         12:31 PM        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ TURN 3 - Sales Closer  ⟳ STREAMING                      │  │
│   │ ───────────────────────────────────────────────────     │  │
│   │ Rebuttal content being generated█                       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ DEBATE CONTROLS                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │                                                           │  │
│ │  TOPIC INPUT (when idle)                                  │  │
│ │  ┌─────────────────────────────────────────────┐ [Start] │  │
│ │  │ Enter debate topic...                       │         │  │
│ │  └─────────────────────────────────────────────┘         │  │
│ │                                                           │  │
│ │  STATUS (when active)                                     │  │
│ │  [⏸️ Pause]  Watching debate...  [⏹️ Stop]                │  │
│ │                                                           │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5. DebateTurnCard

Individual turn display in debate view.

```typescript
interface DebateTurnCardProps {
  turn: DebateTurn;
  avatar: Avatar;
  isCurrentTurn: boolean;
  isStreaming: boolean;
  streamingContent?: string;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ TURN N - Avatar Name                     [stance badge]         │
│ ────────────────────────────────────────────────────────────    │
│                                                                 │
│ Turn content with markdown rendering...                         │
│                                                                 │
│ ────────────────────────────────────────────────────────────    │
│ 12:34 PM · 245 tokens                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 6. ModeSelector

Tab-based mode selection with descriptions.

```typescript
interface ModeSelectorProps {
  mode: "single" | "multi" | "debate";
  onModeChange: (mode: "single" | "multi" | "debate") => void;
  disabled?: boolean;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────┬─────────────┬─────────────┐                    │
│ │   Single    │    Multi    │   Debate    │   (TabsList)       │
│ │   [💬]      │    [👥]     │    [⚔️]     │                    │
│ └─────────────┴─────────────┴─────────────┘                    │
│                                                                 │
│ ℹ️ Get a response from one expert avatar.                       │
│    Best for focused questions.                (ModeDescription) │
└─────────────────────────────────────────────────────────────────┘
```

### 7. ConnectionBadge

Real-time connection status indicator.

```typescript
interface ConnectionBadgeProps {
  status: "connected" | "connecting" | "disconnected" | "error";
}
```

**States:**
```
Connected:    [🟢 connected]
Connecting:   [⟳  connecting...]
Disconnected: [⚫ disconnected]
Error:        [🔴 error]
```

### 8. ChatInput

Message input with auto-resize and keyboard handling.

```typescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;

  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}
```

**Structure:**
```
┌───────────────────────────────────────────────────────┐ ┌──────┐
│ Placeholder or user input...                          │ │  ➤   │
│ (Auto-resizing textarea)                              │ │      │
│ (Shift+Enter for new line, Enter to send)             │ │      │
└───────────────────────────────────────────────────────┘ └──────┘
```

### 9. VoicePlaybackControl (Future)

Placeholder for text-to-speech functionality.

```typescript
interface VoicePlaybackControlProps {
  content: string;
  avatarId: string;

  // State
  isPlaying: boolean;
  isLoading: boolean;

  // Callbacks
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}
```

**Structure:**
```
┌───────────────────────────────────┐
│ [▶️ Play] [⏸️] [⏹️]  0:00 / 0:45  │
│ ━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░  │
└───────────────────────────────────┘
```

---

## Data Flow

### State Management (Zustand Store)

```typescript
interface AvatarCouncilStore {
  // Avatar Data
  avatars: Avatar[];
  selectedAvatarIds: string[];

  // Mode
  mode: "single" | "multi" | "debate";

  // Session
  sessionId: string | null;
  messages: AvatarMessage[];

  // Debate State
  currentDebate: DebateState | null;

  // Connection
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";

  // UI State
  isLoading: boolean;
  error: string | null;

  // Streaming
  streaming: {
    avatarId: string | null;
    content: string;
  };

  // Actions
  fetchAvatars: () => Promise<void>;
  selectAvatar: (id: string) => void;
  deselectAvatar: (id: string) => void;
  clearSelectedAvatars: () => void;
  setMode: (mode: "single" | "multi" | "debate") => void;

  sendMessage: (content: string) => void;
  clearMessages: () => void;

  startDebate: (topic: string) => void;
  pauseDebate: () => void;
  resumeDebate: () => void;
  stopDebate: () => void;

  connect: (userId: string) => void;
  disconnect: () => void;
}
```

### WebSocket Events

```typescript
// Outgoing (Client → Server)
type ClientEvent =
  | { type: "auth"; userId: string }
  | { type: "avatar:prompt"; sessionId: string; message: string; avatarIds: string[]; mode: string }
  | { type: "debate:start"; topic: string; avatarIds: string[] }
  | { type: "debate:pause" }
  | { type: "debate:resume" }
  | { type: "debate:stop" };

// Incoming (Server → Client)
type ServerEvent =
  | { type: "connected"; sessionId: string }
  | { type: "avatar:response:start"; avatarId: string }
  | { type: "avatar:response:token"; avatarId: string; token: string }
  | { type: "avatar:response:end"; avatarId: string; content: string; tokens: number }
  | { type: "debate:turn:start"; avatarId: string; turnNumber: number }
  | { type: "debate:turn:end"; avatarId: string; content: string; turnNumber: number }
  | { type: "debate:complete"; summary: DebateSummary }
  | { type: "error"; message: string };
```

---

## Component File Structure

```
client/src/
├── pages/
│   └── agents/
│       └── AgentAvatarCouncil.tsx       # Main page component
│
├── components/
│   └── agent/
│       ├── AvatarCard.tsx               # Avatar selection card
│       ├── AvatarChat.tsx               # Chat interface
│       ├── MessageBubble.tsx            # Individual message
│       ├── ChatInput.tsx                # Message input
│       ├── DebateView.tsx               # Debate interface
│       ├── DebateTurnCard.tsx           # Debate turn display
│       ├── DebateParticipantCard.tsx    # Participant status
│       ├── DebateControls.tsx           # Debate control buttons
│       ├── ModeSelector.tsx             # Mode tabs
│       ├── SelectionBar.tsx             # Selection count/clear
│       ├── ConnectionBadge.tsx          # Connection status
│       ├── VoicePlaybackControl.tsx     # Future: TTS control
│       └── index.ts                     # Barrel exports
│
└── lib/
    └── avatarCouncilStore.ts            # Zustand store
```

---

## Responsive Behavior

### Desktop (≥1024px)
- Side-by-side layout: Avatar panel (380px) | Chat/Debate (flex)
- Full avatar cards with details
- Panel collapsible

### Tablet (768px - 1023px)
- Stacked layout: Avatar panel above Chat/Debate
- Compact avatar cards
- Mode selector as horizontal tabs

### Mobile (<768px)
- Full-width single column
- Avatar selection as bottom sheet or modal
- Floating action button for avatar selection
- Simplified chat interface

---

## Accessibility Considerations

1. **Keyboard Navigation**
   - Tab through avatar cards
   - Enter/Space to select
   - Escape to close panels
   - Arrow keys in mode selector

2. **Screen Reader Support**
   - ARIA labels on all interactive elements
   - Live regions for streaming content
   - Announce new messages

3. **Visual Indicators**
   - Selected state clearly visible
   - Connection status with icon + text
   - Loading states with spinners

---

## Future Extensions

### Voice Playback
- TTS integration (ElevenLabs, etc.)
- Per-message play button
- Avatar-specific voices

### Multi-Avatar View Enhancements
- Side-by-side response panels
- Synchronized scrolling
- Response comparison view

### Debate Enhancements
- Audience voting
- Moderator injection
- Summary generation
- Transcript export
