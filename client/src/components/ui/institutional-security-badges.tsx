import { Shield, Lock, CheckCircle2, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export function InstitutionalSecurityBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/40"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[hsl(348,65%,20%)]/5 flex items-center justify-center">
          <Lock className="w-4 h-4 text-[hsl(348,65%,25%)]" />
        </div>
        <div className="text-left">
          <p className="font-medium text-primary text-xs">256-bit SSL</p>
          <p className="text-[10px] text-muted-foreground">Encrypted</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[hsl(348,65%,20%)]/5 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[hsl(348,65%,25%)]" />
        </div>
        <div className="text-left">
          <p className="font-medium text-primary text-xs">Bank-Level</p>
          <p className="text-[10px] text-muted-foreground">Security</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[hsl(348,65%,20%)]/5 flex items-center justify-center">
          <FileCheck className="w-4 h-4 text-[hsl(348,65%,25%)]" />
        </div>
        <div className="text-left">
          <p className="font-medium text-primary text-xs">SOC 2</p>
          <p className="text-[10px] text-muted-foreground">Compliant</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[hsl(348,65%,20%)]/5 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-[hsl(348,65%,25%)]" />
        </div>
        <div className="text-left">
          <p className="font-medium text-primary text-xs">Regulatory</p>
          <p className="text-[10px] text-muted-foreground">Compliant</p>
        </div>
      </div>
    </motion.div>
  );
}

export function InstitutionalSecurityBadgesCompact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground mt-5"
    >
      <div className="flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-[hsl(348,65%,30%)]" />
        <span>SSL Secured</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-[hsl(348,65%,30%)]" />
        <span>Bank-Level Security</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3 text-[hsl(348,65%,30%)]" />
        <span>Compliant</span>
      </div>
    </motion.div>
  );
}
