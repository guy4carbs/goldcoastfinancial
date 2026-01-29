/**
 * CarrierComparison - Side-by-side carrier comparison component
 *
 * Allows agents to compare multiple carriers across products, features,
 * underwriting approaches, and support information.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Shield,
  Clock,
  DollarSign,
  Check,
  X,
  Minus,
  ChevronDown,
  ChevronUp,
  Filter,
  ExternalLink,
  Phone,
  FileText,
  Scale,
  AlertCircle,
  Globe,
  Calendar,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CarrierInfo,
  ProductType,
  CarrierRating,
  getCarrierById,
  getCarriersByProduct,
  getCarriersByState,
  CARRIERS,
  getProductTypeDisplayName
} from "@/lib/trainingInfrastructure";

interface CarrierComparisonProps {
  productType?: ProductType;
  stateCode?: string;
  maxCarriers?: number;
  className?: string;
}

type ComparisonCategory = "overview" | "products" | "underwriting" | "support";

const productTypeLabels: Record<ProductType, string> = {
  term_life: "Term Life",
  whole_life: "Whole Life",
  iul: "Indexed Universal Life",
  final_expense: "Final Expense",
  fixed_annuity: "Fixed Annuity",
  fia: "Fixed Indexed Annuity"
};

const ratingColors: Record<CarrierRating, string> = {
  "A++": "text-green-700 bg-green-100",
  "A+": "text-green-600 bg-green-50",
  "A": "text-blue-600 bg-blue-50",
  "A-": "text-blue-500 bg-blue-50",
  "B++": "text-amber-600 bg-amber-50",
  "B+": "text-amber-500 bg-amber-50",
  "B": "text-orange-500 bg-orange-50",
  "NR": "text-gray-500 bg-gray-100"
};

// Calculate years in business from founded year
function getYearsInBusiness(foundedYear: number): number {
  return new Date().getFullYear() - foundedYear;
}

export function CarrierComparison({
  productType,
  stateCode,
  maxCarriers = 4,
  className
}: CarrierComparisonProps) {
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory>("overview");
  const [filterProduct, setFilterProduct] = useState<ProductType | "all">(productType || "all");
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");
  const [showFilters, setShowFilters] = useState(false);

  // Get available carriers based on filters
  const availableCarriers = useMemo(() => {
    let carriers = CARRIERS.filter(c => c.isActive);

    if (filterProduct !== "all") {
      carriers = getCarriersByProduct(filterProduct);
    }

    if (stateCode) {
      const stateCarriers = getCarriersByState(stateCode as any);
      carriers = carriers.filter(c => stateCarriers.some(sc => sc.id === c.id));
    }

    // Sort carriers
    const ratingOrder: CarrierRating[] = ["A++", "A+", "A", "A-", "B++", "B+", "B", "NR"];
    return carriers.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rating") {
        return ratingOrder.indexOf(a.amBestRating) - ratingOrder.indexOf(b.amBestRating);
      }
      return 0;
    });
  }, [filterProduct, stateCode, sortBy]);

  // Get selected carrier data
  const comparedCarriers = selectedCarriers
    .map(id => getCarrierById(id))
    .filter((c): c is CarrierInfo => c !== undefined);

  const toggleCarrier = (carrierId: string) => {
    setSelectedCarriers(prev => {
      if (prev.includes(carrierId)) {
        return prev.filter(id => id !== carrierId);
      }
      if (prev.length >= maxCarriers) {
        return [...prev.slice(1), carrierId];
      }
      return [...prev, carrierId];
    });
  };

  const categories: { id: ComparisonCategory; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Building2 className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <FileText className="w-4 h-4" /> },
    { id: "underwriting", label: "Underwriting", icon: <Shield className="w-4 h-4" /> },
    { id: "support", label: "Support", icon: <Phone className="w-4 h-4" /> }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-violet-500" />
              Carrier Comparison
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-500 mb-1 block">Product Type</label>
                    <Select
                      value={filterProduct}
                      onValueChange={(v) => setFilterProduct(v as ProductType | "all")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {Object.entries(productTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-500 mb-1 block">Sort By</label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as typeof sortBy)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="rating">AM Best Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        {/* Carrier Selection */}
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Select up to {maxCarriers} carriers to compare
              {selectedCarriers.length > 0 && (
                <span className="ml-2 text-violet-500 font-medium">
                  ({selectedCarriers.length} selected)
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {availableCarriers.map(carrier => (
                <Button
                  key={carrier.id}
                  variant={selectedCarriers.includes(carrier.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCarrier(carrier.id)}
                  className={cn(
                    "gap-2",
                    selectedCarriers.includes(carrier.id) &&
                    "bg-violet-500 text-primary hover:bg-violet-500/90"
                  )}
                >
                  {selectedCarriers.includes(carrier.id) && <Check className="w-3 h-3" />}
                  {carrier.shortName || carrier.name}
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] ml-1", ratingColors[carrier.amBestRating])}
                  >
                    {carrier.amBestRating}
                  </Badge>
                </Button>
              ))}
            </div>

            {availableCarriers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No carriers match the selected filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {comparedCarriers.length > 0 && (
        <Card>
          {/* Category Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto px-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeCategory === cat.id
                      ? "border-violet-500 text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <CardContent className="p-0">
            {/* Overview Category */}
            {activeCategory === "overview" && (
              <ComparisonTable
                carriers={comparedCarriers}
                rows={[
                  {
                    label: "AM Best Rating",
                    render: (c) => (
                      <Badge className={cn("font-bold", ratingColors[c.amBestRating])}>
                        {c.amBestRating}
                      </Badge>
                    )
                  },
                  {
                    label: "Rating Date",
                    render: (c) => (
                      <span className="text-sm">{c.ratingDate}</span>
                    )
                  },
                  {
                    label: "Years in Business",
                    render: (c) => <span className="text-sm">{getYearsInBusiness(c.foundedYear)} years</span>
                  },
                  {
                    label: "Headquarters",
                    render: (c) => <span className="text-sm">{c.headquarters}</span>
                  },
                  {
                    label: "Key Strengths",
                    render: (c) => (
                      <div className="flex flex-wrap gap-1">
                        {c.strengths.slice(0, 2).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    )
                  },
                  {
                    label: "Website",
                    render: (c) => (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:underline text-sm flex items-center gap-1"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    )
                  },
                  {
                    label: "Agent Portal",
                    render: (c) => (
                      c.agentSupport.portalUrl ? (
                        <a
                          href={c.agentSupport.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-500 hover:underline text-sm flex items-center gap-1"
                        >
                          Access Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-gray-400 text-sm">N/A</span>
                    )
                  }
                ]}
              />
            )}

            {/* Products Category */}
            {activeCategory === "products" && (
              <ComparisonTable
                carriers={comparedCarriers}
                rows={Object.entries(productTypeLabels).map(([type, label]) => ({
                  label,
                  render: (c) => {
                    const product = c.products.find(p => p.productType === type);
                    if (!product) return <X className="w-4 h-4 text-gray-300" />;
                    return (
                      <div className="text-left">
                        <Check className="w-4 h-4 text-green-500 inline" />
                        <p className="text-[10px] text-gray-600 mt-1">{product.productName}</p>
                        <p className="text-[10px] text-gray-400">
                          ${(product.minCoverage / 1000).toFixed(0)}K - ${(product.maxCoverage / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    );
                  }
                }))}
              />
            )}

            {/* Underwriting Category */}
            {activeCategory === "underwriting" && (
              <ComparisonTable
                carriers={comparedCarriers}
                rows={[
                  {
                    label: "Simplified Issue",
                    render: (c) => {
                      const hasSimplified = c.products.some(p => p.underwritingApproach === 'simplified');
                      return hasSimplified
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <X className="w-4 h-4 text-gray-300" />;
                    }
                  },
                  {
                    label: "Accelerated UW",
                    render: (c) => {
                      const hasAccelerated = c.products.some(p => p.underwritingApproach === 'accelerated');
                      return hasAccelerated
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <X className="w-4 h-4 text-gray-300" />;
                    }
                  },
                  {
                    label: "Guaranteed Issue",
                    render: (c) => {
                      const hasGuaranteed = c.products.some(p => p.underwritingApproach === 'guaranteed');
                      return hasGuaranteed
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <X className="w-4 h-4 text-gray-300" />;
                    }
                  },
                  {
                    label: "Fastest Issue Time",
                    render: (c) => {
                      const times = c.products.map(p => p.averageIssueTime).filter(Boolean);
                      return <span className="text-sm">{times[0] || "N/A"}</span>;
                    }
                  },
                  {
                    label: "Min Issue Age",
                    render: (c) => {
                      const minAge = Math.min(...c.products.map(p => p.minIssueAge));
                      return <span className="text-sm">{minAge}</span>;
                    }
                  },
                  {
                    label: "Max Issue Age",
                    render: (c) => {
                      const maxAge = Math.max(...c.products.map(p => p.maxIssueAge));
                      return <span className="text-sm">{maxAge}</span>;
                    }
                  },
                  {
                    label: "Product Training Required",
                    render: (c) => (
                      c.appointmentRequirements.productTraining
                        ? <Check className="w-4 h-4 text-amber-500" />
                        : <X className="w-4 h-4 text-gray-300" />
                    )
                  },
                  {
                    label: "Training Hours",
                    render: (c) => (
                      <span className="text-sm">
                        {c.appointmentRequirements.trainingHours
                          ? `${c.appointmentRequirements.trainingHours} hrs`
                          : "N/A"}
                      </span>
                    )
                  }
                ]}
              />
            )}

            {/* Support Category */}
            {activeCategory === "support" && (
              <ComparisonTable
                carriers={comparedCarriers}
                rows={[
                  {
                    label: "Agent Support Line",
                    render: (c) => (
                      <a href={`tel:${c.agentSupport.phone}`} className="text-sm text-violet-500">
                        {c.agentSupport.phone}
                      </a>
                    )
                  },
                  {
                    label: "Email",
                    render: (c) => (
                      <a href={`mailto:${c.agentSupport.email}`} className="text-sm text-violet-500 truncate block max-w-[120px]">
                        {c.agentSupport.email}
                      </a>
                    )
                  },
                  {
                    label: "Support Hours",
                    render: (c) => (
                      <span className="text-sm">{c.agentSupport.hours || "Business hours"}</span>
                    )
                  },
                  {
                    label: "Background Check Required",
                    render: (c) => (
                      c.appointmentRequirements.backgroundCheck
                        ? <Check className="w-4 h-4 text-amber-500" />
                        : <X className="w-4 h-4 text-gray-300" />
                    )
                  },
                  {
                    label: "States Available",
                    render: (c) => (
                      <span className="text-sm">{c.statesAvailable.length} states</span>
                    )
                  },
                  {
                    label: "Last Updated",
                    render: (c) => (
                      <span className="text-sm text-gray-500">{c.lastUpdated}</span>
                    )
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {comparedCarriers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Select carriers to compare</p>
            <p className="text-sm">Choose up to {maxCarriers} carriers from the list above</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Comparison table helper component
 */
interface ComparisonTableProps {
  carriers: CarrierInfo[];
  rows: {
    label: string;
    render: (carrier: CarrierInfo) => React.ReactNode;
  }[];
}

function ComparisonTable({ carriers, rows }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[180px] font-semibold text-primary">
              Feature
            </TableHead>
            {carriers.map(carrier => (
              <TableHead key={carrier.id} className="text-center min-w-[150px]">
                <div className="flex flex-col items-center gap-1">
                  <Building2 className="w-6 h-6 text-gray-400" />
                  <span className="font-medium text-sm">{carrier.shortName || carrier.name}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              <TableCell className="font-medium text-sm text-gray-700">
                {row.label}
              </TableCell>
              {carriers.map(carrier => (
                <TableCell key={carrier.id} className="text-center">
                  {row.render(carrier)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * CarrierCard - Single carrier info card
 */
interface CarrierCardProps {
  carrierId: string;
  showProducts?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CarrierCard({
  carrierId,
  showProducts = true,
  onClick,
  className
}: CarrierCardProps) {
  const carrier = getCarrierById(carrierId);

  if (!carrier) return null;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Logo/Icon */}
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-primary">{carrier.name}</h4>
              <Badge className={cn("ml-2", ratingColors[carrier.amBestRating])}>
                {carrier.amBestRating}
              </Badge>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {carrier.headquarters} • {getYearsInBusiness(carrier.foundedYear)} years
            </p>

            {/* Products */}
            {showProducts && carrier.products.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {carrier.products.slice(0, 4).map((product, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px]">
                    {getProductTypeDisplayName(product.productType)}
                  </Badge>
                ))}
                {carrier.products.length > 4 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{carrier.products.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {/* Strengths */}
            {carrier.strengths.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {carrier.strengths.slice(0, 2).map((strength, idx) => (
                  <span key={idx} className="text-xs text-gray-400">
                    {strength}{idx < Math.min(carrier.strengths.length - 1, 1) && " •"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CarrierList - Grid list of all carriers
 */
interface CarrierListProps {
  productType?: ProductType;
  stateCode?: string;
  onSelect?: (carrierId: string) => void;
  className?: string;
}

export function CarrierList({
  productType,
  stateCode,
  onSelect,
  className
}: CarrierListProps) {
  const carriers = useMemo(() => {
    let result = CARRIERS.filter(c => c.isActive);

    if (productType) {
      result = getCarriersByProduct(productType);
    }

    if (stateCode) {
      const stateCarriers = getCarriersByState(stateCode as any);
      result = result.filter(c => stateCarriers.some(sc => sc.id === c.id));
    }

    return result;
  }, [productType, stateCode]);

  if (carriers.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No carriers available</p>
      </div>
    );
  }

  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {carriers.map(carrier => (
        <CarrierCard
          key={carrier.id}
          carrierId={carrier.id}
          onClick={() => onSelect?.(carrier.id)}
        />
      ))}
    </div>
  );
}
