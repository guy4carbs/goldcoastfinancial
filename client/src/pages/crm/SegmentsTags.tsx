/**
 * Segments & Tags
 * Organize leads with tags and smart segments
 * Updated with Heritage Design System
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tags,
  Flame,
  Clock,
  DollarSign,
  Bell,
  UserX,
  Sparkles,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  Hash,
  Users,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';

// =============================================================================
// TYPES
// =============================================================================

interface Tag {
  name: string;
  count: number;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
  count: number;
  filters?: Record<string, any>;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  pipelineStage: string;
  leadScore: number;
  scoreTier: string;
  estimatedValue: number;
  source: string;
  assignedTo: string | null;
  tags: string[];
  createdAt: string;
}

// =============================================================================
// API
// =============================================================================

async function fetchTags(): Promise<{ tags: Tag[]; untaggedCount: number }> {
  const res = await fetch('/api/crm/tags', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

async function fetchSegments(): Promise<{ segments: Segment[] }> {
  const res = await fetch('/api/crm/segments', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch segments');
  return res.json();
}

async function fetchSegmentLeads(segmentId: string, page: number = 1): Promise<{ leads: Lead[]; pagination: any }> {
  const res = await fetch(`/api/crm/segments/${segmentId}/leads?page=${page}&limit=25`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch segment leads');
  return res.json();
}

async function deleteTag(tag: string): Promise<void> {
  const res = await fetch(`/api/crm/tags/${encodeURIComponent(tag)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete tag');
}

// =============================================================================
// COMPONENTS
// =============================================================================

function SegmentIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, any> = {
    flame: Flame,
    clock: Clock,
    'dollar-sign': DollarSign,
    bell: Bell,
    'user-x': UserX,
    sparkles: Sparkles,
    filter: Filter,
  };
  const Icon = icons[icon] || Filter;
  return <Icon className={className} />;
}

function SegmentCard({
  segment,
  onClick,
  isSelected,
}: {
  segment: Segment;
  onClick: () => void;
  isSelected: boolean;
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 border-red-200 hover:border-red-400',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    gray: 'bg-gray-50 border-gray-200 hover:border-gray-400',
    violet: 'bg-violet-50 border-violet-200 hover:border-violet-400',
  };

  const iconColorMap: Record<string, string> = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    violet: 'text-violet-600',
  };

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all",
          colorMap[segment.color] || colorMap.gray,
          isSelected && "ring-2 ring-indigo-500"
        )}
        onClick={onClick}
        style={{ borderRadius: RADIUS.card }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                `bg-${segment.color}-100`
              )}>
                <SegmentIcon
                  icon={segment.icon}
                  className={cn("w-5 h-5", iconColorMap[segment.color] || iconColorMap.gray)}
                />
              </div>
              <div>
                <h3 className="font-semibold">{segment.name}</h3>
                <p className="text-sm text-gray-500">{segment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {segment.count}
              </Badge>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TagCloud({
  tags,
  untaggedCount,
  onTagClick,
  onDeleteTag,
}: {
  tags: Tag[];
  untaggedCount: number;
  onTagClick: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (showDeleteDialog) {
      onDeleteTag(showDeleteDialog);
      setShowDeleteDialog(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          style={{ borderRadius: RADIUS.input }}
        />
      </div>

      <motion.div
        className="flex flex-wrap gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filteredTags.map((tag, index) => (
          <motion.div
            key={tag.name}
            variants={scaleIn}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Badge
              variant="outline"
              className="px-3 py-1.5 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 group transition-colors"
              onClick={() => onTagClick(tag.name)}
            >
              <Hash className="w-3 h-3 mr-1 text-indigo-400" />
              {tag.name}
              <span className="ml-2 text-gray-400">{tag.count}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(tag.name);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
              </button>
            </Badge>
          </motion.div>
        ))}

        {filteredTags.length === 0 && tags.length > 0 && (
          <p className="text-gray-500 text-sm">No tags match your search</p>
        )}

        {tags.length === 0 && (
          <p className="text-gray-500 text-sm">No tags created yet</p>
        )}
      </motion.div>

      {untaggedCount > 0 && (
        <div className="text-sm text-gray-500">
          {untaggedCount} lead{untaggedCount !== 1 ? 's' : ''} without tags
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the tag "{showDeleteDialog}" from all leads?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SegmentLeadsList({
  segment,
  onClose,
}: {
  segment: Segment;
  onClose: () => void;
}) {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['crm', 'segment-leads', segment.id, page],
    queryFn: () => fetchSegmentLeads(segment.id, page),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const { leads, pagination } = data || { leads: [], pagination: { total: 0, totalPages: 1 } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{segment.name}</h3>
          <p className="text-sm text-gray-500">{pagination.total} leads</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/crm/leads/${lead.id}`)}
            >
              <TableCell className="font-medium">
                {lead.firstName} {lead.lastName}
              </TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>
                <Badge variant={
                  lead.scoreTier === 'on_fire' ? 'destructive' :
                  lead.scoreTier === 'hot' ? 'default' :
                  lead.scoreTier === 'warm' ? 'secondary' : 'outline'
                }>
                  {lead.leadScore || 0}
                </Badge>
              </TableCell>
              <TableCell>${(lead.estimatedValue || 0).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline">{lead.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {leads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No leads in this segment</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function SegmentsTags() {
  const queryClient = useQueryClient();
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['crm', 'tags'],
    queryFn: fetchTags,
  });

  const { data: segmentsData, isLoading: segmentsLoading } = useQuery({
    queryKey: ['crm', 'segments'],
    queryFn: fetchSegments,
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'tags'] });
      toast.success('Tag deleted');
    },
    onError: () => {
      toast.error('Failed to delete tag');
    },
  });

  const handleTagClick = (tag: string) => {
    // Navigate to contacts with tag filter
    window.location.href = `/crm/contacts?tag=${encodeURIComponent(tag)}`;
  };

  return (
    <CRMLoungeLayout>
      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Header */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden mb-6" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 lg:p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Segments & Tags</h1>
                <p className="text-indigo-100 text-lg">Organize your leads with smart segments and custom tags</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-3 gap-6">
          {/* Segments Column */}
          <motion.div className="col-span-2 space-y-6" variants={fadeInUp}>
            <Card style={{ borderRadius: RADIUS.card }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Smart Segments
                </CardTitle>
                <CardDescription>
                  Pre-built segments that automatically group leads based on criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {segmentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {segmentsData?.segments.map((segment) => (
                      <SegmentCard
                        key={segment.id}
                        segment={segment}
                        onClick={() => setSelectedSegment(segment)}
                        isSelected={selectedSegment?.id === segment.id}
                      />
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Segment Leads */}
            {selectedSegment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
              >
                <Card style={{ borderRadius: RADIUS.card }}>
                  <CardContent className="p-6">
                    <SegmentLeadsList
                      segment={selectedSegment}
                      onClose={() => setSelectedSegment(null)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Tags Column */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <Card style={{ borderRadius: RADIUS.card }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-indigo-600" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Custom labels to categorize your leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <TagCloud
                    tags={tagsData?.tags || []}
                    untaggedCount={tagsData?.untaggedCount || 0}
                    onTagClick={handleTagClick}
                    onDeleteTag={(tag) => deleteTagMutation.mutate(tag)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <motion.div
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card style={{ borderRadius: RADIUS.card }}>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Tags</span>
                    <Badge variant="secondary">{tagsData?.tags.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tagged Leads</span>
                    <Badge variant="secondary">
                      {tagsData?.tags.reduce((sum, t) => sum + t.count, 0) || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Untagged Leads</span>
                    <Badge variant="outline">{tagsData?.untaggedCount || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </CRMLoungeLayout>
  );
}

export default SegmentsTags;
