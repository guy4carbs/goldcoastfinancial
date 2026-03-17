/**
 * Client Lounge Two-Factor Authentication Page
 * Combined 2FA setup and verification for the Client Portal
 *
 * Heritage Design System: Client Lounge (Violet/Amber Theme)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  RADIUS, SHADOW, MOTION, TYPE, COLORS, GLASS,
  fadeInUp, staggerContainer, scaleIn, spacing,
} from '@/lib/heritageDesignSystem';
import {
  Shield,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

type Mode = 'setup' | 'verify';

export default function ClientTwoFactor() {
  const [, setLocation] = useLocation();

  // Determine mode from URL: /client/2fa-verify = verify, /client/2fa-setup = setup
  const [mode, setMode] = useState<Mode>('verify');

  // Setup state
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'scan' | 'verify'>('scan');
  const [copied, setCopied] = useState(false);

  // Verify state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Detect mode from current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('2fa-setup')) {
      setMode('setup');
      initSetup();
    } else {
      setMode('verify');
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, []);

  const initSetup = async () => {
    setIsLoadingSetup(true);
    setError(null);
    try {
      const response = await fetch('/api/client/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to set up 2FA');
      const data = await response.json();
      setQrCodeUrl(data.qrCodeDataUrl);
      setManualKey(data.manualEntryKey);
    } catch (err) {
      setError('Failed to initialize 2FA setup. Please try again.');
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const getCode = () => digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && getCode().length === 6) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    // Focus the last filled or first empty
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = getCode();
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    const endpoint = mode === 'setup' ? '/api/client/2fa/verify' : '/api/client/2fa/verify';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      if (mode === 'setup') {
        setLocation('/client/dashboard');
      } else {
        const redirectPath = sessionStorage.getItem('redirectAfterClient2FA') || '/client/dashboard';
        sessionStorage.removeItem('redirectAfterClient2FA');
        setLocation(redirectPath);
      }
    } catch (err: any) {
      setAttempts((prev) => prev + 1);
      setError(err.message || 'Invalid verification code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('client-2fa-bypassed', 'true');
    setLocation('/client/dashboard');
  };

  const handleCopyKey = () => {
    if (manualKey) {
      navigator.clipboard.writeText(manualKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state for setup
  if (mode === 'setup' && isLoadingSetup) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#fffaf3' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-gray-500">Setting up two-factor authentication...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#fffaf3', padding: spacing(3) }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(124, 58, 237, 0.06)' }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)' }}
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={scaleIn}>
          {/* Card */}
          <div
            className="border border-gray-100/80 overflow-hidden"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              ...GLASS.css.light,
            }}
          >
            {/* Violet gradient header */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)',
                padding: `${spacing(4)}px ${spacing(3)}px`,
              }}
            >
              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  variants={fadeInUp}
                  className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20"
                  style={{ marginBottom: spacing(2), boxShadow: SHADOW.level3 }}
                >
                  <Shield className="h-8 w-8 text-white" />
                </motion.div>
                <motion.h1
                  variants={fadeInUp}
                  className="text-white font-bold"
                  style={{ fontSize: TYPE.section, fontFamily: "'Playfair Display', serif", marginBottom: spacing(0.5) }}
                >
                  {mode === 'setup' ? 'Set Up Two-Factor Authentication' : 'Two-Factor Authentication'}
                </motion.h1>
                <motion.p
                  variants={fadeInUp}
                  className="text-white/70"
                  style={{ fontSize: TYPE.meta }}
                >
                  {mode === 'setup'
                    ? 'Add an extra layer of security to your account'
                    : 'Enter the 6-digit code from your authenticator app'}
                </motion.p>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: spacing(4) }}>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700"
                    style={{ padding: spacing(2), borderRadius: RADIUS.input, marginBottom: spacing(2.5) }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span style={{ fontSize: TYPE.meta }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attempt warning */}
              {attempts >= 3 && mode === 'verify' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800"
                  style={{ padding: spacing(2), borderRadius: RADIUS.input, marginBottom: spacing(2.5) }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span style={{ fontSize: TYPE.meta }}>
                    {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
                  </span>
                </motion.div>
              )}

              {/* SETUP MODE */}
              {mode === 'setup' && setupStep === 'scan' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}
                >
                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-2 text-gray-600"
                    style={{ fontSize: TYPE.meta }}
                  >
                    <Smartphone className="h-4 w-4 text-violet-600" />
                    <span>Scan this QR code with your authenticator app</span>
                  </motion.div>

                  {qrCodeUrl && (
                    <motion.div
                      variants={scaleIn}
                      className="flex justify-center bg-white border border-gray-200"
                      style={{
                        padding: spacing(3),
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.level2,
                      }}
                    >
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </motion.div>
                  )}

                  {manualKey && (
                    <motion.div variants={fadeInUp}>
                      <p className="text-gray-600" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Or enter this key manually:
                      </p>
                      <div className="flex items-center gap-2">
                        <code
                          className="flex-1 bg-gray-50 font-mono break-all text-gray-800 border border-gray-200"
                          style={{ padding: spacing(1.5), borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        >
                          {manualKey}
                        </code>
                        <motion.button
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          onClick={handleCopyKey}
                          className="p-2 border border-violet-200 hover:bg-violet-50 transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-violet-600" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    variants={fadeInUp}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSetupStep('verify')}
                    className={cn(
                      'w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                      'text-white font-semibold flex items-center justify-center gap-2',
                      'shadow-lg shadow-violet-500/25'
                    )}
                    style={{
                      height: 48,
                      borderRadius: RADIUS.button,
                      marginTop: spacing(1),
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                    }}
                  >
                    Next: Verify Code <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* SETUP VERIFY or VERIFY MODE — shared 6-digit input */}
              {((mode === 'setup' && setupStep === 'verify') || mode === 'verify') && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}
                >
                  {mode === 'setup' && setupStep === 'verify' && (
                    <motion.p variants={fadeInUp} className="text-gray-600" style={{ fontSize: TYPE.meta }}>
                      Enter the 6-digit code from your authenticator app to complete setup:
                    </motion.p>
                  )}

                  {/* 6 digit input boxes */}
                  <motion.div
                    variants={fadeInUp}
                    className="flex justify-center"
                    style={{ gap: spacing(1) }}
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        disabled={isVerifying}
                        className={cn(
                          'w-12 h-14 text-center text-xl font-mono font-bold border-2 outline-none',
                          'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                          'bg-white/80 text-gray-900 transition-all',
                          digit ? 'border-violet-300' : 'border-gray-200',
                          isVerifying && 'opacity-60 cursor-not-allowed'
                        )}
                        style={{ borderRadius: RADIUS.input }}
                      />
                    ))}
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    variants={fadeInUp}
                    style={{ display: 'flex', flexDirection: 'column', gap: spacing(1.5) }}
                  >
                    {/* Back button for setup verify */}
                    {mode === 'setup' && setupStep === 'verify' && (
                      <div className="flex" style={{ gap: spacing(1.5) }}>
                        <motion.button
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          onClick={() => setSetupStep('scan')}
                          disabled={isVerifying}
                          className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-1.5"
                          style={{
                            padding: `${spacing(1.5)}px ${spacing(2)}px`,
                            borderRadius: RADIUS.button,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </motion.button>
                        <motion.button
                          whileHover={{ y: isVerifying ? 0 : MOTION.hover.y, scale: isVerifying ? 1 : MOTION.hover.scale }}
                          whileTap={{ scale: isVerifying ? 1 : 0.99 }}
                          onClick={handleVerify}
                          disabled={getCode().length !== 6 || isVerifying}
                          className={cn(
                            'flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                            'text-white font-semibold flex items-center justify-center gap-2',
                            'disabled:opacity-60 disabled:cursor-not-allowed',
                            'shadow-lg shadow-violet-500/25'
                          )}
                          style={{
                            height: 48,
                            borderRadius: RADIUS.button,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                            </>
                          ) : (
                            <>Enable 2FA</>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {/* Verify button for login flow */}
                    {mode === 'verify' && (
                      <>
                        <motion.button
                          whileHover={{ y: isVerifying ? 0 : MOTION.hover.y, scale: isVerifying ? 1 : MOTION.hover.scale }}
                          whileTap={{ scale: isVerifying ? 1 : 0.99 }}
                          onClick={handleVerify}
                          disabled={getCode().length !== 6 || isVerifying}
                          className={cn(
                            'w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                            'text-white font-semibold flex items-center justify-center gap-2',
                            'disabled:opacity-60 disabled:cursor-not-allowed',
                            'shadow-lg shadow-violet-500/25'
                          )}
                          style={{
                            height: 48,
                            borderRadius: RADIUS.button,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-5 h-5" /> Verify
                            </>
                          )}
                        </motion.button>

                        {/* Skip for now */}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          onClick={handleSkip}
                          className="w-full text-gray-400 hover:text-gray-600 font-medium transition-colors"
                          style={{
                            padding: `${spacing(1.25)}px ${spacing(2)}px`,
                            fontSize: TYPE.meta,
                          }}
                        >
                          Skip for now
                        </motion.button>
                        <p className="text-center text-gray-400" style={{ fontSize: TYPE.micro }}>
                          You can set up 2FA later in your profile settings
                        </p>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div
              className="text-center border-t border-gray-100"
              style={{ padding: `${spacing(2)}px ${spacing(3)}px` }}
            >
              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                We recommend using Google Authenticator, Authy, or 1Password
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
