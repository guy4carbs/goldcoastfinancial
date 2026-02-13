/**
 * Executive Dashboard
 * High-level business metrics and forecasting
 */

import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function ExecutiveDashboard() {
  return (
    <ExecutiveLoungeLayout breadcrumbs={[{ label: 'Executive Lounge' }, { label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Business performance overview and forecasting</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$248,500</div>
              <div className="flex items-center text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +22% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pipeline Value</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1.2M</div>
              <div className="flex items-center text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +15% growth
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">3 new this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.4%</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                -2% from target
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>Projected revenue vs. actual for the quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">Revenue chart will be rendered here</p>
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Q1 Goals</CardTitle>
              <CardDescription>Progress toward quarterly targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="text-sm text-gray-500">$248K / $300K</span>
                </div>
                <Progress value={83} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">New Policies</span>
                  <span className="text-sm text-gray-500">127 / 150</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Agent Hiring</span>
                  <span className="text-sm text-gray-500">3 / 5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Retention Rate</span>
                  <span className="text-sm text-gray-500">94% / 95%</span>
                </div>
                <Progress value={99} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveDashboard;
