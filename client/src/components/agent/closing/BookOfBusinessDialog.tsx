import { useState, useCallback, useEffect } from "react";
import {
  Plus, Trash2, UserPlus, IdCard, Car, Landmark, Heart, Activity, Upload, FileText
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RADIUS, TYPE } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useAgentStore, type Beneficiary, type MedicalInfo, type ClientStatus } from "@/lib/agentStore";
// Document upload goes through server-side API (Firebase Storage via s3Service)

const CARRIERS = [
  'Pacific Life', 'MassMutual', 'Nationwide', 'Mutual of Omaha',
  'Transamerica', 'Banner Life', 'Athene', 'New York Life',
  'Protective Life', 'Prudential', 'MetLife', 'Lincoln Financial',
  'AIG', 'Foresters Financial', 'National Life Group', 'Americo',
  'North American', 'Global Atlantic', 'Corebridge Financial',
  'John Hancock', 'Securian Financial',
];

// Input formatters
function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatHeight(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 3);
  if (digits.length === 0) return '';
  if (digits.length === 1) return `${digits}'`;
  return `${digits[0]}'${digits.slice(1)}"`;
}

function formatCurrencyInput(value: string | number): string {
  const raw = String(value).replace(/[^0-9.]/g, '');
  if (!raw) return '';
  // Prevent multiple dots
  const dotIdx = raw.indexOf('.');
  let cleaned = raw;
  if (dotIdx !== -1) {
    cleaned = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '');
  }
  const parts = cleaned.split('.');
  const whole = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Keep trailing dot and partial decimals while typing
  if (cleaned.endsWith('.')) return `$${whole}.`;
  if (parts.length > 1) return `$${whole}.${parts[1].slice(0, 2)}`;
  return `$${whole}`;
}

