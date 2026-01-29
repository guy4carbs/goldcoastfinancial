import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Lock, Eye, EyeOff, AlertCircle, Crown, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ExecLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email && password) {
      localStorage.setItem("execAuth", JSON.stringify({ 
        email, 
        role: "executive",
        name: email.includes("jack") ? "Jack Cook" : "Executive",
        loginTime: new Date().toISOString()
      }));
      navigate("/exec");
    } else {
      setError("Please enter valid credentials");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary via-secondary to-amber-600 shadow-2xl shadow-secondary/30 mb-6"
          >
            <Crown className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight">
            Executive Command
          </h1>
          <p className="text-white/60 text-sm flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4" />
            Gold Coast Financial
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-secondary text-sm border border-secondary/30 bg-secondary/5 rounded-lg p-3">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Secure Executive Access Portal — Authorized Personnel Only</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Executive Email</label>
                <Input
                  data-testid="input-exec-email"
                  type="email"
                  placeholder="executive@goldcoastfinancial.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-secondary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    data-testid="input-exec-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-secondary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                data-testid="button-exec-login"
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-secondary via-amber-500 to-secondary hover:from-amber-500 hover:via-secondary hover:to-amber-500 text-primary font-semibold text-base shadow-lg shadow-secondary/25 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Access Executive Portal
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  256-bit Encryption
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  SOC2 Compliant
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-100">
              <p className="font-medium mb-1 text-gray-700">Demo Credentials:</p>
              <p>Email: exec@goldcoastfnl.com</p>
              <p>Password: exec123</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/50 hover:text-white/80 text-sm transition-colors">
            ← Return to Gold Coast Financial
          </Link>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2026 Gold Coast Financial. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
