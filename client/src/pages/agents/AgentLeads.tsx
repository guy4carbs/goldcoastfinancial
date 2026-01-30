import { useState, useMemo, useRef, memo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore, Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LogCallModal } from "@/components/agent/LogCallModal";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { Pagination, usePagination } from "@/components/agent/primitives/Pagination";
import { useConfirm } from "@/components/agent/primitives/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  Upload,
  Download,
  Trash2,
  CheckSquare,
  X
} from "lucide-react";
import { cn, formatPhone, formatRelativeDate, openGoogleCalendar } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = 'kanban' | 'table';
type LeadStatus = Lead['status'];

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-600", bgColor: "bg-blue-500" },
  contacted: { label: "Contacted", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  qualified: { label: "Qualified", color: "text-purple-600", bgColor: "bg-purple-500" },
  proposal: { label: "Proposal", color: "text-green-600", bgColor: "bg-green-500" },
  closed: { label: "Closed", color: "text-emerald-600", bgColor: "bg-emerald-500" },
  lost: { label: "Lost", color: "text-gray-600", bgColor: "bg-gray-500" },
};

const statusOrder: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'closed', 'lost'];

function HighlightText({ text, query }: { text: string; query: string }): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark> : part
  );
}

export default function AgentLeads() {
  const { leads, updateLeadStatus, currentUser, addLead, logCall, addActivityToLead, bulkUpdateLeadStatus, importLeads, deleteLeads } = useAgentStore();
  const confirm = useConfirm();
  const { trackAgentLeadViewed } = useAnalytics();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [showClosedLost, setShowClosedLost] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      const matchesProduct = filterProduct === 'all' || lead.product === filterProduct;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [leads, searchQuery, filterStatus, filterProduct]);

  // Pagination for table view
  const tablePagination = usePagination(filteredLeads, 10);

  // Group leads by status for Kanban
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      closed: [],
      lost: [],
    };
    filteredLeads.forEach(lead => {
      grouped[lead.status].push(lead);
    });
    return grouped;
  }, [filteredLeads]);

  // Get unique products for filter
  const products = useMemo(() => {
    const productSet = new Set(leads.map(l => l.product).filter(Boolean));
    return Array.from(productSet);
  }, [leads]);

  // Bulk selection handlers
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const selectAllLeads = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const clearSelection = () => {
    setSelectedLeadIds(new Set());
  };

  const handleBulkStatusUpdate = (status: LeadStatus) => {
    const count = selectedLeadIds.size;
    bulkUpdateLeadStatus(Array.from(selectedLeadIds), status);
    toast.success(`Updated ${count} leads to ${statusConfig[status].label}`);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    const count = selectedLeadIds.size;
    const confirmed = await confirm({
      title: 'Delete Leads',
      description: `Are you sure you want to delete ${count} selected lead(s)? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteLeads(Array.from(selectedLeadIds));
      toast.success(`Deleted ${count} leads`);
      clearSelection();
    }
  };

  // CSV Import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const newLeads: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo' | 'statusHistory'>[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const lead: any = { status: 'new' as const };

          headers.forEach((header, idx) => {
            if (header === 'name') lead.name = values[idx];
            else if (header === 'email') lead.email = values[idx];
            else if (header === 'phone') lead.phone = values[idx];
            else if (header === 'source') lead.source = values[idx] || 'CSV Import';
            else if (header === 'product') lead.product = values[idx];
            else if (header === 'state') lead.state = values[idx];
          });

          if (lead.name && lead.email) {
            lead.source = lead.source || 'CSV Import';
            newLeads.push(lead as Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo' | 'statusHistory'>);
          }
        }

        if (newLeads.length > 0) {
          importLeads(newLeads);
          toast.success(`Imported ${newLeads.length} leads successfully`);
        } else {
          toast.error('No valid leads found in CSV');
        }
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // CSV Export
  const handleExportCSV = () => {
    const leadsToExport = selectedLeadIds.size > 0
      ? leads.filter(l => selectedLeadIds.has(l.id))
      : filteredLeads;

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Source', 'Product', 'State', 'Created Date', 'Last Contact'];
    const rows = leadsToExport.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.status,
      lead.source,
      lead.product || '',
      lead.state || '',
      lead.createdDate,
      lead.lastContactDate || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${leadsToExport.length} leads`);
  };

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: LeadStatus) => {
    if (draggedLead) {
      const lead = leads.find(l => l.id === draggedLead);
      if ((status === 'closed' || status === 'lost') && lead) {
        const confirmed = await confirm({
          title: `Move to ${statusConfig[status].label}?`,
          description: `Are you sure you want to mark "${lead.name}" as ${statusConfig[status].label.toLowerCase()}? This typically indicates a final status.`,
          confirmLabel: `Move to ${statusConfig[status].label}`,
          cancelLabel: 'Cancel',
          variant: status === 'lost' ? 'warning' : 'info',
        });
        if (!confirmed) {
          setDraggedLead(null);
          return;
        }
      }
      updateLeadStatus(draggedLead, status);
      setDraggedLead(null);
      toast.success(`Lead moved to ${statusConfig[status].label}`, {
        description: lead ? `${lead.name} status updated` : undefined
      });
    }
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
    trackAgentLeadViewed(lead.id, lead.name);
  };

  const LeadCard = memo(({ lead }: { lead: Lead }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      draggable
      onDragStart={() => handleDragStart(lead.id)}
      onClick={() => openLeadDetail(lead)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLeadDetail(lead);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Lead: ${lead.name}, Status: ${statusConfig[lead.status].label}, Source: ${lead.source}`}
      className={cn(
        "bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer",
        "hover:shadow-md hover:border-violet-500/30 transition-all",
        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
        draggedLead === lead.id && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-medium text-sm">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">
              <HighlightText text={lead.name} query={searchQuery} />
            </p>
            <p className="text-[10px] text-gray-500">{lead.source}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Lead actions">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setSelectedLead(lead);
              setShowLogCall(true);
            }}>
              <Phone className="w-4 h-4 mr-2" /> Log Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${lead.email}?subject=Following up on your life insurance inquiry`;
            }}>
              <Mail className="w-4 h-4 mr-2" /> Send Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              openGoogleCalendar(lead.name, lead.phone, lead.email, lead.product);
            }}>
              <Calendar className="w-4 h-4 mr-2" /> Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {lead.product && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Tag className="w-3 h-3" />
            {lead.product}
          </div>
        )}
        {lead.state && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            {lead.state}
          </div>
        )}
        {lead.lastContactDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatRelativeDate(lead.lastContactDate)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          aria-label={`Call ${lead.name}`}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${lead.phone}`;
          }}
        >
          <Phone className="w-3 h-3 mr-1" /> Call
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          aria-label={`Email ${lead.name}`}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `mailto:${lead.email}`;
          }}
        >
          <Mail className="w-3 h-3 mr-1" /> Email
        </Button>
      </div>
    </motion.div>
  ));

  const KanbanColumn = ({ status }: { status: LeadStatus }) => {
    const config = statusConfig[status];
    const columnLeads = leadsByStatus[status];

    // Don't show closed/lost columns if empty
    if ((status === 'closed' || status === 'lost') && columnLeads.length === 0) {
      return null;
    }

    return (
      <div
        className="flex-shrink-0 w-[300px] lg:w-auto lg:flex-1"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(status)}
      >
        <div className={cn(
          "rounded-t-lg px-3 py-2 flex items-center justify-between",
          "bg-gradient-to-r from-gray-100 to-transparent"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", config.bgColor)} />
            <span className="font-medium text-sm text-gray-700">{config.label}</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {columnLeads.length}
            </Badge>
          </div>
        </div>

        <div className={cn(
          "min-h-[400px] p-2 space-y-2 rounded-b-lg",
          "bg-gray-50/50 border border-t-0 border-gray-200",
          draggedLead && "ring-2 ring-violet-500/30 ring-inset"
        )}>
          <AnimatePresence mode="popLayout">
            {columnLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </AnimatePresence>

          {columnLeads.length === 0 && (
            <div className="h-full min-h-[300px] flex items-center justify-center">
              <p className="text-sm text-gray-400">No leads</p>
            </div>
          )}

          {status === 'new' && (
            <Button
              variant="ghost"
              className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-violet-500 hover:text-violet-500"
              onClick={() => setShowAddLead(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          )}
        </div>
      </div>
    );
  };

  const TableView = () => (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0}
                  onCheckedChange={selectAllLeads}
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Contact</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Source</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Last Contact</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tablePagination.paginatedItems.map(lead => (
              <tr
                key={lead.id}
                className={cn(
                  "border-b border-gray-100 hover:bg-gray-50 cursor-pointer",
                  selectedLeadIds.has(lead.id) && "bg-violet-50"
                )}
                onClick={() => openLeadDetail(lead)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLeadIds.has(lead.id)}
                    onCheckedChange={() => toggleLeadSelection(lead.id)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        <HighlightText text={lead.name} query={searchQuery} />
                      </p>
                      <p className="text-xs text-gray-500">{lead.state}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm">{formatPhone(lead.phone)}</p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </td>
                <td className="p-4">
                  <span className="text-sm">{lead.product || '-'}</span>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={cn("text-xs", statusConfig[lead.status].color)}>
                    {statusConfig[lead.status].label}
                  </Badge>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">{lead.source}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">
                    {lead.lastContactDate ? formatRelativeDate(lead.lastContactDate) : '-'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Call ${lead.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${lead.phone}`;
                      }}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Email ${lead.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${lead.email}`;
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`View ${lead.name} details`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLeadDetail(lead);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tablePagination.totalItems > tablePagination.itemsPerPage && (
        <div className="border-t border-gray-100 p-4">
          <Pagination
            currentPage={tablePagination.currentPage}
            totalPages={tablePagination.totalPages}
            onPageChange={tablePagination.goToPage}
            itemsPerPage={tablePagination.itemsPerPage}
            onItemsPerPageChange={tablePagination.changeItemsPerPage}
            totalItems={tablePagination.totalItems}
            itemsPerPageOptions={[10, 25, 50]}
          />
        </div>
      )}
    </Card>
  );

  return (
    <AgentLoungeLayout>
      {/* Modals */}
      <AddLeadModal open={showAddLead} onOpenChange={setShowAddLead} onAddLead={addLead} existingLeads={leads} />
      <LogCallModal
        open={showLogCall}
        onOpenChange={setShowLogCall}
        leads={leads}
        onLogCall={logCall}
      />
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAddActivity={addActivityToLead}
        onUpdateStatus={updateLeadStatus}
      />

      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleImportCSV}
        className="hidden"
      />

      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Leads</h1>
            <p className="text-sm text-gray-600">Manage your pipeline and track prospects</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddLead(true)} className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLeadIds.size > 0 && (
          <Card className="border-violet-200 bg-violet-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-violet-600" />
                  <span className="font-medium text-violet-900">
                    {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {statusOrder.map(status => (
                        <DropdownMenuItem key={status} onClick={() => handleBulkStatusUpdate(status)}>
                          <div className={cn("w-2 h-2 rounded-full mr-2", statusConfig[status].bgColor)} />
                          {statusConfig[status].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-1" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters & View Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOrder.map(status => (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger className="w-[140px]">
                    <Tag className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product} value={product!}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="h-8"
                    aria-label="Kanban view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8"
                    aria-label="Table view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Count Summary */}
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-primary">{filteredLeads.length}</span> leads
          </p>
          <div className="flex items-center gap-2">
            {statusOrder.slice(0, 4).map(status => (
              <Badge
                key={status}
                variant="outline"
                className={cn("text-xs", statusConfig[status].color)}
              >
                {statusConfig[status].label}: {leadsByStatus[status].length}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredLeads.length === 0 && (searchQuery || filterStatus !== 'all' || filterProduct !== 'all') ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No leads match your filters</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterProduct('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
            {statusOrder.slice(0, 4).map(status => (
              <KanbanColumn key={status} status={status} />
            ))}
          </div>
        ) : (
          <TableView />
        )}

        {/* Closed/Lost Summary */}
        {(leadsByStatus.closed.length > 0 || leadsByStatus.lost.length > 0) && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-emerald-600">
                    Closed: {leadsByStatus.closed.length}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    Lost: {leadsByStatus.lost.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowClosedLost(!showClosedLost)}>
                  {showClosedLost ? 'Hide' : 'View All'} <ArrowRight className={cn("w-4 h-4 ml-1 transition-transform", showClosedLost && "rotate-90")} />
                </Button>
              </div>

              {/* Expanded Closed/Lost Leads */}
              <AnimatePresence>
                {showClosedLost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Closed Leads */}
                      {leadsByStatus.closed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-600 mb-2">Closed Leads</h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {leadsByStatus.closed.map(lead => (
                              <div
                                key={lead.id}
                                onClick={() => openLeadDetail(lead)}
                                className="bg-white p-3 rounded-lg border border-emerald-200 cursor-pointer hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-xs">
                                    {lead.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{lead.name}</p>
                                    <p className="text-xs text-gray-500">{lead.product || 'No product'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lost Leads */}
                      {leadsByStatus.lost.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Lost Leads</h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {leadsByStatus.lost.map(lead => (
                              <div
                                key={lead.id}
                                onClick={() => openLeadDetail(lead)}
                                className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                                    {lead.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{lead.name}</p>
                                    <p className="text-xs text-gray-500">{lead.product || 'No product'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}
      </div>
    </AgentLoungeLayout>
  );
}
