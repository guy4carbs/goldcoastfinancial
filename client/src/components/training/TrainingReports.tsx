/**
 * Training Reports - Phase 5.5
 *
 * Reporting and export features:
 * - ExportTrainingRecords: Export to PDF/CSV
 * - CertificateGenerator: Printable certificates
 * - TrainingTranscript: Full training history
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Award,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Shield,
  FileDown,
  File,
  Table,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  category: string;
  completedAt: Date;
  duration: number; // minutes
  assessmentScore?: number;
  assessmentPassed?: boolean;
  certificationLevel: string;
}

export interface CertificateData {
  id: string;
  name: string;
  recipientName: string;
  certificationName: string;
  certificationLevel: string;
  earnedDate: Date;
  expiryDate?: Date;
  modules: string[];
  issuerName: string;
  certificateNumber: string;
}

// ============================================================================
// EXPORT TRAINING RECORDS
// ============================================================================

interface ExportTrainingRecordsProps {
  records: TrainingRecord[];
  agentName: string;
  onExport: (format: 'pdf' | 'csv', options: ExportOptions) => Promise<void>;
  className?: string;
}

interface ExportOptions {
  includeAssessments: boolean;
  includeTimestamps: boolean;
  includeDurations: boolean;
  dateRange: 'all' | '30days' | '90days' | '1year';
  groupBy: 'date' | 'category' | 'certification';
}

export function ExportTrainingRecords({
  records,
  agentName,
  onExport,
  className
}: ExportTrainingRecordsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includeAssessments: true,
    includeTimestamps: true,
    includeDurations: true,
    dateRange: 'all',
    groupBy: 'certification'
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format, options);
      setIsOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = records.filter(r => {
    if (options.dateRange === 'all') return true;
    const now = new Date();
    const daysAgo = options.dateRange === '30days' ? 30 : options.dateRange === '90days' ? 90 : 365;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return r.completedAt >= cutoff;
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Export Records
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-violet-500" />
            Export Training Records
          </DialogTitle>
          <DialogDescription>
            Download your training history for compliance records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Export Format</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                  format === 'pdf' ? "border-violet-500 bg-violet-500/5" : "border-gray-200"
                )}
                onClick={() => setFormat('pdf')}
              >
                <File className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="font-medium text-sm">PDF</p>
                  <p className="text-xs text-gray-500">Formatted report</p>
                </div>
              </button>
              <button
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                  format === 'csv' ? "border-violet-500 bg-violet-500/5" : "border-gray-200"
                )}
                onClick={() => setFormat('csv')}
              >
                <Table className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-sm">CSV</p>
                  <p className="text-xs text-gray-500">Spreadsheet data</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Date Range</Label>
            <Select
              value={options.dateRange}
              onValueChange={(val) => setOptions({ ...options, dateRange: val as ExportOptions['dateRange'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time ({records.length} records)</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group by (PDF only) */}
          {format === 'pdf' && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Group By</Label>
              <Select
                value={options.groupBy}
                onValueChange={(val) => setOptions({ ...options, groupBy: val as ExportOptions['groupBy'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certification">Certification Level</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="date">Completion Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Include options */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Include</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="assessments"
                  checked={options.includeAssessments}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeAssessments: !!checked })
                  }
                />
                <Label htmlFor="assessments" className="text-sm">Assessment scores</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="timestamps"
                  checked={options.includeTimestamps}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeTimestamps: !!checked })
                  }
                />
                <Label htmlFor="timestamps" className="text-sm">Completion timestamps</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="durations"
                  checked={options.includeDurations}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeDurations: !!checked })
                  }
                />
                <Label htmlFor="durations" className="text-sm">Time spent</Label>
              </div>
            </div>
          </div>

          {/* Preview count */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{filteredCount}</span> records will be exported
            </p>
          </div>

          {/* Export button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredCount === 0}
            className="w-full bg-primary"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CERTIFICATE GENERATOR / VIEWER
// ============================================================================

interface CertificateGeneratorProps {
  certificate: CertificateData;
  onPrint?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function CertificateGenerator({
  certificate,
  onPrint,
  onDownload,
  className
}: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" />
            Certificate
          </CardTitle>
          <div className="flex gap-2">
            {onPrint && (
              <Button size="sm" variant="outline" onClick={onPrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            )}
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Certificate Preview */}
        <div
          ref={certificateRef}
          className="relative bg-gradient-to-br from-primary via-primary to-indigo-900 rounded-lg p-8 text-white overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-violet-500/30 rounded-tl-lg" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-violet-500/30 rounded-br-lg" />
          <div className="absolute top-4 right-4">
            <Shield className="w-16 h-16 text-violet-500/20" />
          </div>

          {/* Content */}
          <div className="relative text-center space-y-4">
            {/* Header */}
            <div>
              <p className="text-violet-500 text-sm font-medium tracking-widest uppercase">
                Gold Coast Financial
              </p>
              <h2 className="text-3xl font-serif mt-2">Certificate of Completion</h2>
            </div>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="h-px w-16 bg-violet-500/50" />
              <Award className="w-6 h-6 text-violet-500" />
              <div className="h-px w-16 bg-violet-500/50" />
            </div>

            {/* Recipient */}
            <div className="py-4">
              <p className="text-white/70 text-sm">This certifies that</p>
              <p className="text-2xl font-serif font-semibold mt-1">
                {certificate.recipientName}
              </p>
            </div>

            {/* Achievement */}
            <div className="py-2">
              <p className="text-white/70 text-sm">has successfully completed</p>
              <p className="text-xl font-semibold text-violet-500 mt-1">
                {certificate.certificationName}
              </p>
              <Badge className="mt-2 bg-white/20 text-white">
                {certificate.certificationLevel}
              </Badge>
            </div>

            {/* Date & Certificate Number */}
            <div className="pt-6 flex justify-between text-sm">
              <div className="text-left">
                <p className="text-white/50">Date Issued</p>
                <p className="font-medium">{formatDate(certificate.earnedDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50">Certificate No.</p>
                <p className="font-mono text-xs">{certificate.certificateNumber}</p>
              </div>
            </div>

            {/* Issuer signature */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/70 text-sm">{certificate.issuerName}</p>
              <p className="text-white/50 text-xs">Training Director</p>
            </div>
          </div>
        </div>

        {/* Certificate details */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Completed Modules:</h4>
          <div className="flex flex-wrap gap-1">
            {certificate.modules.map((mod, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {mod}
              </Badge>
            ))}
          </div>
          {certificate.expiryDate && (
            <p className="text-xs text-gray-500 mt-3">
              Valid until: {formatDate(certificate.expiryDate)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TRAINING TRANSCRIPT
// ============================================================================

interface TrainingTranscriptProps {
  records: TrainingRecord[];
  agentName: string;
  agentId: string;
  className?: string;
}

export function TrainingTranscript({
  records,
  agentName,
  agentId,
  className
}: TrainingTranscriptProps) {
  const sortedRecords = [...records].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  const totalTime = records.reduce((acc, r) => acc + r.duration, 0);
  const avgScore = records.filter(r => r.assessmentScore !== undefined).length > 0
    ? Math.round(
        records
          .filter(r => r.assessmentScore !== undefined)
          .reduce((acc, r) => acc + (r.assessmentScore || 0), 0) /
        records.filter(r => r.assessmentScore !== undefined).length
      )
    : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  // Group by certification level
  const groupedRecords = sortedRecords.reduce((acc, record) => {
    const level = record.certificationLevel;
    if (!acc[level]) acc[level] = [];
    acc[level].push(record);
    return acc;
  }, {} as Record<string, TrainingRecord[]>);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              Training Transcript
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{agentName} • ID: {agentId}</p>
          </div>
          <Badge variant="outline">
            {records.length} modules completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-700">{formatDuration(totalTime)}</p>
            <p className="text-xs text-blue-600">Total Time</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <BookOpen className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-700">{records.length}</p>
            <p className="text-xs text-green-600">Modules</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-700">
              {avgScore !== null ? `${avgScore}%` : 'N/A'}
            </p>
            <p className="text-xs text-purple-600">Avg Score</p>
          </div>
        </div>

        {/* Records by certification level */}
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([level, levelRecords]) => (
            <div key={level}>
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                <Badge variant="outline" className="text-xs ml-auto">
                  {levelRecords.length} modules
                </Badge>
              </h4>
              <div className="space-y-2">
                {levelRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">
                          {record.moduleCode}
                        </span>
                        <span className="font-medium text-sm truncate">
                          {record.moduleTitle}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(record.completedAt)} • {formatDuration(record.duration)}
                      </p>
                    </div>
                    {record.assessmentScore !== undefined && (
                      <Badge className={cn(
                        record.assessmentPassed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}>
                        {record.assessmentScore}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-400">
            Generated on {new Date().toLocaleDateString()} • Gold Coast Financial Training System
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUICK EXPORT BUTTON
// ============================================================================

interface QuickExportButtonProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
  className?: string;
}

export function QuickExportButton({
  onExportPDF,
  onExportCSV,
  className
}: QuickExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="w-4 h-4 mr-1" />
        Export
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-50 py-1 min-w-[120px]">
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                onExportPDF();
                setIsOpen(false);
              }}
            >
              <File className="w-4 h-4 text-red-500" />
              PDF
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                onExportCSV();
                setIsOpen(false);
              }}
            >
              <Table className="w-4 h-4 text-green-500" />
              CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
