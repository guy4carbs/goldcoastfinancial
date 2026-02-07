import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Calendar, RefreshCw, TrendingUp,
  ChevronRight, Bell, Zap, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { RenewalAlerts } from "./RenewalAlerts";
import { UpcomingAppointments } from "./UpcomingAppointments";

interface AssistedActionsPanelProps {
  onSelectLead?: (lead: Lead) => void;
}

type Tab = 'appointments' | 'renewals' | 'insights';

export function AssistedActionsPanel({ onSelectLead }: AssistedActionsPanelProps) {
  const { getUpcomingAppointments, getRenewalAlerts } = useAgentStore();
  const [activeTab, setActiveTab] = useState<Tab>('appointments');

  const appointments = getUpcomingAppointments();
  const renewals = getRenewalAlerts();

  const todayAppointments = appointments.filter(({ appointment }) => {
    const date = new Date(appointment.date);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;

  const urgentRenewals = renewals.filter(r => r.daysUntilExpiration <= 14).length;

  const tabs = [
    {
      id: 'appointments' as Tab,
      label: 'Appointments',
      icon: Calendar,
      count: todayAppointments,
      countType: 'today' as const,
    },
    {
      id: 'renewals' as Tab,
      label: 'Renewals',
      icon: RefreshCw,
      count: urgentRenewals,
      countType: 'urgent' as const,
    },
    {
      id: 'insights' as Tab,
      label: 'AI Insights',
      icon: Brain,
      count: 0,
      countType: 'new' as const,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-500">Smart actions & reminders</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Stage 3
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <Badge className={cn(
                  "text-[10px] px-1.5 py-0",
                  tab.countType === 'urgent'
                    ? "bg-red-500 text-white"
                    : tab.countType === 'today'
                    ? "bg-primary text-white"
                    : "bg-blue-100 text-blue-700"
                )}>
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'appointments' && (
          <UpcomingAppointments
            onSelectLead={onSelectLead}
            limit={5}
          />
        )}

        {activeTab === 'renewals' && (
          <RenewalAlerts
            onSelectLead={onSelectLead}
            limit={5}
          />
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <InsightCard
              icon={TrendingUp}
              title="Conversion Opportunity"
              description="3 leads in 'Proposal' stage haven't been contacted in 5+ days. Follow up to close."
              action="View Leads"
              color="blue"
            />
            <InsightCard
              icon={Calendar}
              title="Best Time to Call"
              description="Based on your history, 10 AM - 12 PM has the highest contact rate. Schedule calls accordingly."
              color="green"
            />
            <InsightCard
              icon={RefreshCw}
              title="Cross-Sell Alert"
              description="2 clients with term policies may benefit from whole life coverage. Review opportunities."
              action="View Clients"
              color="purple"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t">
        <Button variant="ghost" className="w-full text-sm text-gray-500 hover:text-gray-700">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface InsightCardProps {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  action?: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

function InsightCard({ icon: Icon, title, description, action, color }: InsightCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
  };

  const iconStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border",
        colorStyles[color]
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          iconStyles[color]
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
          {action && (
            <Button size="sm" variant="link" className="h-auto p-0 mt-2 text-xs">
              {action}
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
