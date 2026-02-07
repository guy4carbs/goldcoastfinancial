import { motion } from "framer-motion";
import {
  Clock, AlertTriangle, Calendar, User,
  Phone, Mail, ChevronRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";

interface RenewalAlertsProps {
  onSelectLead?: (lead: Lead) => void;
  limit?: number;
}

export function RenewalAlerts({ onSelectLead, limit }: RenewalAlertsProps) {
  const { getRenewalAlerts } = useAgentStore();
  const renewals = getRenewalAlerts();

  const displayedRenewals = limit ? renewals.slice(0, limit) : renewals;

  if (renewals.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <RefreshCw className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-gray-900">No Renewals Due</p>
        <p className="text-sm text-gray-500 mt-1">
          All policies are current. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedRenewals.map(({ lead, daysUntilExpiration, product }) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className={cn(
            "p-4 rounded-xl border cursor-pointer transition-all",
            daysUntilExpiration <= 14
              ? "bg-red-50 border-red-200"
              : daysUntilExpiration <= 30
              ? "bg-amber-50 border-amber-200"
              : "bg-blue-50 border-blue-200"
          )}
          onClick={() => onSelectLead?.(lead)}
        >
          <div className="flex items-start gap-3">
            {/* Urgency Icon */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              daysUntilExpiration <= 14
                ? "bg-red-100"
                : daysUntilExpiration <= 30
                ? "bg-amber-100"
                : "bg-blue-100"
            )}>
              {daysUntilExpiration <= 14 ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{lead.name}</h4>
                <Badge className={cn(
                  "text-[10px] px-1.5 py-0",
                  daysUntilExpiration <= 14
                    ? "bg-red-100 text-red-700"
                    : daysUntilExpiration <= 30
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
                )}>
                  {daysUntilExpiration <= 0
                    ? "Expired"
                    : daysUntilExpiration === 1
                    ? "1 day"
                    : `${daysUntilExpiration} days`}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {product}
                </span>
                {lead.carrier && (
                  <span>{lead.carrier}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">
                  Expires: {lead.policyExpirationDate && new Date(lead.policyExpirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Would trigger call
                }}
              >
                <Phone className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Would trigger email
                }}
              >
                <Mail className="w-3 h-3" />
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-300 mx-auto" />
            </div>
          </div>
        </motion.div>
      ))}

      {limit && renewals.length > limit && (
        <p className="text-center text-sm text-gray-500 pt-2">
          +{renewals.length - limit} more renewals due
        </p>
      )}
    </div>
  );
}
