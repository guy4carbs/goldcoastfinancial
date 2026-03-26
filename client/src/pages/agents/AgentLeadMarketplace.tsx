import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingBag,
  Layers,
  ClipboardCheck,
  PhoneCall,
  Flame,
  Bot,
  Loader2,
  Check,
  Clock,
  CreditCard,
  Minus,
  Plus,
  MapPin,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',
  DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',
  MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
  NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
  TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',
  WI:'Wisconsin',WY:'Wyoming',DC:'Washington DC'
};

// ---------------------------------------------------------------------------
// Stripe singleton (loaded once, reused across renders)
// ---------------------------------------------------------------------------
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// ---------------------------------------------------------------------------
// Product visual mapping
// ---------------------------------------------------------------------------
const PRODUCT_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  consolidation: Layers,
  survey: ClipboardCheck,
  live_iul: PhoneCall,
  high_intent_iul: Flame,
  ai_qualified: Bot,
};

const PRODUCT_GRADIENTS: Record<string, string> = {
  consolidation: "from-blue-500 to-indigo-600",
  survey: "from-emerald-500 to-teal-600",
  live_iul: "from-violet-500 to-purple-600",
  high_intent_iul: "from-amber-500 to-orange-600",
  ai_qualified: "from-pink-500 to-rose-600",
};

