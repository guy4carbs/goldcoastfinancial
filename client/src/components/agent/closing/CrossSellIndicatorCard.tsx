import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";

interface CrossSellIndicatorCardProps {
  leadId: string;
}

const priorityStyles: Record<string, string> = {
  high: "bg-violet-100 text-violet-700 border-transparent",
  medium: "bg-amber-100 text-amber-700 border-transparent",
  low: "bg-gray-100 text-gray-600 border-transparent",
};

export function CrossSellIndicatorCard({ leadId }: CrossSellIndicatorCardProps) {
  const { data: crossSellResponse } = useQuery<{
    success: boolean;
    data: {
      currentCoverage: string;
      coverageAmount: number;
      clientName: string;
      recommendations: Array<{
        product: string;
        reason: string;
        priority: "high" | "medium" | "low";
      }>;
    };
  }>({
    queryKey: [`/api/post-close/${leadId}/cross-sell`],
    enabled: !!leadId,
  });

  const recommendations = crossSellResponse?.data?.recommendations ?? [];

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="border-0"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Coverage Opportunities
            </h3>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <Badge
                    className={priorityStyles[rec.priority] ?? priorityStyles.low}
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {rec.product}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              <span>Full coverage in place</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
