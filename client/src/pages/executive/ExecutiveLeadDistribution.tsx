/**
 * Executive Lead Distribution Center
 * Heritage Design System — Orange/Amber executive theme
 *
 * Three-level drill-down: Manager Allocation Grid → Manager drawer (dark header + lead list) →
 * Lead Detail drawer (contact info, lead details, pipeline, activity timeline).
 *
 * Design matches Executive Book of Business drawer exactly:
 * - 560px panel, #fafafa bg, no border, blur backdrop, spring animation
 * - Dark gradient header with manager stats
 * - Search + filter pills for lead list
 * - Lead rows with colored left border accent + outlined status badge
 * - Lead detail with icon-labeled 2-col grid in white bordered cards
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Upload, Users, X, ChevronLeft, ChevronRight,
  Mail, Phone, MapPin, Search,
  Target, FileSpreadsheet, Activity, RefreshCw, UserPlus,
  FileText, Inbox, Percent, Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import {
  GRID, TYPE, RADIUS, SHADOW, COLORS, GLASS, MOTION,
  fadeInUp, staggerContainer, scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency, EXECUTIVE_GRADIENT_CSS,
  DEMO_DISTRIBUTION_LEADS, DEMO_EXEC_DISTRIBUTION_HISTORY,
  DEMO_IMPORT_BATCHES, DEMO_LEAD_ACTIVITIES,
  LEAD_STATUS_CFG, LEAD_PRIORITY_CFG, LEAD_SOURCE_LABELS,
  PIPELINE_STAGE_ORDER, PIPELINE_STAGE_LABELS,
  DEMO_BOOK_TEAMS,
} from './executiveConstants';
import type { DistributionLead, ImportBatch } from './executiveConstants';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  useLeadPool,
  useDistributionStats,
  useDistributionHistory,
  useDistributeLeads,
  useDistributionRecipients,
} from '@/hooks/useLeadDistribution';
import { useWebSocketLeads } from '@/hooks/useWebSocketLeads';

// ─── HELPERS ────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

const MANAGERS = DEMO_BOOK_TEAMS.slice(0, 5);

const ACTIVITY_ICON_MAP: Record<string, typeof Send> = {
  distribution: Send,
  assignment: UserPlus,
  call: Phone,
  email: Mail,
  note: FileText,
  status_change: RefreshCw,
  score_update: Target,
};

const ACTIVITY_COLOR_MAP: Record<string, string> = {
  distribution: '#3b82f6',
  assignment: '#8b5cf6',
  call: '#10b981',
  email: '#f59e0b',
  note: '#6b7280',
  status_change: '#ea580c',
  score_update: '#ec4899',
};

// ─── MAIN COMPONENT ────────────────────────────────

function ExecutiveLeadDistribution() {
  const [leads, setLeads] = useState<DistributionLead[]>([...DEMO_DISTRIBUTION_LEADS]);
  const [selectedManagerName, setSelectedManagerName] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState('All');
  const [managerLeadSearch, setManagerLeadSearch] = useState('');
  const [managerLeadFilter, setManagerLeadFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'imported' | 'website'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([...DEMO_IMPORT_BATCHES]);
  const [isDragOver, setIsDragOver] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const LEADS_PER_PAGE = 30;

  // ── API hooks (real backend) ──
  const distributeMutation = useDistributeLeads();
  const recipientsQuery = useDistributionRecipients();
  const apiStatsQuery = useDistributionStats();

  // ── Load website leads from quote_requests on mount ──
  const websiteLeadsLoaded = useRef(false);
  useEffect(() => {
    if (websiteLeadsLoaded.current) return;
    websiteLeadsLoaded.current = true;

    fetch('/api/lead-distribution/website-leads', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then((websiteLeads: DistributionLead[]) => {
        if (websiteLeads.length > 0) {
          setLeads(prev => {
            const existingIds = new Set(prev.map(l => l.id));
            const newLeads = websiteLeads.filter(l => !existingIds.has(l.id));
            return newLeads.length > 0 ? [...newLeads, ...prev] : prev;
          });
        }
      })
      .catch(() => { /* API not available, continue with demo data */ });
  }, []);

  // ── Real-time WebSocket — new leads from website quoter ──
  useWebSocketLeads({
    onNewLead: useCallback((lead: DistributionLead) => {
      setLeads(prev => {
        if (prev.some(l => l.id === lead.id)) return prev;
        return [lead, ...prev];
      });
      toast.success(
        `New website lead: ${lead.firstName} ${lead.lastName} — ${lead.product} ${lead.coverageAmountDisplay || ''}`,
        { duration: 6000 },
      );
    }, []),
  });

  // ── Derived state ──

  const poolLeads = useMemo(() => leads.filter(l => l.status === 'pool'), [leads]);
  const importedLeads = useMemo(() => poolLeads.filter(l => l.source === 'csv_import' || l.source === 'cold_list'), [poolLeads]);
  const websiteLeads = useMemo(() => poolLeads.filter(l => l.source === 'website'), [poolLeads]);

  const tabLeads = useMemo(() => {
    let result: DistributionLead[];
    if (activeTab === 'imported') result = importedLeads;
    else if (activeTab === 'website') result = websiteLeads;
    else result = poolLeads;

    if (leadSearch) {
      const q = leadSearch.toLowerCase();
      result = result.filter(l =>
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
        l.product.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    if (leadFilter !== 'All') {
      const statusKey = Object.entries(LEAD_STATUS_CFG).find(([, v]) => v.label === leadFilter)?.[0];
      if (statusKey) result = result.filter(l => l.status === statusKey);
    }
    return result;
  }, [poolLeads, importedLeads, websiteLeads, activeTab, leadSearch, leadFilter]);

  const totalPages = Math.ceil(tabLeads.length / LEADS_PER_PAGE);
  const paginatedLeads = useMemo(
    () => tabLeads.slice((currentPage - 1) * LEADS_PER_PAGE, currentPage * LEADS_PER_PAGE),
    [tabLeads, currentPage],
  );

  const managerAllocations = useMemo(() => {
    return MANAGERS.map(team => {
      const mLeads = leads.filter(l => l.distributedTo === team.manager);
      const byStatus: Record<string, number> = {};
      for (const l of mLeads) {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      }
      return { manager: team.manager, teamName: team.name, total: mLeads.length, byStatus };
    });
  }, [leads]);

  const selectedManager = useMemo(
    () => MANAGERS.find(t => t.manager === selectedManagerName),
    [selectedManagerName],
  );

  const allManagerLeads = useMemo(
    () => leads.filter(l => l.distributedTo === selectedManagerName),
    [leads, selectedManagerName],
  );

  const managerLeads = useMemo(() => {
    let result = allManagerLeads;
    if (managerLeadSearch) {
      const q = managerLeadSearch.toLowerCase();
      result = result.filter(l =>
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
        l.product.toLowerCase().includes(q)
      );
    }
    if (managerLeadFilter !== 'All') {
      const statusKey = Object.entries(LEAD_STATUS_CFG).find(([, v]) => v.label === managerLeadFilter)?.[0];
      if (statusKey) result = result.filter(l => l.status === statusKey);
    }
    return result;
  }, [allManagerLeads, managerLeadSearch, managerLeadFilter]);

  const selectedLead = useMemo(
    () => leads.find(l => l.id === selectedLeadId),
    [leads, selectedLeadId],
  );

  const leadActivities = useMemo(
    () => DEMO_LEAD_ACTIVITIES.filter(a => a.leadId === selectedLeadId),
    [selectedLeadId],
  );

  const distributedLeads = useMemo(() => leads.filter(l => l.status !== 'pool'), [leads]);

  const stats = useMemo(() => {
    const total = leads.length;
    const distributed = distributedLeads.length;
    const inPool = poolLeads.length;
    const fromWebsite = websiteLeads.length;
    const converted = distributedLeads.filter(l => l.status === 'converted').length;
    const conversionRate = distributedLeads.length > 0 ? Math.round((converted / distributedLeads.length) * 100) : 0;
    return { total, distributed, inPool, fromWebsite, conversionRate };
  }, [leads, distributedLeads, poolLeads, websiteLeads]);

  const drawerOpen = selectedManagerName !== null || selectedLeadId !== null;

  useEffect(() => {
    drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedLeadId, showTimeline]);

  // ── Actions ──

  function closeDrawer() {
    setSelectedManagerName(null);
    setSelectedLeadId(null);
    setShowTimeline(false);
    setManagerLeadSearch('');
    setManagerLeadFilter('All');
  }

  function goBackToManager() {
    if (selectedManagerName) {
      setSelectedLeadId(null);
      setShowTimeline(false);
    } else {
      closeDrawer();
    }
  }

  function goBackToLead() {
    setShowTimeline(false);
  }

  const handleDistributeEvenly = useCallback(() => {
    const pool = leads.filter(l => l.status === 'pool');
    if (pool.length === 0) {
      toast.error('No leads in pool to distribute');
      return;
    }

    // Try real API distribution first
    distributeMutation.mutate({ all: true }, {
      onSuccess: (data) => {
        // Also update local demo state for UI
        const managerNames = MANAGERS.map(t => t.manager);
        const updated = [...leads];
        let idx = 0;
        for (const lead of updated) {
          if (lead.status === 'pool') {
            lead.status = 'distributed';
            lead.distributedTo = managerNames[idx % managerNames.length];
            lead.distributedAt = new Date().toISOString().slice(0, 10);
            idx++;
          }
        }
        setLeads(updated);
        toast.success(`Distributed ${data.distributed} leads evenly across ${data.recipientCount} managers`);
      },
      onError: () => {
        // Fallback to demo-only distribution
        const managerNames = MANAGERS.map(t => t.manager);
        const updated = [...leads];
        let idx = 0;
        for (const lead of updated) {
          if (lead.status === 'pool') {
            lead.status = 'distributed';
            lead.distributedTo = managerNames[idx % managerNames.length];
            lead.distributedAt = new Date().toISOString().slice(0, 10);
            idx++;
          }
        }
        setLeads(updated);
        toast.success(`Distributed ${pool.length} leads evenly across ${managerNames.length} managers`);
      },
    });
  }, [leads, distributeMutation]);

  function handleLeadRowClick(lead: DistributionLead) {
    if (lead.distributedTo) {
      setSelectedManagerName(lead.distributedTo);
    }
    setSelectedLeadId(lead.id);
  }

  // ── File Import ──

  const COLUMN_PATTERNS: Record<string, string[]> = {
    firstName: ['first_name', 'firstname', 'first name', 'fname', 'given name', 'first'],
    lastName: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family name', 'last'],
    email: ['email', 'email address', 'e-mail', 'emailaddress', 'e_mail'],
    phone: ['phone', 'phone number', 'telephone', 'mobile', 'cell', 'phonenumber', 'tel'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region', 'st'],
    source: ['source', 'lead source', 'how heard', 'lead_source', 'origin'],
    product: ['product', 'coverage', 'coverage type', 'product type', 'insurance type', 'coverage_type', 'product_type', 'type'],
    estimatedValue: ['value', 'estimated value', 'deal value', 'amount', 'estimated_value', 'deal_value', 'premium'],
    notes: ['notes', 'comments', 'description', 'note'],
    priority: ['priority', 'urgency', 'level'],
  };

  const autoMapColumns = useCallback((headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    for (const header of headers) {
      const lower = header.toLowerCase().trim();
      for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
        if (patterns.includes(lower) || patterns.some(p => lower.includes(p))) {
          mapping[header] = field;
          break;
        }
      }
    }
    return mapping;
  }, []);

  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return phone;
  };

  const titleCase = (s: string): string => s.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const PRODUCTS = ['IUL', 'Whole Life', 'Term Life', 'Annuity', 'Final Expense'];
  const SOURCES: DistributionLead['source'][] = ['csv_import', 'marketing_campaign', 'website', 'partner_referral', 'executive_referral', 'cold_list'];
  const PRIORITIES: DistributionLead['priority'][] = ['low', 'medium', 'high', 'urgent'];

  const processImportedFile = useCallback((file: File) => {
    const fileName = file.name;
    const isExcel = /\.xlsx?$/i.test(fileName);

    const parseAndImport = (rows: Record<string, string>[], headers: string[]) => {
      if (rows.length === 0) {
        toast.error('File is empty — no rows found');
        return;
      }

      const mapping = autoMapColumns(headers);
      const now = new Date().toISOString().slice(0, 10);
      const batchId = `batch-${Date.now()}`;

      const getValue = (row: Record<string, string>, field: string): string => {
        const col = Object.entries(mapping).find(([, v]) => v === field)?.[0];
        return col ? (row[col] || '').trim() : '';
      };

      const newLeads: DistributionLead[] = rows.map((row, i) => {
        const firstName = titleCase(getValue(row, 'firstName') || 'Unknown');
        const lastName = titleCase(getValue(row, 'lastName') || `Lead ${i + 1}`);
        const email = (getValue(row, 'email') || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@imported.com`).toLowerCase();
        const phone = normalizePhone(getValue(row, 'phone') || '');
        const city = titleCase(getValue(row, 'city') || 'Unknown');
        const state = (getValue(row, 'state') || 'FL').toUpperCase().slice(0, 2);
        const rawProduct = getValue(row, 'product');
        const product = PRODUCTS.find(p => p.toLowerCase().includes(rawProduct.toLowerCase())) || PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const rawValue = getValue(row, 'estimatedValue');
        const estimatedValue = parseInt(rawValue.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 40000) + 10000;
        const rawPriority = getValue(row, 'priority').toLowerCase();
        const priority = PRIORITIES.includes(rawPriority as DistributionLead['priority']) ? rawPriority as DistributionLead['priority'] : 'medium';
        const rawSource = getValue(row, 'source').toLowerCase().replace(/\s+/g, '_');
        const source = SOURCES.includes(rawSource as DistributionLead['source']) ? rawSource as DistributionLead['source'] : 'csv_import';
        const leadScore = Math.floor(Math.random() * 60) + 30;

        return {
          id: `imp-${batchId}-${i}`,
          firstName,
          lastName,
          email,
          phone,
          city,
          state,
          source,
          priority,
          product,
          coverageType: product,
          estimatedValue,
          leadScore,
          scoreTier: leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold',
          status: 'pool',
          distributedTo: null,
          assignedTo: null,
          distributedAt: null,
          assignedAt: null,
          pipelineStage: 'new',
          lastActivity: now,
          nextFollowUp: now,
          notes: getValue(row, 'notes') || '',
          importBatch: fileName,
          importedAt: now,
        };
      });

      setLeads(prev => [...newLeads, ...prev]);
      setImportBatches(prev => [{
        id: batchId,
        fileName,
        importedAt: now,
        totalLeads: newLeads.length,
        status: 'complete',
        importedBy: 'Executive',
      }, ...prev]);
      setActiveTab('imported');
      setCurrentPage(1);
      toast.success(`Imported ${newLeads.length} leads from ${fileName} — all normalized to standard format`);
    };

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
          if (jsonData.length < 2) { toast.error('File is empty'); return; }
          const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
          const rows = jsonData.slice(1).map(row => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = (row as string[])[i] !== undefined ? String((row as string[])[i]) : ''; });
            return obj;
          }).filter(row => Object.values(row).some(v => v !== ''));
          parseAndImport(rows, headers);
        } catch {
          toast.error('Failed to parse Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const result = Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() });
          const headers = result.meta.fields || [];
          parseAndImport(result.data as Record<string, string>[], headers);
        } catch {
          toast.error('Failed to parse CSV file');
        }
      };
      reader.readAsText(file);
    }
  }, [autoMapColumns]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(csv|xlsx?|xls)$/i.test(file.name)) {
      processImportedFile(file);
    } else {
      toast.error('Please drop a CSV or Excel file (.csv, .xlsx, .xls)');
    }
  }, [processImportedFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImportedFile(file);
    e.target.value = '';
  }, [processImportedFile]);

  // ── Level 1: Manager drawer header ──

  function ManagerDrawerHeader() {
    if (!selectedManager) return null;
    const mLeads = allManagerLeads;
    const convertedCount = mLeads.filter(l => l.status === 'converted').length;
    const convPct = mLeads.length > 0 ? Math.round((convertedCount / mLeads.length) * 100) : 0;
    const activeDeals = mLeads.filter(l => l.status === 'in_progress' || l.status === 'assigned').length;

    return (
      <div style={{ background: EXECUTIVE_GRADIENT_CSS, padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px`, position: 'relative' }}>
        {/* Close button */}
        <button onClick={closeDrawer} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <X style={{ width: 20, height: 20, color: 'white' }} />
        </button>
        {/* Manager icon + name */}
        <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{
            width: 56, height: 56, borderRadius: RADIUS.pill,
            backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <Users style={{ width: 26, height: 26, color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>{selectedManager.manager}</h3>
            <p style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)' }}>{selectedManager.name}</p>
          </div>
        </div>
        {/* 4-column stats */}
        <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
          {[
            { v: String(mLeads.length), l: 'Leads Assigned' },
            { v: `${convPct}%`, l: 'Conversion %' },
            { v: '2.4h', l: 'Avg Response' },
            { v: String(activeDeals), l: 'Active Deals' },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontSize: TYPE.title, fontWeight: 700, color: 'white' }}>{s.v}</p>
              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Lead drawer header (direct access, no manager context) ──

  function LeadDrawerHeader() {
    if (!selectedLead) return null;
    const cfg = LEAD_STATUS_CFG[selectedLead.status] ?? LEAD_STATUS_CFG.pool;
    const priCfg = LEAD_PRIORITY_CFG[selectedLead.priority] ?? LEAD_PRIORITY_CFG.medium;

    return (
      <div style={{ background: EXECUTIVE_GRADIENT_CSS, padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px ${GRID.spacing.md}px`, position: 'relative' }}>
        {/* Close button */}
        <button onClick={closeDrawer} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <X style={{ width: 20, height: 20, color: 'white' }} />
        </button>
        {/* Lead icon + name */}
        <div className="flex items-center gap-4" style={{ marginBottom: GRID.spacing.md }}>
          <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
            width: 56, height: 56, borderRadius: RADIUS.pill,
            backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)', fontSize: TYPE.body,
          }}>
            {getInitials(selectedLead.firstName, selectedLead.lastName)}
          </div>
          <div>
            <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: 'white' }}>
              {selectedLead.firstName} {selectedLead.lastName}
            </h3>
            <p style={{ fontSize: TYPE.meta, color: 'rgba(255,255,255,0.75)' }}>
              {selectedLead.city}, {selectedLead.state}
            </p>
          </div>
        </div>
        {/* 4-column stats */}
        <div className="grid grid-cols-4 text-center" style={{ gap: GRID.spacing.xs }}>
          {[
            { v: selectedLead.product, l: 'Product' },
            { v: fmtCurrency(selectedLead.estimatedValue), l: 'Est. Value' },
            { v: cfg.label, l: 'Status' },
            { v: priCfg.label, l: 'Priority' },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: 'white' }}>{s.v}</p>
              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.6)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Level 1: Manager lead list ──

  function ManagerLeadList() {
    const filters = ['All', 'In Pool', 'Distributed', 'Assigned', 'In Progress', 'Converted', 'Lost'];

    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Search */}
        <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text" placeholder="Search leads..."
            value={managerLeadSearch} onChange={e => setManagerLeadSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-colors"
            style={{ padding: '10px 12px 10px 36px', borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: GRID.spacing.md }}>
          {filters.map(f => (
            <button key={f} onClick={() => setManagerLeadFilter(f)}
              className="transition-all font-medium"
              style={{
                fontSize: TYPE.micro, padding: '4px 14px', borderRadius: RADIUS.pill,
                backgroundColor: managerLeadFilter === f ? '#ea580c' : 'transparent',
                color: managerLeadFilter === f ? 'white' : COLORS.gray[500],
                border: `1px solid ${managerLeadFilter === f ? '#ea580c' : COLORS.gray[200]}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>Lead Allocation</h4>
          <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{managerLeads.length} of {allManagerLeads.length}</span>
        </div>

        {/* Lead rows */}
        <div className="space-y-2">
          {managerLeads.map(lead => {
            const cfg = LEAD_STATUS_CFG[lead.status] ?? LEAD_STATUS_CFG.pool;
            return (
              <motion.div
                key={lead.id}
                whileHover={{ x: 2 }}
                transition={{ duration: MOTION.duration.hover }}
                onClick={() => setSelectedLeadId(lead.id)}
                className="flex items-center gap-3 cursor-pointer bg-white hover:bg-orange-50 transition-colors overflow-hidden"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${COLORS.gray[100]}`,
                  borderLeft: `3px solid ${cfg.border}`,
                  boxShadow: SHADOW.level1,
                }}
              >
                {/* Dot */}
                <div className="flex-shrink-0" style={{ marginLeft: GRID.spacing.sm }}>
                  <span style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: cfg.dot, display: 'block' }} />
                </div>

                {/* Name + info */}
                <div className="flex-1 min-w-0" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    {lead.product} · {fmtCurrency(lead.estimatedValue)}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 font-medium border ${cfg.badge} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, flexShrink: 0 }}
                >
                  {cfg.label}
                </span>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" style={{ marginRight: GRID.spacing.sm }} />
              </motion.div>
            );
          })}
          {managerLeads.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-stone-300" />
              <p className="font-medium text-stone-400">No leads found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Level 2: Lead detail ──

  function LeadDetailContent() {
    if (!selectedLead) return null;
    const cfg = LEAD_STATUS_CFG[selectedLead.status] ?? LEAD_STATUS_CFG.pool;
    const priCfg = LEAD_PRIORITY_CFG[selectedLead.priority] ?? LEAD_PRIORITY_CFG.medium;

    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Back link */}
        <button onClick={goBackToManager} className="flex items-center gap-1 text-stone-500 hover:text-stone-700 transition-colors" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.md }}>
          <ChevronLeft className="w-4 h-4" /> {selectedManagerName ? `Back to ${selectedManager?.manager}'s leads` : 'Back to leads'}
        </button>

        {/* Lead header */}
        <div className="flex items-center gap-3" style={{ marginBottom: GRID.spacing.lg }}>
          <div className="flex-shrink-0 flex items-center justify-center text-white font-bold" style={{
            width: 52, height: 52, borderRadius: RADIUS.pill,
            background: EXECUTIVE_GRADIENT_CSS, fontSize: TYPE.body,
          }}>
            {getInitials(selectedLead.firstName, selectedLead.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>
              {selectedLead.firstName} {selectedLead.lastName}
            </h3>
            <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>{selectedLead.city}, {selectedLead.state}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 font-medium border ${priCfg.bg} ${priCfg.border}`}
            style={{ fontSize: TYPE.micro, padding: '3px 12px', borderRadius: RADIUS.pill, flexShrink: 0, color: priCfg.color }}
          >
            {priCfg.label}
          </span>
        </div>

        {/* Source badge for website leads */}
        {selectedLead.source === 'website' && (
          <div className="flex items-center gap-2" style={{ marginBottom: GRID.spacing.sm }}>
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{
              fontSize: TYPE.micro, padding: '4px 12px', borderRadius: RADIUS.pill,
              backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
              Website Quoter Lead
            </span>
            {selectedLead.quoteRequestId && (
              <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                Quote #{selectedLead.quoteRequestId}
              </span>
            )}
          </div>
        )}

        {/* Contact Info card */}
        <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Contact Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCell icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedLead.phone} />
            <InfoCell icon={<Mail className="w-4 h-4" />} label="Email" value={selectedLead.email} />
          </div>
          <div style={{ marginTop: GRID.spacing.sm }}>
            <div className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5 flex-shrink-0"><MapPin className="w-4 h-4" /></span>
              <div className="min-w-0">
                <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Address</p>
                <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>
                  {selectedLead.streetAddress
                    ? `${selectedLead.streetAddress}, ${selectedLead.city}, ${selectedLead.state} ${selectedLead.zipCode || ''}`
                    : `${selectedLead.city}, ${selectedLead.state}${selectedLead.zipCode ? ' ' + selectedLead.zipCode : ''}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quoter Profile card (website leads only) */}
        {selectedLead.source === 'website' && (
          <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
            <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Applicant Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              {selectedLead.age && <DetailCell label="Age" value={String(selectedLead.age)} />}
              {selectedLead.birthDate && <DetailCell label="Date of Birth" value={selectedLead.birthDate} />}
              {selectedLead.gender && <DetailCell label="Gender" value={selectedLead.gender === 'male' ? 'Male' : 'Female'} />}
              {selectedLead.tobacco !== undefined && (
                <div>
                  <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Tobacco Use</p>
                  <div className="flex items-center gap-1.5">
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: selectedLead.tobacco ? '#ef4444' : '#10b981',
                      display: 'inline-block',
                    }} />
                    <span className="font-medium" style={{ fontSize: TYPE.meta, color: selectedLead.tobacco ? '#ef4444' : COLORS.gray[900] }}>
                      {selectedLead.tobacco ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}
              {selectedLead.heightDisplay && <DetailCell label="Height" value={selectedLead.heightDisplay} />}
              {selectedLead.weightDisplay && <DetailCell label="Weight" value={selectedLead.weightDisplay} />}
              {selectedLead.coverageAmountDisplay && <DetailCell label="Coverage Requested" value={selectedLead.coverageAmountDisplay} highlight />}
            </div>
          </div>
        )}

        {/* Medical Background card (website leads only) */}
        {selectedLead.source === 'website' && selectedLead.medicalBackground && (
          <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
            <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Medical Background</h4>
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[700], lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {selectedLead.medicalBackground.replace(/_/g, ' ')}
            </p>
          </div>
        )}

        {/* Lead Details card */}
        <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
            <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>Lead Details</h4>
            <span style={{ fontSize: TYPE.title, fontWeight: 700, color: '#ea580c' }}>
              {fmtCurrency(selectedLead.estimatedValue)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailCell label="Source" value={LEAD_SOURCE_LABELS[selectedLead.source] ?? selectedLead.source} />
            <div>
              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Lead Score</p>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }}>{selectedLead.leadScore}</span>
                <div className="flex-1" style={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.gray[200], maxWidth: 80 }}>
                  <div style={{
                    width: `${selectedLead.leadScore}%`, height: '100%', borderRadius: RADIUS.pill,
                    background: selectedLead.leadScore >= 80 ? '#10b981' : selectedLead.leadScore >= 50 ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
              </div>
            </div>
            <DetailCell label="Product" value={selectedLead.product} highlight />
            <DetailCell label="Coverage Type" value={selectedLead.coverageType} />
            <DetailCell label="Priority" value={priCfg.label} highlight={selectedLead.priority === 'urgent' || selectedLead.priority === 'high'} />
            <DetailCell label="Score Tier" value={selectedLead.scoreTier === 'on_fire' ? 'On Fire' : selectedLead.scoreTier.charAt(0).toUpperCase() + selectedLead.scoreTier.slice(1)} />
          </div>
        </div>

        {/* Assignment History card */}
        <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Assignment History</h4>
          <div className="space-y-3">
            {/* Imported step */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: RADIUS.pill, backgroundColor: '#ede9fe' }}>
                  <Upload className="w-3.5 h-3.5 text-violet-600" />
                </div>
              </div>
              <div>
                <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>Imported via {selectedLead.importBatch}</p>
                <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{selectedLead.importedAt}</p>
              </div>
            </div>
            {/* Distributed step */}
            {selectedLead.distributedTo && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: RADIUS.pill, backgroundColor: '#dbeafe' }}>
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>Distributed to {selectedLead.distributedTo}</p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{selectedLead.distributedAt ?? ''}</p>
                </div>
              </div>
            )}
            {/* Assigned step */}
            {selectedLead.assignedTo && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: RADIUS.pill, backgroundColor: '#fef3c7' }}>
                    <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>Assigned to {selectedLead.assignedTo}</p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{selectedLead.assignedAt ?? ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Stage card */}
        <div className="border border-stone-200 bg-white" style={{ borderRadius: RADIUS.button, padding: GRID.spacing.md, marginBottom: GRID.spacing.sm }}>
          <h4 style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.md }}>Pipeline Stage</h4>
          <div className="flex items-start justify-between overflow-x-auto" style={{ gap: 2 }}>
            {PIPELINE_STAGE_ORDER.map((stage, i) => {
              const currentIdx = PIPELINE_STAGE_ORDER.indexOf(selectedLead.pipelineStage as typeof PIPELINE_STAGE_ORDER[number]);
              const isActive = i === currentIdx;
              const isPast = i < currentIdx;
              const isFuture = i > currentIdx;
              const stageLabel = PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] ?? stage;
              return (
                <div key={stage} className="flex flex-col items-center" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <div style={{
                    width: isActive ? 14 : 10,
                    height: isActive ? 14 : 10,
                    borderRadius: RADIUS.pill,
                    backgroundColor: isPast || isActive ? '#ea580c' : COLORS.gray[200],
                    border: isActive ? '2px solid #c2410c' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }} />
                  <p className="text-center mt-1 leading-tight" style={{
                    fontSize: '9px',
                    color: isPast || isActive ? '#ea580c' : COLORS.gray[400],
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {stageLabel}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Connecting line overlay */}
          <div className="relative" style={{ height: 2, marginTop: -28, marginBottom: 20, marginLeft: '5%', marginRight: '5%' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: COLORS.gray[200], borderRadius: RADIUS.pill }} />
            {(() => {
              const currentIdx = PIPELINE_STAGE_ORDER.indexOf(selectedLead.pipelineStage as typeof PIPELINE_STAGE_ORDER[number]);
              const pct = currentIdx >= 0 ? (currentIdx / (PIPELINE_STAGE_ORDER.length - 1)) * 100 : 0;
              return (
                <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 2, backgroundColor: '#ea580c', borderRadius: RADIUS.pill, transition: 'width 0.4s ease' }} />
              );
            })()}
          </div>
        </div>

        {/* View Full Activity button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowTimeline(true)}
          className="w-full flex items-center justify-center gap-2 font-semibold text-white transition-colors"
          style={{
            background: EXECUTIVE_GRADIENT_CSS,
            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
            borderRadius: RADIUS.button,
            fontSize: TYPE.meta,
            boxShadow: SHADOW.card,
          }}
        >
          <Activity className="w-4 h-4" />
          View Full Activity Timeline
        </motion.button>
      </div>
    );
  }

  // ── Level 3: Activity Timeline ──

  function ActivityTimelineContent() {
    if (!selectedLead) return null;

    return (
      <div style={{ padding: GRID.spacing.md }}>
        {/* Back link */}
        <button onClick={goBackToLead} className="flex items-center gap-1 text-stone-500 hover:text-stone-700 transition-colors" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.md }}>
          <ChevronLeft className="w-4 h-4" /> Back to lead detail
        </button>

        <h3 style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.md }}>
          Activity Timeline
        </h3>
        <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginBottom: GRID.spacing.lg }}>
          {selectedLead.firstName} {selectedLead.lastName} — {leadActivities.length} activities
        </p>

        {/* Vertical timeline */}
        <div className="relative">
          {leadActivities.length > 0 && (
            <div className="absolute left-4 top-4 bottom-4" style={{ width: 2, backgroundColor: COLORS.gray[200] }} />
          )}
          <div className="space-y-6">
            {leadActivities.map((activity, idx) => {
              const IconComponent = ACTIVITY_ICON_MAP[activity.type] ?? FileText;
              const color = ACTIVITY_COLOR_MAP[activity.type] ?? COLORS.gray[500];
              return (
                <div key={activity.id} className="flex items-start gap-4 relative">
                  {/* Dot */}
                  <div className="flex-shrink-0 z-10 flex items-center justify-center" style={{
                    width: 32, height: 32, borderRadius: RADIUS.pill,
                    backgroundColor: `${color}15`, border: `2px solid ${color}`,
                  }}>
                    <IconComponent style={{ width: 14, height: 14, color }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0" style={{ paddingTop: 2 }}>
                    <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
                        {activity.timestamp}
                      </span>
                      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                        by {activity.performedBy}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {leadActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                <p className="font-medium text-stone-400">No activities recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──

  return (
    <ExecutiveLoungeLayout>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

        {/* 1. Hero */}
        <ExecutivePageHero
          icon={Send}
          title="Lead Distribution Center"
          subtitle="Import, distribute, and track leads across all managers and teams"
        />

        {/* 2. Stat Cards */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard icon={Inbox} label="Total Leads" value={String(stats.total)} periodLabel="across all sources" />
            <ExecutiveStatCard icon={Target} label="In Pool" value={String(stats.inPool)} periodLabel="awaiting distribution" />
            <ExecutiveStatCard icon={Globe} label="From Website" value={String(stats.fromWebsite)} periodLabel="quoter submissions" />
            <ExecutiveStatCard icon={Send} label="Distributed" value={String(stats.distributed)} periodLabel="to managers" />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* 3. Import Section + Distribution Controls */}
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: GRID.spacing.md }}>
            {/* Left: Import Zone */}
            <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.md }}>
                <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Import Leads</h4>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {/* Drop zone */}
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className="flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{
                    border: `2px dashed ${isDragOver ? '#ea580c' : COLORS.gray[300]}`,
                    borderRadius: RADIUS.button,
                    padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px`,
                    marginBottom: GRID.spacing.md,
                    backgroundColor: isDragOver ? '#fff7ed' : 'transparent',
                  }}
                >
                  <Upload style={{ width: 32, height: 32, color: isDragOver ? '#ea580c' : COLORS.gray[400], marginBottom: GRID.spacing.xs, transition: 'color 0.2s ease' }} />
                  <p style={{ fontSize: TYPE.meta, fontWeight: 600, color: isDragOver ? '#ea580c' : COLORS.gray[700], marginBottom: 4, transition: 'color 0.2s ease' }}>
                    {isDragOver ? 'Drop file to import' : 'Drop CSV or Excel file here'}
                  </p>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
                    or click to browse — any format gets normalized
                  </p>
                </motion.div>
                {/* Recent imports */}
                <h5 style={{ fontSize: TYPE.caption, fontWeight: 600, color: COLORS.gray[500], marginBottom: GRID.spacing.xs }}>Recent Imports</h5>
                <div className="space-y-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {importBatches.map(batch => (
                    <div key={batch.id} className="flex items-center gap-3" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <FileSpreadsheet className="w-4 h-4 flex-shrink-0" style={{ color: batch.status === 'complete' ? '#10b981' : COLORS.gray[400] }} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontSize: TYPE.caption, fontWeight: 500, color: COLORS.gray[700] }}>{batch.fileName}</p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{batch.importedAt} · {batch.totalLeads} leads</p>
                      </div>
                      <span
                        className="inline-flex items-center font-medium"
                        style={{
                          fontSize: TYPE.micro, padding: '2px 8px', borderRadius: RADIUS.pill,
                          backgroundColor: batch.status === 'complete' ? '#ecfdf5' : '#fef3c7',
                          color: batch.status === 'complete' ? '#059669' : '#d97706',
                        }}
                      >
                        {batch.status === 'complete' ? 'Done' : 'Processing'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Right: Distribution Controls */}
            <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.md }}>
                <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Distribution Controls</h4>
                {/* Distribute button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDistributeEvenly}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold transition-all"
                  style={{
                    background: EXECUTIVE_GRADIENT_CSS,
                    padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.body,
                    boxShadow: SHADOW.card,
                    marginBottom: GRID.spacing.sm,
                  }}
                >
                  <Send className="w-5 h-5" />
                  Distribute Evenly
                </motion.button>
                <p className="text-center" style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: GRID.spacing.md }}>
                  {poolLeads.length} leads in pool → {Math.ceil(poolLeads.length / MANAGERS.length)} per manager
                </p>
                {/* Quick stats */}
                <div className="grid grid-cols-2" style={{ gap: 1, backgroundColor: COLORS.gray[200], borderRadius: RADIUS.input, overflow: 'hidden' }}>
                  {[
                    { l: 'Managers', v: String(MANAGERS.length) },
                    { l: 'Pool Size', v: String(poolLeads.length) },
                    { l: 'Per Manager', v: poolLeads.length > 0 ? String(Math.ceil(poolLeads.length / MANAGERS.length)) : '0' },
                    { l: 'Total Leads', v: String(leads.length) },
                  ].map(s => (
                    <div key={s.l} className="flex flex-col items-center justify-center" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, backgroundColor: 'rgba(255,255,255,0.95)' }}>
                      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{s.l}</span>
                      <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 4. Tab section: All Leads | Imported | Website */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardContent style={{ padding: GRID.spacing.md }}>
              {/* Tabs */}
              <div className="flex gap-3" style={{ marginBottom: GRID.spacing.md }}>
                {([
                  { key: 'all' as const, label: 'All Leads', count: poolLeads.length },
                  { key: 'imported' as const, label: 'Imported', count: importedLeads.length },
                  { key: 'website' as const, label: 'Website', count: websiteLeads.length },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setLeadFilter('All'); setLeadSearch(''); setCurrentPage(1); }}
                    className="transition-all font-semibold"
                    style={{
                      fontSize: TYPE.meta,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.pill,
                      background: activeTab === tab.key ? EXECUTIVE_GRADIENT_CSS : 'transparent',
                      color: activeTab === tab.key ? 'white' : COLORS.gray[500],
                      border: `1px solid ${activeTab === tab.key ? 'transparent' : COLORS.gray[200]}`,
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text" placeholder="Search leads..."
                  value={leadSearch} onChange={e => { setLeadSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-stone-50 border border-stone-200 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-colors"
                  style={{ padding: '10px 12px 10px 36px', borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                />
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: GRID.spacing.md }}>
                {['All', ...Object.values(LEAD_STATUS_CFG).map(c => c.label)].map(f => (
                  <button key={f} onClick={() => { setLeadFilter(f); setCurrentPage(1); }}
                    className="transition-all font-medium"
                    style={{
                      fontSize: TYPE.micro, padding: '4px 14px', borderRadius: RADIUS.pill,
                      backgroundColor: leadFilter === f ? '#ea580c' : 'transparent',
                      color: leadFilter === f ? 'white' : COLORS.gray[500],
                      border: `1px solid ${leadFilter === f ? '#ea580c' : COLORS.gray[200]}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>

              {/* Lead rows */}
              <div className="space-y-2">
                {paginatedLeads.map(lead => {
                  const cfg = LEAD_STATUS_CFG[lead.status] ?? LEAD_STATUS_CFG.pool;
                  return (
                    <motion.div
                      key={lead.id}
                      whileHover={{ x: 2 }}
                      transition={{ duration: MOTION.duration.hover }}
                      onClick={() => handleLeadRowClick(lead)}
                      className="flex items-center gap-3 cursor-pointer bg-white hover:bg-orange-50 transition-colors overflow-hidden"
                      style={{
                        borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[100]}`,
                        borderLeft: `3px solid ${cfg.border}`,
                        boxShadow: SHADOW.level1,
                      }}
                    >
                      <div className="flex-shrink-0" style={{ marginLeft: GRID.spacing.sm }}>
                        <span style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: cfg.dot, display: 'block' }} />
                      </div>
                      <div className="flex-1 min-w-0" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                        <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                          {lead.product} · {fmtCurrency(lead.estimatedValue)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 font-medium border ${cfg.badge} ${cfg.badgeText} ${cfg.badgeBorder}`}
                        style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, flexShrink: 0 }}
                      >
                        {cfg.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" style={{ marginRight: GRID.spacing.sm }} />
                    </motion.div>
                  );
                })}
                {tabLeads.length === 0 && (
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                    <p className="font-medium text-stone-400">No leads match your search</p>
                  </div>
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.md, paddingTop: GRID.spacing.sm, borderTop: `1px solid ${COLORS.gray[100]}` }}>
                  <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    Showing {((currentPage - 1) * LEADS_PER_PAGE) + 1}–{Math.min(currentPage * LEADS_PER_PAGE, tabLeads.length)} of {tabLeads.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center transition-colors"
                      style={{
                        width: 32, height: 32, borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[200]}`,
                        color: currentPage === 1 ? COLORS.gray[300] : COLORS.gray[600],
                        backgroundColor: currentPage === 1 ? COLORS.gray[50] : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className="flex items-center justify-center font-medium transition-colors"
                          style={{
                            width: 32, height: 32, borderRadius: RADIUS.button,
                            fontSize: TYPE.caption,
                            backgroundColor: currentPage === page ? '#ea580c' : 'transparent',
                            color: currentPage === page ? 'white' : COLORS.gray[600],
                            border: currentPage === page ? 'none' : `1px solid ${COLORS.gray[200]}`,
                          }}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center transition-colors"
                      style={{
                        width: 32, height: 32, borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[200]}`,
                        color: currentPage === totalPages ? COLORS.gray[300] : COLORS.gray[600],
                        backgroundColor: currentPage === totalPages ? COLORS.gray[50] : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Manager Allocation Grid */}
        <motion.div variants={fadeInUp}>
          <h3 style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Manager Allocations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" style={{ gap: GRID.spacing.md }}>
            {managerAllocations.map(alloc => {
              const total = alloc.total;
              const statusColors: Record<string, string> = {
                pool: '#8b5cf6', distributed: '#3b82f6', assigned: '#f59e0b',
                in_progress: '#ea580c', converted: '#10b981', lost: '#ef4444',
              };
              return (
                <motion.div
                  key={alloc.manager}
                  variants={scaleIn}
                  whileHover={{ y: -2, scale: 1.005 }}
                  transition={{ duration: MOTION.duration.hover }}
                  onClick={() => setSelectedManagerName(alloc.manager)}
                  className="cursor-pointer"
                >
                  <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent style={{ padding: GRID.spacing.md }}>
                      <div style={{ marginBottom: GRID.spacing.xs }}>
                        <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>{alloc.manager}</p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{alloc.teamName}</p>
                      </div>
                      <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.xs }}>
                        {total}
                      </p>
                      {/* Mini colored bar */}
                      <div className="flex overflow-hidden" style={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.gray[200] }}>
                        {total > 0 && Object.entries(alloc.byStatus).map(([status, count]) => (
                          <div
                            key={status}
                            style={{
                              width: `${(count / total) * 100}%`,
                              height: '100%',
                              backgroundColor: statusColors[status] ?? COLORS.gray[400],
                              transition: 'width 0.4s ease',
                            }}
                          />
                        ))}
                      </div>
                      {/* Legend micro text */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1" style={{ marginTop: GRID.spacing.xs }}>
                        {Object.entries(alloc.byStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center gap-1">
                            <span style={{ width: 6, height: 6, borderRadius: RADIUS.pill, backgroundColor: statusColors[status] ?? COLORS.gray[400], display: 'inline-block' }} />
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                              {LEAD_STATUS_CFG[status]?.label ?? status} ({count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 6. Distribution History */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardContent style={{ padding: GRID.spacing.md }}>
              <h4 style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900], marginBottom: GRID.spacing.sm }}>Distribution History</h4>
              <div className="space-y-3">
                {DEMO_EXEC_DISTRIBUTION_HISTORY.slice(0, 5).map(record => {
                  const methodColors: Record<string, { bg: string; text: string }> = {
                    even: { bg: '#ecfdf5', text: '#059669' },
                    weighted: { bg: '#eff6ff', text: '#2563eb' },
                    manual: { bg: '#fef3c7', text: '#d97706' },
                  };
                  const mc = methodColors[record.method] ?? methodColors.even;
                  return (
                    <div key={record.id} className="flex items-center gap-3" style={{ padding: `${GRID.spacing.xs}px 0`, borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                      <div className="flex-shrink-0 flex items-center justify-center" style={{
                        width: 32, height: 32, borderRadius: RADIUS.pill, backgroundColor: '#fff7ed',
                      }}>
                        <Send className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>
                          {record.leadsDistributed} leads → {record.managersCount} managers
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>{record.date}</p>
                      </div>
                      <span
                        className="inline-flex items-center font-medium"
                        style={{
                          fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill,
                          backgroundColor: mc.bg, color: mc.text,
                        }}
                      >
                        {record.method.charAt(0).toUpperCase() + record.method.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={closeDrawer}
            />
            {/* Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: 560 }}
              animate={{ x: 0 }}
              exit={{ x: 560 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto overflow-x-hidden"
              style={{
                width: 560,
                backgroundColor: '#fafafa',
                border: 'none',
                boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Animated level transitions */}
              <AnimatePresence mode="wait">
                {/* Level 1: Manager lead list (only when manager selected, no lead selected) */}
                {selectedManagerName && !selectedLeadId && (
                  <motion.div
                    key="manager-leads"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <ManagerDrawerHeader />
                    <ManagerLeadList />
                  </motion.div>
                )}

                {/* Level 2: Lead detail */}
                {selectedLeadId && !showTimeline && (
                  <motion.div
                    key="lead-detail"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {selectedManagerName ? <ManagerDrawerHeader /> : <LeadDrawerHeader />}
                    <LeadDetailContent />
                  </motion.div>
                )}

                {/* Level 3: Activity Timeline */}
                {selectedLeadId && showTimeline && (
                  <motion.div
                    key="activity-timeline"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {selectedManagerName ? <ManagerDrawerHeader /> : <LeadDrawerHeader />}
                    <ActivityTimelineContent />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ExecutiveLoungeLayout>
  );
}

// ─── INFO CELL (icon + label + value) ──────────────

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-stone-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{label}</p>
        <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{value}</p>
      </div>
    </div>
  );
}

// ─── DETAIL CELL (label + value) ────────────────────

function DetailCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{label}</p>
      <p className="font-medium" style={{ fontSize: TYPE.meta, color: highlight ? '#ea580c' : COLORS.gray[900] }}>{value}</p>
    </div>
  );
}

export { ExecutiveLeadDistribution };
export default ExecutiveLeadDistribution;
