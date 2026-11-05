export type ThemeMode = 'dark-amoled' | 'dark' | 'light';

export type MainTab = 'HOME' | 'FOCUS' | 'WAKEUP' | 'PROGRESS' | 'PROFILE';

export type GoalCategory =
  | 'Government Jobs (RRB, SSC, UPSC, Banking)'
  | 'Competitive Exams (JEE, NEET, GATE, CAT)'
  | 'Career & Software Engineering'
  | 'Business & Entrepreneurship'
  | 'Personal Growth & Fitness';

export type DifficultyLevel =
  | 'EASY'
  | 'EASY_MEDIUM'
  | 'MEDIUM'
  | 'MEDIUM_HARD'
  | 'HARD'
  | 'EXPERT';

export type MathCategory =
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'Tables 1-30'
  | 'Squares & Roots'
  | 'Cubes & Cube Roots'
  | 'Percentages'
  | 'Fractions'
  | 'BODMAS'
  | 'Number Series'
  | 'Missing Number'
  | 'Algebra'
  | 'Mental Math Tricks'
  | 'Competitive Exam Calc';

export type ChallengeMode =
  | 'MATH'
  | 'MEMORY'
  | 'NUMBER_SERIES'
  | 'BRAIN_TEASER'
  | 'REFLEX'
  | 'QR_CODE'
  | 'COMBINED';

export type ClockTheme =
  | 'ORANGE_DIGITAL'
  | 'AMOLED_MINIMAL'
  | 'FLIP_CLOCK'
  | 'NEON_CYBER';

export interface CustomGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetDate: string; // YYYY-MM-DD
  whyStatement: string;
  motivationQuote: string;
  photoDataUrl?: string;
  dailyTargetHours: number;
  completedMinutesToday: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  onboardingCompleted: boolean;
  primaryGoalTitle: string;
  goalCategory: GoalCategory;
  targetDate: string;
  whyImportant: string;
  personalStatement: string;
  goalPhotoUrl: string;
  biggestDistraction: string;
  distractingApps: string[];
  dailyFocusTargetHours: number;
  desiredWakeUpTime: string; // HH:mm
  usualSleepTime: string; // HH:mm
  registeredQrCode: string;
  futureSelfMessages: string[];
  themeMode: ThemeMode;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationFrequencyMinutes: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface AlarmItem {
  id: string;
  time: string; // HH:mm (24h)
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0=Sun .. 6=Sat
  soundType: 'CHAMPION_CHIME' | 'TACTICAL_PULSE' | 'DIGITAL_BELL' | 'SUNRISE_HARMONICS' | 'INTENSE_SIREN';
  vibrate: boolean;
  gradualVolume: boolean;
  snoozeMinutes: number;
  maxSnoozeCount: number;
  currentSnoozeCount: number;
  questionCount: 10 | 15 | 20;
  challengeMode: ChallengeMode;
  baseDifficulty: DifficultyLevel;
  lastTriggeredDate?: string;
}

export interface AlarmHistoryEntry {
  id: string;
  alarmId: string;
  alarmLabel: string;
  triggeredAt: string;
  dismissedAt: string;
  snoozeCount: number;
  finalDifficulty: DifficultyLevel;
  questionsSolved: number;
  usedEmergencyDismiss: boolean;
}

export interface MathQuestion {
  id: string;
  category: MathCategory;
  difficulty: DifficultyLevel;
  prompt: string;
  answer: number;
  acceptableTolerance?: number;
  hint: string;
  explanation: string;
}

export interface MathTrickModule {
  id: string;
  title: string;
  category: string;
  concept: string;
  shortcutFormula: string;
  workedExample: {
    problem: string;
    steps: string[];
    finalAnswer: string;
  };
  practiceQuestions: {
    question: string;
    answer: number;
    explanation: string;
  }[];
}

export interface FocusSession {
  id: string;
  taskTitle: string;
  goalId: string;
  durationMinutes: number;
  completedMinutes: number;
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'INTERRUPTED';
  dndActive: boolean;
  coinsEarned: number;
}

export interface DistractingAppItem {
  id: string;
  packageName: string;
  appName: string;
  category: 'Social Media' | 'Short Video' | 'Gaming' | 'Streaming' | 'Messaging';
  isBlockedDuringFocus: boolean;
  isAllowedInBreak: boolean;
  usageMinutesToday: number;
  dailyLimitMinutes: number;
  blockedAttemptsToday: number;
}

export interface DailyChallengeItem {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  rewardCoins: number;
  completed: boolean;
  isCustom?: boolean;
}

export interface ReflectionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  accomplishment: string;
  completedMainGoal: boolean;
  biggestDistraction: string;
  improvementForTomorrow: string;
  moodRating: number; // 1-5
}

export type GardenStage = 'SEED' | 'SPROUT' | 'PLANT' | 'TREE' | 'BEAUTIFUL_GARDEN';

export interface GardenTree {
  id: string;
  plantedDate: string;
  sessionsContributed: number;
  stage: GardenStage;
  speciesName: string;
}

export interface NotificationItem {
  id: string;
  category:
    | 'Morning Motivation'
    | 'Goal Reminder'
    | 'Focus Reminder'
    | 'Discipline'
    | 'Break Over'
    | 'Study Boost'
    | 'Confidence'
    | 'Competition'
    | 'Evening Reflection'
    | 'Wake-Up Streak'
    | 'Comeback'
    | 'Future Self';
  title: string;
  body: string;
  timestamp: string;
  actionTab: MainTab;
  read: boolean;
}

export interface AndroidPermissionStatus {
  postNotifications: boolean;
  scheduleExactAlarm: boolean;
  fullScreenIntent: boolean;
  accessNotificationPolicyDnd: boolean;
  packageUsageStats: boolean;
  accessibilityService: boolean;
  cameraQr: boolean;
}
