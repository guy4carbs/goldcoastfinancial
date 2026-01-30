import { Clock, CheckCircle, FileEdit, Archive } from "lucide-react";

type ContentStatus = "draft" | "scheduled" | "published" | "archived";

interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<ContentStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  draft: {
    label: "Draft",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: FileEdit,
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Clock,
  },
  published: {
    label: "Published",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  archived: {
    label: "Archived",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Archive,
  },
};

export default function ContentStatusBadge({
  status,
  className = "",
  showIcon = true,
}: ContentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
