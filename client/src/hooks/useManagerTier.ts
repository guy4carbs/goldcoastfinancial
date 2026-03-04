/**
 * useManagerTier — Determines manager vs director tier
 *
 * Manager tier controls scope of visibility and authority within
 * the Manager Lounge. Directors see multi-team data and have
 * elevated approval authority.
 */

import { useAgentStore } from '@/lib/agentStore';

export type ManagerTier = 'manager' | 'director';

export interface ManagerTierInfo {
  tier: ManagerTier;
  isDirector: boolean;
  teamIds: number[];
  canApproveLevel: number;
  canEscalateTo: string;
}

export function useManagerTier(): ManagerTierInfo {
  const { currentUser } = useAgentStore();

  // Derive tier from user metadata — stub defaults to 'manager'
  const tier: ManagerTier = (currentUser as any)?.managerTier === 'director'
    ? 'director'
    : 'manager';

  const isDirector = tier === 'director';

  return {
    tier,
    isDirector,
    teamIds: isDirector ? [1, 2, 3] : [1],
    canApproveLevel: isDirector ? 30 : 15,
    canEscalateTo: isDirector ? 'executive' : 'director',
  };
}

export default useManagerTier;
