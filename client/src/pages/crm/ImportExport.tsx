/**
 * Import/Export Center
 * CSV/Excel import with column mapping and export with filters
 *
 * Heritage Design System: CRM Lounge (INDIGO theme)
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';
import { TOUR } from '@/lib/tour/selectors';
import {
  Upload,
  Download,
  FileSpreadsheet,
  File,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  Trash2,
  History,
  Users,
  Activity,
  Filter,
  Calendar,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface UploadResponse {
  sessionId: string;
  fileName: string;
  fileSize: number;
  headers: string[];
  rowCount: number;
  sampleRows: any[];
  duplicateCount: number;
  duplicates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
  }>;
  suggestedMappings: Record<string, string>;
}

interface ImportResult {
  success: boolean;
  results: {
    total: number;
    imported: number;
    skipped: number;
    errors: number;
    errorDetails: string[];
  };
}

interface ImportHistoryItem {
  id: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errorRows: number;
  source: string;
  userName: string;
  createdAt: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/crm/import/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return res.json();
}

async function executeImport(data: {
  sessionId: string;
  columnMapping: Record<string, string>;
  skipDuplicates: boolean;
  source: string;
}): Promise<ImportResult> {
  const res = await fetch('/api/crm/import/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to execute import');
  }

  return res.json();
}

async function fetchImportHistory(): Promise<{ history: ImportHistoryItem[] }> {
  const res = await fetch('/api/crm/import/history', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

async function exportData(options: {
  type: string;
  format: string;
  filters: any;
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
// FILE UPLOAD ZONE COMPONENT
// =============================================================================

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

function FileUploadZone({ onFileSelect, isUploading }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      variants={scaleIn}
      className={cn(
        'border-2 border-dashed p-8 text-center transition-all duration-200',
        isDragOver
          ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50',
        isUploading && 'opacity-50 pointer-events-none'
      )}
      style={{ borderRadius: RADIUS.card }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className={cn(
        'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors',
        isDragOver ? 'bg-indigo-100' : 'bg-gray-100'
      )}>
        <Upload className={cn(
          'w-8 h-8 transition-colors',
          isDragOver ? 'text-indigo-600' : 'text-gray-400'
        )} />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">
        {isUploading ? 'Uploading...' : 'Drop your file here'}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Supports CSV and Excel files up to 10MB
      </p>
      <label className="cursor-pointer">
        <Button
          variant="outline"
          disabled={isUploading}
          asChild
          className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <span>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
            Browse Files
          </span>
        </Button>
        <input
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          disabled={isUploading}
        />
      </label>
    </motion.div>
  );
}

// =============================================================================
// COLUMN MAPPER COMPONENT
// =============================================================================

interface ColumnMapperProps {
  headers: string[];
  sampleRows: any[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

const CRM_FIELDS = [
  { value: '', label: 'Skip this column' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'streetAddress', label: 'Street Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zipCode', label: 'Zip Code' },
  { value: 'source', label: 'Lead Source' },
  { value: 'coverageType', label: 'Coverage Type' },
  { value: 'estimatedValue', label: 'Estimated Value' },
  { value: 'notes', label: 'Notes' },
];

function ColumnMapper({ headers, sampleRows, mapping, onMappingChange }: ColumnMapperProps) {
  const handleChange = (header: string, value: string) => {
    const newMapping = { ...mapping };
    // Remove previous mapping for this value
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === value && key !== header) {
        delete newMapping[key];
      }
    });
    if (value) {
      newMapping[header] = value;
    } else {
      delete newMapping[header];
    }
    onMappingChange(newMapping);
  };

  // Get sample values for a header
  const getSampleValues = (header: string) => {
    return sampleRows
      .slice(0, 3)
      .map(row => row[header])
      .filter(Boolean)
      .join(', ') || '(empty)';
  };

  return (
    <div className="space-y-4">
      <div
        className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 border border-indigo-100"
        style={{ borderRadius: RADIUS.button }}
      >
        <h4 className="font-medium text-sm mb-3 text-indigo-900">Map your columns to CRM fields</h4>
        <div className="space-y-3">
          {headers.map(header => (
            <div key={header} className="flex items-center gap-4">
              <div className="w-1/3">
                <p className="font-medium text-sm truncate text-gray-900">{header}</p>
                <p className="text-xs text-gray-500 truncate">{getSampleValues(header)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <Select
                value={mapping[header] || ''}
                onValueChange={(value) => handleChange(header, value)}
              >
                <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {CRM_FIELDS.map(field => (
                    <SelectItem key={field.value} value={field.value || 'skip'}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mapping[header] && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      <div
        className="border border-gray-200 overflow-hidden"
        style={{ borderRadius: RADIUS.button }}
      >
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 border-b border-indigo-100">
          <h4 className="font-medium text-sm text-indigo-900">Preview (first 3 rows)</h4>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {headers.map(header => (
                  <TableHead key={header} className="whitespace-nowrap">
                    <div>
                      <p className="text-xs text-gray-700">{header}</p>
                      {mapping[header] && (
                        <Badge variant="outline" className="text-[10px] mt-1 border-indigo-200 text-indigo-700 bg-indigo-50">
                          → {CRM_FIELDS.find(f => f.value === mapping[header])?.label}
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRows.slice(0, 3).map((row, i) => (
                <TableRow key={i} className="hover:bg-indigo-50/50">
                  {headers.map(header => (
                    <TableCell key={header} className="text-sm whitespace-nowrap">
                      {row[header] || <span className="text-gray-300">-</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DUPLICATE PREVIEW COMPONENT
// =============================================================================

interface DuplicatePreviewProps {
  duplicates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
  }>;
  totalDuplicates: number;
}

function DuplicatePreview({ duplicates, totalDuplicates }: DuplicatePreviewProps) {
  if (totalDuplicates === 0) {
    return (
      <Alert
        className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        style={{ borderRadius: RADIUS.button }}
      >
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <AlertTitle className="text-green-800">No duplicates detected</AlertTitle>
        <AlertDescription className="text-green-700">
          All records appear to be new contacts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
      style={{ borderRadius: RADIUS.button }}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        {totalDuplicates} potential duplicate{totalDuplicates > 1 ? 's' : ''} found
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">These emails already exist in your CRM:</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {duplicates.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{d.firstName} {d.lastName}</span>
              <span className="text-gray-500">({d.email})</span>
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50">{d.status}</Badge>
            </div>
          ))}
          {totalDuplicates > duplicates.length && (
            <p className="text-xs text-gray-500">and {totalDuplicates - duplicates.length} more...</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// =============================================================================
// IMPORT HISTORY COMPONENT
// =============================================================================

interface ImportHistoryProps {
  history: ImportHistoryItem[];
  isLoading: boolean;
}

function ImportHistory({ history, isLoading }: ImportHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No import history yet</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {history.map(item => (
        <motion.div
          key={item.id}
          variants={fadeInUp}
          className="flex items-center justify-between p-4 border border-gray-200 bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          style={{ borderRadius: RADIUS.card }}
        >
          <div>
            <p className="font-medium text-sm">{item.fileName || 'Import'}</p>
            <p className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()} by {item.userName}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-green-600">{item.importedRows}</p>
              <p className="text-xs text-gray-500">Imported</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-amber-600">{item.skippedRows}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">{item.errorRows}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// EXPORT BUILDER COMPONENT
// =============================================================================

interface ExportBuilderProps {
  onExport: (options: { type: string; format: string; filters: any }) => void;
  isExporting: boolean;
}

function ExportBuilder({ onExport, isExporting }: ExportBuilderProps) {
  const [exportType, setExportType] = useState('leads');
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    pipelineStage: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleExport = () => {
    const cleanFilters: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') cleanFilters[key] = value;
    });
    onExport({ type: exportType, format, filters: cleanFilters });
  };

  return (
    <div className="space-y-6">
      {/* Export Type */}
      <div>
        <Label className="text-sm font-medium text-gray-700">What do you want to export?</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button
            variant={exportType === 'leads' ? 'default' : 'outline'}
            className={cn(
              "h-auto py-4 transition-all duration-200",
              exportType === 'leads'
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            )}
            style={{ borderRadius: RADIUS.button }}
            onClick={() => setExportType('leads')}
          >
            <Users className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-medium">Leads</p>
              <p className="text-xs opacity-70">Contact information</p>
            </div>
          </Button>
          <Button
            variant={exportType === 'activities' ? 'default' : 'outline'}
            className={cn(
              "h-auto py-4 transition-all duration-200",
              exportType === 'activities'
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            )}
            style={{ borderRadius: RADIUS.button }}
            onClick={() => setExportType('activities')}
          >
            <Activity className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-medium">Activities</p>
              <p className="text-xs opacity-70">Communication logs</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Format */}
      <div>
        <Label className="text-sm font-medium text-gray-700">File Format</Label>
        <div className="flex gap-3 mt-2">
          <Button
            variant={format === 'csv' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "transition-all duration-200",
              format === 'csv'
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            )}
            style={{ borderRadius: RADIUS.button }}
            onClick={() => setFormat('csv')}
          >
            <File className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button
            variant={format === 'xlsx' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "transition-all duration-200",
              format === 'xlsx'
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            )}
            style={{ borderRadius: RADIUS.button }}
            onClick={() => setFormat('xlsx')}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      {exportType === 'leads' && (
        <div>
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filters (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                <SelectValue placeholder="Status" />
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
            <Select value={filters.source} onValueChange={(v) => setFilters({ ...filters, source: v })}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="quote_form">Quote Form</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label className="text-xs text-gray-500">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <Button
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
        onClick={handleExport}
        disabled={isExporting}
        style={{ borderRadius: RADIUS.button }}
      >
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : `Export ${exportType === 'leads' ? 'Leads' : 'Activities'}`}
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ImportExport() {
  const queryClient = useQueryClient();

  // Import state
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importSource, setImportSource] = useState('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Fetch import history
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: fetchImportHistory,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setUploadData(data);
      setColumnMapping(data.suggestedMappings || {});
      setImportResult(null);
      toast.success(`File parsed: ${data.rowCount} rows found`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: executeImport,
    onSuccess: (data) => {
      setImportResult(data);
      if (data.results.imported > 0) {
        toast.success(`Successfully imported ${data.results.imported} leads`);
        queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
        queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
        refetchHistory();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (blob, variables) => {
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-export-${Date.now()}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    },
    onError: () => {
      toast.error('Export failed');
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleImport = useCallback(() => {
    if (!uploadData) return;
    importMutation.mutate({
      sessionId: uploadData.sessionId,
      columnMapping,
      skipDuplicates,
      source: importSource,
    });
  }, [uploadData, columnMapping, skipDuplicates, importSource, importMutation]);

  const handleReset = useCallback(() => {
    setUploadData(null);
    setColumnMapping({});
    setImportResult(null);
  }, []);

  const handleExport = useCallback((options: { type: string; format: string; filters: any }) => {
    exportMutation.mutate(options);
  }, [exportMutation]);

  // Check if required fields are mapped
  const hasRequiredMappings = useMemo(() => {
    const mappedFields = Object.values(columnMapping);
    return mappedFields.includes('firstName') || mappedFields.includes('lastName') || mappedFields.includes('email');
  }, [columnMapping]);

  return (
    <CRMLoungeLayout
      breadcrumbs={[
        { label: 'CRM', href: '/crm/dashboard' },
        { label: 'Import/Export' },
      ]}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.IMPORT_EXPORT.HEADER}>
          <Card className="border-0 overflow-hidden mb-6" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 lg:p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Import/Export Center</h1>
                <p className="text-indigo-100 text-lg">Bulk import leads from CSV/Excel or export your data</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-indigo-50 p-1" style={{ borderRadius: RADIUS.button }}>
              <TabsTrigger
                value="import"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 4 }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 4 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 4 }}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-6" data-tour-id={TOUR.CRM.IMPORT_EXPORT.IMPORT_TAB}>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Import Area */}
              <div className="lg:col-span-2 space-y-6">
                {!uploadData ? (
                  <motion.div variants={fadeInUp}>
                    <Card
                      className="border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
                      style={{ borderRadius: RADIUS.card }}
                    >
                      <CardHeader>
                        <CardTitle className="text-gray-900">Upload File</CardTitle>
                        <CardDescription>
                          Upload a CSV or Excel file to import leads
                        </CardDescription>
                      </CardHeader>
                      <CardContent data-tour-id={TOUR.CRM.IMPORT_EXPORT.UPLOAD}>
                        <FileUploadZone
                          onFileSelect={handleFileSelect}
                          isUploading={uploadMutation.isPending}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : importResult ? (
                  <motion.div variants={fadeInUp}>
                    <Card
                      className="border-0 overflow-hidden"
                      style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                          {importResult.results.errors === 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          )}
                          Import Complete
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-4 gap-4 mb-6"
                        >
                          <motion.div
                            variants={scaleIn}
                            className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <p className="text-2xl font-bold text-gray-900">{importResult.results.total}</p>
                            <p className="text-sm text-gray-500">Total Rows</p>
                          </motion.div>
                          <motion.div
                            variants={scaleIn}
                            className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <p className="text-2xl font-bold text-green-600">{importResult.results.imported}</p>
                            <p className="text-sm text-gray-500">Imported</p>
                          </motion.div>
                          <motion.div
                            variants={scaleIn}
                            className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <p className="text-2xl font-bold text-amber-600">{importResult.results.skipped}</p>
                            <p className="text-sm text-gray-500">Skipped</p>
                          </motion.div>
                          <motion.div
                            variants={scaleIn}
                            className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-100 border border-red-200"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <p className="text-2xl font-bold text-red-600">{importResult.results.errors}</p>
                            <p className="text-sm text-gray-500">Errors</p>
                          </motion.div>
                        </motion.div>

                        {importResult.results.errorDetails.length > 0 && (
                          <Alert className="mb-4 border-red-200 bg-red-50">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <AlertTitle className="text-red-800">Import Errors</AlertTitle>
                            <AlertDescription>
                              <ul className="mt-2 space-y-1 text-sm max-h-32 overflow-y-auto text-red-700">
                                {importResult.results.errorDetails.slice(0, 10).map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                                {importResult.results.errorDetails.length > 10 && (
                                  <li>...and {importResult.results.errorDetails.length - 10} more</li>
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={handleReset}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Import Another File
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <>
                    <motion.div variants={fadeInUp}>
                      <Card
                        className="border border-gray-200"
                        style={{ borderRadius: RADIUS.card }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-indigo-900">
                              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                              {uploadData.fileName}
                            </CardTitle>
                            <CardDescription className="text-indigo-600">
                              {uploadData.rowCount} rows - {(uploadData.fileSize / 1024).toFixed(1)}KB
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </CardHeader>
                        <CardContent className="pt-6" data-tour-id={TOUR.CRM.IMPORT_EXPORT.MAPPER}>
                          <ColumnMapper
                            headers={uploadData.headers}
                            sampleRows={uploadData.sampleRows}
                            mapping={columnMapping}
                            onMappingChange={setColumnMapping}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <DuplicatePreview
                        duplicates={uploadData.duplicates}
                        totalDuplicates={uploadData.duplicateCount}
                      />
                    </motion.div>
                  </>
                )}
              </div>

              {/* Import Options Sidebar */}
              {uploadData && !importResult && (
                <motion.div variants={fadeInUp} className="space-y-6">
                  <Card
                    className="border border-gray-200 sticky top-6"
                    style={{ borderRadius: RADIUS.card }}
                  >
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                      <CardTitle className="text-base text-indigo-900">Import Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="skipDuplicates"
                          checked={skipDuplicates}
                          onCheckedChange={(c) => setSkipDuplicates(c as boolean)}
                          className="border-indigo-300 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="skipDuplicates" className="text-sm">
                          Skip duplicate emails
                        </Label>
                      </div>

                      <div>
                        <Label className="text-sm">Lead Source</Label>
                        <Select value={importSource} onValueChange={setImportSource}>
                          <SelectTrigger className="mt-1 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="import">CSV Import</SelectItem>
                            <SelectItem value="purchased_list">Purchased List</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-indigo-100" />

                      <div className="text-sm">
                        <p className="font-medium mb-2 text-indigo-900">Mapped Fields:</p>
                        <ul className="space-y-1 text-gray-600">
                          {Object.entries(columnMapping).map(([header, field]) => (
                            <li key={header} className="flex justify-between">
                              <span className="truncate">{header}</span>
                              <span className="text-indigo-600 ml-2 font-medium">→ {field}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                        onClick={handleImport}
                        disabled={!hasRequiredMappings || importMutation.isPending}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        {importMutation.isPending ? (
                          <>
                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Import {uploadData.rowCount} Leads
                          </>
                        )}
                      </Button>

                      {!hasRequiredMappings && (
                        <p className="text-xs text-amber-600 text-center">
                          Map at least first name, last name, or email to continue
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6" data-tour-id={TOUR.CRM.IMPORT_EXPORT.EXPORT_TAB}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="max-w-xl"
            >
              <Card
                className="border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
                style={{ borderRadius: RADIUS.card }}
              >
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                  <CardTitle className="text-indigo-900">Export Data</CardTitle>
                  <CardDescription>
                    Download your CRM data as CSV or Excel
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6" data-tour-id={TOUR.CRM.IMPORT_EXPORT.FIELD_SELECT}>
                  <ExportBuilder
                    onExport={handleExport}
                    isExporting={exportMutation.isPending}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card
                className="border border-gray-200"
                style={{ borderRadius: RADIUS.card }}
              >
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                  <CardTitle className="text-indigo-900">Import History</CardTitle>
                  <CardDescription>
                    Previous import operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ImportHistory
                    history={historyData?.history || []}
                    isLoading={historyLoading}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </CRMLoungeLayout>
  );
}

export default ImportExport;
