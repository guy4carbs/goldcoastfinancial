import { useState } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Mail,
  Calendar,
  Bell,
  Clock,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Play,
  Pause,
  Plus,
  Settings,
  ArrowRight,
  RefreshCw,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runs: number;
  icon: typeof Zap;
  color: string;
  gradient: string;
}

const AUTOMATIONS: Automation[] = [
  {
    id: "auto-1",
    name: "Follow-Up Reminder",
    description: "Send reminder when lead hasn't been contacted in 3 days",
    trigger: "Lead inactive for 3 days",
    action: "Send notification + email reminder",
    enabled: true,
    runs: 156,
    icon: Bell,
    color: "amber",
    gradient: "from-amber-400 to-orange-500"
  },
  {
    id: "auto-2",
    name: "Birthday Greetings",
    description: "Automatically send birthday wishes to clients",
    trigger: "Client birthday",
    action: "Send personalized email",
    enabled: true,
    runs: 42,
    icon: Calendar,
    color: "pink",
    gradient: "from-pink-400 to-rose-500"
  },
  {
    id: "auto-3",
    name: "Policy Renewal Alert",
    description: "Notify when policy renewal is approaching",
    trigger: "30 days before renewal",
    action: "Create task + send email",
    enabled: true,
    runs: 89,
    icon: RefreshCw,
    color: "blue",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    id: "auto-4",
    name: "New Lead Assignment",
    description: "Auto-assign leads based on territory and capacity",
    trigger: "New lead received",
    action: "Assign to available agent",
    enabled: false,
    runs: 234,
    icon: Users,
    color: "violet",
    gradient: "from-violet-400 to-purple-500"
  },
  {
    id: "auto-5",
    name: "Quote Follow-Up",
    description: "Follow up on quotes not converted within 7 days",
    trigger: "Quote pending 7 days",
    action: "Send follow-up sequence",
    enabled: true,
    runs: 67,
    icon: FileText,
    color: "emerald",
    gradient: "from-emerald-400 to-green-500"
  },
  {
    id: "auto-6",
    name: "Meeting Preparation",
    description: "Send client info summary before scheduled meetings",
    trigger: "1 hour before meeting",
    action: "Send prep email with client details",
    enabled: true,
    runs: 28,
    icon: Target,
    color: "cyan",
    gradient: "from-cyan-400 to-teal-500"
  }
];

export default function AgentAutomations() {
  const [automations, setAutomations] = useState(AUTOMATIONS);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => {
      if (auto.id === id) {
        const newState = !auto.enabled;
        toast.success(newState ? "Automation enabled" : "Automation paused", {
          description: auto.name
        });
        return { ...auto, enabled: newState };
      }
      return auto;
    }));
  };

  const activeCount = automations.filter(a => a.enabled).length;
  const totalRuns = automations.reduce((sum, a) => sum + a.runs, 0);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Automations</h1>
                <p className="text-gray-500 text-sm">Automate your workflow and save time</p>
              </div>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md">
              <Plus className="w-4 h-4" />
              Create Automation
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">{activeCount}</p>
                <p className="text-sm text-gray-500">Active Automations</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">{totalRuns}</p>
                <p className="text-sm text-gray-500">Total Runs</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">12h</p>
                <p className="text-sm text-gray-500">Time Saved</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">98%</p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Automation List */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Your Automations</h2>
          <div className="space-y-4">
            {automations.map((automation, index) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "transition-all border-0 shadow-lg hover:shadow-xl",
                  !automation.enabled && "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-md",
                        automation.gradient
                      )}>
                        <automation.icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                          <Badge variant={automation.enabled ? "default" : "secondary"} className="text-[10px]">
                            {automation.enabled ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{automation.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {automation.trigger}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {automation.action}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{automation.runs}</p>
                          <p className="text-[10px] text-gray-400">runs</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={automation.enabled}
                            onCheckedChange={() => toggleAutomation(automation.id)}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Quick Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Email Drip Campaign", icon: Mail, description: "Send automated email sequences", gradient: "from-blue-400 to-cyan-500" },
              { name: "Task Auto-Creation", icon: CheckCircle2, description: "Create tasks based on triggers", gradient: "from-emerald-400 to-green-500" },
              { name: "SMS Notifications", icon: MessageSquare, description: "Send text alerts automatically", gradient: "from-violet-400 to-purple-500" },
            ].map((template, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md", template.gradient)}>
                      <template.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
