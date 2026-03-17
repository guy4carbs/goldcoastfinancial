/**
 * Agent Onboarding Intake — Main Page
 *
 * Public-facing full-page onboarding experience.
 * No sidebar, no header — clean standalone page with Heritage branding.
 *
 * Flow: Token validation -> Path selection -> Wizard -> Congratulations
 */
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  fadeInUp,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import { useTokenValidation } from '@/components/onboarding-intake/useTokenValidation';
import { useOnboardingIntakeForm } from '@/components/onboarding-intake/useOnboardingIntakeForm';
import { PathSelectionScreen } from '@/components/onboarding-intake/PathSelectionScreen';
import { OnboardingWizard } from '@/components/onboarding-intake/OnboardingWizard';
import { CongratulationsPage } from '@/components/onboarding-intake/CongratulationsPage';

// ---------------------------------------------------------------------------
// Heritage Logo (inline SVG placeholder — replace with actual asset)
// ---------------------------------------------------------------------------
function HeritageLogo() {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 40,
          height: 40,
          background: COLORS.gradients.hero,
        }}
      >
        <span className="text-white font-bold text-lg">H</span>
      </div>
      <span
        className="font-bold text-gray-900"
        style={{ fontSize: TYPE.section }}
      >
        Heritage Life Solutions
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2
          className="animate-spin"
          style={{
            width: 48,
            height: 48,
            color: COLORS.primary.violet[500],
          }}
        />
      </motion.div>
      <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
        Validating your onboarding link...
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error State
// ---------------------------------------------------------------------------
function ErrorState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="bg-white text-center max-w-md w-full"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.level3,
          padding: GRID.spacing.xl,
        }}
      >
        <div
          className="flex items-center justify-center bg-red-50 rounded-full mx-auto mb-6"
          style={{ width: 64, height: 64 }}
        >
          <AlertCircle className="text-red-500" style={{ width: 32, height: 32 }} />
        </div>

        <h2
          className="font-bold text-gray-900 mb-2"
          style={{ fontSize: TYPE.section }}
        >
          Link Expired or Invalid
        </h2>
        <p
          className="text-gray-500 mb-8"
          style={{ fontSize: TYPE.body, lineHeight: TYPE.lineHeight }}
        >
          This onboarding link has expired or is no longer valid. Please contact
          your recruiter or our support team for a new link.
        </p>

        <a
          href="mailto:onboarding@heritagels.org"
          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
          style={{ fontSize: TYPE.body }}
        >
          <Mail style={{ width: 18, height: 18 }} />
          Contact Support
        </a>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function AgentOnboardingIntake() {
  // Parse token and dev flag from URL
  const { token, isDevMode } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get('token') || '',
      isDevMode: params.get('dev') === 'true',
    };
  }, []);

  // Validate token (skip in dev mode)
  const { data, isLoading, isError } = useTokenValidation(isDevMode ? '' : token);

  // Dev mode mock data
  const devData = useMemo(() => isDevMode ? {
    profileId: 'dev-profile',
    userId: 'dev-user',
    email: 'dev@heritagels.org',
    firstName: 'Test',
    lastName: 'Agent',
    isLicensed: null,
    npn: null,
    dateOfBirth: null,
    onboardingType: null,
    currentStep: 0,
  } : null, [isDevMode]);

  const resolvedData = isDevMode ? devData : data;

  // Zustand store
  const {
    path,
    isComplete,
    setToken,
    setTokenValid,
    setTokenData,
    setPath,
    setStep,
  } = useOnboardingIntakeForm();

  // Sync token data to store on successful validation
  useEffect(() => {
    if (token) {
      setToken(token);
    }
    if (isDevMode) {
      setToken('dev-token');
    }
  }, [token, isDevMode, setToken]);

  useEffect(() => {
    if (resolvedData) {
      setTokenValid(true);
      setTokenData(resolvedData);

      // If the token already has a path selected, restore it
      if (resolvedData.onboardingType) {
        setPath(resolvedData.onboardingType);
      }
      // If there's a saved step, restore it
      if (resolvedData.currentStep && resolvedData.currentStep > 0) {
        setStep(resolvedData.currentStep);
      }
    }
  }, [resolvedData, setTokenValid, setTokenData, setPath, setStep]);

  // Handle path selection
  const handleSelectPath = (selectedPath: 'licensed' | 'new_agent') => {
    setPath(selectedPath);
    setStep(0);
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  // Completed — show congratulations
  if (isComplete) {
    return <CongratulationsPage />;
  }

  // Dev mode — skip token validation entirely
  if (isDevMode) {
    return (
      <div className="min-h-screen bg-white">
        <HeritageLogo />
        {/* Dev mode banner */}
        <div className="text-center py-1" style={{ backgroundColor: '#fef3c7', fontSize: TYPE.micro, color: '#92400e', fontWeight: 600 }}>
          DEV MODE — API saves disabled
        </div>
        {!path && (
          <PathSelectionScreen
            firstName="Test"
            onSelectPath={handleSelectPath}
          />
        )}
        {path && <OnboardingWizard path={path} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Logo */}
      <HeritageLogo />

      {/* No token provided */}
      {!token && <ErrorState />}

      {/* Loading */}
      {token && isLoading && <LoadingState />}

      {/* Error */}
      {token && isError && <ErrorState />}

      {/* Path Selection */}
      {token && !isLoading && !isError && resolvedData && !path && (
        <PathSelectionScreen
          firstName={resolvedData.firstName || 'Agent'}
          onSelectPath={handleSelectPath}
        />
      )}

      {/* Wizard */}
      {token && !isLoading && !isError && resolvedData && path && (
        <OnboardingWizard path={path} />
      )}
    </div>
  );
}