function parseCurrencyInput(value: string): number {
  const num = parseFloat(String(value).replace(/[$,\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

interface BookOfBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  workflow: any;
  onComplete: () => void;
}

export function BookOfBusinessDialog({ open, onOpenChange, leadId, workflow, onComplete }: BookOfBusinessDialogProps) {
  const [saving, setSaving] = useState(false);
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const dateOfBirth = dobMonth && dobDay && dobYear
    ? `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`
    : '';

  // Check if client already exists in Book of Business (for editing)
  const existingClient = useAgentStore.getState().bookOfBusiness.find(c => c.leadId === leadId);

  // Pre-fill from existing BoB entry > workflow data > empty
  const [newClient, setNewClient] = useState(() => {
    const e = existingClient;
    return {
      name: e?.name || `${workflow?.lead_first_name || ''} ${workflow?.lead_last_name || ''}`.trim(),
      email: e?.email || workflow?.lead_email || '',
      phone: e?.phone || workflow?.lead_phone || '',
      dateOfBirth: e?.dateOfBirth || '',
      ssn: e?.ssn || '',
      streetAddress: e?.streetAddress || '',
      city: e?.city || workflow?.city || '',
      state: e?.state || workflow?.state || '',
      zipCode: e?.zipCode || '',
      idType: (e?.idType || 'drivers_license') as 'drivers_license' | 'state_id',
      idNumber: e?.idNumber || '',
      idState: e?.idState || '',
      idExpiration: e?.idExpiration || '',
      bankName: e?.bankName || '',
      bankRoutingNumber: e?.bankRoutingNumber || '',
      bankAccountNumber: e?.bankAccountNumber || '',
      beneficiaries: (e?.beneficiaries || []) as Beneficiary[],
      medicalInfo: (e?.medicalInfo || { tobaccoUse: false, healthConditions: '', medications: '', height: '', weight: '' }) as MedicalInfo,
      policyNumber: e?.policyNumber || workflow?.policy_number || '',
      policyType: e?.policyType || workflow?.policy_type || workflow?.coverage_type || 'Term Life',
      carrier: e?.carrier || workflow?.carrier || '',
      coverageAmount: e?.coverageAmount || workflow?.coverage_amount || workflow?.estimated_value || 0,
      monthlyPremium: e?.monthlyPremium || parseFloat(workflow?.monthly_premium) || 0,
      draftDate: e?.draftDate || '',
      commissionRate: e?.commissionRate || 0,
      policyEffectiveDate: e?.policyEffectiveDate || '',
      notes: e?.notes || '',
      clientStatus: (e?.clientStatus || 'active') as ClientStatus,
      policyDocumentUrl: e?.policyDocumentUrl || '',
    };
  });

  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', relationship: '', percentage: 0 });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Re-populate form when dialog opens (picks up saved data from Zustand)
  useEffect(() => {
    if (open) {
      const saved = useAgentStore.getState().bookOfBusiness.find(c => c.leadId === leadId);
      console.log("[BoB] Dialog opened, Zustand saved data:", saved ? { name: saved.name, beneficiaries: saved.beneficiaries?.length || 0 } : 'none');

      if (saved) {
        setNewClient({
          name: saved.name || `${workflow?.lead_first_name || ''} ${workflow?.lead_last_name || ''}`.trim(),
          email: saved.email || workflow?.lead_email || '',
          phone: saved.phone || workflow?.lead_phone || '',
          dateOfBirth: saved.dateOfBirth || '',
          ssn: saved.ssn || '',
          streetAddress: saved.streetAddress || '',
          city: saved.city || workflow?.city || '',
          state: saved.state || workflow?.state || '',
          zipCode: saved.zipCode || '',
          idType: (saved.idType || 'drivers_license') as 'drivers_license' | 'state_id',
          idNumber: saved.idNumber || '',
          idState: saved.idState || '',
          idExpiration: saved.idExpiration || '',
          bankName: saved.bankName || '',
          bankRoutingNumber: saved.bankRoutingNumber || '',
          bankAccountNumber: saved.bankAccountNumber || '',
          beneficiaries: (saved.beneficiaries && saved.beneficiaries.length > 0 ? saved.beneficiaries : []) as Beneficiary[],
          medicalInfo: (saved.medicalInfo || { tobaccoUse: false, healthConditions: '', medications: '', height: '', weight: '' }) as MedicalInfo,
          policyNumber: saved.policyNumber || workflow?.policy_number || '',
          policyType: saved.policyType || workflow?.policy_type || workflow?.coverage_type || 'Term Life',
          carrier: saved.carrier || workflow?.carrier || '',
          coverageAmount: saved.coverageAmount || workflow?.coverage_amount || workflow?.estimated_value || 0,
          monthlyPremium: saved.monthlyPremium || parseFloat(workflow?.monthly_premium) || 0,
          draftDate: saved.draftDate || '',
          commissionRate: saved.commissionRate || 0,
          policyEffectiveDate: saved.policyEffectiveDate || '',
          notes: saved.notes || '',
          clientStatus: (saved.clientStatus || 'active') as ClientStatus,
          policyDocumentUrl: saved.policyDocumentUrl || '',
        });
        // Restore DOB if saved
        if (saved.dateOfBirth) {
          const parts = saved.dateOfBirth.split('-');
          if (parts.length === 3) {
            setDobYear(parts[0]);
            setDobMonth(String(parseInt(parts[1])));
            setDobDay(String(parseInt(parts[2])));
          }
        }
      }
      setSelectedFiles([]);
    }
  }, [open, leadId]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  const handleSave = async () => {
    if (!newClient.name || !newClient.policyNumber) {
      toast.error('Name and policy number are required');
      return;
    }
    if (!newClient.carrier) {
      toast.error('Carrier is required');
      return;
    }

    setSaving(true);
    try {
      // Auto-add pending beneficiary if user filled it but didn't click "Add"
      let allBeneficiaries = [...newClient.beneficiaries];
      if (newBeneficiary.name && newBeneficiary.relationship && newBeneficiary.percentage) {
        allBeneficiaries.push({ ...newBeneficiary, id: `ben-auto-${Date.now()}` });
        // Also update the state so Zustand gets it
        setNewClient(prev => ({
          ...prev,
          beneficiaries: allBeneficiaries,
        }));
        setNewBeneficiary({ name: '', relationship: '', percentage: 0 });
      }

      console.log("[BoB Save] beneficiaries:", JSON.stringify(allBeneficiaries));
      console.log("[BoB Save] selectedFiles:", selectedFiles.length);

      // 1. Finalize policy — updates policy, creates billing, sets onboarding status
      // Non-blocking: if this fails (e.g., already finalized), still proceed to save BoB
      try {
        await apiRequest("POST", `/api/post-close/${leadId}/finalize-policy`, {
        carrier: newClient.carrier,
        policyNumber: newClient.policyNumber,
        type: newClient.policyType,
        coverageAmount: newClient.coverageAmount,
        monthlyPremium: newClient.monthlyPremium,
        policyEffectiveDate: newClient.policyEffectiveDate || undefined,
        draftDate: newClient.draftDate || undefined,
        beneficiaries: allBeneficiaries.map(b => ({
          name: b.name,
          relationship: b.relationship,
          percentage: b.percentage,
        })),
        commissionRate: newClient.commissionRate || undefined,
        notes: newClient.notes || undefined,
      });
      } catch (finalizeErr: any) {
        console.warn("[BoB] Finalize-policy failed (proceeding with BoB save):", finalizeErr?.message);
      }

      // 2. Upload documents via server (uses Firebase Storage on backend)
      let firstDocUrl: string | undefined;
      if (selectedFiles.length > 0 && workflow?.client_user_id) {
        let uploadedCount = 0;
        for (const file of selectedFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name);
            formData.append("category", "policy");
            if (workflow.policy_id) formData.append("policyId", workflow.policy_id);

            const uploadRes = await fetch(`/api/agent-clients/${workflow.client_user_id}/documents`, {
              method: "POST",
              credentials: "include",
              body: formData,
            });

            if (uploadRes.ok) {
              uploadedCount++;
              try {
                const docResult = await uploadRes.json();
                if (!firstDocUrl && docResult?.url) firstDocUrl = docResult.url;
                if (!firstDocUrl && docResult?.s3Key) firstDocUrl = docResult.s3Key;
              } catch { /* response may not be JSON */ }
            } else {
              const errText = await uploadRes.text();
              console.error(`[BoB] Doc upload failed for ${file.name}:`, errText);
            }
          } catch (uploadErr) {
            console.error(`[BoB] Document upload error for ${file.name}:`, uploadErr);
          }
        }
        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} document${uploadedCount > 1 ? 's' : ''} uploaded`);
        } else if (selectedFiles.length > 0) {
          toast.warning("Documents could not be uploaded");
        }
      }

      // 3. Save to Book of Business via real API
      // If a policy already exists (from post-close finalize), UPDATE it instead of creating new
      try {
        const nameParts = newClient.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const existingPolicyId = workflow?.policy_id;
        const method = existingPolicyId ? "PUT" : "POST";
        const url = existingPolicyId
          ? `/api/book-of-business/${existingPolicyId}`
          : "/api/book-of-business";

        await apiRequest(method, url, {
          name: newClient.name,
          firstName,
          lastName,
          email: newClient.email,
          phone: newClient.phone,
          dateOfBirth: dateOfBirth || undefined,
          // Address
          streetAddress: newClient.streetAddress || undefined,
          city: newClient.city || undefined,
          state: newClient.state || undefined,
          zipCode: newClient.zipCode || undefined,
          // Sensitive info
          ssn: newClient.ssn || undefined,
          // Identification
          idType: newClient.idType || undefined,
          idNumber: newClient.idNumber || undefined,
          idState: newClient.idState || undefined,
          idExpiration: newClient.idExpiration || undefined,
          // Banking
          bankName: newClient.bankName || undefined,
          bankRoutingNumber: newClient.bankRoutingNumber || undefined,
          bankAccountNumber: newClient.bankAccountNumber || undefined,
          // Medical
          medicalInfo: newClient.medicalInfo || undefined,
          // Policy
          policyNumber: newClient.policyNumber,
          policyType: newClient.policyType,
          carrier: newClient.carrier,
          coverageAmount: newClient.coverageAmount,
          monthlyPremium: newClient.monthlyPremium,
          commissionRate: newClient.commissionRate || undefined,
          draftDate: newClient.draftDate || undefined,
          policyEffectiveDate: newClient.policyEffectiveDate || undefined,
          notes: newClient.notes || undefined,
          clientStatus: newClient.clientStatus || 'active',
          beneficiaries: allBeneficiaries.map(b => ({
            name: b.name,
            relationship: b.relationship,
            percentage: b.percentage,
          })),
        });
      } catch (bobErr: any) {
        console.warn("[BoB] API save failed, falling back to local:", bobErr?.message);
        // Fallback: save to Zustand store
        const store = useAgentStore.getState();
        store.addClientToBook({
          leadId,
          ...newClient,
          beneficiaries: allBeneficiaries,
          dateOfBirth: dateOfBirth || undefined,
          policyDocumentUrl: firstDocUrl || newClient.policyDocumentUrl || undefined,
        });
      }

      toast.success("Book of Business updated and client portal synced!");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to update book of business");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]" style={{ borderRadius: RADIUS.card }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-600" /> Add to Book of Business
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-5 py-2 pr-4">
            {/* Personal Info */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Full Name *</Label><Input placeholder="John Smith" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Select value={dobMonth} onValueChange={setDobMonth}>
                      <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={dobDay} onValueChange={setDobDay}>
                      <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Day" /></SelectTrigger>
                      <SelectContent>{DAYS.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={dobYear} onValueChange={setDobYear}>
                      <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email</Label><Input type="email" placeholder="john@email.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Phone</Label><Input placeholder="(555) 123-4567" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: formatPhone(e.target.value) })} maxLength={14} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>SSN</Label><Input placeholder="XXX-XX-XXXX" value={newClient.ssn} onChange={(e) => setNewClient({ ...newClient, ssn: formatSSN(e.target.value) })} maxLength={11} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Zip Code</Label><Input placeholder="33101" value={newClient.zipCode || ''} onChange={(e) => setNewClient({ ...newClient, zipCode: e.target.value })} maxLength={10} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                <div><Label>Street Address</Label><Input placeholder="123 Main St, Apt 4" value={newClient.streetAddress || ''} onChange={(e) => setNewClient({ ...newClient, streetAddress: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input placeholder="Miami" value={newClient.city || ''} onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>State</Label><Input placeholder="FL" value={newClient.state} onChange={(e) => setNewClient({ ...newClient, state: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
              </div>
            </div>

            {/* Identification */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><IdCard className="w-3.5 h-3.5" /> Identification</p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {([{ value: 'drivers_license' as const, label: "Driver's License", icon: Car }, { value: 'state_id' as const, label: 'State ID', icon: IdCard }]).map(opt => (
                    <Button key={opt.value} variant={newClient.idType === opt.value ? 'default' : 'outline'} size="sm"
                      className={newClient.idType === opt.value ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2' : 'gap-2'}
                      style={{ borderRadius: RADIUS.pill }}
                      onClick={() => setNewClient({ ...newClient, idType: opt.value })}>
                      <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>{newClient.idType === 'state_id' ? 'State ID #' : 'License #'}</Label><Input placeholder={newClient.idType === 'state_id' ? 'ID-123456' : 'D123-456-78'} value={newClient.idNumber} onChange={(e) => setNewClient({ ...newClient, idNumber: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Issuing State</Label><Input placeholder="FL" value={newClient.idState} onChange={(e) => setNewClient({ ...newClient, idState: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Expiration</Label><Input type="date" value={newClient.idExpiration} onChange={(e) => setNewClient({ ...newClient, idExpiration: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Landmark className="w-3.5 h-3.5" /> Banking Information</p>
              <div className="space-y-3">
                <div><Label>Bank Name</Label><Input placeholder="Chase Bank" value={newClient.bankName} onChange={(e) => setNewClient({ ...newClient, bankName: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Routing Number</Label><Input placeholder="XXXXXXXXX" value={newClient.bankRoutingNumber} onChange={(e) => setNewClient({ ...newClient, bankRoutingNumber: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Account Number</Label><Input placeholder="XXXXXXXXXXXX" value={newClient.bankAccountNumber} onChange={(e) => setNewClient({ ...newClient, bankAccountNumber: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
              </div>
            </div>

            {/* Beneficiaries */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Beneficiaries</p>
              <div className="space-y-3">
                {newClient.beneficiaries.map((ben, idx) => (
                  <div key={ben.id} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                      <span className="font-medium">{ben.name}</span>
                      <span className="text-gray-500">{ben.relationship}</span>
                      <span className="text-violet-600 font-semibold">{ben.percentage}%</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setNewClient({ ...newClient, beneficiaries: newClient.beneficiaries.filter((_, i) => i !== idx) })}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {newClient.beneficiaries.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                    <span>Total Allocation</span>
                    <span className={`font-semibold ${newClient.beneficiaries.reduce((s, b) => s + b.percentage, 0) === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {newClient.beneficiaries.reduce((s, b) => s + b.percentage, 0)}%
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2 items-end">
                  <div><Label className="text-xs">Name</Label><Input placeholder="Jane Doe" value={newBeneficiary.name} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label className="text-xs">Relationship</Label><Input placeholder="Spouse" value={newBeneficiary.relationship} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label className="text-xs">%</Label><Input type="number" placeholder="50" value={newBeneficiary.percentage || ''} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, percentage: Number(e.target.value) })} style={{ borderRadius: RADIUS.input }} /></div>
                  <Button variant="outline" size="sm" className="gap-1" style={{ borderRadius: RADIUS.input }}
                    onClick={() => {
                      if (!newBeneficiary.name || !newBeneficiary.relationship || !newBeneficiary.percentage) return;
                      setNewClient({ ...newClient, beneficiaries: [...newClient.beneficiaries, { ...newBeneficiary, id: `ben-new-${Date.now()}` }] });
                      setNewBeneficiary({ name: '', relationship: '', percentage: 0 });
                    }}>
                    <UserPlus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Medical Questions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Medical Questions</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Height</Label><Input placeholder={`5'10"`} value={newClient.medicalInfo.height || ''} onChange={(e) => setNewClient({ ...newClient, medicalInfo: { ...newClient.medicalInfo, height: formatHeight(e.target.value) } })} maxLength={5} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Weight</Label><Input placeholder="180 lbs" value={newClient.medicalInfo.weight || ''} onChange={(e) => setNewClient({ ...newClient, medicalInfo: { ...newClient.medicalInfo, weight: e.target.value } })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="mb-0">Tobacco Use?</Label>
                  <div className="flex gap-2">
                    {([false, true] as const).map(val => (
                      <Button key={String(val)} variant={newClient.medicalInfo.tobaccoUse === val ? 'default' : 'outline'} size="sm"
                        className={newClient.medicalInfo.tobaccoUse === val ? (val ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white') : ''}
                        style={{ borderRadius: RADIUS.pill }}
                        onClick={() => setNewClient({ ...newClient, medicalInfo: { ...newClient.medicalInfo, tobaccoUse: val } })}>
                        {val ? 'Yes' : 'No'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div><Label>Health Conditions</Label><Textarea placeholder="List any known health conditions..." value={newClient.medicalInfo.healthConditions || ''} onChange={(e) => setNewClient({ ...newClient, medicalInfo: { ...newClient.medicalInfo, healthConditions: e.target.value } })} rows={2} style={{ borderRadius: RADIUS.input }} /></div>
                <div><Label>Current Medications</Label><Textarea placeholder="List current medications and dosages..." value={newClient.medicalInfo.medications || ''} onChange={(e) => setNewClient({ ...newClient, medicalInfo: { ...newClient.medicalInfo, medications: e.target.value } })} rows={2} style={{ borderRadius: RADIUS.input }} /></div>
              </div>
            </div>

            {/* Policy Details */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Policy Details</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Policy Number *</Label><Input placeholder="POL-2026-XXX" value={newClient.policyNumber} onChange={(e) => setNewClient({ ...newClient, policyNumber: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div>
                    <Label>Carrier *</Label>
                    <Select value={newClient.carrier} onValueChange={(v) => setNewClient({ ...newClient, carrier: v })}>
                      <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Select carrier..." /></SelectTrigger>
                      <SelectContent>{CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Type</Label>
                    <Select value={newClient.policyType} onValueChange={(v) => setNewClient({ ...newClient, policyType: v })}>
                      <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue /></SelectTrigger>
                      <SelectContent>{['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Mortgage Protection', 'Annuity'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Coverage Amount</Label><Input placeholder="$500,000" value={newClient.coverageAmount ? formatCurrencyInput(newClient.coverageAmount) : ''} onChange={(e) => setNewClient({ ...newClient, coverageAmount: parseCurrencyInput(e.target.value) })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Effective Date</Label><Input type="date" value={newClient.policyEffectiveDate} onChange={(e) => setNewClient({ ...newClient, policyEffectiveDate: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div><Label>Draft Date (Day of Month)</Label><Input placeholder="15" value={newClient.draftDate} onChange={(e) => setNewClient({ ...newClient, draftDate: e.target.value })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
              </div>
            </div>

            {/* Premium & Commission */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Premium & Commission</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Monthly Premium</Label><Input placeholder="$89.50" value={newClient.monthlyPremium ? formatCurrencyInput(newClient.monthlyPremium) : ''} onChange={(e) => setNewClient({ ...newClient, monthlyPremium: parseCurrencyInput(e.target.value) })} style={{ borderRadius: RADIUS.input }} /></div>
                  <div>
                    <Label>Annual Premium</Label>
                    <div className="h-10 flex items-center px-3 bg-gray-100 text-gray-700 font-medium" style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}>
                      ${(newClient.monthlyPremium * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div><Label>Commission Rate (%)</Label><Input type="number" placeholder="75" value={newClient.commissionRate || ''} onChange={(e) => setNewClient({ ...newClient, commissionRate: Number(e.target.value) })} style={{ borderRadius: RADIUS.input }} /></div>
                </div>
                {newClient.monthlyPremium > 0 && newClient.commissionRate > 0 && (
                  <div className="bg-violet-50 p-3 border border-violet-100 flex items-center justify-between" style={{ borderRadius: RADIUS.button }}>
                    <span className="text-sm text-violet-700 font-medium">Estimated Commission</span>
                    <span className="text-lg font-bold text-violet-700">${((newClient.monthlyPremium * 12) * (newClient.commissionRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any additional notes about this client..." value={newClient.notes} onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} rows={3} style={{ borderRadius: RADIUS.input }} />
            </div>

            {/* Document Upload */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Documents</p>
              <div
                className="border-2 border-dashed border-gray-200 p-5 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
                style={{ borderRadius: RADIUS.input }}
                onClick={() => document.getElementById('bob-doc-upload')?.click()}
              >
                <Upload className="w-5 h-5 mx-auto mb-1.5 text-gray-300" />
                <p className="text-xs text-gray-500">Click to upload policy documents</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Declaration page, application copy, etc.</p>
                <input
                  id="bob-doc-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="space-y-1 mt-2">
                  {selectedFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 text-xs" style={{ borderRadius: RADIUS.input }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate text-gray-700">{f.name}</span>
                        <span className="text-gray-400 shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                      </div>
                      <Button size="icon" variant="ghost" className="w-5 h-5 shrink-0" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-2.5 h-2.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} style={{ borderRadius: RADIUS.button }}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2"
            style={{ borderRadius: RADIUS.button }}
          >
            <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Add to Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
