/**
 * AgentCommunications - Combined Email + Chat Communications Hub
 * Part of Agent Lounge Navigation Restructure
 *
 * This page combines Email and Team Chat into a unified communications interface
 * with tabs for easy navigation between communication channels.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Mail,
  PenSquare,
  Users,
} from "lucide-react";
import { AgentPageHero } from "@/components/agent/primitives";
import {
  RADIUS,
  COLORS,
  fadeInUp,
  staggerContainer,
  spacing
} from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";

// Import Email and Chat content components
import AgentEmailContent from "@/components/agent/communications/EmailContent";
import AgentChatContent from "@/components/agent/communications/ChatContent";
import ClientChatContent from "@/components/agent/communications/ClientChatContent";

export default function AgentCommunications() {
  const [activeTab, setActiveTab] = useState<'email' | 'chat' | 'client'>('email');

  // Email unread count — fetch connection first, then inbox if connected
  const { data: emailConn } = useQuery({
    queryKey: ['/api/email/connection'],
  });
  const isEmailConnected = !!(emailConn as any)?.connection;

  const { data: inboxData } = useQuery({
    queryKey: ['/api/email/messages?folder=inbox&limit=50'],
    enabled: isEmailConnected,
  });
  const unreadEmails = Array.isArray(inboxData)
    ? inboxData.filter((e: any) => !e.isRead).length
    : 0;

  // Team chat unread count from conversations
  const { data: chatConversations } = useQuery({
    queryKey: ['/api/chat/conversations'],
    refetchInterval: 15000,
  });
  const unreadMessages = Array.isArray(chatConversations)
    ? (chatConversations as any[]).reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0)
    : 0;

  // Client chat unread count from dedicated endpoint
  const { data: unreadData } = useQuery({
    queryKey: ['/api/client-chat/unread-count'],
  });
  const unreadClientMessages = (unreadData as any)?.count || 0;

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col h-full"
        style={{ gap: spacing(2) }}
      >
        {/* Hero Card */}
        <motion.div data-tour-id={TOUR.AGENT.COMMUNICATIONS.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={MessageSquare}
            title="Communications"
            subtitle="Email, chat, and connect with your team and clients"
          >
            <Button
              data-tour-id={TOUR.AGENT.COMMUNICATIONS.COMPOSE}
              className="gap-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
              onClick={() => setActiveTab('email')}
            >
              <PenSquare className="w-4 h-4" />
              Compose
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Tabs Container */}
        <motion.div
          data-tour-id={TOUR.AGENT.COMMUNICATIONS.TABS}
          variants={fadeInUp}
          className="flex-1 min-h-0"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'email' | 'chat' | 'client')}
            className="flex flex-col h-full"
          >
            <TabsList
              className="w-fit mb-4 border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="email"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Mail className="w-4 h-4" />
                Email
                {unreadEmails > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700"
                  >
                    {unreadEmails}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <MessageSquare className="w-4 h-4" />
                Team Chat
                {unreadMessages > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="client"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Users className="w-4 h-4" />
                Client Chat
                {unreadClientMessages > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700"
                  >
                    {unreadClientMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              data-tour-id={TOUR.AGENT.COMMUNICATIONS.INBOX}
              value="email"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <AgentEmailContent />
            </TabsContent>

            <TabsContent
              value="chat"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <AgentChatContent colorScheme="violet" />
            </TabsContent>

            <TabsContent
              value="client"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <ClientChatContent />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
