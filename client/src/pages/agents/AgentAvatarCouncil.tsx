import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Sparkles, Clock, Users } from "lucide-react";

export default function AgentAvatarCouncil() {
  return (
    <AgentLoungeLayout>
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg px-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-600 flex items-center justify-center"
          >
            <Users className="w-12 h-12 text-amber-700" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Avatar Council
          </motion.h1>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-600 mb-6"
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span className="text-amber-700 font-medium text-sm">Coming Soon</span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-700 text-lg leading-relaxed mb-8"
          >
            Summon legendary sales minds for live debates and strategic advice.
            Warren Buffett, Patrick Bet-David, Ben Feldman, and more will be ready
            to guide your insurance career.
          </motion.p>

          {/* Feature Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 text-sm text-gray-800"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Debates</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Expert Councils</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Strategy Sessions</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AgentLoungeLayout>
  );
}
