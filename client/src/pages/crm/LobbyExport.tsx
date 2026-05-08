/**
 * Lobby Export
 * Export contacts and data to CSV/Excel files
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { LobbyLayout } from './LobbyLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from '@/lib/tour/selectors';
import {
  Download,
  FileSpreadsheet,
  File,
  Users,
  Activity,
  Filter,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  FileDown,
  Database,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

// =============================================================================
// API
// =============================================================================

async function exportData(options: {
  type: string;
  format: string;
  filters: any;
  fields?: string[];
}): Promise<Blob> {
  const res = await fetch('/api/crm/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(options),
  });

  if (!res.ok) throw new Error('Failed to export');
  return res.blob();
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface ExportTypeCardProps {
  type: string;
  icon: any;
  title: string;
  description: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}

function ExportTypeCard({ type, icon: Icon, title, description, count, selected, onClick }: ExportTypeCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className={cn(
          'transition-all',
          selected ? 'border-indigo-500 bg-indigo-50/50' : 'hover:border-indigo-200'
        )}
        style={{
          borderRadius: RADIUS.card,
          boxShadow: selected ? SHADOW.level3 : SHADOW.level2
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 flex items-center justify-center',
              selected ? 'bg-indigo-600' : 'bg-gray-100'
            )} style={{ borderRadius: RADIUS.button }}>
              <Icon className={cn('w-6 h-6', selected ? 'text-white' : 'text-gray-600')} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {selected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </div>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
              {count !== undefined && (
                <Badge variant="secondary" className="mt-2">{count.toLocaleString()} records</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FormatButton({ format, icon: Icon, label, selected, onClick }: {
  format: string;
  icon: any;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      className={cn('flex-1', selected && 'bg-indigo-600 hover:bg-indigo-700')}
      onClick={onClick}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

// =============================================================================
// FIELD SELECTION
// =============================================================================

const CONTACT_FIELDS = [
  { id: 'firstName', label: 'First Name', default: true },
  { id: 'lastName', label: 'Last Name', default: true },
  { id: 'email', label: 'Email', default: true },
  { id: 'phone', label: 'Phone', default: true },
  { id: 'status', label: 'Status', default: true },
  { id: 'source', label: 'Lead Source', default: true },
  { id: 'streetAddress', label: 'Street Address', default: false },
  { id: 'city', label: 'City', default: false },
  { id: 'state', label: 'State', default: false },
  { id: 'zipCode', label: 'Zip Code', default: false },
  { id: 'estimatedValue', label: 'Estimated Value', default: true },
  { id: 'coverageType', label: 'Coverage Type', default: false },
  { id: 'leadScore', label: 'Lead Score', default: true },
  { id: 'assignedTo', label: 'Assigned Agent', default: false },
  { id: 'createdAt', label: 'Created Date', default: true },
  { id: 'lastContactedAt', label: 'Last Contact', default: true },
];

const ACTIVITY_FIELDS = [
  { id: 'type', label: 'Activity Type', default: true },
  { id: 'title', label: 'Title', default: true },
  { id: 'description', label: 'Description', default: true },
  { id: 'contactName', label: 'Contact Name', default: true },
  { id: 'performerName', label: 'Performed By', default: true },
  { id: 'createdAt', label: 'Date', default: true },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LobbyExport() {
  const [exportType, setExportType] = useState<'contacts' | 'activities'>('contacts');
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(CONTACT_FIELDS.filter(f => f.default).map(f => f.id))
  );
  const [filters, setFilters] = useState({
    type: 'both',
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const exportMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heritage-${exportType}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export downloaded successfully');
    },
    onError: () => {
      toast.error('Export failed. Please try again.');
    },
  });

  const handleExport = useCallback(() => {
    const cleanFilters: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'both') cleanFilters[key] = value;
    });
    exportMutation.mutate({
      type: exportType,
      format,
      filters: cleanFilters,
      fields: Array.from(selectedFields),
    });
  }, [exportType, format, filters, selectedFields, exportMutation]);

  const toggleField = (fieldId: string) => {
    const newFields = new Set(selectedFields);
    if (newFields.has(fieldId)) {
      newFields.delete(fieldId);
    } else {
      newFields.add(fieldId);
    }
    setSelectedFields(newFields);
  };

  const selectAllFields = () => {
    const fields = exportType === 'contacts' ? CONTACT_FIELDS : ACTIVITY_FIELDS;
    setSelectedFields(new Set(fields.map(f => f.id)));
  };

  const selectDefaultFields = () => {
    const fields = exportType === 'contacts' ? CONTACT_FIELDS : ACTIVITY_FIELDS;
    setSelectedFields(new Set(fields.filter(f => f.default).map(f => f.id)));
  };

  const currentFields = exportType === 'contacts' ? CONTACT_FIELDS : ACTIVITY_FIELDS;

  // Update selected fields when export type changes
  const handleTypeChange = (type: 'contacts' | 'activities') => {
    setExportType(type);
    const fields = type === 'contacts' ? CONTACT_FIELDS : ACTIVITY_FIELDS;
    setSelectedFields(new Set(fields.filter(f => f.default).map(f => f.id)));
  };

  return (
    <LobbyLayout>
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Card */}
        <motion.div
          variants={fadeInUp}
          data-tour-id={TOUR.CRM.LOBBY_EXPORT.HEADER}
          className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white p-8"
          style={{
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileDown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Export Data</h1>
              <p className="text-white/80 mt-1">
                Download your CRM data as CSV or Excel files
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Export Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Data Type */}
            <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.LOBBY_EXPORT.TYPE_SELECTOR}>
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Step 1: Select Data Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <ExportTypeCard
                      type="contacts"
                      icon={Users}
                      title="Contacts"
                      description="Leads and clients with contact info"
                      selected={exportType === 'contacts'}
                      onClick={() => handleTypeChange('contacts')}
                    />
                    <ExportTypeCard
                      type="activities"
                      icon={Activity}
                      title="Activities"
                      description="Communication and activity logs"
                      selected={exportType === 'activities'}
                      onClick={() => handleTypeChange('activities')}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Select Fields */}
            <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.LOBBY_EXPORT.FIELDS}>
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      Step 2: Select Fields
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={selectAllFields}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={selectDefaultFields}>
                        Reset
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Choose which fields to include in your export
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentFields.map((field) => (
                      <motion.div
                        key={field.id}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        onClick={() => toggleField(field.id)}
                        className={cn(
                          'flex items-center gap-2 p-3 border cursor-pointer transition-all',
                          selectedFields.has(field.id)
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        )}
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <Checkbox
                          checked={selectedFields.has(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                        <span className="text-sm">{field.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3: Filters (for contacts) */}
            {exportType === 'contacts' && (
              <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.LOBBY_EXPORT.FILTERS}>
                <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="w-4 h-4 text-indigo-600" />
                      Step 3: Apply Filters (Optional)
                    </CardTitle>
                    <CardDescription>
                      Filter which records to include in your export
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Contact Type</Label>
                        <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="both">All Types</SelectItem>
                            <SelectItem value="lead">Leads Only</SelectItem>
                            <SelectItem value="client">Clients Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Status</Label>
                        <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">From Date</Label>
                        <Input
                          type="date"
                          className="mt-1"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">To Date</Label>
                        <Input
                          type="date"
                          className="mt-1"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <motion.div className="space-y-6" variants={staggerContainer}>
            {/* Format Selection */}
            <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.LOBBY_EXPORT.FORMAT}>
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader>
                  <CardTitle className="text-base">File Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <FormatButton
                      format="csv"
                      icon={File}
                      label="CSV"
                      selected={format === 'csv'}
                      onClick={() => setFormat('csv')}
                    />
                    <FormatButton
                      format="xlsx"
                      icon={FileSpreadsheet}
                      label="Excel"
                      selected={format === 'xlsx'}
                      onClick={() => setFormat('xlsx')}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {format === 'csv'
                      ? 'Comma-separated values, works with any spreadsheet'
                      : 'Native Excel format with formatting support'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Export Summary */}
            <motion.div variants={fadeInUp}>
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader>
                  <CardTitle className="text-base">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Data Type</span>
                    <Badge variant="outline" className="capitalize">{exportType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Fields</span>
                    <span className="font-medium">{selectedFields.size} selected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Format</span>
                    <span className="font-medium uppercase">{format}</span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleExport}
                    disabled={exportMutation.isPending || selectedFields.size === 0}
                  >
                    {exportMutation.isPending ? (
                      <>
                        <Download className="w-4 h-4 mr-2 animate-bounce" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4 mr-2" />
                        Download Export
                      </>
                    )}
                  </Button>

                  {selectedFields.size === 0 && (
                    <p className="text-xs text-amber-600 text-center">
                      Select at least one field to export
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Export Tips */}
            <motion.div variants={fadeInUp}>
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Export Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Use filters to export only the data you need
                  </p>
                  <p className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    CSV is best for importing into other systems
                  </p>
                  <p className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Excel format preserves special characters better
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </LobbyLayout>
  );
}

export default LobbyExport;
