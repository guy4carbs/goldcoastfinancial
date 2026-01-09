import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function SecurityBadges() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-muted/50"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Lock className="w-4 h-4 text-green-600" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground text-xs">256-bit SSL</p>
          <p className="text-[10px]">Encrypted</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground text-xs">Bank-Level</p>
          <p className="text-[10px]">Security</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground text-xs">HIPAA</p>
          <p className="text-[10px]">Compliant</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SecurityBadgesCompact() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground mt-4"
    >
      <div className="flex items-center gap-1">
        <Lock className="w-3 h-3 text-green-600" />
        <span>SSL Secured</span>
      </div>
      <span className="text-muted-foreground/30">•</span>
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3 text-blue-600" />
        <span>Privacy Protected</span>
      </div>
      <span className="text-muted-foreground/30">•</span>
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-purple-600" />
        <span>HIPAA Compliant</span>
      </div>
    </motion.div>
  );
}
