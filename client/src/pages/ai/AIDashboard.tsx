/**
 * AI Dashboard
 * Overview of all AI agents and system status
 */

import { AILoungeLayout } from './AILoungeLayout';
import { AgentActivityIndicator } from '@/components/agents/AgentActivityIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Activity, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function AIDashboard() {
  return (
    <AILoungeLayout breadcrumbs={[{ label: 'AI Lounge' }, { label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Command Center</h1>
          <p className="text-gray-500 mt-1">Monitor and control your 37-agent AI workforce</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">37</div>
              <p className="text-xs text-gray-500">Across 10 tiers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">32</div>
              <p className="text-xs text-gray-500">5 idle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Events Today</CardTitle>
              <Zap className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-gray-500">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Healthy</div>
              <p className="text-xs text-gray-500">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
                <CardDescription>Real-time status of all AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentActivityIndicator mode="full" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest agent events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { agent: 'Lead Scoring', action: 'Scored lead: Maria G. (85/100)', time: '2m ago', status: 'success' },
                    { agent: 'Dialer Agent', action: 'Call connected: John S.', time: '5m ago', status: 'success' },
                    { agent: 'Compliance', action: 'Blocked: Invalid disclosure', time: '8m ago', status: 'warning' },
                    { agent: 'Email Agent', action: 'Sent follow-up to 12 leads', time: '15m ago', status: 'success' },
                    { agent: 'Enrichment', action: 'Enriched 3 new leads', time: '22m ago', status: 'success' },
                  ].map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.status === 'success' ? 'bg-emerald-500' :
                        event.status === 'warning' ? 'bg-amber-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.agent}</p>
                        <p className="text-xs text-gray-500 truncate">{event.action}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AILoungeLayout>
  );
}

export default AIDashboard;
