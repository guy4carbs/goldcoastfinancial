/**
 * Two-Factor Authentication Verification Page
 * Displayed when user needs to verify 2FA for session access
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#292966] via-[#292966] to-black p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Two-Factor Verification</CardTitle>
          <CardDescription>
            Enter the code from your authenticator app
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {attempts >= 3 && (
            <Alert className="py-2 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
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
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              autoComplete="one-time-code"
              disabled={isVerifying}
            />
          </div>

          <Button
            className="w-full h-11"
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
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel and Sign Out
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Having trouble? Contact support for help.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
