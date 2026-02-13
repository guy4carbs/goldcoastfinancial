/**
 * Manager Dashboard
 * Team performance overview and key metrics
 */

import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Target, DollarSign, TrendingUp, Award, AlertTriangle } from 'lucide-react';

export function ManagerDashboard() {
  return (
    <ManagerLoungeLayout breadcrumbs={[{ label: 'Manager Lounge' }, { label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your team's performance and pipeline</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Size</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">8 active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pipeline Value</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$847K</div>
              <p className="text-xs text-emerald-600">+18% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">MTD Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$124K</div>
              <p className="text-xs text-gray-500">76% of target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Quota</CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <Progress value={76} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Performers
              </CardTitle>
              <CardDescription>This month's leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Johnson', sales: 8, revenue: '$42,500', quota: 112 },
                  { name: 'Mike Chen', sales: 6, revenue: '$38,200', quota: 95 },
                  { name: 'Emily Davis', sales: 5, revenue: '$31,800', quota: 88 },
                  { name: 'James Wilson', sales: 4, revenue: '$28,400', quota: 71 },
                ].map((agent, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      idx === 0 ? 'bg-amber-500' :
                      idx === 1 ? 'bg-gray-400' :
                      idx === 2 ? 'bg-amber-700' : 'bg-gray-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.sales} sales · {agent.revenue}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${agent.quota >= 100 ? 'text-emerald-600' : 'text-gray-600'}`}>
                        {agent.quota}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Escalations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pending Escalations
              </CardTitle>
              <CardDescription>Requires your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Compliance Review', agent: 'Mike Chen', lead: 'Robert M.', priority: 'high' },
                  { type: 'Discount Approval', agent: 'Emily Davis', lead: 'Susan K.', priority: 'medium' },
                  { type: 'Policy Exception', agent: 'James Wilson', lead: 'Thomas L.', priority: 'medium' },
                ].map((escalation, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      escalation.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{escalation.type}</p>
                      <p className="text-xs text-gray-500">
                        {escalation.agent} · Lead: {escalation.lead}
                      </p>
                    </div>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLoungeLayout>
  );
}

export default ManagerDashboard;
