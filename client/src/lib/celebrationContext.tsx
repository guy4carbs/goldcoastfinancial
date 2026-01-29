import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { XPPopup } from '@/components/agent/celebrations/XPPopup';
import { LevelUpCelebration } from '@/components/agent/celebrations/LevelUpCelebration';
import { AchievementUnlock } from '@/components/agent/celebrations/AchievementUnlock';
import { StreakCelebration } from '@/components/agent/celebrations/StreakCelebration';
import type { LucideIcon } from 'lucide-react';

interface Achievement {
  title: string;
  description: string;
  icon?: LucideIcon;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CelebrationContextType {
  showXP: (amount: number, position?: { x: number; y: number }) => void;
  showLevelUp: (newLevel: number) => void;
  showAchievement: (achievement: Achievement) => void;
  showStreak: (days: number, xpBonus: number) => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return context;
}

export function CelebrationProvider({ children }: { children: ReactNode }) {
  // XP Popup state
  const [xpPopup, setXpPopup] = useState<{ amount: number; position?: { x: number; y: number } } | null>(null);
  const [xpVisible, setXpVisible] = useState(false);

  // Level Up state
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [levelUpVisible, setLevelUpVisible] = useState(false);

  // Achievement state
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [achievementVisible, setAchievementVisible] = useState(false);

  // Streak state
  const [streak, setStreak] = useState<{ days: number; xpBonus: number } | null>(null);
  const [streakVisible, setStreakVisible] = useState(false);

  const showXP = useCallback((amount: number, position?: { x: number; y: number }) => {
    setXpPopup({ amount, position });
    setXpVisible(true);
    // Auto-hide after animation
    setTimeout(() => {
      setXpVisible(false);
      setTimeout(() => setXpPopup(null), 300);
    }, 2000);
  }, []);

  const showLevelUp = useCallback((newLevel: number) => {
    setLevelUp(newLevel);
    setLevelUpVisible(true);
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUpVisible(false);
    setTimeout(() => setLevelUp(null), 300);
  }, []);

  const showAchievement = useCallback((ach: Achievement) => {
    setAchievement(ach);
    setAchievementVisible(true);
  }, []);

  const closeAchievement = useCallback(() => {
    setAchievementVisible(false);
    setTimeout(() => setAchievement(null), 300);
  }, []);

  const showStreak = useCallback((days: number, xpBonus: number) => {
    setStreak({ days, xpBonus });
    setStreakVisible(true);
  }, []);

  const closeStreak = useCallback(() => {
    setStreakVisible(false);
    setTimeout(() => setStreak(null), 300);
  }, []);

  return (
    <CelebrationContext.Provider value={{ showXP, showLevelUp, showAchievement, showStreak }}>
      {children}

      {/* XP Popup */}
      {xpPopup && (
        <XPPopup
          amount={xpPopup.amount}
          isVisible={xpVisible}
          position={xpPopup.position}
        />
      )}

      {/* Level Up Celebration */}
      {levelUp !== null && (
        <LevelUpCelebration
          isVisible={levelUpVisible}
          newLevel={levelUp}
          onClose={closeLevelUp}
        />
      )}

      {/* Achievement Unlock */}
      {achievement && (
        <AchievementUnlock
          isVisible={achievementVisible}
          achievement={achievement}
          onClose={closeAchievement}
        />
      )}

      {/* Streak Celebration */}
      {streak && (
        <StreakCelebration
          isVisible={streakVisible}
          streakDays={streak.days}
          xpBonus={streak.xpBonus}
          onClose={closeStreak}
        />
      )}
    </CelebrationContext.Provider>
  );
}
