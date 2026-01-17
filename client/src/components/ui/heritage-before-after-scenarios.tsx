import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  cream: "#fffaf3",
  white: "#ffffff",
};

export function HeritageBeforeAfterScenarios() {
  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: c.white }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3" style={{ color: c.primary }}>
            What If the Unexpected Happens?
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: c.textSecondary }}>
            Life insurance makes a real difference when families need it most.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* Without Coverage */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-red-800">Without Coverage</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Family may struggle to pay mortgage</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Savings depleted for everyday expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>College plans may be put on hold</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Financial stress during difficult time</span>
              </li>
            </ul>
          </div>

          {/* With Coverage */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: `${c.primary}10`, borderColor: `${c.primary}20` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.primary}20` }}>
                <CheckCircle className="w-5 h-5" style={{ color: c.primary }} />
              </div>
              <h3 className="font-bold" style={{ color: c.primary }}>With Coverage</h3>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: c.primaryHover }}>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                <span>Mortgage and debts paid off</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                <span>Income replaced for years</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                <span>Children's education funded</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                <span>Family stays in their home</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
