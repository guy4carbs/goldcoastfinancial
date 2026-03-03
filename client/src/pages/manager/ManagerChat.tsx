/**
 * Manager Team Chat
 * Communicate with your team in real-time
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives';
import { RADIUS, GRID, LAYOUT, MOTION, COLORS, SHADOW, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { Card } from '@/components/ui/card';
import { MessageSquare, Hash, Send } from 'lucide-react';

const channels = [
  { id: 'general', name: 'general', icon: Hash },
  { id: 'announcements', name: 'announcements', icon: Hash },
  { id: 'direct-messages', name: 'direct-messages', icon: MessageSquare },
];

const demoMessages = [
  {
    id: '1',
    sender: 'Sarah Johnson',
    avatar: 'SJ',
    timestamp: '9:42 AM',
    text: 'Good morning team! Just closed the Henderson account — $12K annual premium. Pipeline is looking strong this week.',
  },
  {
    id: '2',
    sender: 'Mike Chen',
    avatar: 'MC',
    timestamp: '9:48 AM',
    text: 'Congrats Sarah! I have a follow-up meeting with the Ramirez family at 2 PM today. They are leaning toward the whole life policy.',
  },
  {
    id: '3',
    sender: 'Emily Davis',
    avatar: 'ED',
    timestamp: '10:05 AM',
    text: 'Reminder: team standup is tomorrow at 9 AM. Please have your weekly metrics ready to share.',
  },
  {
    id: '4',
    sender: 'James Wilson',
    avatar: 'JW',
    timestamp: '10:22 AM',
    text: 'I updated the pipeline board with three new leads from the community event last weekend. All qualified for IUL products.',
  },
  {
    id: '5',
    sender: 'Lisa Park',
    avatar: 'LP',
    timestamp: '10:35 AM',
    text: 'Can someone share the latest commission structure doc? I want to review the new tier thresholds before my coaching session.',
  },
];

export function ManagerChat() {
  const [activeChannel, setActiveChannel] = useState('general');

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* Hero */}
        <ManagerPageHero
          icon={MessageSquare}
          title="Team Chat"
          subtitle="Communicate with your team in real-time"
        />

        {/* Chat UI Card */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0 flex"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              minHeight: 500,
            }}
          >
            {/* Left Sidebar — Channel List */}
            <div
              className="flex-shrink-0 border-r border-gray-100 flex flex-col"
              style={{ width: 256, padding: GRID.spacing.sm }}
            >
              <p
                className="text-sm font-semibold text-gray-900"
                style={{ padding: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}
              >
                Channels
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
                {channels.map((channel) => {
                  const isActive = activeChannel === channel.id;
                  const ChannelIcon = channel.icon;
                  return (
                    <motion.button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`flex items-center w-full text-left border-0 ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                      style={{
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.xs}px 12px`,
                        borderRadius: RADIUS.button,
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer',
                      }}
                      whileHover={{
                        backgroundColor: isActive ? undefined : COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover },
                      }}
                    >
                      <ChannelIcon style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, flexShrink: 0 }} />
                      <span className="truncate">{channel.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Content — Messages Area */}
            <div className="flex-1 flex flex-col">
              {/* Channel Header */}
              <div
                className="flex items-center border-b border-gray-100"
                style={{ padding: GRID.spacing.sm, gap: GRID.spacing.xs }}
              >
                <Hash className="text-gray-400" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                <p className="text-sm font-semibold text-gray-900">
                  {activeChannel}
                </p>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
              >
                {demoMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start"
                    style={{ gap: 12 }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold"
                      style={{
                        width: LAYOUT.icon.xxl,
                        height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.pill,
                        fontSize: 14,
                      }}
                    >
                      {message.avatar}
                    </div>
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline" style={{ gap: GRID.spacing.xs }}>
                        <p className="text-sm font-semibold text-gray-900">
                          {message.sender}
                        </p>
                        <p className="text-xs text-gray-400">
                          {message.timestamp}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700" style={{ lineHeight: 1.5, marginTop: 2 }}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div
                className="border-t border-gray-100 flex items-center"
                style={{ padding: GRID.spacing.sm, gap: GRID.spacing.xs }}
              >
                <input
                  type="text"
                  placeholder={`Message #${activeChannel}`}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-colors"
                  style={{
                    borderRadius: RADIUS.input,
                    padding: `${GRID.spacing.xs}px 12px`,
                    fontSize: 14,
                    height: LAYOUT.buttonHeight,
                  }}
                />
                <motion.button
                  className="flex items-center justify-center text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                  style={{
                    width: LAYOUT.buttonHeight,
                    height: LAYOUT.buttonHeight,
                    borderRadius: RADIUS.button,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerChat;
