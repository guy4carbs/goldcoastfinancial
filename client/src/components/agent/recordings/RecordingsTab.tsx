import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staggerContainer } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { RecordingsStats } from "./RecordingsStats";
import { RecordingsFilter } from "./RecordingsFilter";
import { RecordingsList } from "./RecordingsList";
import { RecordingDetailPanel } from "./RecordingDetailPanel";

export function RecordingsTab() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Debounced search for query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeout = useMemo(() => {
    return (value: string) => {
      const id = setTimeout(() => setDebouncedSearch(value), 300);
      return () => clearTimeout(id);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    searchTimeout(value);
  };

  // Reset page when filters change
  const handleFilterChange = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(0);
  };

  // Build query params
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (direction !== "all") queryParams.set("direction", direction);
  if (status !== "all") queryParams.set("status", status);
  if (dateRange !== "all") queryParams.set("dateRange", dateRange);
  queryParams.set("sortBy", sortBy);
  queryParams.set("limit", String(itemsPerPage));
  queryParams.set("offset", String(page * itemsPerPage));

  // Recordings list
  const { data: recordingsData, isLoading } = useQuery<any>({
    queryKey: [`/api/calls/recordings?${queryParams.toString()}`],
  });

  // Stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/calls/recordings/stats"],
  });

  // Selected recording detail (for analysis data)
  const { data: selectedDetail } = useQuery<any>({
    queryKey: [`/api/calls/${selectedId}`],
    enabled: !!selectedId,
  });

  // Find selected recording from list
  const selectedRecording = (recordingsData?.recordings || []).find(
    (r: any) => r.id === selectedId
  );

  // Notes mutation
  const notesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      await apiRequest("PATCH", `/api/calls/${id}/notes`, { notes });
    },
    onSuccess: () => {
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: [`/api/calls/recordings`] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save notes"),
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <RecordingsStats stats={stats} />

      <RecordingsFilter
        search={search}
        onSearchChange={handleSearchChange}
        direction={direction}
        onDirectionChange={handleFilterChange(setDirection)}
        status={status}
        onStatusChange={handleFilterChange(setStatus)}
        dateRange={dateRange}
        onDateRangeChange={handleFilterChange(setDateRange)}
        sortBy={sortBy}
        onSortByChange={handleFilterChange(setSortBy)}
      />

      <RecordingsList
        recordings={recordingsData?.recordings || []}
        totalCount={recordingsData?.totalCount || 0}
        page={page}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => { setItemsPerPage(size); setPage(0); }}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
        isLoading={isLoading}
        detailPanel={
          selectedId && selectedRecording ? (
            <RecordingDetailPanel
              recording={selectedRecording}
              analysis={selectedDetail?.analysis || null}
              onClose={() => setSelectedId(null)}
              onNotesUpdate={(id, notes) => notesMutation.mutate({ id, notes })}
              isSavingNotes={notesMutation.isPending}
            />
          ) : undefined
        }
      />
    </motion.div>
  );
}
