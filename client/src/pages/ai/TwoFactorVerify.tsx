/**
 * Two-Factor Authentication Verification Page
 * Displayed when user needs to verify 2FA for session access
 *
 * Heritage Design System: AI Lounge (Cyan Theme)
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

export default function TwoFactorVerify() {
  const { user, set2FAVerified, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!user) {
      setLocation('/admin/login');
      return;
    }

    // If 2FA is not enabled, redirect to setup
    if (!user.twoFactorEnabled) {
      setLocation('/ai/2fa-setup');
      return;
    }

    // If already verified, redirect to AI Lounge
    if (user.twoFactorVerified) {
      setLocation('/agents');
      return;
    }

    // Focus input on mount
    inputRef.current?.focus();
  }, [user]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      // Mark as verified in auth context
      set2FAVerified(true);
      toast.success('Verified successfully!');

      // Redirect to AI Lounge
      const redirectPath = sessionStorage.getItem('redirectAfter2FA') || '/agents';
      sessionStorage.removeItem('redirectAfter2FA');
      setLocation(redirectPath);
    } catch (err: any) {
      setAttempts(prev => prev + 1);
      setError(err.message || 'Invalid verification code');
      setVerificationCode('');
      inputRef.current?.focus();

      // Lock out after too many attempts
      if (attempts >= 4) {
        toast.error('Too many failed attempts. Please log in again.');
        await signOut();
        setLocation('/admin/login');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerify();
    }
  };

  const handleCancel = async () => {
    await signOut();
    setLocation('/admin/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700 p-4"
      style={{ padding: spacing(3) }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div
          variants={scaleIn}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
        >
          <Card
            className="w-full backdrop-blur-xl bg-white/95 border-white/20"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            <CardHeader className="text-center" style={{ padding: spacing(3) }}>
              <motion.div
                variants={fadeInUp}
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <CardTitle
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"
                  style={{ fontSize: TYPE.section }}
                >
                  Two-Factor Verification
                </CardTitle>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <CardDescription style={{ fontSize: TYPE.body }}>
                  Enter the code from your authenticator app
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4" style={{ padding: `0 ${spacing(3)}px ${spacing(2)}px` }}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: MOTION.duration.fast }}
                >
                  <Alert variant="destructive" className="py-2" style={{ borderRadius: RADIUS.input }}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {attempts >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: MOTION.duration.fast }}
                >
                  <Alert className="py-2 bg-amber-50 border-amber-200" style={{ borderRadius: RADIUS.input }}>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-800">
                      {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={fadeInUp} className="space-y-2">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationCode(value);
                    setError(null);
                  }}
                  onKeyPress={handleKeyPress}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                  style={{ borderRadius: RADIUS.input }}
                  autoComplete="one-time-code"
                  disabled={isVerifying}
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium shadow-lg"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2" style={{ padding: `0 ${spacing(3)}px ${spacing(3)}px` }}>
              <motion.div variants={fadeInUp} className="w-full">
                <Button
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-cyan-600 hover:bg-cyan-50"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={handleCancel}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel and Sign Out
                </Button>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="text-xs text-center text-gray-400"
                style={{ fontSize: TYPE.micro }}
              >
                Having trouble? Contact support for help.
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