// ---------------------------------------------------------------------------
// Status badge color helper
// ---------------------------------------------------------------------------
function statusBadgeClasses(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ---------------------------------------------------------------------------
// CheckoutForm — wraps Stripe PaymentElement inside the dialog
// ---------------------------------------------------------------------------
function CheckoutForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
        style={{ borderRadius: RADIUS.button }}
      >
        {processing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-2" />
        )}
        {processing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// AgentLeadMarketplace — main page component
// ---------------------------------------------------------------------------
export default function AgentLeadMarketplace() {
  const queryClient = useQueryClient();

  // ---- Data queries ----
  const { data: productsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/lead-purchases/products"],
  });

  const { data: purchasesResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/lead-purchases/my-purchases"],
  });

  const products = productsResponse?.data ?? [];
  const purchases = purchasesResponse?.data ?? [];

  // ---- Order configuration state ----
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState('');

  // ---- Payment state ----
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const orderTotal = selectedProduct ? (selectedProduct.priceCents * quantity / 100) : 0;

  // ---- Handlers ----
  const handleBuyClick = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedStates([]);
    setStateSearch('');
    setShowOrderDialog(true);
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const selectAllStates = () => setSelectedStates([...US_STATES]);
  const clearAllStates = () => setSelectedStates([]);

  const filteredStates = stateSearch
    ? US_STATES.filter(s =>
        s.toLowerCase().includes(stateSearch.toLowerCase()) ||
        STATE_NAMES[s]?.toLowerCase().includes(stateSearch.toLowerCase())
      )
    : US_STATES;

  const handleProceedToPayment = async () => {
    if (selectedStates.length === 0) {
      toast.error("Select at least one state");
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await apiRequest("POST", "/api/lead-purchases/create-payment-intent", {
        productId: selectedProduct.id,
        quantity,
        states: selectedStates,
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setShowOrderDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to start payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success(`${quantity} lead${quantity > 1 ? 's' : ''} purchased successfully!`);
    setClientSecret(null);
    setSelectedProduct(null);
    setShowOrderDialog(false);
    queryClient.invalidateQueries({ queryKey: ["/api/lead-purchases/my-purchases"] });
  };

  const closePaymentDialog = () => {
    setClientSecret(null);
    setSelectedProduct(null);
  };

  // ---- Render ----
  return (
    <AgentLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* ── Hero ── */}
        <AgentPageHero
          icon={ShoppingBag}
          title="Lead Marketplace"
          subtitle="Purchase qualified leads to grow your book of business"
        />

        {/* ── Product Cards Grid ── */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {products.map((product: any) => {
            const slug: string = product.id ?? product.slug ?? product.type ?? "consolidation";
            const Icon = PRODUCT_ICONS[slug] ?? ShoppingBag;
            const gradient = product.gradient ?? PRODUCT_GRADIENTS[slug] ?? "from-violet-500 to-purple-600";

            return (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Card
                  className="border-0 overflow-hidden h-full flex flex-col"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  {/* Top half — product image or gradient fallback */}
                  <div className={`aspect-[3/4] relative overflow-hidden ${product.image ? 'bg-gray-900' : `bg-gradient-to-br ${gradient}`}`}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover object-top ${product.comingSoon ? 'opacity-60' : ''}`}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${product.comingSoon ? 'opacity-60' : ''}`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    )}
                    {product.comingSoon && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-amber-500 text-white border-0 text-[10px] font-semibold px-2 py-0.5 shadow-lg">
                          Coming Soon
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Bottom half — details + buy button */}
                  <CardContent className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-baseline justify-between mt-auto pt-3">
                      <p className="text-xl font-bold text-violet-600">
                        {product.priceDisplay}
                      </p>
                      <span className="text-[9px] text-gray-400">per lead</span>
                    </div>

                    <Button
                      className={`w-full mt-3 h-9 text-xs font-semibold ${product.comingSoon ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'}`}
                      style={{ borderRadius: RADIUS.button }}
                      disabled={product.comingSoon || (paymentLoading && selectedProduct?.id === product.id)}
                      onClick={() => !product.comingSoon && handleBuyClick(product)}
                    >
                      {product.comingSoon ? (
                        <>Coming Soon</>
                      ) : paymentLoading && selectedProduct?.id === product.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
                      ) : (
                        <><CreditCard className="w-4 h-4 mr-2" />Buy Now</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Purchase History ── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Purchase History
                </h2>
              </div>

              {purchases.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No purchases yet
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {purchases.map((purchase: any) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          {(() => {
                            const pSlug =
                              purchase.productSlug ?? purchase.productType ?? "";
                            const PIcon = PRODUCT_ICONS[pSlug] ?? ShoppingBag;
                            return (
                              <PIcon className="w-4 h-4 text-violet-600" />
                            );
                          })()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {purchase.productName ?? purchase.leadType ?? "Lead"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {purchase.createdAt
                              ? new Date(purchase.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-700">
                          {purchase.priceDisplay ?? purchase.amount ?? "—"}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-medium px-2 py-0.5 ${statusBadgeClasses(
                            purchase.status,
                          )}`}
                        >
                          {purchase.status ?? "unknown"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Order Configuration Dialog ── */}
        <Dialog open={showOrderDialog && !clientSecret} onOpenChange={(open) => { if (!open) { setShowOrderDialog(false); setSelectedProduct(null); } }}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-violet-600" />
                Configure Order
              </DialogTitle>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-5">
                {/* Product info */}
                <div className="p-4 bg-violet-50 flex items-center justify-between" style={{ borderRadius: RADIUS.input }}>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-500">{selectedProduct.priceDisplay} per lead</p>
                  </div>
                </div>

                {/* Quantity selector */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      style={{ borderRadius: RADIUS.input }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-10 w-20 text-center text-lg font-bold"
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      style={{ borderRadius: RADIUS.input }}
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* State selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Target States
                    </Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-violet-600" onClick={selectAllStates}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-gray-400" onClick={clearAllStates}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Search states..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="h-8 text-sm mb-2"
                    style={{ borderRadius: RADIUS.input }}
                  />
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1">
                    {filteredStates.map(state => (
                      <button
                        key={state}
                        onClick={() => toggleState(state)}
                        className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                          selectedStates.includes(state)
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{ borderRadius: RADIUS.input }}
                        title={STATE_NAMES[state]}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                  {selectedStates.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">{selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} selected</p>
                  )}
                </div>

                {/* Order total */}
                <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-center" style={{ borderRadius: RADIUS.button }}>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Order Total</p>
                  <p className="text-white text-3xl font-bold mt-1">
                    ${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-white/60 text-xs mt-1">{quantity} lead{quantity > 1 ? 's' : ''} × {selectedProduct.priceDisplay}</p>
                </div>

                {/* Proceed button */}
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading || selectedStates.length === 0}
                >
                  {paymentLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {paymentLoading ? 'Processing...' : `Proceed to Payment — $${orderTotal.toFixed(2)}`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Payment Dialog ── */}
        <Dialog open={!!clientSecret} onOpenChange={() => closePaymentDialog()}>
          <DialogContent
            className="sm:max-w-md max-h-[85vh] overflow-y-auto"
            style={{ borderRadius: RADIUS.card }}
          >
            <DialogHeader>
              <DialogTitle>Complete Purchase</DialogTitle>
            </DialogHeader>

            {/* Product summary */}
            {selectedProduct && (
              <div className="p-4 bg-violet-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedProduct.name} × {quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} • {selectedProduct.priceDisplay}/lead
                  </p>
                </div>
                <p className="text-xl font-bold text-violet-600">
                  ${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* Stripe Elements */}
            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <CheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AgentLoungeLayout>
  );
}
