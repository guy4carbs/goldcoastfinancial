/**
 * Agent Client Management Page
 * Heritage Design System — Violet-to-Amber theme
 * Glass cards, framer-motion animations, Heritage tokens
 *
 * Agent-facing client list: view, search, and manage assigned clients.
 * Each card links to full detail view at /agents/clients/:id.
 *
 * Governance: Nova (UI) + Forge (API) + Lumen (flow)
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  RADIUS, SHADOW, MOTION, TYPE,
  fadeInUp, staggerContainer, scaleIn,
  COLORS,
} from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import {
  Users, Search, Phone, Mail, FileText, Shield, Clock,
  CheckCircle, AlertTriangle, Loader2, ChevronRight, User,
} from 'lucide-react';

// ─── ONBOARDING STATUS COLORS ─────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending_setup: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  onboarding: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  churned: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onboardingStatus: string;
  policyCount: number;
  lastActivity: string | null;
  createdAt: string;
}

export default function AgentClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/agent-clients'],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Filter clients by search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const lower = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower) ||
        c.phone?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  // Compute stats
  const stats = useMemo(() => {
    const total = clients.length;
    const activePolicies = clients.reduce((sum, c) => sum + (c.policyCount || 0), 0);
    const pendingSetup = clients.filter((c) => c.onboardingStatus === 'pending_setup').length;
    const activeClients = clients.filter((c) => c.onboardingStatus === 'active').length;
    return { total, activePolicies, pendingSetup, activeClients };
  }, [clients]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status] || STATUS_COLORS.inactive;

  const formatStatus = (status: string) =>
    (status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  if (error) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">Failed to load clients. Please try again.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/agent-clients'] })} variant="outline">
            Retry
          </Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero */}
        <motion.div data-tour-id={TOUR.AGENT.CLIENTS.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Users}
            title="My Clients"
            subtitle="Manage your client relationships, policies, and documents"
          />
        </motion.div>

        {/* Stat Cards */}
        <motion.div data-tour-id={TOUR.AGENT.CLIENTS.STATS} variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={Users}
              value={stats.total}
              label="Total Clients"
              gradient="from-violet-500 to-purple-600"
            />
            <AgentStatCard
              icon={Shield}
              value={stats.activePolicies}
              label="Active Policies"
              gradient="from-emerald-500 to-teal-600"
            />
            <AgentStatCard
              icon={CheckCircle}
              value={stats.activeClients}
              label="Active Clients"
              gradient="from-blue-500 to-cyan-600"
            />
            <AgentStatCard
              icon={AlertTriangle}
              value={stats.pendingSetup}
              label="Pending Setup"
              gradient="from-amber-500 to-orange-600"
            />
          </AgentStatCardGrid>
        </motion.div>

        {/* Search Bar */}
        <motion.div data-tour-id={TOUR.AGENT.CLIENTS.SEARCH} variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardContent className="p-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ width: 18, height: 18 }}
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-violet-300 focus:ring-violet-200"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Client List */}
        {isLoading ? (
          <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
            <p className="text-gray-500" style={{ fontSize: TYPE.body }}>Loading clients...</p>
          </motion.div>
        ) : filteredClients.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={glassCard}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div
                  className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 mb-4"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <Users className="w-8 h-8 text-violet-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {searchTerm ? 'No clients found' : 'No clients yet'}
                </h3>
                <p className="text-gray-500 text-sm text-center max-w-sm">
                  {searchTerm
                    ? 'Try adjusting your search terms to find what you are looking for.'
                    : 'When clients are assigned to you, they will appear here for management.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div data-tour-id={TOUR.AGENT.CLIENTS.GRID} variants={fadeInUp} className="space-y-3">
            {filteredClients.map((client) => {
              const statusColor = getStatusColor(client.onboardingStatus);
              return (
                <Link key={client.id} href={`/agents/clients/${client.id}`}>
                  <motion.div
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="cursor-pointer"
                  >
                    <Card className="border-0 overflow-hidden" style={glassCard}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div
                            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold"
                            style={{ borderRadius: RADIUS.button, fontSize: TYPE.body }}
                          >
                            {(client.firstName?.[0] || '?')}{(client.lastName?.[0] || '?')}
                          </div>

                          {/* Client Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.body }}>
                                {client.firstName} {client.lastName}
                              </h3>
                              <Badge
                                className={cn(statusColor.bg, statusColor.text, 'border-0 text-xs')}
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                <div className={cn('w-1.5 h-1.5 rounded-full mr-1', statusColor.dot)} />
                                {formatStatus(client.onboardingStatus)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              {client.email && (
                                <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: TYPE.meta }}>
                                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span className="truncate max-w-[180px]">{client.email}</span>
                                </span>
                              )}
                              {client.phone && (
                                <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: TYPE.meta }}>
                                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right side - meta */}
                          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-gray-600" style={{ fontSize: TYPE.meta }}>
                                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                                <span className="font-medium">{client.policyCount || 0}</span>
                                <span className="text-gray-400">policies</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400 mt-0.5" style={{ fontSize: TYPE.caption }}>
                                <Clock className="w-3 h-3" aria-hidden="true" />
                                {formatDate(client.lastActivity)}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" aria-hidden="true" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </AgentLoungeLayout>
  );
}
