/**
 * Marketing Dashboard
 * Content performance and campaign overview
 */

import { MarketingLoungeLayout } from './MarketingLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Heart, Share2, Star, TrendingUp } from 'lucide-react';

export function MarketingDashboard() {
  return (
    <MarketingLoungeLayout breadcrumbs={[{ label: 'Marketing Lounge' }, { label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-500 mt-1">Content performance and campaign insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Content Published</CardTitle>
              <FileText className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Reach</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124K</div>
              <p className="text-xs text-emerald-600">+18% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Engagement</CardTitle>
              <Heart className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2%</div>
              <p className="text-xs text-emerald-600">+0.8% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Reputation Score</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-gray-500">Based on 127 reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Best engagement this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: '5 Ways to Protect Your Family', type: 'Blog', views: '8.2K', engagement: '6.2%' },
                  { title: 'Life Insurance Explained', type: 'Video', views: '5.1K', engagement: '8.4%' },
                  { title: 'IUL vs Whole Life', type: 'Infographic', views: '3.8K', engagement: '5.1%' },
                  { title: 'Client Success Story: The Johnsons', type: 'Social', views: '2.4K', engagement: '9.2%' },
                ].map((content, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                      <p className="text-xs text-gray-500">{content.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{content.views}</p>
                      <p className="text-xs text-emerald-600">{content.engagement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Social media metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { channel: 'Facebook', followers: '12.4K', growth: '+2.1%', engagement: '4.8%' },
                  { channel: 'Instagram', followers: '8.7K', growth: '+5.3%', engagement: '6.2%' },
                  { channel: 'LinkedIn', followers: '5.2K', growth: '+3.8%', engagement: '3.1%' },
                  { channel: 'YouTube', followers: '2.1K', growth: '+8.2%', engagement: '7.4%' },
                ].map((channel, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{channel.channel}</p>
                      <p className="text-xs text-gray-500">{channel.followers} followers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600">{channel.growth}</p>
                      <p className="text-xs text-gray-500">{channel.engagement} eng.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLoungeLayout>
  );
}

export default MarketingDashboard;
