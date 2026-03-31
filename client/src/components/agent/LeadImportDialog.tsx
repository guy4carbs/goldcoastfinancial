import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload, FileSpreadsheet, Link2, Loader2, CheckCircle2, AlertCircle,
  ArrowRight, X, MapPin,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RADIUS } from "@/lib/heritageDesignSystem";
import { toast } from "sonner";

const LEAD_FIELDS = [
  { value: "", label: "— Skip —" },
  { value: "fullName", label: "Full Name" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "birthDate", label: "Date of Birth" },
  { value: "fullAddress", label: "Full Address" },
  { value: "streetAddress", label: "Street Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zipCode", label: "Zip Code" },
  { value: "source", label: "Lead Source" },
  { value: "coverageType", label: "Coverage Type" },
  { value: "estimatedValue", label: "Estimated Value" },
  { value: "notes", label: "Notes" },
];

interface LeadImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "mapping" | "result";

export function LeadImportDialog({ open, onOpenChange }: LeadImportDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [sheetUrl, setSheetUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Session data from upload/parse step
  const [session, setSession] = useState<any>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Import results
  const [results, setResults] = useState<any>(null);

  const resetDialog = () => {
    setStep("upload");
    setSheetUrl("");
    setSession(null);
    setColumnMapping({});
    setResults(null);
    setUploading(false);
  };

  // Upload CSV/Excel file
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/crm/import/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setSession(data);
      setColumnMapping(data.suggestedMappings || {});
      setStep("mapping");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Import from Google Sheets URL
  const handleGoogleSheet = async () => {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      toast.error("Please enter a valid Google Sheets URL");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/crm/import/google-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetUrl }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to import sheet");
      }
      const data = await res.json();
      setSession(data);
      setColumnMapping(data.suggestedMappings || {});
      setStep("mapping");
    } catch (err: any) {
      toast.error(err.message || "Failed to import from Google Sheets");
    } finally {
      setUploading(false);
    }
  };

  // Execute the import
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          columnMapping,
          skipDuplicates: true,
          source: "import",
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Import failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data.results || data);
      setStep("result");
      queryClient.invalidateQueries();
      toast.success(`${data.results?.imported || 0} leads imported!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Import failed");
    },
  });

  const mappedFieldCount = Object.values(columnMapping).filter((v) => v).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetDialog();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileSpreadsheet className="w-5 h-5 text-violet-600" />
            Import Leads
            {step !== "upload" && (
              <Badge variant="secondary" className="ml-2 text-xs" style={{ borderRadius: RADIUS.pill }}>
                {step === "mapping" ? "Map Columns" : "Complete"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* ═══ STEP 1: UPLOAD ═══ */}
        {step === "upload" && (
          <div className="space-y-5 py-2">
            {/* File Upload */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Upload CSV or Excel File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full p-8 border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-colors flex flex-col items-center gap-2 text-center"
                style={{ borderRadius: RADIUS.card }}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-600">
                  {uploading ? "Parsing file..." : "Click to upload CSV or Excel"}
                </span>
                <span className="text-xs text-gray-400">Supports .csv, .xlsx, .xls</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sheets URL */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                <Link2 className="w-3.5 h-3.5 inline mr-1.5" />
                Google Sheets URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  style={{ borderRadius: RADIUS.input }}
                  disabled={uploading}
                />
                <Button
                  onClick={handleGoogleSheet}
                  disabled={uploading || !sheetUrl}
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 gap-1.5"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Import
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Sheet must be shared as "Anyone with the link can view"
              </p>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: COLUMN MAPPING ═══ */}
        {step === "mapping" && session && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">{session.rowCount} rows found</p>
                <p className="text-xs text-gray-400">
                  {mappedFieldCount} of {session.headers.length} columns mapped
                  {session.duplicateCount > 0 && ` · ${session.duplicateCount} duplicates will be skipped`}
                </p>
              </div>
              <Badge className="bg-violet-100 text-violet-700 border-0" style={{ borderRadius: RADIUS.pill }}>
                {session.headers.length} columns
              </Badge>
            </div>

            {/* Column mapping */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-none">
              {session.headers.map((header: string) => (
                <div key={header} className="flex items-center gap-3 p-2.5 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{header}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {session.sampleRows?.[0]?.[header] || "—"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  <Select
                    value={columnMapping[header] || ""}
                    onValueChange={(v) =>
                      setColumnMapping((prev) => ({ ...prev, [header]: v }))
                    }
                  >
                    <SelectTrigger className="w-[160px]" style={{ borderRadius: RADIUS.input }}>
                      <SelectValue placeholder="Skip" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value || "skip"}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("upload")} style={{ borderRadius: RADIUS.button }}>
                Back
              </Button>
              <Button
                onClick={() => executeMutation.mutate()}
                disabled={executeMutation.isPending || mappedFieldCount === 0}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                style={{ borderRadius: RADIUS.button }}
              >
                {executeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Import {session.rowCount} Leads
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: RESULTS ═══ */}
        {step === "result" && results && (
          <div className="space-y-5 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Import Complete</h3>
              <p className="text-sm text-gray-500 mt-1">
                {results.imported || 0} of {results.total || 0} leads added to your inbox
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 text-center" style={{ borderRadius: RADIUS.input }}>
                <p className="text-2xl font-bold text-emerald-700">{results.imported || 0}</p>
                <p className="text-xs text-emerald-600 font-medium">Imported</p>
              </div>
              <div className="p-3 bg-amber-50 text-center" style={{ borderRadius: RADIUS.input }}>
                <p className="text-2xl font-bold text-amber-700">{results.skipped || 0}</p>
                <p className="text-xs text-amber-600 font-medium">Duplicates</p>
              </div>
              <div className="p-3 bg-red-50 text-center" style={{ borderRadius: RADIUS.input }}>
                <p className="text-2xl font-bold text-red-700">{results.errors || 0}</p>
                <p className="text-xs text-red-600 font-medium">Errors</p>
              </div>
            </div>

            {/* Explanations */}
            {((results.skipped || 0) > 0 || (results.errors || 0) > 0) && (
              <div className="space-y-3">
                {(results.skipped || 0) > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-100" style={{ borderRadius: RADIUS.input }}>
                    <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      {results.skipped} Duplicates Skipped
                    </p>
                    <p className="text-xs text-amber-700">
                      These leads already exist in your system (matched by email or phone). They were skipped
                      to prevent double entries. Your existing lead data for these contacts was not changed.
                    </p>
                  </div>
                )}

                {(results.errors || 0) > 0 && (
                  <div className="p-3 bg-red-50 border border-red-100" style={{ borderRadius: RADIUS.input }}>
                    <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      {results.errors} Rows Had Errors
                    </p>
                    <p className="text-xs text-red-700 mb-2">
                      These rows couldn't be imported due to data issues. Common causes: invalid email format,
                      missing name and email, or corrupted data. No leads were lost — you can fix the data in
                      your spreadsheet and re-import.
                    </p>
                    {results.errorDetails?.length > 0 && (
                      <div className="max-h-[100px] overflow-y-auto text-[11px] text-red-600 space-y-0.5 bg-red-100/50 p-2" style={{ borderRadius: 8 }}>
                        {results.errorDetails.slice(0, 20).map((err: string, i: number) => (
                          <p key={i}>{err}</p>
                        ))}
                        {results.errorDetails.length > 20 && (
                          <p className="font-medium">...and {results.errorDetails.length - 20} more</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No leads lost message */}
            <div className="p-3 bg-blue-50 border border-blue-100" style={{ borderRadius: RADIUS.input }}>
              <p className="text-xs text-blue-700">
                <strong>No leads were lost.</strong> Skipped duplicates are already in your system.
                Errored rows can be fixed in your spreadsheet and re-imported. You can import
                the same file again — duplicates will automatically be detected and skipped.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setResults(null);
                  setSession(null);
                }}
                className="flex-1 gap-2"
                style={{ borderRadius: RADIUS.button }}
              >
                <Upload className="w-4 h-4" />
                Import More
              </Button>
              <Button
                onClick={() => {
                  resetDialog();
                  onOpenChange(false);
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                style={{ borderRadius: RADIUS.button }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
