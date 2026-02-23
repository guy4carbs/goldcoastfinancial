/**
 * Two-Factor Authentication Setup Page
 * Displays QR code for authenticator app setup
 *
 * Heritage Design System: AI Lounge (Cyan Theme)
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Copy, Check, Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

export default function TwoFactorSetup() {
  const { user, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'scan' | 'verify'>('scan');

  useEffect(() => {
    if (!user) {
      setLocation('/admin/login');
      return;
    }

    // If 2FA is already enabled and verified, redirect to AI Lounge
    if (user.twoFactorEnabled && user.twoFactorVerified) {
      setLocation('/agents');
      return;
    }

    // Setup 2FA
    setup2FA();
  }, [user]);

  const setup2FA = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to set up 2FA');
      }

      const data = await response.json();
      setQrCodeUrl(data.qrCodeDataUrl);
      setManualKey(data.manualEntryKey);
    } catch (err) {
      setError('Failed to initialize 2FA setup. Please try again.');
      console.error('2FA setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

      toast.success('Two-factor authentication enabled successfully!');
      await refreshProfile();
      setLocation('/agents');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyKey = () => {
    if (manualKey) {
      navigator.clipboard.writeText(manualKey);
      setCopied(true);
      toast.success('Key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Setting up two-factor authentication...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={fadeInUp}>
          <Card
            className="w-full bg-white/95 backdrop-blur-xl border-white/20"
            style={{
              borderRadius: `${RADIUS.hero}px`,
              boxShadow: SHADOW.hero,
            }}
          >
            <CardHeader className="text-center" style={{ padding: `${spacing(4)}px ${spacing(3)}px` }}>
              <motion.div
                variants={scaleIn}
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4"
                style={{ boxShadow: SHADOW.level3 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Enable Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-600">
                Secure your account with an additional layer of protection
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6" style={{ padding: `0 ${spacing(3)}px ${spacing(3)}px` }}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: MOTION.duration.fast }}
                >
                  <Alert variant="destructive" style={{ borderRadius: `${RADIUS.input}px` }}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {step === 'scan' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Step 1: Scan QR Code */}
                  <div className="space-y-4">
                    <motion.div
                      variants={fadeInUp}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Smartphone className="h-4 w-4 text-cyan-600" />
                      <span>Scan this QR code with your authenticator app</span>
                    </motion.div>

                    {qrCodeUrl && (
                      <motion.div
                        variants={scaleIn}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex justify-center p-4 bg-white border border-gray-200"
                        style={{
                          borderRadius: `${RADIUS.card}px`,
                          boxShadow: SHADOW.level2,
                        }}
                      >
                        <img
                          src={qrCodeUrl}
                          alt="2FA QR Code"
                          className="w-48 h-48"
                        />
                      </motion.div>
                    )}

                    {manualKey && (
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Or enter this key manually:
                        </p>
                        <div className="flex items-center gap-2">
                          <code
                            className="flex-1 p-3 bg-gray-50 text-sm font-mono break-all text-gray-800 border border-gray-200"
                            style={{ borderRadius: `${RADIUS.input}px` }}
                          >
                            {manualKey}
                          </code>
                          <motion.div
                            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                            transition={{ duration: MOTION.duration.hover }}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleCopyKey}
                              className="border-cyan-200 hover:bg-cyan-50"
                              style={{ borderRadius: `${RADIUS.input}px` }}
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-cyan-600" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    <motion.div variants={fadeInUp} className="pt-4">
                      <motion.div
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                      >
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                          onClick={() => setStep('verify')}
                          style={{
                            borderRadius: `${RADIUS.button}px`,
                            height: `${spacing(6)}px`,
                            boxShadow: SHADOW.level2,
                          }}
                        >
                          Next: Verify Code
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {step === 'verify' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Step 2: Verify Code */}
                  <div className="space-y-4">
                    <motion.p variants={fadeInUp} className="text-sm text-gray-600">
                      Enter the 6-digit code from your authenticator app to verify setup:
                    </motion.p>

                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Input
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
                        className="text-center text-2xl tracking-widest font-mono border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                        style={{ borderRadius: `${RADIUS.input}px` }}
                        autoFocus
                      />
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex gap-2">
                      <motion.div
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setStep('scan')}
                          disabled={isVerifying}
                          className="border-gray-200 hover:bg-gray-50"
                          style={{ borderRadius: `${RADIUS.button}px` }}
                        >
                          Back
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex-1"
                      >
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                          onClick={handleVerify}
                          disabled={verificationCode.length !== 6 || isVerifying}
                          style={{
                            borderRadius: `${RADIUS.button}px`,
                            height: `${spacing(6)}px`,
                            boxShadow: SHADOW.level2,
                          }}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Enable 2FA'
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </CardContent>

            <CardFooter
              className="text-center border-t border-gray-100"
              style={{ padding: `${spacing(2)}px ${spacing(3)}px` }}
            >
              <p className="text-xs text-gray-500 w-full">
                We recommend using Google Authenticator, Authy, or 1Password
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
