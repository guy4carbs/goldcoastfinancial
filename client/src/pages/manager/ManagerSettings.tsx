/**
 * Manager Settings
 * Configure manager lounge preferences
 * Heritage Design System — Emerald theme
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives';
import { glassCard } from './managerConstants';
import { RADIUS, TYPE, GRID, LAYOUT, MOTION, COLORS, SHADOW, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, LayoutDashboard, Users, Download, BookOpen, Mail, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const notificationPreferences = [
  {
    id: 'team-activity',
    label: 'Team Activity Alerts',
    description: 'Get notified when team members hit milestones',
    defaultChecked: true,
  },
  {
    id: 'escalation-alerts',
    label: 'Escalation Alerts',
    description: 'Instant notifications for new escalations',
    defaultChecked: true,
  },
  {
    id: 'weekly-report',
    label: 'Weekly Report Delivery',
    description: 'Receive weekly team performance summary',
    defaultChecked: true,
  },
  {
    id: 'pipeline-alerts',
    label: 'Pipeline Alerts',
    description: 'Notifications for pipeline stage changes',
    defaultChecked: false,
  },
  {
    id: 'training-deadlines',
    label: 'Training Deadline Reminders',
    description: 'Upcoming certification deadlines and incomplete modules',
    defaultChecked: true,
  },
  {
    id: 'team-achievements',
    label: 'Team Achievement Notifications',
    description: 'When agents complete certifications or training milestones',
    defaultChecked: true,
  },
  {
    id: 'compliance-alerts',
    label: 'Compliance Alerts',
    description: 'Certifications expiring, overdue training, and compliance violations',
    defaultChecked: true,
  },
];

const dashboardWidgets = [
  { id: 'top-performers', label: 'Show Top Performers widget' },
  { id: 'pipeline-summary', label: 'Show Pipeline Summary' },
  { id: 'escalations', label: 'Show Escalations widget' },
  { id: 'activity-feed', label: 'Show Team Activity Feed' },
];

const teamDefaults = [
  { id: 'quota-target', label: 'Default Quota Target (%)', defaultValue: '100' },
  { id: 'meeting-frequency', label: 'Meeting Frequency', defaultValue: 'Weekly' },
  { id: 'escalation-threshold', label: 'Escalation Threshold (days)', defaultValue: '2' },
];

export function ManagerSettings() {
  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* Hero */}
        <ManagerPageHero
          icon={Settings}
          title="Settings"
          subtitle="Configure your manager lounge preferences"
        />

        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
          {/* Section 1: Notification Preferences */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Bell className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notificationPreferences.map((pref, idx) => (
                    <div
                      key={pref.id}
                      className={`flex items-center justify-between ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                      style={{ padding: `${GRID.spacing.sm}px 0` }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.description}</p>
                      </div>
                      <Switch defaultChecked={pref.defaultChecked} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 1b: Delivery Method */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Mail className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Delivery Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: `${GRID.spacing.sm}px 0` }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <Smartphone className="text-gray-400" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Push Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts on your device</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div
                    className="flex items-center justify-between border-t border-gray-100"
                    style={{ padding: `${GRID.spacing.sm}px 0` }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <Mail className="text-gray-400" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div
                    className="border-t border-gray-100"
                    style={{ padding: `${GRID.spacing.sm}px 0` }}
                  >
                    <Label
                      htmlFor="email-frequency"
                      className="text-sm text-gray-700 font-medium"
                    >
                      Email Frequency
                    </Label>
                    <div className="flex" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.xs }}>
                      {['Real-time', 'Daily Digest', 'Weekly Digest'].map((option, idx) => (
                        <label
                          key={option}
                          className={`flex items-center cursor-pointer font-medium ${
                            idx === 1 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' : 'text-gray-600'
                          }`}
                          style={{
                            ...(idx !== 1 ? glassCard : {}),
                            borderRadius: RADIUS.button,
                            padding: `${GRID.spacing.xs}px 12px`,
                            fontSize: 12,
                          }}
                        >
                          <input
                            type="radio"
                            name="email-frequency"
                            value={option.toLowerCase().replace(' ', '-')}
                            defaultChecked={idx === 1}
                            className="sr-only"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Dashboard Customization */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <LayoutDashboard className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Dashboard Customization</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {dashboardWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center"
                      style={{ gap: GRID.spacing.xs }}
                    >
                      <Checkbox id={widget.id} defaultChecked />
                      <label
                        htmlFor={widget.id}
                        className="text-sm text-gray-900 cursor-pointer"
                      >
                        {widget.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Team Defaults */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Users className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Team Defaults</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {teamDefaults.map((field) => (
                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
                      <Label
                        htmlFor={field.id}
                        className="text-sm text-gray-700 font-medium"
                      >
                        {field.label}
                      </Label>
                      <Input
                        id={field.id}
                        defaultValue={field.defaultValue}
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 4: Data Export */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Download className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Data Export</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <p className="text-sm text-gray-500" style={{ marginBottom: GRID.spacing.sm }}>
                  Download team data in CSV format for external analysis.
                </p>
                <div className="flex flex-wrap" style={{ gap: GRID.spacing.sm }}>
                  <motion.button
                    className="font-semibold text-sm text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.button,
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Export Team Data
                  </motion.button>
                  <motion.button
                    className="font-medium text-sm text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.button,
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Export Pipeline Report
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerSettings;
