import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { useAgentStore, type ClientStatus, type BookOfBusinessClient, type ActivityLog, type Beneficiary, type MedicalInfo } from "@/lib/agentStore";
import { toast } from "sonner";
import {
  RADIUS, SHADOW, TYPE, COLORS,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import {
  Briefcase, Users, CheckCircle, DollarSign, AlertTriangle,
  Clock, Search, Mail, MessageSquare, Phone, ChevronRight,
  Plus, ArrowUpDown, X, FileText, Calendar, Shield, User,
  TrendingUp, Loader2, Upload, Cake, CreditCard, Percent, StickyNote,
  Lock, Landmark, IdCard, Heart, Activity, Trash2, UserPlus, Eye, EyeOff, Car, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

function formatHeight(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 3);
  if (digits.length === 0) return '';
  if (digits.length === 1) return `${digits}'`;
  return `${digits[0]}'${digits.slice(1)}"`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatCurrencyInput(value: string | number): string {
  const raw = String(value).replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const dotIdx = raw.indexOf('.');
  let cleaned = raw;
  if (dotIdx !== -1) {
    cleaned = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '');
  }
  const parts = cleaned.split('.');
  const whole = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (cleaned.endsWith('.')) return `$${whole}.`;
  if (parts.length > 1) return `$${whole}.${parts[1].slice(0, 2)}`;
  return `$${whole}`;
}

function parseCurrencyInput(value: string): number {
  const num = parseFloat(String(value).replace(/[$,\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

const BOB_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BOB_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const BOB_CURRENT_YEAR = new Date().getFullYear();
const BOB_YEARS = Array.from({ length: 100 }, (_, i) => BOB_CURRENT_YEAR - i);

const statusConfig: Record<ClientStatus, { label: string; icon: typeof Clock; color: string; bg: string; ring: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-200' },
  active: { label: 'Active', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-200' },
  chargeback: { label: 'Chargeback', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', ring: 'ring-red-200' },
};

const maskSSN = (ssn: string) => ssn.replace(/^(\d{3})-(\d{2})/, '***-**');
const maskAccount = (num: string) => num.length > 4 ? '****' + num.slice(-4) : '****';

export default function AgentBookOfBusiness() {
  const { bookOfBusiness, getBookOfBusinessStats, updateClientStatus, addClientActivity, addClientToBook } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'premium' | 'date'>('date');
  const [selectedClient, setSelectedClient] = useState<BookOfBusinessClient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChargebackDialog, setShowChargebackDialog] = useState<string | null>(null);
  const [chargebackReason, setChargebackReason] = useState('');
  const [reminderType, setReminderType] = useState<'text' | 'email' | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderClientId, setReminderClientId] = useState<string | null>(null);
  const [bobDobMonth, setBobDobMonth] = useState('');
  const [bobDobDay, setBobDobDay] = useState('');
  const [bobDobYear, setBobDobYear] = useState('');

  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', ssn: '', streetAddress: '', city: '', state: '', zipCode: '',
    idType: 'drivers_license' as 'drivers_license' | 'state_id',
    idNumber: '', idState: '', idExpiration: '',
    bankName: '', bankRoutingNumber: '', bankAccountNumber: '',
    beneficiaries: [] as Beneficiary[],
    medicalInfo: { tobaccoUse: false, healthConditions: '', medications: '', height: '', weight: '' } as MedicalInfo,
    policyNumber: '', policyType: 'Term Life', carrier: '',
    coverageAmount: 0, monthlyPremium: 0, draftDate: '',
    commissionRate: 0, policyEffectiveDate: '', notes: '',
    clientStatus: 'pending' as ClientStatus,
  });
  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', relationship: '', percentage: 0 });
  const [bobSelectedFiles, setBobSelectedFiles] = useState<File[]>([]);
  const handleBobFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setBobSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  }, []);
  const [showSensitive, setShowSensitive] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const isVisible = (key: string) => showSensitive || visibleFields[key];
  const toggleField = (key: string) => setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }));

  const stats = getBookOfBusinessStats();

  const filteredClients = useMemo(() => {
    let result = [...bookOfBusiness];
    if (searchQuery) result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) || c.carrier.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== 'all') result = result.filter(c => c.clientStatus === filterStatus);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'premium') result.sort((a, b) => b.monthlyPremium - a.monthlyPremium);
    else result.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    return result;
  }, [bookOfBusiness, searchQuery, filterStatus, sortBy]);

  const handleStatusChange = (clientId: string, newStatus: ClientStatus) => {
    if (newStatus === 'chargeback') {
      setShowChargebackDialog(clientId);
      return;
    }
    updateClientStatus(clientId, newStatus);
    if (newStatus === 'active') toast.success('Client activated! Leaderboard updated.');
  };

  const handleChargeback = () => {
    if (showChargebackDialog) {
      updateClientStatus(showChargebackDialog, 'chargeback', chargebackReason);
      toast.error('Chargeback recorded. Leaderboard updated.');
      setShowChargebackDialog(null);
      setChargebackReason('');
    }
  };

  const handleSendReminder = (clientId: string, type: 'text' | 'email') => {
    setReminderClientId(clientId);
    setReminderType(type);
    const client = bookOfBusiness.find(c => c.id === clientId);
    setReminderMessage(type === 'text'
      ? `Hi ${client?.name?.split(' ')[0]}, this is a friendly reminder from Heritage Life Solutions regarding your ${client?.policyType} policy. Please don't hesitate to reach out if you have any questions!`
      : `Dear ${client?.name},\n\nThis is a courtesy reminder regarding your ${client?.policyType} policy (${client?.policyNumber}). If you have any questions about your coverage or need to make any changes, please don't hesitate to contact me.\n\nBest regards`
    );
  };

  const confirmReminder = () => {
    if (reminderClientId && reminderType) {
      addClientActivity(reminderClientId, { type: reminderType === 'text' ? 'text' : 'email', notes: `Sent ${reminderType} reminder: ${reminderMessage}` });
      toast.success(`${reminderType === 'text' ? 'Text' : 'Email'} reminder sent!`);
      setReminderType(null);
      setReminderMessage('');
      setReminderClientId(null);
    }
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.policyNumber) { toast.error('Name and policy number are required'); return; }
    const computedDob = bobDobMonth && bobDobDay && bobDobYear
      ? `${bobDobYear}-${bobDobMonth.padStart(2, '0')}-${bobDobDay.padStart(2, '0')}`
      : '';
    addClientToBook({ ...newClient, dateOfBirth: computedDob });
    setNewClient({ name: '', email: '', phone: '', dateOfBirth: '', ssn: '', streetAddress: '', city: '', state: '', zipCode: '', idType: 'drivers_license', idNumber: '', idState: '', idExpiration: '', bankName: '', bankRoutingNumber: '', bankAccountNumber: '', beneficiaries: [], medicalInfo: { tobaccoUse: false, healthConditions: '', medications: '', height: '', weight: '' }, policyNumber: '', policyType: 'Term Life', carrier: '', coverageAmount: 0, monthlyPremium: 0, draftDate: '', commissionRate: 0, policyEffectiveDate: '', notes: '', clientStatus: 'pending' });
    setBobDobMonth(''); setBobDobDay(''); setBobDobYear('');
    setBobSelectedFiles([]);
    setShowAddDialog(false);
    toast.success('Client added to Book of Business!');
  };

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Active Policies', value: stats.activePolicies, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Monthly Premium', value: `$${stats.totalMonthlyPremium.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Chargebacks', value: stats.chargebackCount, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600' },
  ];

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Briefcase}
            title="Book of Business"
            subtitle="Your official client portfolio — active clients update the leaderboard"
          >
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              <Plus className="w-4 h-4" /> Add Client
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            {statCards.map((stat) => (
              <AgentStatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} gradient={stat.gradient} />
            ))}
          </AgentStatCardGrid>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search clients, policies, carriers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" style={{ borderRadius: RADIUS.input }} />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'active', 'chargeback'] as const).map((status) => (
              <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : ''} style={{ borderRadius: RADIUS.pill }}>
                {status === 'all' ? 'All' : statusConfig[status].label}
                {status !== 'all' && <span className="ml-1 opacity-70">({bookOfBusiness.filter(c => c.clientStatus === status).length})</span>}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSortBy(s => s === 'name' ? 'premium' : s === 'premium' ? 'date' : 'name')} className="gap-2" style={{ borderRadius: RADIUS.input }}>
            <ArrowUpDown className="w-4 h-4" /> {sortBy === 'name' ? 'Name' : sortBy === 'premium' ? 'Premium' : 'Date'}
          </Button>
        </motion.div>

        {/* Client List */}
        <motion.div variants={fadeInUp} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => {
              const cfg = statusConfig[client.clientStatus];
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={client.id} variants={scaleIn} layout className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-violet-200 transition-all cursor-pointer" style={{ boxShadow: SHADOW.level1, borderRadius: RADIUS.card }} onClick={() => setSelectedClient(client)}>
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 ring-2 ${cfg.ring}`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                        <Badge variant="secondary" className={`${cfg.bg} ${cfg.color}`} style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500" style={{ fontSize: TYPE.caption }}>
                        <span>{client.policyType}</span>
                        <span>{client.carrier}</span>
                        <span>{client.policyNumber}</span>
                        {client.state && <span>{client.state}</span>}
                      </div>
                    </div>
                    {/* Premium & Coverage */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="font-bold text-gray-900">${client.monthlyPremium.toLocaleString()}<span className="text-gray-400 font-normal text-xs">/mo</span></p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>${client.coverageAmount.toLocaleString()} coverage</p>
                    </div>
                    {/* Quick Actions */}
                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleSendReminder(client.id, 'text')} title="Text Reminder">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleSendReminder(client.id, 'email')} title="Email Reminder">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredClients.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No clients found</p>
              <p style={{ fontSize: TYPE.meta }}>Add clients manually or graduate them from the Lead Inbox</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Client Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => { setSelectedClient(null); setShowSensitive(false); setVisibleFields({}); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" style={{ borderRadius: 0 }}>
          {selectedClient && (() => {
            const cfg = statusConfig[selectedClient.clientStatus];
            const StatusIcon = cfg.icon;
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center`}><StatusIcon className={`w-5 h-5 ${cfg.color}`} /></div>
                    {selectedClient.name}
                  </SheetTitle>
                  <Button variant="outline" size="sm" className="gap-2 self-start" style={{ borderRadius: RADIUS.pill }}
                    onClick={() => setShowSensitive(s => !s)}>
                    {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showSensitive ? 'Hide' : 'Show'} Sensitive Info
                  </Button>
                </SheetHeader>
                <div className="space-y-6">
                  {/* Client Info */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2" style={{ borderRadius: RADIUS.button }}>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Client Information</h4>
                    <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-400" /> {selectedClient.email || '—'}</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gray-400" /> {selectedClient.phone || '—'}</div>
                    {selectedClient.dateOfBirth && <div className="flex items-center gap-2 text-sm"><Cake className="w-4 h-4 text-gray-400" /> DOB: {new Date(selectedClient.dateOfBirth).toLocaleDateString()}</div>}
                    {selectedClient.ssn && (
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-gray-400" />
                        SSN: <span className="font-medium font-mono">{isVisible('ssn') ? selectedClient.ssn : maskSSN(selectedClient.ssn)}</span>
                        <button onClick={() => toggleField('ssn')} className="text-gray-400 hover:text-violet-600 transition-colors">
                          {isVisible('ssn') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                    {selectedClient.state && <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-gray-400" /> {selectedClient.state}</div>}
                    {(selectedClient.streetAddress || selectedClient.city) && (
                      <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-gray-400" /> {[selectedClient.streetAddress, selectedClient.city, selectedClient.state, selectedClient.zipCode].filter(Boolean).join(', ')}</div>
                    )}
                  </div>
                  {/* Identification */}
                  {(selectedClient.idNumber || selectedClient.idState) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        {selectedClient.idType === 'state_id' ? <IdCard className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        {selectedClient.idType === 'state_id' ? 'State ID' : "Driver's License"}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedClient.idNumber && (
                          <div>
                            <span className="text-gray-400">{selectedClient.idType === 'state_id' ? 'State ID #' : 'License #'}</span>
                            <div className="flex items-center gap-1">
                              <p className="font-medium font-mono">{isVisible('idNumber') ? selectedClient.idNumber : maskAccount(selectedClient.idNumber)}</p>
                              <button onClick={() => toggleField('idNumber')} className="text-gray-400 hover:text-violet-600 transition-colors">
                                {isVisible('idNumber') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedClient.idState && <div><span className="text-gray-400">Issuing State</span><p className="font-medium">{selectedClient.idState}</p></div>}
                        {selectedClient.idExpiration && <div><span className="text-gray-400">Expiration</span><p className="font-medium">{new Date(selectedClient.idExpiration).toLocaleDateString()}</p></div>}
                      </div>
                    </div>
                  )}
                  {/* Banking Information */}
                  {(selectedClient.bankName || selectedClient.bankAccountNumber) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2"><Landmark className="w-4 h-4" /> Banking Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedClient.bankName && <div><span className="text-gray-400">Bank</span><p className="font-medium">{selectedClient.bankName}</p></div>}
                        {selectedClient.bankRoutingNumber && (
                          <div>
                            <span className="text-gray-400">Routing #</span>
                            <div className="flex items-center gap-1">
                              <p className="font-medium font-mono">{isVisible('bankRouting') ? selectedClient.bankRoutingNumber : maskAccount(selectedClient.bankRoutingNumber)}</p>
                              <button onClick={() => toggleField('bankRouting')} className="text-gray-400 hover:text-violet-600 transition-colors">
                                {isVisible('bankRouting') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedClient.bankAccountNumber && (
                          <div>
                            <span className="text-gray-400">Account #</span>
                            <div className="flex items-center gap-1">
                              <p className="font-medium font-mono">{isVisible('bankAccount') ? selectedClient.bankAccountNumber : maskAccount(selectedClient.bankAccountNumber)}</p>
                              <button onClick={() => toggleField('bankAccount')} className="text-gray-400 hover:text-violet-600 transition-colors">
                                {isVisible('bankAccount') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Beneficiaries */}
                  {selectedClient.beneficiaries && selectedClient.beneficiaries.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2"><Heart className="w-4 h-4" /> Beneficiaries</h4>
                      {selectedClient.beneficiaries.map((ben) => (
                        <div key={ben.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-medium text-sm">{ben.name}</p>
                            <p className="text-xs text-gray-400">{ben.relationship}</p>
                          </div>
                          <Badge variant="secondary" className="bg-violet-100 text-violet-700" style={{ borderRadius: RADIUS.pill }}>{ben.percentage}%</Badge>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-200">
                        <span>Total Allocation</span>
                        <span className={`font-semibold ${selectedClient.beneficiaries.reduce((s, b) => s + b.percentage, 0) === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {selectedClient.beneficiaries.reduce((s, b) => s + b.percentage, 0)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Medical Information */}
                  {selectedClient.medicalInfo && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2"><Activity className="w-4 h-4" /> Medical Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Tobacco Use</span>
                          <p className={`font-medium ${selectedClient.medicalInfo.tobaccoUse ? 'text-red-600' : 'text-emerald-600'}`}>
                            {selectedClient.medicalInfo.tobaccoUse ? 'Yes' : 'No'}
                          </p>
                        </div>
                        {selectedClient.medicalInfo.height && <div><span className="text-gray-400">Height</span><p className="font-medium">{selectedClient.medicalInfo.height}</p></div>}
                        {selectedClient.medicalInfo.weight && <div><span className="text-gray-400">Weight</span><p className="font-medium">{selectedClient.medicalInfo.weight}</p></div>}
                      </div>
                      {selectedClient.medicalInfo.healthConditions && (
                        <div className="text-sm"><span className="text-gray-400">Health Conditions</span><p className="font-medium">{selectedClient.medicalInfo.healthConditions}</p></div>
                      )}
                      {selectedClient.medicalInfo.medications && (
                        <div className="text-sm"><span className="text-gray-400">Medications</span><p className="font-medium">{selectedClient.medicalInfo.medications}</p></div>
                      )}
                    </div>
                  )}
                  {/* Policy Details */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2" style={{ borderRadius: RADIUS.button }}>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Policy Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-400">Policy #</span><p className="font-medium">{selectedClient.policyNumber}</p></div>
                      <div><span className="text-gray-400">Product Type</span><p className="font-medium">{selectedClient.policyType}</p></div>
                      <div><span className="text-gray-400">Carrier</span><p className="font-medium">{selectedClient.carrier}</p></div>
                      <div><span className="text-gray-400">Coverage</span><p className="font-medium">${selectedClient.coverageAmount.toLocaleString()}</p></div>
                      <div><span className="text-gray-400">Monthly Premium</span><p className="font-medium">${selectedClient.monthlyPremium.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo</p></div>
                      <div><span className="text-gray-400">Annual Premium</span><p className="font-medium text-violet-600">${(selectedClient.monthlyPremium * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}/yr</p></div>
                      <div><span className="text-gray-400">Effective Date</span><p className="font-medium">{new Date(selectedClient.policyEffectiveDate).toLocaleDateString()}</p></div>
                      {selectedClient.policyExpirationDate && <div><span className="text-gray-400">Expiration</span><p className="font-medium">{new Date(selectedClient.policyExpirationDate).toLocaleDateString()}</p></div>}
                      {selectedClient.draftDate && <div><span className="text-gray-400">Draft Date</span><p className="font-medium">{selectedClient.draftDate}{['1','21','31'].includes(selectedClient.draftDate) ? 'st' : ['2','22'].includes(selectedClient.draftDate) ? 'nd' : ['3','23'].includes(selectedClient.draftDate) ? 'rd' : 'th'} of each month</p></div>}
                    </div>
                  </div>
                  {/* Commission Summary */}
                  {selectedClient.commissionRate != null && selectedClient.commissionRate > 0 && (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-violet-600 uppercase tracking-wide flex items-center gap-2"><DollarSign className="w-4 h-4" /> Commission Summary</h4>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Rate</p>
                          <p className="text-lg font-bold text-violet-700">{selectedClient.commissionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Annual Premium</p>
                          <p className="text-lg font-bold text-gray-900">${(selectedClient.monthlyPremium * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Commission</p>
                          <p className="text-lg font-bold text-emerald-600">${((selectedClient.monthlyPremium * 12) * (selectedClient.commissionRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Policy Document */}
                  <div className="bg-gray-50 rounded-xl p-4" style={{ borderRadius: RADIUS.button }}>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Policy Document</h4>
                    {selectedClient.policyDocumentUrl ? (
                      <a href={selectedClient.policyDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium">
                        <FileText className="w-4 h-4" /> View Policy PDF
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">No document attached</p>
                    )}
                  </div>
                  {/* Notes */}
                  {selectedClient.notes && (
                    <div className="bg-gray-50 rounded-xl p-4" style={{ borderRadius: RADIUS.button }}>
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2"><StickyNote className="w-4 h-4" /> Notes</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedClient.notes}</p>
                    </div>
                  )}
                  {/* Status Actions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Status</h4>
                    <div className="flex gap-2">
                      {selectedClient.clientStatus === 'pending' && (
                        <Button onClick={() => { handleStatusChange(selectedClient.id, 'active'); setSelectedClient({ ...selectedClient, clientStatus: 'active' }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1" style={{ borderRadius: RADIUS.button }}>
                          <CheckCircle className="w-4 h-4" /> Activate Client
                        </Button>
                      )}
                      {selectedClient.clientStatus !== 'chargeback' && (
                        <Button variant="outline" onClick={() => handleStatusChange(selectedClient.id, 'chargeback')} className="text-red-600 border-red-200 hover:bg-red-50 gap-2 flex-1" style={{ borderRadius: RADIUS.button }}>
                          <AlertTriangle className="w-4 h-4" /> Mark Chargeback
                        </Button>
                      )}
                    </div>
                    {selectedClient.chargebackReason && (
                      <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700">
                        <span className="font-medium">Chargeback reason:</span> {selectedClient.chargebackReason}
                      </div>
                    )}
                  </div>
                  {/* Quick Contact */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSendReminder(selectedClient.id, 'text')} style={{ borderRadius: RADIUS.button }}>
                      <MessageSquare className="w-4 h-4 text-emerald-600" /> Text Reminder
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSendReminder(selectedClient.id, 'email')} style={{ borderRadius: RADIUS.button }}>
                      <Mail className="w-4 h-4 text-blue-600" /> Email Reminder
                    </Button>
                  </div>
                  {/* Activity History */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Activity History</h4>
                    {selectedClient.activityHistory.length > 0 ? selectedClient.activityHistory.map(act => (
                      <div key={act.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl" style={{ borderRadius: RADIUS.button }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'call' ? 'bg-violet-100 text-violet-600' : act.type === 'email' ? 'bg-blue-100 text-blue-600' : act.type === 'text' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                          {act.type === 'call' ? <Phone className="w-4 h-4" /> : act.type === 'email' ? <Mail className="w-4 h-4" /> : act.type === 'text' ? <MessageSquare className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{act.notes}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(act.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet</p>}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Chargeback Dialog */}
      <Dialog open={!!showChargebackDialog} onOpenChange={() => setShowChargebackDialog(null)}>
        <DialogContent style={{ borderRadius: RADIUS.card }}>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Record Chargeback</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Reason for chargeback</Label>
            <Textarea value={chargebackReason} onChange={(e) => setChargebackReason(e.target.value)} placeholder="Enter the reason for this chargeback..." rows={3} style={{ borderRadius: RADIUS.input }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChargebackDialog(null)} style={{ borderRadius: RADIUS.button }}>Cancel</Button>
            <Button onClick={handleChargeback} className="bg-red-600 hover:bg-red-700 text-white" style={{ borderRadius: RADIUS.button }}>Confirm Chargeback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={!!reminderType} onOpenChange={() => setReminderType(null)}>
        <DialogContent style={{ borderRadius: RADIUS.card }}>
          <DialogHeader><DialogTitle className="flex items-center gap-2">{reminderType === 'text' ? <MessageSquare className="w-5 h-5 text-emerald-600" /> : <Mail className="w-5 h-5 text-blue-600" />} Send {reminderType === 'text' ? 'Text' : 'Email'} Reminder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Message</Label>
            <Textarea value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} rows={5} style={{ borderRadius: RADIUS.input }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderType(null)} style={{ borderRadius: RADIUS.button }}>Cancel</Button>
            <Button onClick={confirmReminder} className={`text-white gap-2 ${reminderType === 'text' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`} style={{ borderRadius: RADIUS.button }}>
              {reminderType === 'text' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />} Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-violet-600" /> Add Client</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-5 py-2 pr-4">
              {/* Personal Info Section */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                <div className="space-y-3">
                  <div>
                    <Label>Full Name *</Label>
                    <Input placeholder="John Smith" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} style={{ borderRadius: RADIUS.input }} />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Select value={bobDobMonth} onValueChange={setBobDobMonth}>
                        <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Month" /></SelectTrigger>
                        <SelectContent>{BOB_MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={bobDobDay} onValueChange={setBobDobDay}>
                        <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Day" /></SelectTrigger>
                        <SelectContent>{BOB_DAYS.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={bobDobYear} onValueChange={setBobDobYear}>
                        <SelectTrigger style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>{BOB_YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
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
              {/* Policy Info Section */}
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
              {/* Premium & Commission Section */}
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
                  onClick={() => document.getElementById('bob-page-doc-upload')?.click()}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1.5 text-gray-300" />
                  <p className="text-xs text-gray-500">Click to upload policy documents</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Declaration page, application copy, etc.</p>
                  <input
                    id="bob-page-doc-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleBobFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                {bobSelectedFiles.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {bobSelectedFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 text-xs" style={{ borderRadius: RADIUS.input }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-700">{f.name}</span>
                          <span className="text-gray-400 shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                        </div>
                        <button className="p-1 hover:bg-red-50 rounded" onClick={() => setBobSelectedFiles(prev => prev.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-2.5 h-2.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} style={{ borderRadius: RADIUS.button }}>Cancel</Button>
            <Button onClick={handleAddClient} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2" style={{ borderRadius: RADIUS.button }}><Plus className="w-4 h-4" /> Add to Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
