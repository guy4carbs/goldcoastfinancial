/**
 * Training Analytics - Phase 5.1
 *
 * Personal analytics dashboard components:
 * - PersonalAnalytics: Time spent, completion rates, trends
 * - SkillRadarChart: Visual competency areas
 * - WeakAreasCard: Topics needing review
 * - AssessmentTrendChart: Performance over time
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Zap,
  Calendar,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// PERSONAL ANALYTICS
// ============================================================================

interface AnalyticsData {
  totalTimeSpent: number; // minutes
  thisWeekTime: number;
  lastWeekTime: number;
  completedModules: number;
  totalModules: number;
  passedAssessments: number;
  totalAssessments: number;
  averageScore: number;
  currentStreak: number;
  totalXP: number;
}

interface PersonalAnalyticsProps {
  data: AnalyticsData;
  className?: string;
}

export function PersonalAnalytics({ data, className }: PersonalAnalyticsProps) {
  const completionRate = Math.round((data.completedModules / data.totalModules) * 100);
  const assessmentRate = Math.round((data.passedAssessments / data.totalAssessments) * 100);
  const timeChange = data.thisWeekTime - data.lastWeekTime;
  const timeChangePercent = data.lastWeekTime > 0
    ? Math.round((timeChange / data.lastWeekTime) * 100)
    : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-500" />
          Your Training Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Spent */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Time Spent</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{formatTime(data.totalTimeSpent)}</p>
            <div className="flex items-center gap-1 mt-1">
              {timeChange >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={cn(
                "text-xs",
                timeChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {timeChange >= 0 ? "+" : ""}{timeChangePercent}% vs last week
              </span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Completion</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{completionRate}%</p>
            <p className="text-xs text-green-600 mt-1">
              {data.completedModules}/{data.totalModules} modules
            </p>
          </div>

          {/* Assessment Score */}
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{data.averageScore}%</p>
            <p className="text-xs text-purple-600 mt-1">
              {data.passedAssessments}/{data.totalAssessments} passed
            </p>
          </div>

          {/* Total XP */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{data.totalXP.toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1">
              {data.currentStreak} day streak
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SKILL RADAR CHART
// ============================================================================

interface SkillArea {
  name: string;
  score: number; // 0-100
  maxScore: number;
  category: string;
}

interface SkillRadarChartProps {
  skills: SkillArea[];
  className?: string;
}

export function SkillRadarChart({ skills, className }: SkillRadarChartProps) {
  // Create a simple radar-like visualization using CSS
  const maxSkills = 6;
  const displaySkills = skills.slice(0, maxSkills);

  const getSkillColor = (score: number) => {
    if (score >= 80) return { bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500" };
    if (score >= 60) return { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" };
    if (score >= 40) return { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" };
    return { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" };
  };

  const overallScore = Math.round(
    displaySkills.reduce((acc, s) => acc + s.score, 0) / displaySkills.length
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            Skill Competencies
          </CardTitle>
          <Badge variant="outline" className="text-primary">
            {overallScore}% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Radar-style circular visualization */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          {/* Background circles */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
          <div className="absolute inset-4 rounded-full border-2 border-gray-100" />
          <div className="absolute inset-8 rounded-full border-2 border-gray-100" />
          <div className="absolute inset-12 rounded-full border-2 border-gray-100" />

          {/* Center score */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{overallScore}</p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
          </div>

          {/* Skill points around the circle */}
          {displaySkills.map((skill, idx) => {
            const angle = (idx * 360 / displaySkills.length) - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 70 * (skill.score / 100);
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            const colors = getSkillColor(skill.score);

            return (
              <motion.div
                key={skill.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "absolute w-3 h-3 rounded-full",
                  colors.bar
                )}
                style={{
                  left: `calc(50% + ${x}px - 6px)`,
                  top: `calc(50% + ${y}px - 6px)`,
                }}
                title={`${skill.name}: ${skill.score}%`}
              />
            );
          })}
        </div>

        {/* Skill bars */}
        <div className="space-y-3">
          {displaySkills.map((skill) => {
            const colors = getSkillColor(skill.score);
            return (
              <div key={skill.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{skill.name}</span>
                  <span className={cn("text-xs font-semibold", colors.text)}>
                    {skill.score}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={cn("h-full rounded-full", colors.bar)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// WEAK AREAS CARD
// ============================================================================

interface WeakArea {
  id: string;
  topic: string;
  category: string;
  lastScore: number;
  attempts: number;
  recommendedModule?: string;
  moduleId?: string;
}

interface WeakAreasCardProps {
  weakAreas: WeakArea[];
  onReviewTopic?: (area: WeakArea) => void;
  className?: string;
}

export function WeakAreasCard({ weakAreas, onReviewTopic, className }: WeakAreasCardProps) {
  const sortedAreas = [...weakAreas].sort((a, b) => a.lastScore - b.lastScore);
  const topWeakAreas = sortedAreas.slice(0, 5);

  if (topWeakAreas.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-violet-500" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Great job! No weak areas identified.</p>
            <p className="text-xs text-gray-500 mt-1">Keep up the excellent work!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-1 bg-gradient-to-r from-amber-400 to-red-400" />
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Areas for Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topWeakAreas.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                area.lastScore < 50 ? "bg-red-100" : "bg-amber-100"
              )}>
                <span className={cn(
                  "text-sm font-bold",
                  area.lastScore < 50 ? "text-red-600" : "text-amber-600"
                )}>
                  {area.lastScore}%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{area.topic}</p>
                <p className="text-xs text-gray-500">
                  {area.category} • {area.attempts} attempt{area.attempts !== 1 ? 's' : ''}
                </p>
              </div>
              {onReviewTopic && area.moduleId && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-violet-500 hover:text-primary"
                  onClick={() => onReviewTopic(area)}
                >
                  Review
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {weakAreas.length > 5 && (
          <p className="text-xs text-gray-500 text-center mt-3">
            +{weakAreas.length - 5} more areas to review
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ASSESSMENT TREND CHART
// ============================================================================

interface AssessmentResult {
  date: Date;
  assessmentName: string;
  score: number;
  passingScore: number;
  passed: boolean;
}

interface AssessmentTrendChartProps {
  results: AssessmentResult[];
  className?: string;
}

export function AssessmentTrendChart({ results, className }: AssessmentTrendChartProps) {
  const sortedResults = [...results].sort((a, b) => a.date.getTime() - b.date.getTime());
  const recentResults = sortedResults.slice(-10);

  const averageScore = recentResults.length > 0
    ? Math.round(recentResults.reduce((acc, r) => acc + r.score, 0) / recentResults.length)
    : 0;

  const trend = recentResults.length >= 2
    ? recentResults[recentResults.length - 1].score - recentResults[0].score
    : 0;

  const maxScore = Math.max(...recentResults.map(r => r.score), 100);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-500" />
            Assessment Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Avg: {averageScore}%</Badge>
            {trend !== 0 && (
              <Badge className={cn(
                trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trend > 0 ? "+" : ""}{trend}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentResults.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No assessment results yet</p>
          </div>
        ) : (
          <>
            {/* Simple bar chart */}
            <div className="flex items-end justify-between gap-2 h-32 mb-4">
              {recentResults.map((result, idx) => {
                const height = (result.score / maxScore) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center"
                    title={`${result.assessmentName}: ${result.score}%`}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={cn(
                        "w-full rounded-t-sm",
                        result.passed ? "bg-green-500" : "bg-red-400"
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* Passing line indicator */}
            <div className="relative h-px bg-gray-200 mb-4">
              <div
                className="absolute left-0 h-px bg-amber-400 border-dashed"
                style={{ width: '100%', top: 0 }}
              />
              <span className="absolute -top-2 right-0 text-[10px] text-amber-600">
                Passing threshold
              </span>
            </div>

            {/* Recent results list */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[...recentResults].reverse().slice(0, 4).map((result, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="truncate max-w-[150px]">{result.assessmentName}</span>
                  </div>
                  <span className={cn(
                    "font-medium",
                    result.passed ? "text-green-600" : "text-red-600"
                  )}>
                    {result.score}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// LEARNING VELOCITY
// ============================================================================

interface LearningVelocityProps {
  userModulesPerWeek: number;
  cohortAverage: number;
  topPerformerAverage: number;
  className?: string;
}

export function LearningVelocity({
  userModulesPerWeek,
  cohortAverage,
  topPerformerAverage,
  className
}: LearningVelocityProps) {
  const vsCorhort = Math.round(((userModulesPerWeek - cohortAverage) / cohortAverage) * 100);
  const maxValue = Math.max(userModulesPerWeek, cohortAverage, topPerformerAverage);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-500" />
          Learning Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Your pace */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Your Pace</span>
              <span className="text-sm font-bold text-primary">
                {userModulesPerWeek.toFixed(1)} modules/week
              </span>
            </div>
            <Progress value={(userModulesPerWeek / maxValue) * 100} className="h-3" />
          </div>

          {/* Cohort average */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Cohort Average</span>
              <span className="text-sm text-gray-600">
                {cohortAverage.toFixed(1)} modules/week
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full"
                style={{ width: `${(cohortAverage / maxValue) * 100}%` }}
              />
            </div>
          </div>

          {/* Top performers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Top 10%</span>
              <span className="text-sm text-gray-600">
                {topPerformerAverage.toFixed(1)} modules/week
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(topPerformerAverage / maxValue) * 100}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className={cn(
            "p-3 rounded-lg text-center",
            vsCorhort >= 0 ? "bg-green-50" : "bg-amber-50"
          )}>
            <p className={cn(
              "text-sm font-medium",
              vsCorhort >= 0 ? "text-green-700" : "text-amber-700"
            )}>
              {vsCorhort >= 0 ? (
                <>You're {Math.abs(vsCorhort)}% faster than average!</>
              ) : (
                <>You're {Math.abs(vsCorhort)}% behind the cohort average</>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
