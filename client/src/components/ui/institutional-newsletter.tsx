import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "minimal" | "banner";
  className?: string;
}

export function InstitutionalNewsletter({ variant = "card", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          subscriptionType: "institutional"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        toast({ title: "Successfully subscribed!", description: "You'll receive our updates." });
      } else {
        throw new Error(data.error || "Failed to subscribe");
      }
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 p-4 bg-[hsl(348,65%,20%)]/5 rounded-sm ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-[hsl(348,65%,20%)]/10 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-[hsl(348,65%,25%)]" />
        </div>
        <div>
          <p className="font-medium text-primary text-sm">You're subscribed!</p>
          <p className="text-xs text-muted-foreground">Thank you for joining our mailing list.</p>
        </div>
      </motion.div>
    );
  }

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white"
            required
            aria-label="Email address for newsletter"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white"
            required
            aria-label="Email address for newsletter"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[hsl(348,65%,20%)] hover:bg-[hsl(348,65%,25%)] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    );
  }

  // Banner variant - Full width CTA section
  if (variant === "banner") {
    return (
      <section className={`bg-[hsl(348,65%,12%)] ${className}`}>
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <div className="h-px w-8 bg-[hsl(42,60%,55%)]" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(42,60%,55%)]">
                  Stay Informed
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-3">
                The Gold Coast Perspective
              </h3>
              <p className="text-white/60 max-w-xl leading-relaxed">
                Quarterly insights on financial services, market dynamics, and strategic perspectives from our leadership team.
              </p>
            </div>

            {/* Form */}
            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 pr-4 py-3 h-12 w-full sm:w-72 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(42,60%,55%)] focus:ring-[hsl(42,60%,55%)]/20 rounded-sm"
                    required
                    aria-label="Email address for newsletter"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-[hsl(42,60%,55%)] hover:bg-[hsl(42,60%,60%)] text-[hsl(348,65%,12%)] font-medium rounded-sm group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-white/30 text-xs mt-3 text-center sm:text-left">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-gradient-to-br from-[hsl(348,65%,18%)] to-[hsl(348,65%,22%)] p-8 rounded-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-[hsl(42,60%,55%)]" />
        </div>
        <div>
          <h3 className="font-medium text-white text-lg">Stay Informed</h3>
          <p className="text-white/60 text-sm">Corporate updates and insights</p>
        </div>
      </div>

      <p className="text-white/70 text-sm mb-6 leading-relaxed">
        Receive quarterly updates on company developments, portfolio news, and industry perspectives from our leadership team.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(42,60%,55%)]"
            aria-label="Your name"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(42,60%,55%)]"
            required
            aria-label="Email address for newsletter"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[hsl(42,60%,55%)] hover:bg-[hsl(42,60%,60%)] text-[hsl(348,65%,15%)] font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe to Updates"
          )}
        </Button>
      </form>

      <p className="text-white/40 text-xs mt-4 text-center">
        Unsubscribe anytime. We respect your privacy.
      </p>
    </motion.div>
  );
}
