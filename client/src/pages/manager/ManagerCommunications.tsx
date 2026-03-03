/**
 * ManagerCommunications - Combined Email + Chat Communications Hub
 * Manager Lounge — Emerald theme
 *
 * Mirrors Agent Communications page structure with tabs for
 * Email and Team Chat. Client Chat is excluded for the manager role.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ManagerLoungeLayout } from "./ManagerLoungeLayout";
import { ManagerPageHero } from "./primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Mail,
  PenSquare,
} from "lucide-react";
import {
  RADIUS,
  COLORS,
  fadeInUp,
  staggerContainer,
  spacing,
} from '@/lib/heritageDesignSystem';

// Reuse the same Email and Chat content components from agent communications
import AgentEmailContent from "@/components/agent/communications/EmailContent";
import AgentChatContent from "@/components/agent/communications/ChatContent";

export function ManagerCommunications() {
  const [activeTab, setActiveTab] = useState<'email' | 'chat'>('email');

  // Mock unread counts - these would come from state/API
  const unreadEmails = 3;
  const unreadMessages = 4;

  return (
    <ManagerLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col h-full"
        style={{ gap: spacing(2) }}
      >
        {/* Hero Card — Emerald gradient */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={MessageSquare}
            title="Communication"
            subtitle="Email, chat, and connect with your team"
          >
            <Button
              className="gap-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
              onClick={() => setActiveTab('email')}
            >
              <PenSquare className="w-4 h-4" />
              Compose
            </Button>
          </ManagerPageHero>
        </motion.div>

        {/* Tabs Container */}
        <motion.div
          variants={fadeInUp}
          className="flex-1 min-h-0"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'email' | 'chat')}
            className="flex flex-col h-full"
          >
            <TabsList
              className="w-fit mb-4 border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="email"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Mail className="w-4 h-4" />
                Email
                {unreadEmails > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700"
                  >
                    {unreadEmails}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <MessageSquare className="w-4 h-4" />
                Team Chat
                {unreadMessages > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="email"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <AgentEmailContent colorScheme="emerald" />
            </TabsContent>

            <TabsContent
              value="chat"
              className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
            >
              <AgentChatContent colorScheme="emerald" />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerCommunications;
