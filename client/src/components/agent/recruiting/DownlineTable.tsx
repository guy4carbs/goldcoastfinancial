import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { RADIUS, SHADOW, GRID, TYPE, fadeInUp } from "@/lib/heritageDesignSystem";
import type { DownlineAgent } from "@/lib/agentStore";

interface DownlineTableProps {
  agents: DownlineAgent[];
}

type SortField =
  | "name"
  | "status"
  | "stateLicensed"
  | "applicationStage"
  | "dateJoined"
  | "productionVolume"
  | "overrideEarnings";
type SortDirection = "asc" | "desc";

const STATUS_FILTERS = ["all", "active", "inactive", "probation"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_COLORS: Record<DownlineAgent["status"], { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  probation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DownlineTable({ agents }: DownlineTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...agents];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.email.toLowerCase().includes(query) ||
          agent.phone.includes(query) ||
          agent.stateLicensed.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((agent) => agent.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "stateLicensed":
          return dir * a.stateLicensed.localeCompare(b.stateLicensed);
        case "applicationStage":
          return dir * a.applicationStage.localeCompare(b.applicationStage);
        case "dateJoined":
          return dir * (new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime());
        case "productionVolume":
          return dir * (a.productionVolume - b.productionVolume);
        case "overrideEarnings":
          return dir * (a.overrideEarnings - b.overrideEarnings);
        default:
          return 0;
      }
    });

    return result;
  }, [agents, search, statusFilter, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5 hover:text-gray-900 transition-colors duration-150 cursor-pointer select-none"
    >
      {children}
      <ArrowUpDown
        className={`w-3.5 h-3.5 transition-colors ${
          sortField === field ? "text-violet-600" : "text-gray-300"
        }`}
      />
    </button>
  );

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <div
        className="bg-white/80 backdrop-blur-xl border border-gray-100 overflow-hidden"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.level2,
          padding: GRID.spacing.md,
        }}
      >
        {/* Search + Filter Bar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ marginBottom: GRID.spacing.md, gap: GRID.spacing.sm }}
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents by name, email, phone, or state..."
              className="pl-10 bg-gray-50/80 border-gray-200 focus:bg-white"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div
            className="flex items-center bg-gray-100/80 p-1"
            style={{ borderRadius: RADIUS.pill, gap: 4 }}
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 font-medium capitalize transition-all duration-200 ${
                  statusFilter === filter
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  borderRadius: RADIUS.pill,
                  fontSize: TYPE.meta,
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredAndSorted.length > 0 ? (
          <div className="overflow-x-auto" style={{ borderRadius: RADIUS.input }}>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="name">Agent Name</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="status">Status</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="stateLicensed">State Licensed</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="applicationStage">Stage</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="dateJoined">Date Joined</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500 text-right" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="productionVolume">Production Volume</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-500 text-right" style={{ fontSize: TYPE.caption }}>
                    <SortableHeader field="overrideEarnings">Override Earnings</SortableHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((agent) => {
                  const statusColor = STATUS_COLORS[agent.status];
                  return (
                    <TableRow
                      key={agent.id}
                      className="border-gray-50 transition-colors duration-150 hover:bg-gray-50/60 cursor-pointer"
                    >
                      {/* Agent Name with Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(agent.name)}`}
                          >
                            {getInitials(agent.name)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-gray-900 truncate"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {agent.name}
                            </p>
                            <p
                              className="text-gray-400 truncate"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {agent.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColor.bg} ${statusColor.text} border-transparent capitalize`}
                          style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusColor.dot}`} />
                          {agent.status}
                        </Badge>
                      </TableCell>

                      {/* State Licensed */}
                      <TableCell>
                        <span className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                          {agent.stateLicensed}
                        </span>
                      </TableCell>

                      {/* Application Stage */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-transparent capitalize ${
                            agent.applicationStage === "activated"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                          style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
                        >
                          {agent.applicationStage}
                        </Badge>
                      </TableCell>

                      {/* Date Joined */}
                      <TableCell>
                        <span className="text-gray-600" style={{ fontSize: TYPE.meta }}>
                          {formatDate(agent.dateJoined)}
                        </span>
                      </TableCell>

                      {/* Production Volume */}
                      <TableCell className="text-right">
                        <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {formatMoney(agent.productionVolume)}
                        </span>
                      </TableCell>

                      {/* Override Earnings */}
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600" style={{ fontSize: TYPE.meta }}>
                          {formatMoney(agent.overrideEarnings)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Empty State */
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            style={{ gap: GRID.spacing.sm }}
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p
                className="font-semibold text-gray-700"
                style={{ fontSize: TYPE.body }}
              >
                No agents found
              </p>
              <p
                className="text-gray-400 mt-1"
                style={{ fontSize: TYPE.meta }}
              >
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Your downline will appear here once agents are recruited."}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
