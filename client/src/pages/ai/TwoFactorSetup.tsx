/**
 * Two-Factor Authentication Setup Page
 * Displays QR code for authenticator app setup
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Copy, Check, Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up two-factor authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Secure your account with an additional layer of protection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'scan' && (
            <>
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>Scan this QR code with your authenticator app</span>
                </div>

                {qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <img
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}

                {manualKey && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Or enter this key manually:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                        {manualKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyKey}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => setStep('verify')}
                  >
                    Next: Verify Code
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'verify' && (
            <>
              {/* Step 2: Verify Code */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to verify setup:
                </p>

                <div className="space-y-2">
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
                    className="text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('scan')}
                    disabled={isVerifying}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || isVerifying}
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
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground w-full">
            We recommend using Google Authenticator, Authy, or 1Password
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
