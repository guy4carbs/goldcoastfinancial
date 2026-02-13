/**
 * Lobby Import
 * Import contacts and data from CSV/Excel files
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LobbyLayout } from './LobbyLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  Trash2,
  History,
  FileUp,
  Database,
} from 'lucide-react';
import { motion } from 'framer-motion';

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

// =============================================================================
// COMPONENTS
// =============================================================================

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

function FileUploadZone({ onFileSelect, isUploading }: { onFileSelect: (file: File) => void; isUploading: boolean }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center transition-all',
        isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300',
        isUploading && 'opacity-50 pointer-events-none'
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
        <FileUp className="w-8 h-8 text-indigo-600" />
      </div>
      <p className="text-lg font-semibold text-gray-900 mb-2">
        {isUploading ? 'Uploading...' : 'Drop your file here'}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Supports CSV and Excel files up to 10MB
      </p>
      <label className="cursor-pointer">
        <Button variant="outline" disabled={isUploading} asChild>
          <span>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
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

function ColumnMapper({
  headers,
  sampleRows,
  mapping,
  onMappingChange,
}: {
  headers: string[];
  sampleRows: any[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}) {
  const handleChange = (header: string, value: string) => {
    const newMapping = { ...mapping };
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === value && key !== header) delete newMapping[key];
    });
    if (value && value !== 'skip') {
      newMapping[header] = value;
    } else {
      delete newMapping[header];
    }
    onMappingChange(newMapping);
  };

  const getSampleValues = (header: string) => {
    return sampleRows.slice(0, 2).map(row => row[header]).filter(Boolean).join(', ') || '(empty)';
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-sm mb-4">Map your columns to CRM fields</h4>
        <div className="space-y-3">
          {headers.map(header => (
            <div key={header} className="flex items-center gap-4">
              <div className="w-1/3">
                <p className="font-medium text-sm truncate">{header}</p>
                <p className="text-xs text-gray-500 truncate">{getSampleValues(header)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Select
                value={mapping[header] || ''}
                onValueChange={(value) => handleChange(header, value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {CRM_FIELDS.map(field => (
                    <SelectItem key={field.value || 'skip'} value={field.value || 'skip'}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mapping[header] && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h4 className="font-medium text-sm">Preview (first 3 rows)</h4>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header} className="whitespace-nowrap">
                    <div>
                      <p className="text-xs">{header}</p>
                      {mapping[header] && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {CRM_FIELDS.find(f => f.value === mapping[header])?.label}
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRows.slice(0, 3).map((row, i) => (
                <TableRow key={i}>
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

function DuplicatePreview({
  duplicates,
  totalDuplicates,
}: {
  duplicates: Array<{ id: string; firstName: string; lastName: string; email: string; status: string }>;
  totalDuplicates: number;
}) {
  if (totalDuplicates === 0) {
    return (
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <AlertTitle className="text-emerald-800">No duplicates detected</AlertTitle>
        <AlertDescription className="text-emerald-700">
          All records appear to be new contacts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="w-4 h-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        {totalDuplicates} potential duplicate{totalDuplicates > 1 ? 's' : ''} found
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
          {duplicates.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{d.firstName} {d.lastName}</span>
              <span className="text-gray-500">({d.email})</span>
              <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
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

function ImportHistory({ history, isLoading }: { history: ImportHistoryItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
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
    <div className="space-y-3">
      {history.map(item => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{item.fileName || 'Import'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()} by {item.userName}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-emerald-600">{item.importedRows}</p>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LobbyImport() {
  const queryClient = useQueryClient();

  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importSource, setImportSource] = useState('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: fetchImportHistory,
  });

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

  const importMutation = useMutation({
    mutationFn: executeImport,
    onSuccess: (data) => {
      setImportResult(data);
      if (data.results.imported > 0) {
        toast.success(`Successfully imported ${data.results.imported} contacts`);
        queryClient.invalidateQueries({ queryKey: ['lobby-directory'] });
        refetchHistory();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
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

  const hasRequiredMappings = useMemo(() => {
    const mappedFields = Object.values(columnMapping);
    return mappedFields.includes('firstName') || mappedFields.includes('lastName') || mappedFields.includes('email');
  }, [columnMapping]);

  return (
    <LobbyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
          <p className="text-gray-500 mt-1">
            Bulk import contacts from CSV or Excel files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Import Area */}
          <div className="lg:col-span-2 space-y-6">
            {!uploadData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    Upload File
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV or Excel file to import contacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    onFileSelect={handleFileSelect}
                    isUploading={uploadMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : importResult ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {importResult.results.errors === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    Import Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{importResult.results.total}</p>
                      <p className="text-sm text-gray-500">Total Rows</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">{importResult.results.imported}</p>
                      <p className="text-sm text-gray-500">Imported</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-600">{importResult.results.skipped}</p>
                      <p className="text-sm text-gray-500">Skipped</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">{importResult.results.errors}</p>
                      <p className="text-sm text-gray-500">Errors</p>
                    </div>
                  </div>

                  {importResult.results.errorDetails.length > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertTitle>Import Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1 text-sm max-h-32 overflow-y-auto">
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

                  <Button onClick={handleReset} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Another File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                        {uploadData.fileName}
                      </CardTitle>
                      <CardDescription>
                        {uploadData.rowCount} rows found
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ColumnMapper
                      headers={uploadData.headers}
                      sampleRows={uploadData.sampleRows}
                      mapping={columnMapping}
                      onMappingChange={setColumnMapping}
                    />
                  </CardContent>
                </Card>

                <DuplicatePreview
                  duplicates={uploadData.duplicates}
                  totalDuplicates={uploadData.duplicateCount}
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {uploadData && !importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Import Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipDuplicates"
                      checked={skipDuplicates}
                      onCheckedChange={(c) => setSkipDuplicates(c as boolean)}
                    />
                    <Label htmlFor="skipDuplicates" className="text-sm">
                      Skip duplicate emails
                    </Label>
                  </div>

                  <div>
                    <Label className="text-sm">Lead Source</Label>
                    <Select value={importSource} onValueChange={setImportSource}>
                      <SelectTrigger className="mt-1">
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

                  <Separator />

                  <div className="text-sm">
                    <p className="font-medium mb-2">Mapped Fields:</p>
                    <ul className="space-y-1 text-gray-600">
                      {Object.entries(columnMapping).map(([header, field]) => (
                        <li key={header} className="flex justify-between">
                          <span className="truncate">{header}</span>
                          <span className="text-indigo-600 ml-2">{field}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleImport}
                    disabled={!hasRequiredMappings || importMutation.isPending}
                  >
                    {importMutation.isPending ? (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Import {uploadData.rowCount} Contacts
                      </>
                    )}
                  </Button>

                  {!hasRequiredMappings && (
                    <p className="text-xs text-amber-600 text-center">
                      Map at least first name, last name, or email
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Import History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Recent Imports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportHistory
                  history={historyData?.history.slice(0, 5) || []}
                  isLoading={historyLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LobbyLayout>
  );
}

export default LobbyImport;
