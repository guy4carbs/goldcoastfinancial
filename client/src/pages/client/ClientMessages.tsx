/**
 * Client Messages — iMessage-Style Chat
 * Heritage Design System — Violet-to-Amber theme
 *
 * Single conversation view for client-to-agent communication.
 * Features: tapback reactions, reply-to, emoji picker, real-time WebSocket.
 * Matches the agent lounge ClientChatContent input bar and message styling.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, fadeInUp, GRID } from '@/lib/heritageDesignSystem';
import { DEMO_CLIENT, DEMO_CLIENT_MESSAGES } from './clientConstants';
import {
  MessageSquare, Send, Phone, Video, Search, Smile, Plus, X, Reply,
} from 'lucide-react';
import { ClientPageHero } from './primitives';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// ─── Types ───

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'agent' | 'client';
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: { id: string; name: string; type: string; url: string }[];
  isRead: boolean;
  createdAt: string;
  replyTo?: { id: string; sender: string; content: string };
}

interface Conversation {
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
}

// ─── Apple Tapback Reactions ───

const TAPBACK_REACTIONS = ['\u2764\uFE0F', '\uD83D\uDC4D', '\uD83D\uDC4E', '\uD83D\uDE02', '\u203C\uFE0F', '\u2753'] as const;

// ─── Quick Emojis ───

const QUICK_EMOJIS = ['\uD83D\uDE0A', '\uD83D\uDC4D', '\u2764\uFE0F', '\uD83C\uDF89', '\uD83D\uDC4B', '\uD83D\uDE4F', '\u2705', '\uD83D\uDCDE'];

// ─── Full Emoji Categories ───

const EMOJI_CATEGORIES = {
  'Smileys': ['\uD83D\uDE00', '\uD83D\uDE03', '\uD83D\uDE04', '\uD83D\uDE01', '\uD83D\uDE06', '\uD83D\uDE05', '\uD83E\uDD23', '\uD83D\uDE02', '\uD83D\uDE42', '\uD83D\uDE43', '\uD83D\uDE09', '\uD83D\uDE0A', '\uD83D\uDE07', '\uD83E\uDD70', '\uD83D\uDE0D', '\uD83E\uDD29', '\uD83D\uDE18', '\uD83D\uDE17', '\u263A\uFE0F', '\uD83D\uDE1A', '\uD83D\uDE19', '\uD83E\uDD72', '\uD83D\uDE0B', '\uD83D\uDE1B', '\uD83D\uDE1C', '\uD83E\uDD2A', '\uD83D\uDE1D', '\uD83E\uDD11', '\uD83E\uDD17', '\uD83E\uDD2D', '\uD83E\uDD2B', '\uD83E\uDD14', '\uD83E\uDD10', '\uD83E\uDD28', '\uD83D\uDE10', '\uD83D\uDE11', '\uD83D\uDE36', '\uD83D\uDE0F', '\uD83D\uDE12', '\uD83D\uDE44', '\uD83D\uDE2C', '\uD83E\uDD25', '\uD83D\uDE0C', '\uD83D\uDE14', '\uD83D\uDE2A', '\uD83E\uDD24', '\uD83D\uDE34', '\uD83D\uDE37', '\uD83E\uDD12', '\uD83E\uDD15', '\uD83E\uDD22', '\uD83E\uDD2E', '\uD83E\uDD27', '\uD83E\uDD75', '\uD83E\uDD76', '\uD83E\uDD74', '\uD83D\uDE35', '\uD83E\uDD2F', '\uD83E\uDD20', '\uD83E\uDD73', '\uD83E\uDD78', '\uD83D\uDE0E', '\uD83E\uDD13', '\uD83E\uDDD0', '\uD83D\uDE15', '\uD83D\uDE1F', '\uD83D\uDE41', '\u2639\uFE0F', '\uD83D\uDE2E', '\uD83D\uDE2F', '\uD83D\uDE32', '\uD83D\uDE33', '\uD83E\uDD7A', '\uD83D\uDE26', '\uD83D\uDE27', '\uD83D\uDE28', '\uD83D\uDE30', '\uD83D\uDE25', '\uD83D\uDE22', '\uD83D\uDE2D', '\uD83D\uDE31', '\uD83D\uDE16', '\uD83D\uDE23', '\uD83D\uDE1E', '\uD83D\uDE13', '\uD83D\uDE29', '\uD83D\uDE2B', '\uD83E\uDD71', '\uD83D\uDE24', '\uD83D\uDE21', '\uD83D\uDE20', '\uD83E\uDD2C', '\uD83D\uDE08', '\uD83D\uDC7F', '\uD83D\uDC80', '\u2620\uFE0F', '\uD83D\uDCA9', '\uD83E\uDD21', '\uD83D\uDC79', '\uD83D\uDC7A', '\uD83D\uDC7B', '\uD83D\uDC7D', '\uD83D\uDC7E', '\uD83E\uDD16', '\uD83D\uDE3A', '\uD83D\uDE38', '\uD83D\uDE39', '\uD83D\uDE3B', '\uD83D\uDE3C', '\uD83D\uDE3D', '\uD83D\uDE40', '\uD83D\uDE3F', '\uD83D\uDE3E', '\uD83D\uDE48', '\uD83D\uDE49', '\uD83D\uDE4A'],
  'Gestures': ['\uD83D\uDC4B', '\uD83E\uDD1A', '\uD83D\uDD90\uFE0F', '\u270B', '\uD83D\uDD96', '\uD83D\uDC4C', '\uD83E\uDD0C', '\uD83E\uDD0F', '\u270C\uFE0F', '\uD83E\uDD1E', '\uD83E\uDD1F', '\uD83E\uDD18', '\uD83E\uDD19', '\uD83D\uDC48', '\uD83D\uDC49', '\uD83D\uDC46', '\uD83D\uDD95', '\uD83D\uDC47', '\u261D\uFE0F', '\uD83D\uDC4D', '\uD83D\uDC4E', '\u270A', '\uD83D\uDC4A', '\uD83E\uDD1B', '\uD83E\uDD1C', '\uD83D\uDC4F', '\uD83D\uDE4C', '\uD83D\uDC50', '\uD83E\uDD32', '\uD83E\uDD1D', '\uD83D\uDE4F', '\u270D\uFE0F', '\uD83D\uDC85', '\uD83E\uDD33', '\uD83D\uDCAA', '\uD83E\uDDBE', '\uD83E\uDDBF', '\uD83E\uDDB5', '\uD83E\uDDB6', '\uD83D\uDC42', '\uD83E\uDDBB', '\uD83D\uDC43', '\uD83E\uDDE0', '\uD83D\uDC40', '\uD83D\uDC41\uFE0F', '\uD83D\uDC45', '\uD83D\uDC44', '\uD83D\uDC8B'],
  'Hearts': ['\u2764\uFE0F', '\uD83E\uDDE1', '\uD83D\uDC9B', '\uD83D\uDC9A', '\uD83D\uDC99', '\uD83D\uDC9C', '\uD83D\uDDA4', '\uD83E\uDD0D', '\uD83E\uDD0E', '\uD83D\uDC94', '\u2763\uFE0F', '\uD83D\uDC95', '\uD83D\uDC9E', '\uD83D\uDC93', '\uD83D\uDC97', '\uD83D\uDC96', '\uD83D\uDC98', '\uD83D\uDC9D', '\uD83D\uDC9F', '\u2665\uFE0F', '\uD83D\uDC8C', '\uD83D\uDC92', '\uD83D\uDC91', '\uD83D\uDC8F'],
  'Animals': ['\uD83D\uDC36', '\uD83D\uDC31', '\uD83D\uDC2D', '\uD83D\uDC39', '\uD83D\uDC30', '\uD83E\uDD8A', '\uD83D\uDC3B', '\uD83D\uDC3C', '\uD83D\uDC28', '\uD83D\uDC2F', '\uD83E\uDD81', '\uD83D\uDC2E', '\uD83D\uDC37', '\uD83D\uDC3D', '\uD83D\uDC38', '\uD83D\uDC35', '\uD83D\uDE48', '\uD83D\uDE49', '\uD83D\uDE4A', '\uD83D\uDC12', '\uD83D\uDC14', '\uD83D\uDC27', '\uD83D\uDC26', '\uD83D\uDC24', '\uD83D\uDC23', '\uD83D\uDC25', '\uD83E\uDD86', '\uD83E\uDD85', '\uD83E\uDD89', '\uD83E\uDD87', '\uD83D\uDC3A', '\uD83D\uDC17', '\uD83D\uDC34', '\uD83E\uDD84', '\uD83D\uDC1D', '\uD83D\uDC1B', '\uD83E\uDD8B', '\uD83D\uDC0C', '\uD83D\uDC1E', '\uD83D\uDC1C', '\uD83D\uDC22', '\uD83D\uDC0D', '\uD83E\uDD8E', '\uD83E\uDD96', '\uD83E\uDD95', '\uD83D\uDC19', '\uD83E\uDD91', '\uD83E\uDD90', '\uD83E\uDD9E', '\uD83E\uDD80', '\uD83D\uDC21', '\uD83D\uDC20', '\uD83D\uDC1F', '\uD83D\uDC2C', '\uD83D\uDC33', '\uD83D\uDC0B', '\uD83E\uDD88', '\uD83D\uDC0A', '\uD83D\uDC05', '\uD83D\uDC06', '\uD83E\uDD93', '\uD83E\uDD8D', '\uD83E\uDDA7', '\uD83D\uDC18', '\uD83E\uDD9B', '\uD83E\uDD8F', '\uD83D\uDC2A', '\uD83D\uDC2B', '\uD83E\uDD92', '\uD83E\uDD98', '\uD83D\uDC03', '\uD83D\uDC02', '\uD83D\uDC04', '\uD83D\uDC0E', '\uD83D\uDC16', '\uD83D\uDC0F', '\uD83D\uDC11', '\uD83E\uDD99', '\uD83D\uDC10', '\uD83E\uDD8C', '\uD83D\uDC15', '\uD83D\uDC29', '\uD83D\uDC08'],
  'Nature': ['\uD83C\uDF38', '\uD83D\uDCAE', '\uD83C\uDFF5\uFE0F', '\uD83C\uDF39', '\uD83E\uDD40', '\uD83C\uDF3A', '\uD83C\uDF3B', '\uD83C\uDF3C', '\uD83C\uDF37', '\uD83C\uDF31', '\uD83E\uDEB4', '\uD83C\uDF32', '\uD83C\uDF33', '\uD83C\uDF34', '\uD83C\uDF35', '\uD83C\uDF3E', '\uD83C\uDF3F', '\u2618\uFE0F', '\uD83C\uDF40', '\uD83C\uDF41', '\uD83C\uDF42', '\uD83C\uDF43', '\uD83C\uDF44', '\uD83C\uDF30', '\uD83C\uDF0D', '\uD83C\uDF0E', '\uD83C\uDF0F', '\uD83C\uDF10', '\uD83E\uDE90', '\uD83D\uDCAB', '\u2B50', '\uD83C\uDF1F', '\u2728', '\u26A1', '\u2604\uFE0F', '\uD83D\uDCA5', '\uD83D\uDD25', '\uD83C\uDF2A\uFE0F', '\uD83C\uDF08', '\u2600\uFE0F', '\uD83C\uDF24\uFE0F', '\u26C5', '\uD83C\uDF25\uFE0F', '\u2601\uFE0F', '\uD83C\uDF26\uFE0F', '\uD83C\uDF27\uFE0F', '\u26C8\uFE0F', '\uD83C\uDF29\uFE0F', '\uD83C\uDF28\uFE0F', '\u2744\uFE0F', '\u2603\uFE0F', '\u26C4', '\uD83C\uDF2C\uFE0F', '\uD83D\uDCA8', '\uD83D\uDCA7', '\uD83D\uDCA6', '\u2614', '\u2602\uFE0F', '\uD83C\uDF0A', '\uD83C\uDF2B\uFE0F'],
  'Food': ['\uD83C\uDF4E', '\uD83C\uDF50', '\uD83C\uDF4A', '\uD83C\uDF4B', '\uD83C\uDF4C', '\uD83C\uDF49', '\uD83C\uDF47', '\uD83C\uDF53', '\uD83E\uDED0', '\uD83C\uDF48', '\uD83C\uDF52', '\uD83C\uDF51', '\uD83E\uDD6D', '\uD83C\uDF4D', '\uD83E\uDD65', '\uD83E\uDD5D', '\uD83C\uDF45', '\uD83C\uDF46', '\uD83E\uDD51', '\uD83E\uDD66', '\uD83E\uDD6C', '\uD83E\uDD52', '\uD83C\uDF36\uFE0F', '\uD83C\uDF3D', '\uD83E\uDD55', '\uD83E\uDD54', '\uD83C\uDF60', '\uD83E\uDD50', '\uD83E\uDD6F', '\uD83C\uDF5E', '\uD83E\uDD56', '\uD83E\uDD68', '\uD83E\uDDC0', '\uD83E\uDD5A', '\uD83C\uDF73', '\uD83E\uDD5E', '\uD83E\uDDC7', '\uD83E\uDD53', '\uD83E\uDD69', '\uD83C\uDF57', '\uD83C\uDF56', '\uD83C\uDF2D', '\uD83C\uDF54', '\uD83C\uDF5F', '\uD83C\uDF55', '\uD83E\uDD6A', '\uD83E\uDD59', '\uD83E\uDDC6', '\uD83C\uDF2E', '\uD83C\uDF2F', '\uD83E\uDD57', '\uD83E\uDD58', '\uD83E\uDD6B', '\uD83C\uDF5D', '\uD83C\uDF5C', '\uD83C\uDF72', '\uD83C\uDF5B', '\uD83C\uDF63', '\uD83C\uDF71', '\uD83E\uDD5F', '\uD83C\uDF64', '\uD83C\uDF59', '\uD83C\uDF5A', '\uD83C\uDF58', '\uD83C\uDF65', '\uD83E\uDD60', '\uD83C\uDF62', '\uD83C\uDF61', '\uD83C\uDF67', '\uD83C\uDF68', '\uD83C\uDF66', '\uD83E\uDD67', '\uD83E\uDDC1', '\uD83C\uDF70', '\uD83C\uDF82', '\uD83C\uDF6E', '\uD83C\uDF6D', '\uD83C\uDF6C', '\uD83C\uDF6B', '\uD83C\uDF7F', '\uD83C\uDF69', '\uD83C\uDF6A', '\uD83E\uDD5C', '\uD83C\uDF6F', '\uD83E\uDD5B', '\uD83C\uDF7C', '\u2615', '\uD83C\uDF75', '\uD83E\uDDC3', '\uD83E\uDD64', '\uD83C\uDF76', '\uD83C\uDF7A', '\uD83C\uDF7B', '\uD83E\uDD42', '\uD83C\uDF77', '\uD83E\uDD43', '\uD83C\uDF78', '\uD83C\uDF79', '\uD83E\uDDC9', '\uD83C\uDF7E', '\uD83E\uDDCA'],
  'Activities': ['\u26BD', '\uD83C\uDFC0', '\uD83C\uDFC8', '\u26BE', '\uD83E\uDD4E', '\uD83C\uDFBE', '\uD83C\uDFD0', '\uD83C\uDFC9', '\uD83E\uDD4F', '\uD83C\uDFB1', '\uD83C\uDFD3', '\uD83C\uDFF8', '\uD83C\uDFD2', '\uD83C\uDFD1', '\uD83E\uDD4D', '\uD83C\uDFCF', '\u26F3', '\uD83C\uDFF9', '\uD83C\uDFA3', '\uD83E\uDD3F', '\uD83E\uDD4A', '\uD83E\uDD4B', '\uD83C\uDFBD', '\uD83D\uDEF9', '\uD83D\uDEFC', '\uD83D\uDEF7', '\u26F8\uFE0F', '\uD83E\uDD4C', '\uD83C\uDFBF', '\u26F7\uFE0F', '\uD83C\uDFC2', '\uD83C\uDFCB\uFE0F', '\uD83E\uDD3C', '\uD83E\uDD38', '\u26F9\uFE0F', '\uD83E\uDD3A', '\uD83E\uDD3E', '\uD83C\uDFCC\uFE0F', '\uD83C\uDFC7', '\uD83E\uDDD8', '\uD83C\uDFC4', '\uD83C\uDFCA', '\uD83E\uDD3D', '\uD83D\uDEA3', '\uD83E\uDDD7', '\uD83D\uDEB5', '\uD83D\uDEB4', '\uD83C\uDFAA', '\uD83C\uDFAD', '\uD83C\uDFA8', '\uD83C\uDFAC', '\uD83C\uDFA4', '\uD83C\uDFA7', '\uD83C\uDFBC', '\uD83C\uDFB9', '\uD83E\uDD41', '\uD83C\uDFB7', '\uD83C\uDFBA', '\uD83C\uDFB8', '\uD83C\uDFBB', '\uD83C\uDFB2', '\u265F\uFE0F', '\uD83C\uDFAF', '\uD83C\uDFB3', '\uD83C\uDFAE', '\uD83C\uDFB0', '\uD83E\uDDE9'],
  'Symbols': ['\u2764\uFE0F', '\uD83E\uDDE1', '\uD83D\uDC9B', '\uD83D\uDC9A', '\uD83D\uDC99', '\uD83D\uDC9C', '\uD83D\uDDA4', '\uD83E\uDD0D', '\uD83E\uDD0E', '\uD83D\uDC94', '\u2763\uFE0F', '\uD83D\uDC95', '\uD83D\uDC9E', '\uD83D\uDC93', '\uD83D\uDC97', '\uD83D\uDC96', '\uD83D\uDC98', '\uD83D\uDC9D', '\uD83D\uDC9F', '\u262E\uFE0F', '\u271D\uFE0F', '\u262A\uFE0F', '\u2638\uFE0F', '\u2721\uFE0F', '\uD83D\uDD2F', '\uD83D\uDD4E', '\u262F\uFE0F', '\u2626\uFE0F', '\uD83D\uDED0', '\u26CE', '\u2648', '\u2649', '\u264A', '\u264B', '\u264C', '\u264D', '\u264E', '\u264F', '\u2650', '\u2651', '\u2652', '\u2653', '\uD83C\uDD94', '\u269B\uFE0F', '\u2622\uFE0F', '\u2623\uFE0F', '\uD83D\uDCF4', '\uD83D\uDCF3', '\u2734\uFE0F', '\uD83C\uDD9A', '\uD83D\uDCAE', '\u3299\uFE0F', '\u3297\uFE0F', '\uD83C\uDD70\uFE0F', '\uD83C\uDD71\uFE0F', '\uD83C\uDD8E', '\uD83C\uDD91', '\uD83C\uDD7E\uFE0F', '\uD83C\uDD98', '\u274C', '\u2B55', '\uD83D\uDED1', '\u26D4', '\uD83D\uDCDB', '\uD83D\uDEAB', '\uD83D\uDCAF', '\uD83D\uDCA2', '\u2668\uFE0F', '\uD83D\uDEB7', '\uD83D\uDEAF', '\uD83D\uDEB3', '\uD83D\uDEB1', '\uD83D\uDD1E', '\uD83D\uDCF5', '\uD83D\uDEAD', '\u2757', '\u2755', '\u2753', '\u2754', '\u203C\uFE0F', '\u2049\uFE0F', '\uD83D\uDD05', '\uD83D\uDD06', '\u26A0\uFE0F', '\uD83D\uDEB8', '\uD83D\uDD31', '\u269C\uFE0F', '\uD83D\uDD30', '\u267B\uFE0F', '\u2705', '\uD83D\uDC39', '\u2747\uFE0F', '\u2733\uFE0F', '\u274E', '\uD83C\uDF10', '\uD83D\uDCA0', '\u24C2\uFE0F', '\uD83C\uDF00', '\uD83D\uDCA4', '\uD83C\uDFE7'],
} as const;

// ─── Skin Tone Support ───

const SKIN_TONES = ['', '\uD83C\uDFFB', '\uD83C\uDFFC', '\uD83C\uDFFD', '\uD83C\uDFFE', '\uD83C\uDFFF'] as const;
const SKIN_TONE_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];

const SKIN_TONE_EMOJIS = new Set([
  '\uD83D\uDC4B', '\uD83E\uDD1A', '\uD83D\uDD90\uFE0F', '\u270B', '\uD83D\uDD96', '\uD83D\uDC4C', '\uD83E\uDD0C', '\uD83E\uDD0F', '\u270C\uFE0F', '\uD83E\uDD1E', '\uD83E\uDD1F', '\uD83E\uDD18', '\uD83E\uDD19', '\uD83D\uDC48', '\uD83D\uDC49', '\uD83D\uDC46', '\uD83D\uDD95', '\uD83D\uDC47', '\u261D\uFE0F', '\uD83D\uDC4D', '\uD83D\uDC4E', '\u270A', '\uD83D\uDC4A', '\uD83E\uDD1B', '\uD83E\uDD1C', '\uD83D\uDC4F', '\uD83D\uDE4C', '\uD83D\uDC50', '\uD83E\uDD32', '\uD83E\uDD1D', '\uD83D\uDE4F', '\u270D\uFE0F', '\uD83D\uDC85', '\uD83E\uDD33', '\uD83D\uDCAA',
  '\uD83E\uDDB5', '\uD83E\uDDB6', '\uD83D\uDC42', '\uD83E\uDDBB', '\uD83D\uDC43',
]);

// ─── API Functions ───

const API_BASE = '/api/client-chat';

async function fetchConversation(): Promise<Conversation | null> {
  const res = await fetch(`${API_BASE}/app/conversation`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

async function fetchMessages(conversationId?: string): Promise<ChatMessage[]> {
  if (!conversationId) {
    // Use client-side endpoint that auto-resolves conversation
    const res = await fetch(`${API_BASE}/app/messages`, { credentials: 'include' });
    if (!res.ok) return [];
    return res.json();
  }
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, { credentials: 'include' });
  if (!res.ok) return [];
  return res.json();
}

async function sendMessageApi(content: string): Promise<ChatMessage | null> {
  const res = await fetch(`${API_BASE}/app/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, messageType: 'text' }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function markAsRead(): Promise<void> {
  await fetch(`${API_BASE}/app/read`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
}

// ─── Typing Indicator (Apple-style bouncing dots) ───

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

// ─── Date Separator ───

const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-4">
    <span className="text-xs font-medium text-gray-400 bg-white/80 px-3 py-1 rounded-full">
      {date}
    </span>
  </div>
);

// ─── Helpers ───

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Convert legacy demo messages to ChatMessage format */
function mapDemoMessages(): ChatMessage[] {
  return DEMO_CLIENT_MESSAGES.map((msg) => ({
    id: msg.id,
    conversationId: 'demo',
    senderId: msg.from === 'client' ? 'client-1' : 'agent-1',
    senderType: msg.from,
    senderName: msg.fromName,
    content: msg.message,
    messageType: 'text' as const,
    isRead: msg.isRead,
    createdAt: new Date(msg.timestamp).toISOString(),
  }));
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function ClientMessages() {
  // ─── State ───
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mapDemoMessages());
  const [newMessage, setNewMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTapback, setShowTapback] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, { emoji: string; count: number }[]>>({});
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [skinToneEmoji, setSkinToneEmoji] = useState<string | null>(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUsingApi, setIsUsingApi] = useState(false);

  // ─── Refs ───
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Agent info — from conversation or fallback to demo
  const agentName = conversation?.agentName || DEMO_CLIENT.agentName;
  const agentInitials = getInitials(agentName);

  // ─── Fetch Conversation + Messages ───
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const conv = await fetchConversation();
        if (cancelled) return;

        if (conv) {
          setConversation(conv);
          setIsUsingApi(true);

          const msgs = await fetchMessages();
          if (cancelled) return;

          if (msgs.length > 0) {
            setMessages(msgs);
          }
          // Mark as read
          await markAsRead();
        }
      } catch {
        // Keep demo data on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ─── WebSocket Connection ───
  useEffect(() => {
    if (!conversation) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/client-chat`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(JSON.stringify({
            type: 'auth',
            userId: conversation.clientId,
            userType: 'client',
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Agent sent a new message
            if ((data.type === 'client_message' || data.type === 'agent_message') && data.message) {
              setMessages(prev => {
                if (prev.some(m => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
              // Mark as read immediately
              markAsRead();
            }

            // Typing indicator
            if (data.type === 'typing' && data.conversationId === conversation.id) {
              setIsAgentTyping(data.isTyping);
              if (data.isTyping) {
                setTimeout(() => setIsAgentTyping(false), 5000);
              }
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // ignore
      }
    };

    connect();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [conversation]);

  // ─── Auto-scroll ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  // ─── Close tapback on click outside ───
  useEffect(() => {
    if (!showTapback) return;
    const handler = () => setShowTapback(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showTapback]);

  // ─── Periodic refetch ───
  useEffect(() => {
    if (!isUsingApi) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await fetchMessages();
        if (msgs.length > 0) setMessages(msgs);
      } catch { /* ignore */ }
    }, 15000);
    return () => clearInterval(interval);
  }, [isUsingApi]);

  // ─── Handlers ───

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setReplyingTo(null);

    if (isUsingApi) {
      setIsSending(true);
      try {
        const sent = await sendMessageApi(content);
        if (sent) {
          setMessages(prev => {
            if (prev.some(m => m.id === sent.id)) return prev;
            return [...prev, sent];
          });
        } else {
          toast.error('Failed to send message');
        }
      } catch {
        toast.error('Failed to send message');
      } finally {
        setIsSending(false);
      }
    } else {
      // Demo mode — add locally
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: 'demo',
        senderId: 'client-1',
        senderType: 'client',
        senderName: `${DEMO_CLIENT.firstName} ${DEMO_CLIENT.lastName}`,
        content,
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
        replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.senderName, content: replyingTo.content } : undefined,
      };
      setMessages(prev => [...prev, newMsg]);

      // Simulate agent response
      setTimeout(() => {
        setIsAgentTyping(true);
        setTimeout(() => {
          setIsAgentTyping(false);
          const responses = [
            "Thanks for reaching out! I'll look into that for you.",
            "Great question! Let me check on that.",
            "I appreciate you letting me know. I'll follow up shortly.",
            "Absolutely, I can help with that!",
            "Got it! I'll have an update for you soon.",
          ];
          setMessages(prev => [...prev, {
            id: `msg-${Date.now() + 1}`,
            conversationId: 'demo',
            senderId: 'agent-1',
            senderType: 'agent',
            senderName: agentName,
            content: responses[Math.floor(Math.random() * responses.length)],
            messageType: 'text',
            isRead: true,
            createdAt: new Date().toISOString(),
          }]);
        }, 2000);
      }, 500);
    }
  }, [newMessage, isSending, isUsingApi, replyingTo, agentName]);

  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    setMessageReactions(prev => {
      const existing = prev[messageId] || [];
      const existingReaction = existing.find(r => r.emoji === emoji);
      if (existingReaction) {
        return { ...prev, [messageId]: existing.filter(r => r.emoji !== emoji) };
      }
      return { ...prev, [messageId]: [...existing, { emoji, count: 1 }] };
    });
    setShowTapback(null);
  }, []);

  const handleReply = useCallback((message: ChatMessage) => {
    setReplyingTo(message);
    setShowTapback(null);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setSkinToneEmoji(null);
    setEmojiSearch('');
  }, []);

  // ─── Date grouping ───
  const dateGroups = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    for (const msg of messages) {
      const dateLabel = formatMessageDate(msg.createdAt);
      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ date: dateLabel, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [messages]);

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════

  return (
    <ClientLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
        className="flex flex-col"
        style={{ gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <ClientPageHero
          icon={MessageSquare}
          title="Messages"
          subtitle="Chat directly with your advisor"
        />

        {/* Chat Container */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col bg-white overflow-hidden"
          style={{
            height: 'calc(100vh - 280px)',
            minHeight: 480,
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.card,
          }}
        >
          {/* ─── Chat Header ─── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-sm font-semibold">
                    {agentInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="w-3 h-3 absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{agentName}</h2>
                <p className="text-xs text-gray-500">Insurance Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => toast.info(`Calling ${agentName}...`)}
              >
                <Phone className="w-5 h-5 text-violet-500" />
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => toast.info(`Video call with ${agentName}...`)}
              >
                <Video className="w-5 h-5 text-violet-500" />
              </button>
            </div>
          </div>

          {/* ─── Messages Area ─── */}
          <ScrollArea className="flex-1 px-4 py-2 bg-gradient-to-b from-gray-50/30 to-white">
            {isLoading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={cn("flex items-end gap-2", i % 2 === 0 ? "" : "justify-end")}>
                    {i % 2 === 0 && <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />}
                    <div
                      className={cn("h-12 rounded-2xl animate-pulse", i % 2 === 0 ? "bg-gray-200" : "bg-violet-100")}
                      style={{ width: `${30 + Math.random() * 40}%` }}
                    />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-2xl font-semibold">
                    {agentInitials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{agentName}</h3>
                <p className="text-sm text-gray-500">Start a conversation with your advisor</p>
              </div>
            ) : (
              <>
                {dateGroups.map((group) => (
                  <div key={group.date}>
                    <DateSeparator date={group.date} />
                    <div className="space-y-0.5">
                      {group.messages.map((message, idx) => {
                        const prevMessage = group.messages[idx - 1];
                        const nextMessage = group.messages[idx + 1];
                        const isFirstInGroup = !prevMessage || prevMessage.senderType !== message.senderType;
                        const isLastInGroup = !nextMessage || nextMessage.senderType !== message.senderType;
                        // Client messages = own (right side)
                        const isOwn = message.senderType === 'client';
                        const showTapbackMenu = showTapback === message.id;
                        const reactions = messageReactions[message.id] || [];

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: idx * 0.02 }}
                            className={cn(
                              'group flex gap-2 relative',
                              isOwn ? 'justify-end' : 'justify-start',
                              isLastInGroup && 'mb-2'
                            )}
                          >
                            {/* Avatar — only for last message in group from agent */}
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

                            <div className={cn('max-w-[70%] flex flex-col relative', isOwn ? 'items-end' : 'items-start')}>
                              {/* Reply indicator */}
                              {message.replyTo && (
                                <div className={cn(
                                  'flex items-center gap-1 mb-1 text-[11px] text-gray-400',
                                  isOwn ? 'mr-1' : 'ml-1'
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

                              {/* Message bubble — iMessage style */}
                              <div
                                className={cn(
                                  'relative px-3 py-2 inline-block text-left cursor-pointer select-none',
                                  isOwn
                                    ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 text-white'
                                    : 'bg-[#e9e9eb] text-gray-900'
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
                                    'text-[11px] mb-1.5 pb-1.5 border-b',
                                    isOwn ? 'border-white/20 text-white/70' : 'border-gray-300 text-gray-500'
                                  )}>
                                    <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
                                  </div>
                                )}
                                <p className="text-[15px] leading-snug whitespace-pre-wrap">{message.content}</p>
                              </div>

                              {/* Tapback menu — Apple style */}
                              <AnimatePresence>
                                {showTapbackMenu && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                    className={cn(
                                      'absolute z-20 bg-white/95 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50 px-2 py-1.5 flex items-center gap-1',
                                      isOwn ? 'right-0 -top-12' : 'left-0 -top-12'
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

                              {/* Hover actions — reply and react */}
                              <div className={cn(
                                'absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all',
                                isOwn ? '-left-20' : '-right-20'
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

                              {/* Time + delivery status — only for last message in group */}
                              {isLastInGroup && (
                                <div className={cn(
                                  'flex items-center gap-1 mt-0.5 px-1',
                                  isOwn ? 'justify-end' : 'justify-start'
                                )}>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                  {isOwn && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                      {message.isRead ? '\u00B7 Read' : '\u00B7 Delivered'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isAgentTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-end gap-2"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-[10px] font-semibold">
                        {agentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <TypingIndicator />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          {/* ─── Message Input — iMessage style (matching Agent Lounge) ─── */}
          <div className="p-2 bg-gray-100/80 backdrop-blur-sm border-t border-gray-200/50 relative">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={() => toast.info('File attachment coming soon')}
            />

            {/* Reply indicator */}
            {replyingTo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-200/60 backdrop-blur mb-2 rounded-2xl">
                <div className="w-1 h-8 bg-violet-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 font-medium">Replying to {replyingTo.senderName}</p>
                  <p className="text-[13px] text-gray-700 truncate">{replyingTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}

            {/* Input row — iMessage style */}
            <div className="flex items-end gap-2">
              {/* Plus/Apps button */}
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

                  {/* Send button — only show when there's content */}
                  <AnimatePresence>
                    {newMessage.trim() && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={handleSendMessage}
                        disabled={isSending}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Emoji Picker (Portal) ─── */}
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
                                  'text-2xl p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-110',
                                  selectedSkinTone === idx && 'bg-violet-100'
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

                    {/* Category tabs */}
                    {!emojiSearch && (
                      <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                          <button
                            key={category}
                            onClick={() => setEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all',
                              emojiCategory === category
                                ? 'bg-violet-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                            'w-5 h-5 rounded-full transition-all hover:scale-110',
                            selectedSkinTone === idx
                              ? 'ring-2 ring-violet-500 ring-offset-1'
                              : 'hover:ring-2 hover:ring-gray-300'
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
                              title={supportsSkinTone ? 'Click to choose skin tone' : undefined}
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
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
