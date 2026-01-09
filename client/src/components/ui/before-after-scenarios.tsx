import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export function BeforeAfterScenarios() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary mb-3">
            What If the Unexpected Happens?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
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
          <div className="bg-red-50 rounded-xl p-6 border border-red-100" data-testid="card-scenario-without">
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
          <div className="bg-green-50 rounded-xl p-6 border border-green-100" data-testid="card-scenario-with">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800">With Coverage</h3>
            </div>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Mortgage and debts paid off</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Income replaced for years</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Children's education funded</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Family stays in their home</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
