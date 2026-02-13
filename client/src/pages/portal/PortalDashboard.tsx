/**
 * Client Portal Dashboard
 * Client's overview of their policies and account
 */

import { PortalLayout } from './PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Calendar, Phone, Gift, ChevronRight } from 'lucide-react';

export function PortalDashboard() {
  return (
    <PortalLayout breadcrumbs={[{ label: 'Client Portal' }, { label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, John!</h1>
          <p className="text-cyan-100 mt-1">Your policies are active and up to date.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: 'View Policies', href: '/portal/policies' },
            { icon: Shield, label: 'File a Claim', href: '/portal/claims' },
            { icon: Calendar, label: 'Schedule Call', href: '/portal/support' },
            { icon: Gift, label: 'Refer a Friend', href: '/portal/referral' },
          ].map((action, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <action.icon className="w-8 h-8 mx-auto text-cyan-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Policies */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My Policies</CardTitle>
              <CardDescription>Your active insurance coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: 'Term Life Insurance',
                    number: 'POL-2024-78542',
                    coverage: '$500,000',
                    premium: '$89/mo',
                    status: 'Active',
                    nextPayment: 'Feb 15, 2025',
                  },
                  {
                    type: 'Whole Life Insurance',
                    number: 'POL-2023-45231',
                    coverage: '$250,000',
                    premium: '$245/mo',
                    status: 'Active',
                    nextPayment: 'Feb 1, 2025',
                  },
                ].map((policy, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{policy.type}</p>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          {policy.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{policy.number}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">Coverage: <strong>{policy.coverage}</strong></span>
                        <span className="text-gray-600">Premium: <strong>{policy.premium}</strong></span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advisor Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Your Advisor</CardTitle>
              <CardDescription>Need help? Reach out anytime.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  SJ
                </div>
                <p className="font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Licensed Insurance Agent</p>
                <p className="text-sm text-gray-500">NPN: 12345678</p>

                <div className="mt-4 space-y-2">
                  <Button className="w-full" variant="default">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule a Call
                  </Button>
                  <Button className="w-full" variant="outline">
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Your scheduled premium payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { policy: 'Whole Life Insurance', amount: '$245.00', date: 'Feb 1, 2025', status: 'scheduled' },
                { policy: 'Term Life Insurance', amount: '$89.00', date: 'Feb 15, 2025', status: 'scheduled' },
                { policy: 'Whole Life Insurance', amount: '$245.00', date: 'Mar 1, 2025', status: 'upcoming' },
              ].map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.policy}</p>
                    <p className="text-xs text-gray-500">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{payment.amount}</p>
                    <p className="text-xs text-emerald-600 capitalize">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

export default PortalDashboard;
