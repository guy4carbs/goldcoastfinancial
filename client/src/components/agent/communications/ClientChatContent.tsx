/**
 * ClientChatContent - Client Chat functionality for Communications hub
 * Handles messaging between agents and their assigned clients
 * Connects to iOS app for real-time client messaging
 *
 * Design matches Team Chat but uses emerald/teal color scheme
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Search,
  Smile,
  Plus,
  Phone,
  Video,
  X,
  User,
  FileText,
  Shield,
  Clock,
  ChevronLeft,
  Info,
  PenSquare,
  Bell,
  BellOff,
  Settings,
  ImageIcon,
  File,
  Trash2,
  Reply,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, fadeInUp, spacing } from '@/lib/heritageDesignSystem';

// Types matching backend API
interface ClientConversation {
  id: string;
  clientId: string;
  agentId: string;
  clientName: string;
  agentName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCountAgent: number;
  unreadCountClient: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ClientMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "agent" | "client";
  senderName: string;
  content: string;
  messageType: "text" | "image" | "file" | "system";
  attachments?: { id: string; name: string; type: string; url: string }[];
  isRead: boolean;
  createdAt: string;
  reactions?: { emoji: string; userId: string }[];
  replyTo?: { id: string; sender: string; content: string };
}

// Apple Tapback reactions
const TAPBACK_REACTIONS = ['❤️', '👍', '👎', '😂', '‼️', '❓'] as const;

// Quick emojis for fast reactions
const QUICK_EMOJIS = ['😊', '👍', '❤️', '🎉', '👋', '🙏', '✅', '📞'];

// Full emoji categories - Complete Apple emoji library
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '❤️‍🔥', '❤️‍🩹', '💌', '💒', '💑', '💏'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛'],
  'Nature': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄', '🌰', '🪨', '🪵', '🌍', '🌎', '🌏', '🌐', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
  'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '✴️', '🆚', '💮', '㊙️', '㊗️', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄'],
} as const;

// Skin tone modifiers
const SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿'] as const;
const SKIN_TONE_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];

// Emojis that support skin tones
const SKIN_TONE_EMOJIS = new Set([
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪',
  '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '🧖', '🧗', '🤸', '🏌️', '🏇', '⛷️', '🏂', '🏋️', '🤽', '🤾', '⛹️', '🚣', '🧘', '🛀', '🛌',
  '🦵', '🦶', '👂', '🦻', '👃',
]);

// Format timestamp like Team Chat (handles "Yesterday", times, etc.)
const formatConversationTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Mock data for testing UI
const MOCK_CONVERSATIONS: ClientConversation[] = [
  {
    id: 'mock-conv-1',
    clientId: 'client-1',
    agentId: 'agent-1',
    clientName: 'Sarah Mitchell',
    agentName: 'Sarah Agent',
    lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    lastMessagePreview: 'That sounds great! What times work for you this week?',
    unreadCountAgent: 1,
    unreadCountClient: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'mock-conv-2',
    clientId: 'client-2',
    agentId: 'agent-1',
    clientName: 'Jack Cook',
    agentName: 'Sarah Agent',
    lastMessageAt: new Date(Date.now() - 75 * 60000).toISOString(), // ~1 hour ago
    lastMessagePreview: 'Thanks for the policy update!',
    unreadCountAgent: 0,
    unreadCountClient: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'mock-conv-3',
    clientId: 'client-3',
    agentId: 'agent-1',
    clientName: 'Marcus Chen',
    agentName: 'Sarah Agent',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
    lastMessagePreview: 'I\'ll review the documents and get back to you.',
    unreadCountAgent: 2,
    unreadCountClient: 0,
    isActive: false,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'mock-conv-4',
    clientId: 'client-4',
    agentId: 'agent-1',
    clientName: 'Emily Davis',
    agentName: 'Sarah Agent',
    lastMessageAt: new Date(Date.now() - 26 * 60 * 60000).toISOString(), // Yesterday
    lastMessagePreview: 'Perfect, I\'ll sign the paperwork tomorrow.',
    unreadCountAgent: 0,
    unreadCountClient: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60000).toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, ClientMessage[]> = {
  'mock-conv-1': [
    {
      id: 'msg-1',
      conversationId: 'mock-conv-1',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Hi there! Welcome to Heritage Life Services. I\'m your dedicated insurance agent and I\'m here to help with all your insurance needs.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'mock-conv-1',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Feel free to reach out anytime through this chat. I\'ll respond as quickly as possible!',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 119 * 60000).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: 'mock-conv-1',
      senderId: 'client-1',
      senderType: 'client',
      senderName: 'Sarah Mitchell',
      content: 'Thank you! I had a question about my policy coverage.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    {
      id: 'msg-4',
      conversationId: 'mock-conv-1',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Of course! I\'d be happy to help. What would you like to know about your coverage?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
    },
    {
      id: 'msg-5',
      conversationId: 'mock-conv-1',
      senderId: 'client-1',
      senderType: 'client',
      senderName: 'Sarah Mitchell',
      content: 'I was wondering if I could increase my coverage amount. Is that possible?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'msg-6',
      conversationId: 'mock-conv-1',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Absolutely! We can definitely look at increasing your coverage. Based on your current policy, I\'d recommend reviewing a few options. Would you like to schedule a quick call to discuss the details?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: 'msg-7',
      conversationId: 'mock-conv-1',
      senderId: 'client-1',
      senderType: 'client',
      senderName: 'Sarah Mitchell',
      content: 'That sounds great! What times work for you this week?',
      messageType: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ],
  'mock-conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'mock-conv-2',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Hi Jack! I wanted to let you know that your policy renewal has been processed successfully.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    },
    {
      id: 'msg-2-2',
      conversationId: 'mock-conv-2',
      senderId: 'client-2',
      senderType: 'client',
      senderName: 'Jack Cook',
      content: 'Thanks for the policy update!',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  ],
  'mock-conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'mock-conv-3',
      senderId: 'client-3',
      senderType: 'client',
      senderName: 'Marcus Chen',
      content: 'Hi, I received the documents you sent. I have a few questions about the beneficiary section.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 26 * 60 * 60000).toISOString(),
    },
    {
      id: 'msg-3-2',
      conversationId: 'mock-conv-3',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Of course, Marcus! What questions do you have?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 25 * 60 * 60000).toISOString(),
    },
    {
      id: 'msg-3-3',
      conversationId: 'mock-conv-3',
      senderId: 'client-3',
      senderType: 'client',
      senderName: 'Marcus Chen',
      content: 'Can I list multiple beneficiaries with different percentages?',
      messageType: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    },
    {
      id: 'msg-3-4',
      conversationId: 'mock-conv-3',
      senderId: 'client-3',
      senderType: 'client',
      senderName: 'Marcus Chen',
      content: 'I\'ll review the documents and get back to you.',
      messageType: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    },
  ],
  'mock-conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'mock-conv-4',
      senderId: 'agent-1',
      senderType: 'agent',
      senderName: 'Sarah Agent',
      content: 'Hi Emily! The paperwork for your new term life policy is ready. I\'ve sent it to your email.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    },
    {
      id: 'msg-4-2',
      conversationId: 'mock-conv-4',
      senderId: 'client-4',
      senderType: 'client',
      senderName: 'Emily Davis',
      content: 'Perfect, I\'ll sign the paperwork tomorrow.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    },
  ],
};

// API functions
const apiBase = "/api/client-chat";

async function fetchConversations(): Promise<ClientConversation[]> {
  const res = await fetch(`${apiBase}/conversations`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

async function fetchMessages(conversationId: string): Promise<ClientMessage[]> {
  const res = await fetch(`${apiBase}/conversations/${conversationId}/messages`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

async function sendMessage(conversationId: string, content: string): Promise<ClientMessage> {
  const res = await fetch(`${apiBase}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content, messageType: "text" }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

async function markAsRead(conversationId: string): Promise<void> {
  await fetch(`${apiBase}/conversations/${conversationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });
}

// Typing indicator component (Apple-style bouncing dots)
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-gray-200/80 rounded-2xl w-fit">
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
    />
  </div>
);

// Date separator component
const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-4">
    <span className="text-xs font-medium text-gray-400 bg-white/80 px-3 py-1 rounded-full">
      {date}
    </span>
  </div>
);

export default function ClientChatContent() {
  const queryClient = useQueryClient();

  // State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showTapback, setShowTapback] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, { emoji: string; count: number }[]>>({});
  const [mutedConversations, setMutedConversations] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<ClientMessage | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [skinToneEmoji, setSkinToneEmoji] = useState<string | null>(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState<number>(0);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, ClientMessage[]>>(MOCK_MESSAGES);

  // Check if current conversation is muted
  const isMuted = selectedConversationId ? mutedConversations.has(selectedConversationId) : false;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Queries - with mock data fallback for testing
  const { data: apiConversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["client-conversations"],
    queryFn: fetchConversations,
    refetchInterval: 30000,
    retry: 1,
  });

  // Use mock data if no API data
  // Always use mock data for now to test UI
  const conversations = MOCK_CONVERSATIONS;

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const { data: apiMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["client-messages", selectedConversationId],
    queryFn: () => selectedConversationId ? fetchMessages(selectedConversationId) : Promise.resolve([]),
    enabled: !!selectedConversationId && !selectedConversationId.startsWith('mock-'),
    refetchInterval: 10000,
    retry: 1,
  });

  // Use local messages for mock conversations, API messages otherwise
  const messages = selectedConversationId?.startsWith('mock-')
    ? (localMessages[selectedConversationId] || [])
    : (apiMessages.length > 0 ? apiMessages : []);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, content),
    onSuccess: (newMsg) => {
      queryClient.setQueryData<ClientMessage[]>(
        ["client-messages", selectedConversationId],
        (old = []) => [...old, newMsg]
      );
      queryClient.invalidateQueries({ queryKey: ["client-conversations"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Mark as read when viewing conversation
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCountAgent > 0) {
      markAsRead(selectedConversationId).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["client-conversations"] });
    }
  }, [selectedConversationId, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversationId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!selectedConversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/client-chat`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(JSON.stringify({
            type: "auth",
            userId: "current-agent",
            userType: "agent",
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "client_message" && data.conversationId === selectedConversationId) {
              queryClient.setQueryData<ClientMessage[]>(
                ["client-messages", selectedConversationId],
                (old = []) => {
                  if (old.some(m => m.id === data.message.id)) return old;
                  return [...old, data.message];
                }
              );
              queryClient.invalidateQueries({ queryKey: ["client-conversations"] });
            }

            if (data.type === "typing" && data.conversationId === selectedConversationId) {
              setIsClientTyping(data.isTyping);
              if (data.isTyping) {
                setTimeout(() => setIsClientTyping(false), 5000);
              }
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connect();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [selectedConversationId, queryClient]);

  // Close tapback menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTapback) setShowTapback(null);
    };
    if (showTapback) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTapback]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(c =>
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Send message handler
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversationId) return;

    // For mock conversations, add message locally
    if (selectedConversationId.startsWith('mock-')) {
      const newMsg: ClientMessage = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversationId,
        senderId: 'agent-1',
        senderType: 'agent',
        senderName: 'You',
        content: newMessage.trim(),
        messageType: 'text',
        isRead: true,
        createdAt: new Date().toISOString(),
        replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.senderName, content: replyingTo.content } : undefined,
      };

      setLocalMessages(prev => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMsg]
      }));

      // Simulate client typing response
      setTimeout(() => {
        setIsClientTyping(true);
        setTimeout(() => {
          setIsClientTyping(false);
          // Add a simulated response
          const responses = [
            "Thanks for the update!",
            "That sounds great!",
            "I appreciate your help.",
            "Let me think about that.",
            "Perfect, I'll get back to you soon.",
          ];
          const responseMsg: ClientMessage = {
            id: `msg-${Date.now() + 1}`,
            conversationId: selectedConversationId,
            senderId: 'client-1',
            senderType: 'client',
            senderName: selectedConversation?.clientName || 'Client',
            content: responses[Math.floor(Math.random() * responses.length)],
            messageType: 'text',
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          setLocalMessages(prev => ({
            ...prev,
            [selectedConversationId]: [...(prev[selectedConversationId] || []), responseMsg]
          }));
        }, 2000);
      }, 500);
    } else {
      // For real conversations, use API
      sendMessageMutation.mutate({
        conversationId: selectedConversationId,
        content: newMessage.trim(),
      });
    }

    setNewMessage("");
    setReplyingTo(null);
  }, [newMessage, selectedConversationId, sendMessageMutation, replyingTo, selectedConversation]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Toggle mute handler
  const handleToggleMute = useCallback(() => {
    if (!selectedConversationId) return;
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(selectedConversationId)) {
        newSet.delete(selectedConversationId);
        toast.success(`Unmuted ${selectedConversation?.clientName}`);
      } else {
        newSet.add(selectedConversationId);
        toast.success(`Muted ${selectedConversation?.clientName}`);
      }
      return newSet;
    });
  }, [selectedConversationId, selectedConversation]);

  // Phone call handler
  const handlePhoneCall = useCallback(() => {
    toast.success(`Starting voice call with ${selectedConversation?.clientName}...`);
  }, [selectedConversation]);

  // Video call handler
  const handleVideoCall = useCallback(() => {
    toast.success(`Starting video call with ${selectedConversation?.clientName}...`);
  }, [selectedConversation]);

  // Add reaction to message
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    setMessageReactions(prev => {
      const existing = prev[messageId] || [];
      const existingReaction = existing.find(r => r.emoji === emoji);
      if (existingReaction) {
        // Toggle off if already reacted
        return {
          ...prev,
          [messageId]: existing.filter(r => r.emoji !== emoji)
        };
      }
      return {
        ...prev,
        [messageId]: [...existing, { emoji, count: 1 }]
      };
    });
    setShowTapback(null);
  }, []);

  // Reply to message
  const handleReply = useCallback((message: ClientMessage) => {
    setReplyingTo(message);
    setShowTapback(null);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setSkinToneEmoji(null);
    setEmojiSearch('');
  }, []);

  // Close tapback on click outside
  useEffect(() => {
    const handleClick = () => {
      if (showTapback) setShowTapback(null);
    };
    if (showTapback) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showTapback]);

  // Calculate emoji picker position
  const getEmojiPickerPosition = () => {
    if (!emojiButtonRef.current) return { bottom: 0, right: 0 };
    const rect = emojiButtonRef.current.getBoundingClientRect();
    return {
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
    };
  };

  // Conversation List Component - exact copy of Team Chat structure
  const ConversationList = () => (
    <div className="px-2">
      {loadingConversations ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse mb-0.5">
            <div className="w-11 h-11 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No client conversations</p>
          <p className="text-xs mt-1">Clients will appear here</p>
        </div>
      ) : (
        filteredConversations.map((conv) => {
          const isSelected = selectedConversationId === conv.id;
          const timestamp = formatConversationTime(conv.lastMessageAt);
          return (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConversationId(conv.id);
                setMobileSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2.5 text-left transition-all mb-0.5",
                isSelected
                  ? "bg-gradient-to-b from-violet-500 via-purple-500 to-amber-400 text-white shadow-md"
                  : "hover:bg-gray-100"
              )}
              style={{ borderRadius: RADIUS.input }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className={cn(
                    "text-sm font-semibold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600"
                  )}>
                    {getInitials(conv.clientName)}
                  </AvatarFallback>
                </Avatar>
                {conv.isActive && (
                  <div className={cn(
                    "w-2.5 h-2.5 absolute bottom-0 right-0 rounded-full border-2",
                    isSelected ? "bg-emerald-400 border-purple-500" : "bg-emerald-500 border-white"
                  )} />
                )}
              </div>

              {/* Content - using grid layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px', minWidth: 0, width: '100%' }}>
                {/* Row 1: Name + Time */}
                <span
                  className={cn(
                    "font-semibold text-sm",
                    isSelected ? "text-white" : "text-gray-900"
                  )}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {conv.clientName}
                </span>
                <span className={cn(
                  "text-[11px]",
                  isSelected ? "text-white/70" : "text-gray-400"
                )}>
                  {timestamp}
                </span>

                {/* Row 2: Message + Badge */}
                <p
                  className={cn(
                    "text-xs",
                    isSelected ? "text-white/80" : "text-gray-500"
                  )}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}
                >
                  {conv.lastMessagePreview || "No messages yet"}
                </p>
                <div>
                  {conv.unreadCountAgent > 0 && (
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold",
                      isSelected ? "bg-white/30 text-white" : "bg-violet-500 text-white"
                    )}>
                      {conv.unreadCountAgent}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <motion.div
      variants={fadeInUp}
      className="flex gap-0 bg-white relative overflow-hidden"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        height: 'calc(100vh - 16rem)',
      }}
    >
      {/* New Message Dialog */}
      <AnimatePresence>
        {showNewMessageDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowNewMessageDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-50 overflow-hidden"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level4 }}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Client</h3>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowNewMessageDialog(false)}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-2 px-1">Your Clients</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversationId(conv.id);
                        setShowNewMessageDialog(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                        selectedConversationId === conv.id
                          ? "bg-violet-100"
                          : "hover:bg-violet-50"
                      )}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 font-semibold">
                          {getInitials(conv.clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{conv.clientName}</p>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessagePreview}</p>
                      </div>
                      {conv.unreadCountAgent > 0 && (
                        <div className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-semibold">
                          {conv.unreadCountAgent}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col lg:hidden"
              style={{ boxShadow: SHADOW.level4 }}
            >
              <div className="p-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 pl-2">Messages</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 hover:bg-violet-200 transition-colors"
                    onClick={() => setShowNewMessageDialog(true)}
                  >
                    <PenSquare className="w-4 h-4 text-violet-600" />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-200/60 rounded-xl outline-none focus:bg-white transition-all placeholder-gray-500"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <ConversationList />
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - iMessage style */}
      <div
        className="hidden lg:flex lg:w-72 flex-col bg-gray-50/50 border-r"
        style={{ borderTopLeftRadius: RADIUS.card, borderBottomLeftRadius: RADIUS.card }}
      >
        <div className="p-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 pl-2">Messages</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 hover:bg-violet-200 transition-colors"
            onClick={() => setShowNewMessageDialog(true)}
          >
            <PenSquare className="w-4 h-4 text-violet-600" />
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-200/60 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder-gray-500"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ConversationList />
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn("flex-1 flex flex-col transition-all", showClientInfo && "lg:mr-80")}
        style={{ borderTopRightRadius: showClientInfo ? 0 : RADIUS.card, borderBottomRightRadius: showClientInfo ? 0 : RADIUS.card }}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header - iMessage style */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <ChevronLeft className="w-5 h-5 text-violet-500" />
                </button>
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-sm font-semibold">
                      {getInitials(selectedConversation.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.isActive && (
                    <div className="w-3 h-3 absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversation.clientName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.isActive ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => toast.info(`Calling ${selectedConversation.clientName}...`)}
                >
                  <Phone className="w-5 h-5 text-violet-500" />
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => toast.info(`Video call with ${selectedConversation.clientName}...`)}
                >
                  <Video className="w-5 h-5 text-violet-500" />
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => setShowClientInfo(!showClientInfo)}
                >
                  <Info className="w-5 h-5 text-violet-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-2 bg-gradient-to-b from-gray-50/30 to-white">
              {loadingMessages ? (
                <div className="space-y-4 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn("flex items-end gap-2", i % 2 === 0 ? "" : "justify-end")}>
                      {i % 2 === 0 && <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />}
                      <div
                        className={cn(
                          "h-12 rounded-2xl animate-pulse",
                          i % 2 === 0 ? "bg-gray-200" : "bg-violet-100"
                        )}
                        style={{ width: `${30 + Math.random() * 40}%` }}
                      />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-2xl font-semibold">
                      {getInitials(selectedConversation.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedConversation.clientName}</h3>
                  <p className="text-sm text-gray-500">iMessage</p>
                </div>
              ) : (
                <>
                  <DateSeparator date="Today" />
                  <div className="space-y-0.5">
                    {messages.map((message, idx) => {
                      const prevMessage = messages[idx - 1];
                      const nextMessage = messages[idx + 1];
                      const isFirstInGroup = !prevMessage || prevMessage.senderType !== message.senderType;
                      const isLastInGroup = !nextMessage || nextMessage.senderType !== message.senderType;
                      const isOwn = message.senderType === "agent";
                      const showTapbackMenu = showTapback === message.id;
                      const reactions = messageReactions[message.id] || [];

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            delay: idx * 0.02
                          }}
                          className={cn(
                            "group flex gap-2 relative",
                            isOwn ? "justify-end" : "justify-start",
                            isLastInGroup && "mb-2"
                          )}
                        >
                          {/* Avatar - only show for last message in group from others */}
                          {!isOwn && (
                            <div className="w-7 flex-shrink-0 self-end">
                              {isLastInGroup && (
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-[10px] font-semibold">
                                    {getInitials(message.senderName)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}

                          <div className={cn("max-w-[70%] flex flex-col relative", isOwn ? "items-end" : "items-start")}>
                            {/* Reply indicator */}
                            {message.replyTo && (
                              <div className={cn(
                                "flex items-center gap-1 mb-1 text-[11px] text-gray-400",
                                isOwn ? "mr-1" : "ml-1"
                              )}>
                                <Reply className="w-3 h-3" />
                                <span>Replying to {message.replyTo.sender}</span>
                              </div>
                            )}

                            {/* Tapback reactions */}
                            {reactions.length > 0 && (
                              <div className="absolute -top-2.5 -right-1 z-10">
                                <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200/80 px-1 py-0.5">
                                  {reactions.map((reaction, ridx) => (
                                    <button
                                      key={ridx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddReaction(message.id, reaction.emoji);
                                      }}
                                      className="text-base hover:scale-110 transition-transform"
                                    >
                                      {reaction.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Message bubble - iMessage style */}
                            <div
                              className={cn(
                                "relative px-3 py-2 inline-block text-left cursor-pointer select-none",
                                isOwn
                                  ? "bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 text-white"
                                  : "bg-[#e9e9eb] text-gray-900"
                              )}
                              style={{
                                borderRadius: isOwn
                                  ? isLastInGroup ? '18px 18px 4px 18px' : '18px 18px 18px 18px'
                                  : isLastInGroup ? '18px 18px 18px 4px' : '18px 18px 18px 18px',
                              }}
                              onDoubleClick={() => setShowTapback(showTapbackMenu ? null : message.id)}
                            >
                              {/* Quoted reply content */}
                              {message.replyTo && (
                                <div className={cn(
                                  "text-[11px] mb-1.5 pb-1.5 border-b",
                                  isOwn ? "border-white/20 text-white/70" : "border-gray-300 text-gray-500"
                                )}>
                                  <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
                                </div>
                              )}
                              <p className="text-[15px] leading-snug whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {/* Tapback menu - Apple style */}
                            <AnimatePresence>
                              {showTapbackMenu && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                  className={cn(
                                    "absolute z-20 bg-white/95 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50 px-2 py-1.5 flex items-center gap-1",
                                    isOwn ? "right-0 -top-12" : "left-0 -top-12"
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {TAPBACK_REACTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleAddReaction(message.id, emoji)}
                                      className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 hover:bg-gray-100 rounded-full transition-all"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Hover actions - reply and react */}
                            <div className={cn(
                              "absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all",
                              isOwn ? "-left-20" : "-right-20"
                            )}>
                              <button
                                onClick={() => handleReply(message)}
                                className="p-1.5 bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full transition-colors"
                              >
                                <Reply className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button
                                onClick={() => setShowTapback(showTapbackMenu ? null : message.id)}
                                className="p-1.5 bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full transition-colors"
                              >
                                <Smile className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>

                            {/* Time and delivery status - only for last message in group */}
                            {isLastInGroup && (
                              <div className={cn(
                                "flex items-center gap-1 mt-0.5 px-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                                {isOwn && (
                                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                    · Delivered
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isClientTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-end gap-2"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-[10px] font-semibold">
                            {getInitials(selectedConversation.clientName)}
                          </AvatarFallback>
                        </Avatar>
                        <TypingIndicator />
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </ScrollArea>

            {/* Message Input - iMessage style (matching Team Chat) */}
            <div className="p-2 bg-gray-100/80 backdrop-blur-sm border-t border-gray-200/50 relative">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={() => toast.info("File attachment coming soon")}
              />

              {/* Reply indicator - iMessage style */}
              {replyingTo && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-200/60 backdrop-blur mb-2 rounded-2xl">
                  <div className="w-1 h-8 bg-violet-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 font-medium">Replying to {replyingTo.senderName}</p>
                    <p className="text-[13px] text-gray-700 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={cancelReply}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Input row - iMessage style */}
              <div className="flex items-end gap-2">
                {/* Apps/Plus button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors mb-0.5"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>

                {/* Message input container */}
                <div className="flex-1 relative flex items-end bg-white rounded-[20px] border border-gray-300/50 shadow-sm overflow-hidden">
                  <input
                    type="text"
                    placeholder="iMessage"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-[15px] py-2 px-3 placeholder-gray-400"
                  />

                  {/* Right side icons */}
                  <div className="flex items-center gap-0.5 pr-1 pb-1">
                    <button
                      ref={emojiButtonRef}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Send button - only show when there's content */}
                    {newMessage.trim() && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emoji Picker - Full emoji keyboard (rendered in portal) */}
            {typeof document !== 'undefined' && createPortal(
              <AnimatePresence>
                {showEmojiPicker && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/30"
                      style={{ zIndex: 99999 }}
                      onClick={() => {
                        setShowEmojiPicker(false);
                        setSkinToneEmoji(null);
                        setEmojiSearch('');
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl bg-white border border-gray-200 overflow-hidden"
                      style={{ zIndex: 100000, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Skin tone selector popup */}
                      <AnimatePresence>
                        {skinToneEmoji && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-1"
                            style={{ zIndex: 100001 }}
                          >
                            {SKIN_TONES.map((tone, idx) => {
                              const emojiWithTone = idx === 0 ? skinToneEmoji : skinToneEmoji + tone;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedSkinTone(idx);
                                    handleEmojiSelect(emojiWithTone);
                                    setSkinToneEmoji(null);
                                  }}
                                  className={cn(
                                    "text-2xl p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-110",
                                    selectedSkinTone === idx && "bg-violet-100"
                                  )}
                                  title={SKIN_TONE_LABELS[idx]}
                                >
                                  {emojiWithTone}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Search bar */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search emojis..."
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-violet-200"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Category tabs - hide when searching */}
                      {!emojiSearch && (
                        <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                          {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                              key={category}
                              onClick={() => setEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                                emojiCategory === category
                                  ? "bg-violet-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Skin tone selector bar */}
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
                        <span className="text-[10px] text-gray-400 font-medium">Skin tone:</span>
                        {SKIN_TONES.map((tone, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSkinTone(idx)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-all hover:scale-110",
                              selectedSkinTone === idx
                                ? "ring-2 ring-violet-500 ring-offset-1"
                                : "hover:ring-2 hover:ring-gray-300"
                            )}
                            style={{ backgroundColor: idx === 0 ? '#FFDC00' : ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#694D3D'][idx - 1] }}
                            title={SKIN_TONE_LABELS[idx]}
                          />
                        ))}
                      </div>

                      {/* Emoji grid */}
                      <div className="h-64 overflow-y-auto p-2">
                        <div className="grid grid-cols-10 gap-0.5">
                          {(emojiSearch
                            ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji =>
                                emoji.toLowerCase().includes(emojiSearch.toLowerCase())
                              )
                            : EMOJI_CATEGORIES[emojiCategory]
                          ).map((emoji) => {
                            const supportsSkinTone = SKIN_TONE_EMOJIS.has(emoji);
                            const displayEmoji = supportsSkinTone && selectedSkinTone > 0
                              ? emoji + SKIN_TONES[selectedSkinTone]
                              : emoji;
                            return (
                              <button
                                key={emoji}
                                onClick={() => {
                                  if (supportsSkinTone) {
                                    setSkinToneEmoji(emoji);
                                  } else {
                                    handleEmojiSelect(displayEmoji);
                                  }
                                }}
                                onDoubleClick={() => handleEmojiSelect(displayEmoji)}
                                className="text-2xl p-1.5 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
                                title={supportsSkinTone ? "Click to choose skin tone" : undefined}
                              >
                                {displayEmoji}
                              </button>
                            );
                          })}
                        </div>
                        {emojiSearch && Object.values(EMOJI_CATEGORIES).flat().filter(emoji =>
                          emoji.toLowerCase().includes(emojiSearch.toLowerCase())
                        ).length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-8">No emojis found</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a client to start messaging</p>
          </div>
        )}
      </div>

      {/* Info Panel - slides in from right (matching Team Chat) */}
      <AnimatePresence>
        {showClientInfo && selectedConversation && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:flex absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex-col"
            style={{ borderTopRightRadius: RADIUS.card, borderBottomRightRadius: RADIUS.card }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-900">Details</h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setShowClientInfo(false)}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              {/* Profile Section */}
              <div className="p-6 flex flex-col items-center border-b border-gray-100">
                <Avatar className="w-20 h-20 mb-3">
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600">
                    {getInitials(selectedConversation.clientName)}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold text-gray-900">{selectedConversation.clientName}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedConversation.isActive ? 'Active now' : 'Offline'}
                </p>

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handlePhoneCall}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      <Phone className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-xs text-gray-500">Call</span>
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      <Video className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-xs text-gray-500">Video</span>
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      {isMuted ? <BellOff className="w-5 h-5 text-violet-600" /> : <Bell className="w-5 h-5 text-violet-600" />}
                    </div>
                    <span className="text-xs text-gray-500">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => toast.info("View policy details")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">View Policy</span>
                  </button>
                  <button
                    onClick={() => toast.info("Search in conversation")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Search in Conversation</span>
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    {isMuted ? <Bell className="w-5 h-5 text-gray-400" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                    <span className="text-sm text-gray-700">{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Chat Settings</span>
                  </button>
                </div>

                {/* Shared Media Preview */}
                <div className="mt-6">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">Shared Media</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Files */}
                <div className="mt-6">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">Shared Files</h5>
                  <div className="space-y-2">
                    {['Policy_Document.pdf', 'Coverage_Summary.docx', 'Payment_History.xlsx'].map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          <File className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{file}</p>
                          <p className="text-xs text-gray-400">Shared 2 days ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Delete Button */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => toast.info("Delete conversation")}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Delete Conversation</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
