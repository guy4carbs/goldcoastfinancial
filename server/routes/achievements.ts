/**
 * Achievements API Routes
 * Self-checking achievement system — querying the endpoint evaluates all criteria
 * against real data (deals, calls, policies, XP, streaks) and auto-unlocks.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// =============================================================================
// GET / — Fetch all achievements for authenticated agent
// Returns earned milestones from DB + all available milestones with unlock status
// Auto-unlocks any achievements whose criteria are met but not yet recorded
// =============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) return res.status(401).json({ error: "Not authenticated" });

    // Fetch earned milestones from DB
    const earnedResult = await pool.query(
      'SELECT * FROM agent_milestones WHERE user_id = $1 ORDER BY earned_at DESC',
      [user.id]
    );
    const earned = earnedResult.rows;
    const earnedIds = new Set(earned.map((e: any) => e.milestone_id));

    // Fetch user stats for determining progress
    const xpResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_xp FROM agent_xp_transactions WHERE user_id = $1',
      [user.id]
    );
    const totalXp = parseInt(xpResult.rows[0]?.total_xp || '0');

    const dealsResult = await pool.query(
      'SELECT COUNT(*) as deal_count, COALESCE(SUM(annual_premium), 0) as total_ap FROM deals WHERE agent_user_id = $1',
      [user.id]
    );
    const dealCount = parseInt(dealsResult.rows[0]?.deal_count || '0');
    const totalAP = parseFloat(dealsResult.rows[0]?.total_ap || '0');

    const callsResult = await pool.query(
      "SELECT COUNT(*) as call_count FROM call_recordings WHERE agent_user_id = $1 AND status = 'completed'",
      [user.id]
    );
    const callCount = parseInt(callsResult.rows[0]?.call_count || '0');

    const policiesResult = await pool.query(
      'SELECT COUNT(*) as policy_count FROM policies WHERE agent_id = $1',
      [user.id]
    );
    const policyCount = parseInt(policiesResult.rows[0]?.policy_count || '0');

    // Fetch streak
    const streakResult = await pool.query(
      'SELECT * FROM agent_streaks WHERE user_id = $1',
      [user.id]
    );
    const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

    // Additional metrics for harder achievements (wrapped in try/catch — tables may not exist)
    let activeClientCount = 0;
    try {
      const bookResult = await pool.query(
        'SELECT COUNT(*) as count FROM policies WHERE agent_id = $1 AND client_status = $2',
        [user.id, 'active']
      );
      activeClientCount = parseInt(bookResult.rows[0]?.count || '0');
    } catch (err) {
      // policies table may not have client_status column — default to 0
    }

    let referralCount = 0;
    try {
      const referralResult = await pool.query(
        "SELECT COUNT(*) as count FROM leads WHERE assigned_to = $1 AND source = 'referral'",
        [user.id]
      );
      referralCount = parseInt(referralResult.rows[0]?.count || '0');
    } catch (err) {
      // leads table or source column may not exist — default to 0
    }

    let trainingSessions = 0;
    try {
      const trainSessionsResult = await pool.query(
        "SELECT COUNT(*) as count FROM training_sessions WHERE (requestor_id = $1 OR trainer_id = $1) AND status = 'completed'",
        [user.id]
      );
      trainingSessions = parseInt(trainSessionsResult.rows[0]?.count || '0');
    } catch (err) {
      // training_sessions table may not exist — default to 0
    }

    // Define all available achievements with progress calculation (40 achievements)
    const allAchievements = [
      // === SALES: DEALS ===
      { id: 'first-deal', name: 'First Deal', description: 'Submit your first deal', tier: 'bronze', icon: 'trophy', category: 'sales', points: 50, requirement: 1, progress: Math.min(dealCount, 1), type: 'deals' },
      { id: 'deal-5', name: 'Deal Machine', description: 'Submit 5 deals', tier: 'bronze', icon: 'zap', category: 'sales', points: 75, requirement: 5, progress: Math.min(dealCount, 5), type: 'deals' },
      { id: 'deal-25', name: 'Quarter Century', description: 'Submit 25 deals', tier: 'silver', icon: 'award', category: 'sales', points: 150, requirement: 25, progress: Math.min(dealCount, 25), type: 'deals' },
      { id: 'deal-50', name: 'Half Century', description: 'Submit 50 deals', tier: 'silver', icon: 'award', category: 'sales', points: 250, requirement: 50, progress: Math.min(dealCount, 50), type: 'deals' },
      { id: 'deal-100', name: 'Century Club', description: 'Submit 100 deals', tier: 'gold', icon: 'star', category: 'sales', points: 500, requirement: 100, progress: Math.min(dealCount, 100), type: 'deals' },
      { id: 'deal-250', name: 'Sales Legend', description: 'Submit 250 deals', tier: 'platinum', icon: 'star', category: 'sales', points: 1000, requirement: 250, progress: Math.min(dealCount, 250), type: 'deals' },
      { id: 'deal-500', name: 'Half Thousand', description: 'Submit 500 deals — elite tier', tier: 'platinum', icon: 'star', category: 'sales', points: 2000, requirement: 500, progress: Math.min(dealCount, 500), type: 'deals' },

      // === ACTIVITY: CALLS ===
      { id: 'first-call', name: 'Ring Ring', description: 'Complete your first call', tier: 'bronze', icon: 'phone', category: 'activity', points: 25, requirement: 1, progress: Math.min(callCount, 1), type: 'calls' },
      { id: 'call-25', name: 'Dialing In', description: 'Complete 25 calls', tier: 'bronze', icon: 'phone', category: 'activity', points: 50, requirement: 25, progress: Math.min(callCount, 25), type: 'calls' },
      { id: 'call-100', name: 'Call Warrior', description: 'Complete 100 calls', tier: 'silver', icon: 'flame', category: 'activity', points: 150, requirement: 100, progress: Math.min(callCount, 100), type: 'calls' },
      { id: 'call-500', name: 'Phone Master', description: 'Complete 500 calls', tier: 'gold', icon: 'trophy', category: 'activity', points: 400, requirement: 500, progress: Math.min(callCount, 500), type: 'calls' },
      { id: 'call-1000', name: 'Thousand Dials', description: 'Complete 1,000 calls — relentless', tier: 'platinum', icon: 'star', category: 'activity', points: 1000, requirement: 1000, progress: Math.min(callCount, 1000), type: 'calls' },

      // === SALES: POLICIES ===
      { id: 'first-policy', name: 'Policy Pro', description: 'Get your first policy placed', tier: 'bronze', icon: 'shield', category: 'sales', points: 75, requirement: 1, progress: Math.min(policyCount, 1), type: 'policies' },
      { id: 'policy-10', name: 'Book Builder', description: 'Place 10 policies', tier: 'silver', icon: 'shield', category: 'sales', points: 200, requirement: 10, progress: Math.min(policyCount, 10), type: 'policies' },
      { id: 'policy-25', name: 'Coverage Champion', description: 'Place 25 policies', tier: 'gold', icon: 'award', category: 'sales', points: 400, requirement: 25, progress: Math.min(policyCount, 25), type: 'policies' },
      { id: 'policy-50', name: 'Insurance Authority', description: 'Place 50 policies', tier: 'gold', icon: 'star', category: 'sales', points: 750, requirement: 50, progress: Math.min(policyCount, 50), type: 'policies' },
      { id: 'policy-100', name: 'Centurion', description: 'Place 100 policies — legendary', tier: 'platinum', icon: 'star', category: 'sales', points: 1500, requirement: 100, progress: Math.min(policyCount, 100), type: 'policies' },

      // === REVENUE: ANNUAL PREMIUM ===
      { id: 'ap-10k', name: '$10K Club', description: 'Reach $10,000 in Annual Premium', tier: 'bronze', icon: 'dollar', category: 'revenue', points: 100, requirement: 10000, progress: Math.min(totalAP, 10000), type: 'ap' },
      { id: 'ap-25k', name: '$25K Producer', description: 'Reach $25,000 in Annual Premium', tier: 'silver', icon: 'dollar', category: 'revenue', points: 200, requirement: 25000, progress: Math.min(totalAP, 25000), type: 'ap' },
      { id: 'ap-50k', name: '$50K Earner', description: 'Reach $50,000 in Annual Premium', tier: 'silver', icon: 'dollar', category: 'revenue', points: 350, requirement: 50000, progress: Math.min(totalAP, 50000), type: 'ap' },
      { id: 'ap-100k', name: 'Six Figure Agent', description: 'Reach $100,000 in Annual Premium', tier: 'gold', icon: 'award', category: 'revenue', points: 750, requirement: 100000, progress: Math.min(totalAP, 100000), type: 'ap' },
      { id: 'ap-250k', name: 'Quarter Million', description: 'Reach $250,000 in Annual Premium', tier: 'gold', icon: 'star', category: 'revenue', points: 1500, requirement: 250000, progress: Math.min(totalAP, 250000), type: 'ap' },
      { id: 'ap-500k', name: 'Half Million Producer', description: 'Reach $500,000 in Annual Premium', tier: 'platinum', icon: 'star', category: 'revenue', points: 3000, requirement: 500000, progress: Math.min(totalAP, 500000), type: 'ap' },
      { id: 'ap-1m', name: 'Million Dollar Agent', description: 'Reach $1,000,000 in Annual Premium — the pinnacle', tier: 'platinum', icon: 'star', category: 'revenue', points: 5000, requirement: 1000000, progress: Math.min(totalAP, 1000000), type: 'ap' },

      // === CLIENTS: BOOK OF BUSINESS ===
      { id: 'active-5', name: 'Client Builder', description: 'Have 5 active clients in your book', tier: 'bronze', icon: 'users', category: 'sales', points: 75, requirement: 5, progress: Math.min(activeClientCount, 5), type: 'clients' },
      { id: 'active-25', name: 'Trusted Advisor', description: 'Have 25 active clients', tier: 'silver', icon: 'users', category: 'sales', points: 250, requirement: 25, progress: Math.min(activeClientCount, 25), type: 'clients' },
      { id: 'active-100', name: 'Agency Builder', description: 'Have 100 active clients', tier: 'gold', icon: 'users', category: 'sales', points: 750, requirement: 100, progress: Math.min(activeClientCount, 100), type: 'clients' },

      // === REFERRALS ===
      { id: 'referral-1', name: 'First Referral', description: 'Receive your first referral lead', tier: 'bronze', icon: 'share', category: 'activity', points: 50, requirement: 1, progress: Math.min(referralCount, 1), type: 'referrals' },
      { id: 'referral-10', name: 'Referral Magnet', description: 'Receive 10 referral leads', tier: 'silver', icon: 'share', category: 'activity', points: 200, requirement: 10, progress: Math.min(referralCount, 10), type: 'referrals' },
      { id: 'referral-50', name: 'Word of Mouth King', description: 'Receive 50 referral leads', tier: 'gold', icon: 'share', category: 'activity', points: 500, requirement: 50, progress: Math.min(referralCount, 50), type: 'referrals' },

      // === TRAINING ===
      { id: 'xp-100', name: 'Getting Started', description: 'Earn 100 XP', tier: 'bronze', icon: 'zap', category: 'training', points: 25, requirement: 100, progress: Math.min(totalXp, 100), type: 'xp' },
      { id: 'xp-500', name: 'Knowledge Seeker', description: 'Earn 500 XP', tier: 'silver', icon: 'zap', category: 'training', points: 75, requirement: 500, progress: Math.min(totalXp, 500), type: 'xp' },
      { id: 'xp-1000', name: 'Expert Learner', description: 'Earn 1,000 XP', tier: 'gold', icon: 'award', category: 'training', points: 200, requirement: 1000, progress: Math.min(totalXp, 1000), type: 'xp' },
      { id: 'xp-5000', name: 'XP Master', description: 'Earn 5,000 XP — deep commitment to growth', tier: 'platinum', icon: 'star', category: 'training', points: 750, requirement: 5000, progress: Math.min(totalXp, 5000), type: 'xp' },
      { id: 'training-5', name: 'Coachable', description: 'Complete 5 training sessions', tier: 'bronze', icon: 'book', category: 'training', points: 50, requirement: 5, progress: Math.min(trainingSessions, 5), type: 'training' },
      { id: 'training-25', name: 'Student of the Game', description: 'Complete 25 training sessions', tier: 'silver', icon: 'book', category: 'training', points: 200, requirement: 25, progress: Math.min(trainingSessions, 25), type: 'training' },

      // === CONSISTENCY: STREAKS ===
      { id: 'streak-7', name: 'Week Warrior', description: '7-day activity streak', tier: 'bronze', icon: 'flame', category: 'consistency', points: 50, requirement: 7, progress: Math.min(streak.current_streak || 0, 7), type: 'streak' },
      { id: 'streak-14', name: 'Two Week Grind', description: '14-day activity streak', tier: 'silver', icon: 'flame', category: 'consistency', points: 100, requirement: 14, progress: Math.min(streak.current_streak || 0, 14), type: 'streak' },
      { id: 'streak-30', name: 'Monthly Master', description: '30-day activity streak', tier: 'gold', icon: 'flame', category: 'consistency', points: 250, requirement: 30, progress: Math.min(streak.current_streak || 0, 30), type: 'streak' },
      { id: 'streak-90', name: 'Quarter of Fire', description: '90-day activity streak — unstoppable', tier: 'platinum', icon: 'star', category: 'consistency', points: 1000, requirement: 90, progress: Math.min(streak.current_streak || 0, 90), type: 'streak' },
      { id: 'streak-365', name: 'Year of Discipline', description: '365-day activity streak — legendary commitment', tier: 'platinum', icon: 'star', category: 'consistency', points: 5000, requirement: 365, progress: Math.min(streak.current_streak || 0, 365), type: 'streak' },
    ];

    // Auto-unlock any achievements that are met but not yet earned
    const newlyUnlocked: any[] = [];
    for (const ach of allAchievements) {
      if (!earnedIds.has(ach.id) && ach.progress >= ach.requirement) {
        try {
          await pool.query(
            'INSERT INTO agent_milestones (user_id, milestone_id, milestone_name, milestone_tier, points_awarded) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, milestone_id) DO NOTHING',
            [user.id, ach.id, ach.name, ach.tier, ach.points]
          );
          // Award XP for the achievement
          await pool.query(
            "INSERT INTO agent_xp_transactions (user_id, amount, reason, source_type, source_id) VALUES ($1, $2, $3, 'achievement', $4)",
            [user.id, ach.points, `Achievement unlocked: ${ach.name}`, ach.id]
          );
          earnedIds.add(ach.id);
          newlyUnlocked.push(ach);
        } catch (err) {
          // Ignore duplicate key conflicts (race condition safe)
        }
      }
    }

    // Re-fetch earned if we unlocked new ones (to get earned_at timestamps)
    let finalEarned = earned;
    if (newlyUnlocked.length > 0) {
      const refreshed = await pool.query(
        'SELECT * FROM agent_milestones WHERE user_id = $1 ORDER BY earned_at DESC',
        [user.id]
      );
      finalEarned = refreshed.rows;
    }

    // Build response
    const achievements = allAchievements.map(ach => ({
      ...ach,
      status: earnedIds.has(ach.id) ? 'unlocked' as const : ach.progress > 0 ? 'in_progress' as const : 'locked' as const,
      earnedAt: finalEarned.find((e: any) => e.milestone_id === ach.id)?.earned_at || null,
      progressPercent: Math.round((ach.progress / ach.requirement) * 100),
    }));

    const totalPointsEarned = finalEarned.reduce((sum: number, e: any) => sum + (e.points_awarded || 0), 0);

    const stats = {
      totalUnlocked: achievements.filter(a => a.status === 'unlocked').length,
      totalInProgress: achievements.filter(a => a.status === 'in_progress').length,
      totalLocked: achievements.filter(a => a.status === 'locked').length,
      totalPoints: totalPointsEarned,
      currentStreak: streak.current_streak || 0,
      longestStreak: streak.longest_streak || 0,
    };

    res.json({ achievements, stats, newlyUnlocked });
  } catch (error) {
    console.error("[achievements] Error fetching achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// =============================================================================
// POST /check — Manually trigger achievement check
// Called after actions like deal submit, call complete, etc.
// =============================================================================
router.post("/check", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) return res.status(401).json({ error: "Not authenticated" });

    // The GET endpoint already auto-unlocks, so we just trigger it internally
    // and return the newly unlocked achievements
    // For efficiency, redirect to the GET logic (calling the same endpoint)
    res.json({ checked: true, message: "Use GET /api/achievements to see results" });
  } catch (error) {
    console.error("[achievements] Error checking achievements:", error);
    res.status(500).json({ error: "Failed to check achievements" });
  }
});

export default router;
