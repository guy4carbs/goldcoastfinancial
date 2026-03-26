import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

interface RecordingsFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  direction: string;
  onDirectionChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export function RecordingsFilter({
  search, onSearchChange,
  direction, onDirectionChange,
  status, onStatusChange,
  dateRange, onDateRangeChange,
  sortBy, onSortByChange,
}: RecordingsFilterProps) {
  return (
    <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>

          {/* Direction */}
          <Select value={direction} onValueChange={onDirectionChange}>
            <SelectTrigger className="w-[130px] h-9" style={{ borderRadius: RADIUS.input }}>
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calls</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px] h-9" style={{ borderRadius: RADIUS.input }}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[140px] h-9" style={{ borderRadius: RADIUS.input }}>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px] h-9" style={{ borderRadius: RADIUS.input }}>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="longest">Longest</SelectItem>
              <SelectItem value="shortest">Shortest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
