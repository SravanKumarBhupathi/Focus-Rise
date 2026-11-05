/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock,
  Award,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Copy,
  Crown,
  Download,
  Edit3,
  Flame,
  Heart,
  Home,
  Moon,
  Pause,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  AlarmHistoryEntry,
  AlarmItem,
  AndroidPermissionStatus,
  ChallengeMode,
  CustomGoal,
  DailyChallengeItem,
  DifficultyLevel,
  DistractingAppItem,
  FocusSession,
  GardenStage,
  MainTab,
  NotificationItem,
  ReflectionEntry,
  ThemeMode,
  UserProfile,
} from './types/focusrise';
import { DigitalClockView } from './components/DigitalClockView';
import { AlarmChallengeModal } from './components/AlarmChallengeModal';
import { MorningMathsMasterView } from './components/MorningMathsMasterView';
import { OnboardingModal } from './components/OnboardingModal';
import { formatDifficultyLabel, getProgressiveDifficulty } from './services/mathEngine';
import { generatePersonalizedNotification } from './services/motivationalLibrary';
import { AMBIENT_TRACKS, AmbientTrackId, soundEngine } from './services/soundEngine';
import { ANDROID_PROJECT_FILES } from './services/androidSourceExporter';

const STORAGE_KEY = 'focusrise_king_state_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Champion',
  onboardingCompleted: false,
  primaryGoalTitle: 'RRB NTPC PREPARATION',
  goalCategory: 'Government Jobs (RRB, SSC, UPSC, Banking)',
  targetDate: '2027-03-15',
  whyImportant: 'To secure a prestigious career, make my family proud, and achieve complete financial independence.',
  personalStatement: 'Wake Up. Think Fast. Stay Focused. Win Your Future.',
  goalPhotoUrl: '',
  biggestDistraction: 'Short-form videos and morning snoozing',
  distractingApps: ['Instagram', 'YouTube Shorts', 'Reels / TikTok'],
  dailyFocusTargetHours: 3,
  desiredWakeUpTime: '05:30',
  usualSleepTime: '22:00',
  registeredQrCode: 'FOCUSRISE-KING-2026',
  futureSelfMessages: [
    "Hey! I'm your future successful self. I know today is difficult. But please don't give up on the dream we started chasing.",
    'Every morning you beat the alarm puzzle, you Separate yourself from 95% of your competition.',
    'Stay locked in on RRB NTPC Preparation today — our future self is thanking you for every single hour.',
  ],
  themeMode: 'dark-amoled',
  quietHoursStart: '22:30',
  quietHoursEnd: '05:00',
  notificationFrequencyMinutes: 60,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alarm_1',
    time: '05:30',
    label: 'RRB NTPC Morning Revision & Speed Math',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5, 6],
    soundType: 'CHAMPION_CHIME',
    vibrate: true,
    gradualVolume: true,
    snoozeMinutes: 5,
    maxSnoozeCount: 5,
    currentSnoozeCount: 0,
    questionCount: 10,
    challengeMode: 'MATH',
    baseDifficulty: 'EASY',
  },
  {
    id: 'alarm_2',
    time: '06:15',
    label: 'Mock Test Deep Practice Block',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    soundType: 'TACTICAL_PULSE',
    vibrate: true,
    gradualVolume: true,
    snoozeMinutes: 5,
    maxSnoozeCount: 3,
    currentSnoozeCount: 2, // Pre-configured at Snooze 2 (MEDIUM) so user can test Snooze 2 right away!
    questionCount: 10,
    challengeMode: 'MATH',
    baseDifficulty: 'EASY',
  },
];

const DEFAULT_DISTRACTING_APPS: DistractingAppItem[] = [
  {
    id: 'app_ig',
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    category: 'Social Media',
    isBlockedDuringFocus: true,
    isAllowedInBreak: false,
    usageMinutesToday: 28,
    dailyLimitMinutes: 30,
    blockedAttemptsToday: 4,
  },
  {
    id: 'app_yt',
    packageName: 'com.google.android.youtube',
    appName: 'YouTube Shorts',
    category: 'Short Video',
    isBlockedDuringFocus: true,
    isAllowedInBreak: true,
    usageMinutesToday: 35,
    dailyLimitMinutes: 45,
    blockedAttemptsToday: 3,
  },
  {
    id: 'app_wa',
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    category: 'Messaging',
    isBlockedDuringFocus: true,
    isAllowedInBreak: true,
    usageMinutesToday: 19,
    dailyLimitMinutes: 30,
    blockedAttemptsToday: 2,
  },
  {
    id: 'app_x',
    packageName: 'com.twitter.android',
    appName: 'X / Twitter',
    category: 'Social Media',
    isBlockedDuringFocus: true,
    isAllowedInBreak: false,
    usageMinutesToday: 12,
    dailyLimitMinutes: 20,
    blockedAttemptsToday: 1,
  },
  {
    id: 'app_game',
    packageName: 'com.pubg.imobile',
    appName: 'Mobile Gaming',
    category: 'Gaming',
    isBlockedDuringFocus: true,
    isAllowedInBreak: false,
    usageMinutesToday: 0,
    dailyLimitMinutes: 15,
    blockedAttemptsToday: 2,
  },
];

const DEFAULT_DAILY_CHALLENGES: DailyChallengeItem[] = [
  {
    id: 'dc_1',
    title: 'Complete 3 Focus Sessions',
    description: 'Finish three uninterrupted deep work blocks today',
    targetValue: 3,
    currentValue: 2,
    unit: 'sessions',
    rewardCoins: 50,
    completed: false,
  },
  {
    id: 'dc_2',
    title: 'Study for 90 Minutes',
    description: 'Accumulate at least 90 minutes of tracked focus today',
    targetValue: 90,
    currentValue: 80,
    unit: 'mins',
    rewardCoins: 60,
    completed: false,
  },
  {
    id: 'dc_3',
    title: 'Complete 50 Practice Questions',
    description: 'Solve alarm math challenges or Morning Maths Master drills',
    targetValue: 50,
    currentValue: 32,
    unit: 'questions',
    rewardCoins: 75,
    completed: false,
  },
  {
    id: 'dc_4',
    title: 'Wake Up On Time',
    description: 'Dismiss your morning Smart Alarm without emergency skip',
    targetValue: 1,
    currentValue: 1,
    unit: 'alarm',
    rewardCoins: 40,
    completed: true,
  },
  {
    id: 'dc_5',
    title: 'Avoid Distracting Apps During Focus',
    description: 'Keep Distraction Shield active during all study sessions',
    targetValue: 1,
    currentValue: 1,
    unit: 'day',
    rewardCoins: 45,
    completed: true,
  },
  {
    id: 'dc_6',
    title: 'Maintain a 7-Day Discipline Streak',
    description: 'Show up every single day for a full week',
    targetValue: 7,
    currentValue: 5,
    unit: 'days',
    rewardCoins: 100,
    completed: false,
  },
];

const DEFAULT_SESSIONS: FocusSession[] = [
  {
    id: 'sess_seed_1',
    taskTitle: 'RRB NTPC Quantitative Aptitude — Simplification & Percentages',
    goalId: 'primary',
    durationMinutes: 45,
    completedMinutes: 45,
    startedAt: '06:00 AM',
    completedAt: '06:45 AM',
    status: 'COMPLETED',
    dndActive: true,
    coinsEarned: 45,
  },
  {
    id: 'sess_seed_2',
    taskTitle: 'General Awareness & Previous Year Paper Analysis',
    goalId: 'primary',
    durationMinutes: 35,
    completedMinutes: 35,
    startedAt: '08:15 AM',
    completedAt: '08:50 AM',
    status: 'COMPLETED',
    dndActive: true,
    coinsEarned: 35,
  },
];

const DEFAULT_REFLECTIONS: ReflectionEntry[] = [
  {
    id: 'ref_1',
    date: '2026-11-04',
    accomplishment: 'Completed 2 full mock sets and mastered Base-50 squares.',
    completedMainGoal: true,
    biggestDistraction: 'Afternoon fatigue around 3 PM',
    improvementForTomorrow: 'Take a structured 10-minute walk break instead of checking phone.',
    moodRating: 5,
  },
];

export default function App() {
  // Load persisted state from localStorage
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [activeTab, setActiveTab] = useState<MainTab>('HOME');
  const [profile, setProfile] = useState<UserProfile>(savedState?.profile || DEFAULT_PROFILE);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>(
    savedState?.customGoals || [
      {
        id: 'goal_1',
        title: 'RRB NTPC PREPARATION',
        category: 'Government Jobs (RRB, SSC, UPSC, Banking)',
        targetDate: '2027-03-15',
        whyStatement: 'To build a proud career and financial security for my family.',
        motivationQuote: 'Every calculation mastered brings the appointment letter closer.',
        dailyTargetHours: 3,
        completedMinutesToday: 80,
        isPrimary: true,
        createdAt: '2026-11-01',
      },
    ]
  );
  const [alarms, setAlarms] = useState<AlarmItem[]>(savedState?.alarms || DEFAULT_ALARMS);
  const [alarmHistory, setAlarmHistory] = useState<AlarmHistoryEntry[]>(
    savedState?.alarmHistory || [
      {
        id: 'hist_1',
        alarmId: 'alarm_1',
        alarmLabel: 'RRB NTPC Morning Revision & Speed Math',
        triggeredAt: '05:30 AM',
        dismissedAt: '05:33 AM',
        snoozeCount: 0,
        finalDifficulty: 'EASY',
        questionsSolved: 10,
        usedEmergencyDismiss: false,
      },
    ]
  );
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(
    savedState?.focusSessions || DEFAULT_SESSIONS
  );
  const [distractingApps, setDistractingApps] = useState<DistractingAppItem[]>(
    savedState?.distractingApps || DEFAULT_DISTRACTING_APPS
  );
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeItem[]>(
    savedState?.dailyChallenges || DEFAULT_DAILY_CHALLENGES
  );
  const [reflections, setReflections] = useState<ReflectionEntry[]>(
    savedState?.reflections || DEFAULT_REFLECTIONS
  );
  const [completedTricks, setCompletedTricks] = useState<string[]>(
    savedState?.completedTricks || ['trick_mult_11', 'trick_square_ending_5']
  );
  const [focusCoins, setFocusCoins] = useState<number>(savedState?.focusCoins ?? 340);
  const [streakDays, setStreakDays] = useState<number>(savedState?.streakDays ?? 5);
  const [permissions, setPermissions] = useState<AndroidPermissionStatus>(
    savedState?.permissions || {
      postNotifications: true,
      scheduleExactAlarm: true,
      fullScreenIntent: true,
      accessNotificationPolicyDnd: true,
      packageUsageStats: true,
      accessibilityService: true,
      cameraQr: true,
    }
  );

  // Modals & transient UI states
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    generatePersonalizedNotification(DEFAULT_PROFILE, 130, 'Morning Motivation'),
    generatePersonalizedNotification(DEFAULT_PROFILE, 130, 'Future Self'),
  ]);

  // Focus Mode & Break State
  const [timerMode, setTimerMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [selectedFocusMinutes, setSelectedFocusMinutes] = useState<number>(25);
  const [customFocusMinutes, setCustomFocusMinutes] = useState<string>('50');
  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string>(
    'RRB NTPC Quantitative Aptitude & Mock Practice'
  );
  const [dndEnabledForSession, setDndEnabledForSession] = useState<boolean>(true);
  const [previousDndStateRestoredMessage, setPreviousDndStateRestoredMessage] =
    useState<string>('');
  const [blockedAppAttemptModal, setBlockedAppAttemptModal] =
    useState<DistractingAppItem | null>(null);

  // Ambient Focus Sound Player State
  const [activeAmbientTrack, setActiveAmbientTrack] = useState<AmbientTrackId | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.55);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // WakeUp Sub-navigation
  const [wakeupSubTab, setWakeupSubTab] = useState<'ALARMS' | 'CLOCK' | 'MATH_MASTER'>('ALARMS');
  const [showNewAlarmForm, setShowNewAlarmForm] = useState<boolean>(false);
  const [newAlarm, setNewAlarm] = useState<AlarmItem>({
    id: '',
    time: '06:00',
    label: 'Morning Discipline Session',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    soundType: 'CHAMPION_CHIME',
    vibrate: true,
    gradualVolume: true,
    snoozeMinutes: 5,
    maxSnoozeCount: 5,
    currentSnoozeCount: 0,
    questionCount: 10,
    challengeMode: 'MATH',
    baseDifficulty: 'EASY',
  });

  // Future Self custom message input
  const [newFutureMessage, setNewFutureMessage] = useState('');

  // Custom Goal modal input
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalHours, setNewGoalHours] = useState(3);

  // Custom Daily Challenge input
  const [newChallengeTitle, setNewChallengeTitle] = useState('');

  // Daily Reflection form
  const [reflectionForm, setReflectionForm] = useState({
    accomplishment: '',
    completedMainGoal: true,
    biggestDistraction: '',
    improvementForTomorrow: '',
    moodRating: 5,
  });

  // Sleep & Bedtime checklists
  const [nightChecklist, setNightChecklist] = useState<Record<string, boolean>>({
    'Review tomorrow’s top 3 study priorities': true,
    'Place QR Wake-Up code away from the bed': true,
    'Keep phone across the room on charger': false,
    'Enable Smart Alarm with 10-question math challenge': true,
  });
  const [morningChecklist, setMorningChecklist] = useState<Record<string, boolean>>({
    'Dismiss Smart Alarm without hitting snooze': true,
    'Drink 500ml water immediately after waking': true,
    'Avoid social media for the first 60 minutes': true,
    'Start first 45-minute FocusRise block before 7:00 AM': false,
  });

  // Selected file in Android Studio Code Viewer
  const [selectedAndroidFileIdx, setSelectedAndroidFileIdx] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sync theme class on <html> and <body>
  useEffect(() => {
    const html = document.documentElement;
    if (profile.themeMode === 'light') {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  }, [profile.themeMode]);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          customGoals,
          alarms,
          alarmHistory,
          focusSessions,
          distractingApps,
          dailyChallenges,
          reflections,
          completedTricks,
          focusCoins,
          streakDays,
          permissions,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    profile,
    customGoals,
    alarms,
    alarmHistory,
    focusSessions,
    distractingApps,
    dailyChallenges,
    reflections,
    completedTricks,
    focusCoins,
    streakDays,
    permissions,
  ]);

  // Live Clock & Automatic Exact Alarm Matcher
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveTime(now);

      // Check if any enabled alarm matches current HH:mm at second 0
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHm = `${hh}:${mm}`;
      const todayKey = `${now.toDateString()}_${currentHm}`;

      if (now.getSeconds() < 2 && !activeRingingAlarm) {
        const matching = alarms.find(
          (a) =>
            a.enabled &&
            a.time === currentHm &&
            (a.repeatDays.length === 0 || a.repeatDays.includes(now.getDay())) &&
            a.lastTriggeredDate !== todayKey
        );
        if (matching) {
          setAlarms((prev) =>
            prev.map((item) =>
              item.id === matching.id ? { ...item, lastTriggeredDate: todayKey } : item
            )
          );
          setActiveRingingAlarm(matching);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms, activeRingingAlarm]);

  // Focus & Break Countdown Timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          soundEngine.playSuccessChime();
          if (timerMode === 'FOCUS') {
            handleCompleteFocusSession(selectedFocusMinutes);
          } else {
            // Break Over Notification
            const breakNotif = generatePersonalizedNotification(
              profile,
              daysUntilTarget,
              'Break Over'
            );
            setNotifications((n) => [breakNotif, ...n]);
            setTimerMode('FOCUS');
            setSecondsRemaining(selectedFocusMinutes * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timerMode, selectedFocusMinutes, profile]);

  // Computed metrics
  const daysUntilTarget = useMemo(() => {
    const target = new Date(profile.targetDate);
    const diffMs = target.getTime() - liveTime.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [profile.targetDate, liveTime]);

  const completedMinutesToday = useMemo(() => {
    return focusSessions.reduce((acc, s) => acc + s.completedMinutes, 0);
  }, [focusSessions]);

  const dailyTargetMinutes = Math.round((profile.dailyFocusTargetHours || 3) * 60);
  const remainingMinutesToday = Math.max(0, dailyTargetMinutes - completedMinutesToday);
  const dailyProgressPct = Math.min(
    100,
    Math.round((completedMinutesToday / Math.max(1, dailyTargetMinutes)) * 100)
  );

  // Gamification Level Calculation
  const userLevel = useMemo(() => {
    if (focusCoins >= 1000) return { level: 5, title: 'Unstoppable', nextThreshold: 1500 };
    if (focusCoins >= 600) return { level: 4, title: 'Focus Master', nextThreshold: 1000 };
    if (focusCoins >= 300) return { level: 3, title: 'Consistent', nextThreshold: 600 };
    if (focusCoins >= 100) return { level: 2, title: 'Disciplined', nextThreshold: 300 };
    return { level: 1, title: 'Beginner', nextThreshold: 100 };
  }, [focusCoins]);

  // Progress Garden Stage Calculation
  const gardenStageInfo = useMemo((): {
    stage: GardenStage;
    label: string;
    description: string;
    nextSessionsNeeded: number;
  } => {
    const count = focusSessions.length;
    if (count >= 12)
      return {
        stage: 'BEAUTIFUL_GARDEN',
        label: 'Beautiful Discipline Garden 🌳✨',
        description: 'Your consistent focus sessions have cultivated a thriving sanctuary.',
        nextSessionsNeeded: 0,
      };
    if (count >= 7)
      return {
        stage: 'TREE',
        label: 'Strong Oak Tree 🌳',
        description: 'Deep roots of daily study habits. Keep going to bloom a full garden!',
        nextSessionsNeeded: 12 - count,
      };
    if (count >= 4)
      return {
        stage: 'PLANT',
        label: 'Growing Sapling 🪴',
        description: 'Your discipline is taking visible shape.',
        nextSessionsNeeded: 7 - count,
      };
    if (count >= 2)
      return {
        stage: 'SPROUT',
        label: 'Fresh Sprout 🌱',
        description: 'Your early sessions have broken through the soil.',
        nextSessionsNeeded: 4 - count,
      };
    return {
      stage: 'SEED',
      label: 'Planted Seed 🌰',
      description: 'Complete a focus session to sprout your virtual tree.',
      nextSessionsNeeded: 2 - count,
    };
  }, [focusSessions.length]);

  // Next enabled alarm helper
  const nextAlarmSummary = useMemo(() => {
    const enabledList = alarms.filter((a) => a.enabled);
    if (enabledList.length === 0) {
      return { timeText: 'No Active Alarm', countdown: 'Enable an alarm below' };
    }
    const sorted = [...enabledList].sort((a, b) => a.time.localeCompare(b.time));
    const next = sorted[0];
    const [h, m] = next.time.split(':').map(Number);
    const target = new Date(liveTime);
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= liveTime.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const diffMinutes = Math.max(1, Math.floor((target.getTime() - liveTime.getTime()) / 60000));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return {
      timeText: `${next.time} (${next.label})`,
      countdown: `in ${hrs}h ${mins}m`,
    };
  }, [alarms, liveTime]);

  const greetingText = useMemo(() => {
    const hr = liveTime.getHours();
    if (hr < 12) return 'GOOD MORNING';
    if (hr < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }, [liveTime]);

  const formatHoursMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m} Minutes`;
    if (m === 0) return `${h} ${h === 1 ? 'Hour' : 'Hours'}`;
    return `${h} ${h === 1 ? 'Hour' : 'Hours'} ${m} Minutes`;
  };

  const handleCompleteFocusSession = (minutesCompleted: number) => {
    const coins = Math.max(10, minutesCompleted);
    const newSession: FocusSession = {
      id: `sess_${Date.now()}`,
      taskTitle: currentTaskTitle || profile.primaryGoalTitle,
      goalId: 'primary',
      durationMinutes: selectedFocusMinutes,
      completedMinutes: minutesCompleted,
      startedAt: new Date(Date.now() - minutesCompleted * 60000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'COMPLETED',
      dndActive: dndEnabledForSession && permissions.accessNotificationPolicyDnd,
      coinsEarned: coins,
    };

    setFocusSessions((prev) => [newSession, ...prev]);
    setFocusCoins((c) => c + coins);

    if (dndEnabledForSession && permissions.accessNotificationPolicyDnd) {
      setPreviousDndStateRestoredMessage(
        'Session complete! Previous Android Do Not Disturb interruption filter automatically restored.'
      );
      setTimeout(() => setPreviousDndStateRestoredMessage(''), 6000);
    }

    // Update Daily Challenges progress
    setDailyChallenges((prev) =>
      prev.map((dc) => {
        if (dc.id === 'dc_1') {
          const nextVal = dc.currentValue + 1;
          return { ...dc, currentValue: nextVal, completed: nextVal >= dc.targetValue };
        }
        if (dc.id === 'dc_2') {
          const nextVal = dc.currentValue + minutesCompleted;
          return { ...dc, currentValue: nextVal, completed: nextVal >= dc.targetValue };
        }
        return dc;
      })
    );
  };

  const handleAlarmDismissSuccess = (
    alarmId: string,
    snoozeCount: number,
    finalDifficulty: DifficultyLevel,
    questionsSolved: number,
    emergency: boolean
  ) => {
    const targetAlarm = alarms.find((a) => a.id === alarmId);
    const entry: AlarmHistoryEntry = {
      id: `ah_${Date.now()}`,
      alarmId,
      alarmLabel: targetAlarm?.label || 'Smart Alarm',
      triggeredAt: targetAlarm?.time || '05:30',
      dismissedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      snoozeCount,
      finalDifficulty,
      questionsSolved,
      usedEmergencyDismiss: emergency,
    };
    setAlarmHistory((prev) => [entry, ...prev]);
    // Reset currentSnoozeCount to 0 after full dismissal
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, currentSnoozeCount: 0 } : a))
    );
    if (!emergency) {
      setFocusCoins((c) => c + 30);
      setDailyChallenges((prev) =>
        prev.map((dc) =>
          dc.id === 'dc_3'
            ? {
                ...dc,
                currentValue: dc.currentValue + questionsSolved,
                completed: dc.currentValue + questionsSolved >= dc.targetValue,
              }
            : dc
        )
      );
    }
    setActiveRingingAlarm(null);
  };

  const handleAlarmSnoozeTriggered = (alarmId: string, newSnoozeCount: number) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, currentSnoozeCount: newSnoozeCount } : a))
    );
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AlarmItem = {
      ...newAlarm,
      id: `alarm_${Date.now()}`,
    };
    setAlarms((prev) => [...prev, created]);
    setShowNewAlarmForm(false);
  };

  const handleToggleAmbientTrack = (trackId: AmbientTrackId) => {
    if (activeAmbientTrack === trackId) {
      soundEngine.stopAmbient();
      setActiveAmbientTrack(null);
    } else {
      soundEngine.startAmbient(trackId, ambientVolume);
      setActiveAmbientTrack(trackId);
    }
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionForm.accomplishment.trim()) return;
    const entry: ReflectionEntry = {
      id: `ref_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ...reflectionForm,
    };
    setReflections((prev) => [entry, ...prev]);
    setFocusCoins((c) => c + 25);
    setReflectionForm({
      accomplishment: '',
      completedMainGoal: true,
      biggestDistraction: '',
      improvementForTomorrow: '',
      moodRating: 5,
    });
  };

  const handleExportBackupJson = () => {
    const payload = JSON.stringify(
      {
        app: 'FocusRise 👑',
        developer: 'Developed by Sravan King 👑',
        exportedAt: new Date().toISOString(),
        profile,
        customGoals,
        alarms,
        focusSessions,
        reflections,
        focusCoins,
        streakDays,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusrise_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAndroidBundle = () => {
    const combined = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FocusRise_Android_Studio_Kotlin_Source.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const timerMinutesStr = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
  const timerSecondsStr = String(secondsRemaining % 60).padStart(2, '0');

  return (
    <div
      className={`min-h-screen pb-24 lg:pb-12 transition-colors duration-200 ${
        profile.themeMode === 'light'
          ? 'bg-[#F8F8FA] text-[#080808]'
          : profile.themeMode === 'dark-amoled'
          ? 'bg-[#080808] text-white'
          : 'bg-[#111111] text-white'
      }`}
    >
      {/* Top Bar Contract: Zone 1 Brand Wordmark — Zone 2 5 Single-Line Nav Links — Zone 3 Primary Action */}
      <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 border-b border-neutral-200 dark:border-[#222222] bg-white/90 dark:bg-[#080808]/90 backdrop-blur-md flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('HOME')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <span>FOCUSRISE 👑</span>
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(
            [
              { id: 'HOME', label: 'Home' },
              { id: 'FOCUS', label: 'Focus' },
              { id: 'WAKEUP', label: 'WakeUp' },
              { id: 'PROGRESS', label: 'Progress' },
              { id: 'PROFILE', label: 'Profile' },
            ] as { id: MainTab; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                activeTab === item.id
                  ? 'border-[#FF8A00] text-[#FF8A00] font-semibold'
                  : 'border-transparent text-neutral-600 dark:text-[#888888] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('FOCUS');
              setTimerMode('FOCUS');
            }}
            className="h-9 px-4 text-xs font-bold text-black bg-[#FF8A00] hover:bg-[#FFA726] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Focus
          </button>
        </div>
      </header>

      {/* Main Content Container (Full 1440px Desktop Presence + Responsive Mobile/Tablet Grid) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ==================================================
            SECTION 1: HOME DASHBOARD & REMEMBER YOUR WHY
           ================================================== */}
        {activeTab === 'HOME' && (
          <div className="space-y-8">
            {/* Hero Mission Card */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border-2 border-[#FF8A00] flex flex-col justify-between space-y-6 shadow-[0_0_40px_rgba(255,138,0,0.08)]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#888888]">
                    <span className="font-mono font-semibold text-[#FF8A00]">
                      {liveTime.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {liveTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnboardingModal(true)}
                      className="text-xs font-semibold text-[#FFA726] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Personalize Mission
                    </button>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {greetingText}, {profile.name.toUpperCase()}! 👑
                  </h1>

                  <div className="pt-1">
                    <div className="text-xs font-semibold text-[#888888]">YOUR MISSION TODAY:</div>
                    <div className="text-xl sm:text-2xl font-bold text-[#FF8A00] mt-0.5">
                      {profile.primaryGoalTitle}
                    </div>
                  </div>
                </div>

                {/* Daily Target Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                    <span className="text-xs text-[#888888] block">Daily Target</span>
                    <span className="font-mono tabular-nums text-lg font-bold text-neutral-900 dark:text-white mt-0.5 block">
                      {profile.dailyFocusTargetHours} Hours
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                    <span className="text-xs text-[#888888] block">Completed Today</span>
                    <span className="font-mono tabular-nums text-lg font-bold text-[#16C784] mt-0.5 block">
                      {formatHoursMinutes(completedMinutesToday)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                    <span className="text-xs text-[#888888] block">Remaining</span>
                    <span className="font-mono tabular-nums text-lg font-bold text-[#FFA726] mt-0.5 block">
                      {formatHoursMinutes(remainingMinutesToday)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#888888]">Daily Task & Focus Progress</span>
                    <span className="font-mono tabular-nums font-bold text-[#FF8A00]">
                      {dailyProgressPct}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-[#111111] overflow-hidden border border-neutral-300 dark:border-[#2A2A2A]">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6D00] to-[#FFA726] transition-all duration-300"
                      style={{ width: `${Math.max(4, dailyProgressPct)}%` }}
                    />
                  </div>
                </div>

                {/* Primary Dashboard Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('FOCUS')}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-extrabold text-sm tracking-wide flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>START FOCUS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('WAKEUP');
                      setWakeupSubTab('ALARMS');
                    }}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-neutral-100 dark:bg-[#111111] hover:border-[#FF8A00] border border-neutral-300 dark:border-[#2E2E2E] text-neutral-900 dark:text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <AlarmClock className="w-4 h-4 text-[#FF8A00]" />
                    <span>Manage Alarms</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('PROGRESS')}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-neutral-100 dark:bg-[#111111] hover:border-[#FF8A00] border border-neutral-300 dark:border-[#2E2E2E] text-neutral-900 dark:text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-[#16C784]" />
                    <span>View Progress</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Target Countdown, Streak, Next Alarm & Level */}
              <div className="lg:col-span-4 rounded-3xl p-6 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#262626] pb-3">
                    <span className="text-xs font-semibold text-[#888888]">
                      TARGET DATE COUNTDOWN
                    </span>
                    <span className="font-mono text-xs text-[#FFA726]">{profile.targetDate}</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-mono tabular-nums text-4xl sm:text-5xl font-extrabold text-[#FF8A00]">
                        {daysUntilTarget}
                      </span>
                      <span className="text-sm font-semibold text-neutral-600 dark:text-[#888888] ml-2">
                        Days Remaining
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                      <div className="text-xs text-[#888888]">Current Streak</div>
                      <div className="font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#FF6D00]" />
                        <span>{streakDays} Days</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                      <div className="text-xs text-[#888888]">Discipline Rank</div>
                      <div className="text-sm font-bold text-[#16C784] mt-1">
                        Lv.{userLevel.level} {userLevel.title}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#888888]">Next Smart Alarm</span>
                      <span className="font-mono text-[#FFA726]">{nextAlarmSummary.countdown}</span>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {nextAlarmSummary.timeText}
                    </div>
                  </div>
                </div>

                {/* Motivational Quote Footer */}
                <div className="p-4 rounded-2xl bg-[#FF8A00]/10 border border-[#FF8A00]/30">
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 italic">
                    “{profile.personalStatement}”
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11: REMEMBER YOUR WHY & FUTURE SELF NOTIFICATIONS */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                      <Heart className="w-4 h-4" />
                      <span>REMEMBER YOUR WHY</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      When Fatigue Hits, Remember Why You Started
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOnboardingModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#2E2E2E] text-xs font-semibold text-neutral-800 dark:text-white hover:border-[#FF8A00]"
                  >
                    Edit Goal & Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Goal Photograph or High-Contrast SVG Emblem */}
                  <div className="sm:col-span-5 h-44 rounded-2xl overflow-hidden bg-[#111111] border border-[#FF8A00]/40 flex flex-col items-center justify-center p-4 text-center relative">
                    {profile.goalPhotoUrl ? (
                      <img
                        src={profile.goalPhotoUrl}
                        alt={profile.primaryGoalTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF8A00]/20 border border-[#FF8A00] flex items-center justify-center mx-auto">
                          <Crown className="w-6 h-6 text-[#FF8A00]" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          {profile.primaryGoalTitle}
                        </div>
                        <div className="text-[11px] text-[#888888]">{profile.goalCategory}</div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-7 space-y-3">
                    <div>
                      <span className="text-xs text-[#888888] block">Deep Personal Reason (Your WHY)</span>
                      <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white mt-1 leading-relaxed">
                        “{profile.whyImportant}”
                      </p>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 dark:border-[#262626] flex items-center justify-between text-xs text-[#888888]">
                      <span>Target: {profile.targetDate}</span>
                      <span>·</span>
                      <span className="text-[#FF8A00] font-semibold">
                        {daysUntilTarget} days to victory
                      </span>
                    </div>
                  </div>
                </div>

                {/* Future Self Messages List & Creator */}
                <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-[#262626]">
                  <div className="text-xs font-bold text-[#FFA726]">
                    MESSAGES FROM YOUR FUTURE SUCCESSFUL SELF
                  </div>
                  <div className="space-y-2">
                    {profile.futureSelfMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 flex items-start justify-between gap-3"
                      >
                        <p className="leading-relaxed">“{msg}”</p>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = profile.futureSelfMessages.filter((_, i) => i !== idx);
                            setProfile({ ...profile, futureSelfMessages: updated });
                          }}
                          className="text-[#888888] hover:text-[#FF4545] shrink-0"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newFutureMessage.trim()) return;
                      setProfile({
                        ...profile,
                        futureSelfMessages: [...profile.futureSelfMessages, newFutureMessage.trim()],
                      });
                      setNewFutureMessage('');
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newFutureMessage}
                      onChange={(e) => setNewFutureMessage(e.target.value)}
                      placeholder="Write a message from your future self..."
                      className="flex-1 h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white outline-none focus:border-[#FF8A00]"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-xl bg-[#FF8A00] text-black font-bold text-xs whitespace-nowrap shrink-0"
                    >
                      Add Note
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Smart Offline Motivational Notification Engine */}
              <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                        <Bell className="w-4 h-4" />
                        <span>SMART MOTIVATIONAL ENGINE</span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                        Context-Aware Offline Alerts
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const fresh = generatePersonalizedNotification(
                          profile,
                          daysUntilTarget,
                          undefined,
                          notifications.map((n) => n.title)
                        );
                        setNotifications([fresh, ...notifications.slice(0, 5)]);
                        soundEngine.playSuccessChime();
                      }}
                      className="h-9 px-3 rounded-xl bg-[#FF8A00] text-black font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate Alert</span>
                    </button>
                  </div>

                  {/* Category Quick Triggers */}
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        'Morning Motivation',
                        'Goal Reminder',
                        'Focus Reminder',
                        'Break Over',
                        'Evening Reflection',
                        'Future Self',
                      ] as NotificationItem['category'][]
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const item = generatePersonalizedNotification(
                            profile,
                            daysUntilTarget,
                            cat,
                            notifications.map((n) => n.title)
                          );
                          setNotifications([item, ...notifications.slice(0, 5)]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#111111] hover:border-[#FF8A00] border border-neutral-200 dark:border-[#282828] text-[11px] font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Active Notification Cards */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#888888]">
                          <span className="font-semibold text-[#FFA726]">{notif.category}</span>
                          <span className="font-mono">{notif.timestamp}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                          {notif.title}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                          {notif.body}
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab(notif.actionTab)}
                            className="text-[11px] font-bold text-[#FF8A00] hover:underline"
                          >
                            Open {notif.actionTab} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[#888888] border-t border-neutral-200 dark:border-[#262626] pt-3 flex items-center justify-between">
                  <span>Quiet Hours: {profile.quietHoursStart} – {profile.quietHoursEnd}</span>
                  <span>Every {profile.notificationFrequencyMinutes}m</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================
            SECTION 2: FOCUS TIMER, SMART BREAKS, SOUNDS & DISTRACTION CONTROL
           ================================================== */}
        {activeTab === 'FOCUS' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 Cols: Focus Timer & Smart Break System */}
              <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border-2 border-[#FF8A00] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#FF8A00]">
                      {timerMode === 'FOCUS' ? 'DEEP FOCUS ENGINE' : 'SMART RECOVERY BREAK'}
                    </span>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
                      {timerMode === 'FOCUS'
                        ? 'Lock In On Your Priority Mission'
                        : 'Recharge Without Dopamine Traps'}
                    </h2>
                  </div>

                  {/* Mode Switcher: Focus vs Smart Break */}
                  <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#2A2A2A]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerMode('FOCUS');
                        setSecondsRemaining(selectedFocusMinutes * 60);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        timerMode === 'FOCUS'
                          ? 'bg-[#FF8A00] text-black'
                          : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Focus Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerMode('BREAK');
                        setSecondsRemaining(selectedBreakMinutes * 60);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        timerMode === 'BREAK'
                          ? 'bg-[#16C784] text-black'
                          : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Smart Break
                    </button>
                  </div>
                </div>

                {/* Duration Presets */}
                {timerMode === 'FOCUS' ? (
                  <div className="space-y-3">
                    <div className="text-xs text-[#888888]">
                      Select Focus Duration (15, 25, 30, 45, 60 mins or Custom):
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[15, 25, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setIsTimerRunning(false);
                            setSelectedFocusMinutes(mins);
                            setSecondsRemaining(mins * 60);
                          }}
                          className={`h-10 px-4 rounded-xl font-mono text-xs font-bold border transition-colors ${
                            selectedFocusMinutes === mins
                              ? 'bg-[#FF8A00] text-black border-[#FF8A00]'
                              : 'bg-neutral-50 dark:bg-[#111111] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-[#2A2A2A]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={customFocusMinutes}
                          onChange={(e) => setCustomFocusMinutes(e.target.value)}
                          className="w-16 h-10 px-2.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2A2A2A] font-mono text-xs text-center text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = Math.max(1, Math.min(240, Number(customFocusMinutes) || 40));
                            setIsTimerRunning(false);
                            setSelectedFocusMinutes(parsed);
                            setSecondsRemaining(parsed * 60);
                          }}
                          className="h-10 px-3 rounded-xl bg-neutral-200 dark:bg-[#242424] text-xs font-semibold text-neutral-900 dark:text-white"
                        >
                          Set Custom
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-[#888888]">
                      Select Smart Break Duration (5, 10, 15, or 20 minutes):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setIsTimerRunning(false);
                            setSelectedBreakMinutes(mins);
                            setSecondsRemaining(mins * 60);
                          }}
                          className={`h-10 px-4 rounded-xl font-mono text-xs font-bold border transition-colors ${
                            selectedBreakMinutes === mins
                              ? 'bg-[#16C784] text-black border-[#16C784]'
                              : 'bg-neutral-50 dark:bg-[#111111] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-[#2A2A2A]'
                          }`}
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Task Input */}
                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    Current Task for Goal ({profile.primaryGoalTitle})
                  </label>
                  <input
                    type="text"
                    value={currentTaskTitle}
                    onChange={(e) => setCurrentTaskTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#2A2A2A] focus:border-[#FF8A00] text-sm text-neutral-900 dark:text-white outline-none"
                  />
                </div>

                {/* Big Tabular Countdown Display */}
                <div className="py-8 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-center space-y-4">
                  <div
                    className={`font-mono tabular-nums text-6xl sm:text-8xl font-extrabold tracking-tight ${
                      timerMode === 'FOCUS' ? 'text-[#FF8A00]' : 'text-[#16C784]'
                    }`}
                  >
                    {timerMinutesStr}:{timerSecondsStr}
                  </div>
                  <p className="text-xs text-[#888888] max-w-md mx-auto px-4">
                    {timerMode === 'FOCUS'
                      ? 'Every focused minute takes you closer to your goal. Distracting apps are shielded.'
                      : 'Hydrate, stretch your back, and rest your eyes. Avoid endless scrolling.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`min-h-[48px] px-8 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                        timerMode === 'FOCUS'
                          ? 'bg-[#FF8A00] hover:bg-[#FFA726] text-black'
                          : 'bg-[#16C784] hover:opacity-90 text-black'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-4 h-4 fill-black" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" />
                          <span>{secondsRemaining < selectedFocusMinutes * 60 ? 'RESUME' : 'START TIMER'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setSecondsRemaining(
                          (timerMode === 'FOCUS' ? selectedFocusMinutes : selectedBreakMinutes) * 60
                        );
                      }}
                      className="min-h-[48px] px-4 rounded-xl bg-neutral-200 dark:bg-[#191919] border border-neutral-300 dark:border-[#2E2E2E] text-xs font-semibold text-neutral-800 dark:text-white flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>

                    {timerMode === 'FOCUS' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          handleCompleteFocusSession(selectedFocusMinutes);
                          setSecondsRemaining(selectedFocusMinutes * 60);
                        }}
                        className="min-h-[48px] px-4 rounded-xl bg-[#16C784]/15 border border-[#16C784] text-xs font-bold text-[#16C784] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete & Log Now</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Android DND Integration Status Bar */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#FF8A00]" />
                      <span>Android Do Not Disturb (DND) Auto-Sync</span>
                    </div>
                    <p className="text-[11px] text-[#888888]">
                      Permission Status:{' '}
                      <strong className={permissions.accessNotificationPolicyDnd ? 'text-[#16C784]' : 'text-[#FF4545]'}>
                        {permissions.accessNotificationPolicyDnd
                          ? 'ACCESS_NOTIFICATION_POLICY Granted'
                          : 'Permission Required'}
                      </strong>{' '}
                      · Automatically restores previous DND state after session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDndEnabledForSession(!dndEnabledForSession)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      dndEnabledForSession
                        ? 'bg-[#FF8A00] text-black border-[#FF8A00]'
                        : 'bg-neutral-200 dark:bg-[#191919] text-[#888888] border-neutral-300 dark:border-[#333333]'
                    }`}
                  >
                    {dndEnabledForSession ? 'DND Active in Focus' : 'DND Off'}
                  </button>
                </div>

                {previousDndStateRestoredMessage && (
                  <div className="p-3.5 rounded-xl bg-[#16C784]/15 border border-[#16C784] text-xs font-semibold text-[#16C784]">
                    {previousDndStateRestoredMessage}
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Offline Focus Sounds Audio Player */}
              <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FF8A00]">OFFLINE FOCUS SOUNDS</span>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                        Acoustic Concentration Shield
                      </h3>
                    </div>
                    {activeAmbientTrack && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.stopAmbient();
                          setActiveAmbientTrack(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FF4545]/15 text-[#FF4545] text-xs font-bold"
                      >
                        Stop Audio
                      </button>
                    )}
                  </div>

                  {/* Sound Tracks List */}
                  <div className="space-y-2.5">
                    {AMBIENT_TRACKS.map((track) => {
                      const playing = activeAmbientTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleToggleAmbientTrack(track.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                            playing
                              ? 'bg-[#FF8A00]/15 border-[#FF8A00] text-neutral-900 dark:text-white'
                              : 'bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-[#FF8A00]/50'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-neutral-900 dark:text-white">
                              {track.name}
                            </div>
                            <div className="text-xs text-[#888888] mt-0.5">{track.subtitle}</div>
                          </div>
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              playing
                                ? 'bg-[#FF8A00] text-black'
                                : 'bg-neutral-200 dark:bg-[#191919] text-neutral-700 dark:text-white'
                            }`}
                          >
                            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Volume & Sleep Timer Controls */}
                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-[#262626]">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#888888] flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#FF8A00]" />
                        Master Volume
                      </span>
                      <span className="font-mono tabular-nums font-bold">
                        {Math.round(ambientVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={ambientVolume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setAmbientVolume(v);
                        soundEngine.setAmbientVolume(v);
                      }}
                      className="w-full accent-[#FF8A00]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#888888]">Audio Sleep Timer:</span>
                    <div className="flex gap-1.5">
                      {[15, 30, 60].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSleepTimerMinutes(sleepTimerMinutes === m ? null : m)}
                          className={`px-2.5 py-1 rounded-lg font-mono text-xs ${
                            sleepTimerMinutes === m
                              ? 'bg-[#FF8A00] text-black font-bold'
                              : 'bg-neutral-100 dark:bg-[#111111] text-[#888888]'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 14: DISTRACTION CONTROL & APP USAGE MONITORING */}
            <section className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>DISTRACTION CONTROL & APP USAGE MONITOR</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                    App Blocker During Focus & UsageStatsManager Telemetry
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#888888]">
                    Usage Access:{' '}
                    <strong className="text-[#16C784]">
                      {permissions.packageUsageStats ? 'Enabled' : 'Fallback Mode'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {distractingApps.map((app) => {
                  const usagePct = Math.min(
                    100,
                    Math.round((app.usageMinutesToday / Math.max(1, app.dailyLimitMinutes)) * 100)
                  );
                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-neutral-900 dark:text-white">
                            {app.appName}
                          </div>
                          <div className="text-[11px] text-[#888888]">
                            {app.category} · {app.blockedAttemptsToday} blocks today
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDistractingApps((prev) =>
                              prev.map((a) =>
                                a.id === app.id
                                  ? { ...a, isBlockedDuringFocus: !a.isBlockedDuringFocus }
                                  : a
                              )
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            app.isBlockedDuringFocus
                              ? 'bg-[#FF4545]/15 text-[#FF4545] border border-[#FF4545]/40'
                              : 'bg-[#16C784]/15 text-[#16C784]'
                          }`}
                        >
                          {app.isBlockedDuringFocus ? 'Blocked in Focus' : 'Allowed'}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#888888]">Usage Today</span>
                          <span className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
                            {app.usageMinutesToday}m / {app.dailyLimitMinutes}m
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-[#191919] overflow-hidden">
                          <div
                            className={`h-full ${
                              usagePct >= 90 ? 'bg-[#FF4545]' : 'bg-[#FF8A00]'
                            }`}
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <label className="flex items-center gap-1.5 text-[#888888] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={app.isAllowedInBreak}
                            onChange={() =>
                              setDistractingApps((prev) =>
                                prev.map((a) =>
                                  a.id === app.id
                                    ? { ...a, isAllowedInBreak: !a.isAllowedInBreak }
                                    : a
                                )
                              )
                            }
                            className="accent-[#FF8A00]"
                          />
                          <span>Allow during Break</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setDistractingApps((prev) =>
                              prev.map((a) =>
                                a.id === app.id
                                  ? { ...a, blockedAttemptsToday: a.blockedAttemptsToday + 1 }
                                  : a
                              )
                            );
                            setBlockedAppAttemptModal(app);
                          }}
                          className="text-[#FFA726] hover:underline font-semibold"
                        >
                          Test Block Shield
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ==================================================
            SECTION 3: WAKEUP (DIGITAL CLOCK, SMART ALARMS, PUZZLES & MORNING MATHS MASTER)
           ================================================== */}
        {activeTab === 'WAKEUP' && (
          <div className="space-y-8">
            {/* WakeUp Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-4">
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'ALARMS', label: 'Smart Alarms & Snooze Puzzles' },
                    { id: 'CLOCK', label: 'Digital Bedside Clock' },
                    { id: 'MATH_MASTER', label: 'Morning Maths Master' },
                  ] as { id: 'ALARMS' | 'CLOCK' | 'MATH_MASTER'; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWakeupSubTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      wakeupSubTab === t.id
                        ? 'bg-[#FF8A00] text-black'
                        : 'bg-neutral-100 dark:bg-[#111111] text-neutral-600 dark:text-[#888888] hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowNewAlarmForm(!showNewAlarmForm)}
                className="h-10 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Smart Alarm</span>
              </button>
            </div>

            {wakeupSubTab === 'CLOCK' && (
              <DigitalClockView
                nextAlarmText={nextAlarmSummary.timeText}
                nextAlarmCountdown={nextAlarmSummary.countdown}
              />
            )}

            {wakeupSubTab === 'MATH_MASTER' && (
              <MorningMathsMasterView
                completedTricks={completedTricks}
                onCompleteTrickPractice={(trickId, count) => {
                  if (!completedTricks.includes(trickId)) {
                    setCompletedTricks((prev) => [...prev, trickId]);
                  }
                  setFocusCoins((c) => c + count * 5);
                  setDailyChallenges((prev) =>
                    prev.map((dc) =>
                      dc.id === 'dc_3'
                        ? {
                            ...dc,
                            currentValue: dc.currentValue + count,
                            completed: dc.currentValue + count >= dc.targetValue,
                          }
                        : dc
                    )
                  );
                }}
              />
            )}

            {wakeupSubTab === 'ALARMS' && (
              <div className="space-y-6">
                {/* Create New Alarm Drawer */}
                {showNewAlarmForm && (
                  <form
                    onSubmit={handleCreateAlarm}
                    className="rounded-3xl p-6 bg-white dark:bg-[#191919] border-2 border-[#FF8A00] space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#262626] pb-3">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Create Smart Progressive Alarm
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowNewAlarmForm(false)}
                        className="text-xs text-[#888888] hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-[#888888] mb-1">Alarm Time</label>
                        <input
                          type="time"
                          required
                          value={newAlarm.time}
                          onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] font-mono text-base text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[#888888] mb-1">Mission Label</label>
                        <input
                          type="text"
                          required
                          value={newAlarm.label}
                          onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                          placeholder="e.g., 5:00 AM Competitive Exam Prep"
                          className="w-full h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-sm text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-[#888888] mb-1">
                          Questions Count (Default 10)
                        </label>
                        <select
                          value={newAlarm.questionCount}
                          onChange={(e) =>
                            setNewAlarm({
                              ...newAlarm,
                              questionCount: Number(e.target.value) as 10 | 15 | 20,
                            })
                          }
                          className="w-full h-11 px-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs font-mono text-neutral-900 dark:text-white"
                        >
                          <option value={10}>10 Questions (Default)</option>
                          <option value={15}>15 Questions</option>
                          <option value={20}>20 Questions</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#888888] mb-1">Challenge Type</label>
                        <select
                          value={newAlarm.challengeMode}
                          onChange={(e) =>
                            setNewAlarm({
                              ...newAlarm,
                              challengeMode: e.target.value as ChallengeMode,
                            })
                          }
                          className="w-full h-11 px-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                        >
                          <option value="MATH">Progressive Snooze Math</option>
                          <option value="MEMORY">Memory Sequence</option>
                          <option value="NUMBER_SERIES">Number Series</option>
                          <option value="BRAIN_TEASER">Verified Brain Teasers</option>
                          <option value="REFLEX">Reflex Challenge</option>
                          <option value="QR_CODE">Away-From-Bed QR Code</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#888888] mb-1">Alarm Sound</label>
                        <select
                          value={newAlarm.soundType}
                          onChange={(e) =>
                            setNewAlarm({
                              ...newAlarm,
                              soundType: e.target.value as AlarmItem['soundType'],
                            })
                          }
                          className="w-full h-11 px-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                        >
                          <option value="CHAMPION_CHIME">Champion Chime</option>
                          <option value="TACTICAL_PULSE">Tactical Pulse</option>
                          <option value="DIGITAL_BELL">Digital Bell</option>
                          <option value="SUNRISE_HARMONICS">Sunrise Harmonics</option>
                          <option value="INTENSE_SIREN">Intense Siren</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#888888] mb-1">Max Snooze Count</label>
                        <select
                          value={newAlarm.maxSnoozeCount}
                          onChange={(e) =>
                            setNewAlarm({ ...newAlarm, maxSnoozeCount: Number(e.target.value) })
                          }
                          className="w-full h-11 px-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs font-mono text-neutral-900 dark:text-white"
                        >
                          <option value={1}>Max 1 Snooze</option>
                          <option value={3}>Max 3 Snoozes</option>
                          <option value={5}>Max 5 Snoozes (Up to Expert)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="h-11 px-6 rounded-xl bg-[#FF8A00] text-black font-bold text-xs"
                      >
                        Save Smart Alarm
                      </button>
                    </div>
                  </form>
                )}

                {/* Alarms List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alarms.map((alarm) => {
                    const effectiveDiff = getProgressiveDifficulty(
                      alarm.currentSnoozeCount,
                      alarm.baseDifficulty
                    );
                    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    return (
                      <div
                        key={alarm.id}
                        className={`rounded-3xl p-6 bg-white dark:bg-[#191919] border transition-all space-y-4 ${
                          alarm.enabled
                            ? 'border-[#FF8A00]'
                            : 'border-neutral-200 dark:border-[#2A2A2A] opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-mono tabular-nums text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white">
                              {alarm.time}
                            </div>
                            <div className="text-sm font-semibold text-[#FF8A00] mt-1">
                              {alarm.label}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAlarms((prev) =>
                                  prev.map((a) =>
                                    a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
                                  )
                                )
                              }
                              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-colors ${
                                alarm.enabled
                                  ? 'bg-[#16C784] text-black'
                                  : 'bg-neutral-200 dark:bg-[#262626] text-[#888888]'
                              }`}
                            >
                              {alarm.enabled ? 'ENABLED' : 'OFF'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAlarms((prev) => prev.filter((a) => a.id !== alarm.id))
                              }
                              className="p-2 text-[#888888] hover:text-[#FF4545]"
                              title="Delete alarm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Weekday Selector */}
                        <div className="flex items-center gap-1.5">
                          {dayLabels.map((d, idx) => {
                            const active = alarm.repeatDays.includes(idx);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const nextDays = active
                                    ? alarm.repeatDays.filter((x) => x !== idx)
                                    : [...alarm.repeatDays, idx];
                                  setAlarms((prev) =>
                                    prev.map((a) =>
                                      a.id === alarm.id ? { ...a, repeatDays: nextDays } : a
                                    )
                                  );
                                }}
                                className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors ${
                                  active
                                    ? 'bg-[#FF8A00] text-black'
                                    : 'bg-neutral-100 dark:bg-[#111111] text-[#888888]'
                                }`}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>

                        {/* Progressive Snooze Difficulty Metadata */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[#888888]">Progressive Snooze State:</span>
                            <span className="font-mono font-bold text-[#FFA726]">
                              Snooze #{alarm.currentSnoozeCount} → {formatDifficultyLabel(effectiveDiff)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[#888888]">
                            <span>Challenge: {alarm.questionCount} Questions ({alarm.challengeMode})</span>
                            <span>Max Snooze: {alarm.maxSnoozeCount}</span>
                          </div>
                        </div>

                        {/* Interactive Test / Trigger Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#888888]">Simulate Snooze Level:</span>
                            {[0, 1, 2, 3, 4, 5].map((snz) => (
                              <button
                                key={snz}
                                type="button"
                                onClick={() =>
                                  setAlarms((prev) =>
                                    prev.map((a) =>
                                      a.id === alarm.id ? { ...a, currentSnoozeCount: snz } : a
                                    )
                                  )
                                }
                                className={`w-6 h-6 rounded font-mono text-[11px] font-bold ${
                                  alarm.currentSnoozeCount === snz
                                    ? 'bg-[#FF8A00] text-black'
                                    : 'bg-neutral-100 dark:bg-[#111111] text-[#888888]'
                                }`}
                                title={`Set Snooze Count to ${snz}`}
                              >
                                {snz}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveRingingAlarm(alarm)}
                            className="h-10 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Flame className="w-4 h-4" />
                            <span>Trigger Challenge Now</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Away-From-Bed QR Code Registration & Alarm History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-3xl p-6 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A00]">
                      <QrCode className="w-4 h-4" />
                      <span>AWAY-FROM-BED QR WAKE-UP CHALLENGE</span>
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Register Your Physical Bathroom / Study Desk QR Code
                    </h4>
                    <p className="text-xs text-[#888888] leading-relaxed">
                      Print or place this registered code in another room so you must physically walk
                      out of bed to scan and dismiss QR-enabled alarms.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profile.registeredQrCode}
                        onChange={(e) =>
                          setProfile({ ...profile, registeredQrCode: e.target.value })
                        }
                        className="flex-1 h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] font-mono text-sm text-neutral-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile({
                            ...profile,
                            registeredQrCode: `FOCUSRISE-${Math.floor(1000 + Math.random() * 9000)}`,
                          })
                        }
                        className="h-11 px-4 rounded-xl bg-[#FF8A00] text-black font-bold text-xs whitespace-nowrap"
                      >
                        Generate New Key
                      </button>
                    </div>
                  </div>

                  {/* Alarm History Log */}
                  <div className="rounded-3xl p-6 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-4">
                    <div className="text-xs font-bold text-[#FF8A00]">
                      WAKE-UP & SNOOZE CHALLENGE HISTORY
                    </div>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {alarmHistory.map((h) => (
                        <div
                          key={h.id}
                          className="p-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">
                              {h.alarmLabel}
                            </div>
                            <div className="text-[#888888] mt-0.5">
                              Snoozes: {h.snoozeCount} · Level: {formatDifficultyLabel(h.finalDifficulty)} · Solved: {h.questionsSolved}
                            </div>
                          </div>
                          <span className="font-mono text-[#16C784] font-semibold">
                            {h.dismissedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            SECTION 4: PROGRESS (STATS, GAMIFICATION, GARDEN, DAILY CHALLENGES, REFLECTION & SLEEP)
           ================================================== */}
        {activeTab === 'PROGRESS' && (
          <div className="space-y-8">
            {/* Top Summary KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A]">
                <span className="text-xs text-[#888888]">Focus Coins Earned</span>
                <div className="font-mono tabular-nums text-3xl font-extrabold text-[#FF8A00] mt-1">
                  {focusCoins} 🪙
                </div>
                <span className="text-[11px] text-[#888888]">
                  Level {userLevel.level}: {userLevel.title}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A]">
                <span className="text-xs text-[#888888]">Daily Focus Total</span>
                <div className="font-mono tabular-nums text-3xl font-extrabold text-[#16C784] mt-1">
                  {completedMinutesToday}m
                </div>
                <span className="text-[11px] text-[#888888]">
                  {dailyProgressPct}% of {profile.dailyFocusTargetHours}h daily target
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A]">
                <span className="text-xs text-[#888888]">Completed Sessions</span>
                <div className="font-mono tabular-nums text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                  {focusSessions.length}
                </div>
                <span className="text-[11px] text-[#888888]">100% locally verified</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A]">
                <span className="text-xs text-[#888888]">Wake-Up & Focus Streak</span>
                <div className="font-mono tabular-nums text-3xl font-extrabold text-[#FFA726] mt-1">
                  {streakDays} Days 🔥
                </div>
                <span className="text-[11px] text-[#888888]">96% Wake-Up Consistency</span>
              </div>
            </div>

            {/* Progress Garden 🌱 & Weekly Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Progress Garden 🌱 (Section 17) */}
              <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border-2 border-[#16C784]/60 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#16C784] flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" />
                    <span>PROGRESS GARDEN 🌱</span>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {gardenStageInfo.label}
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    {gardenStageInfo.description} Missing a day never destroys your garden.
                  </p>
                </div>

                {/* Visual Progression Stepper: Seed -> Sprout -> Plant -> Tree -> Beautiful Garden */}
                <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-center space-y-4">
                  <div className="text-5xl select-none">
                    {gardenStageInfo.stage === 'SEED' && '🌰'}
                    {gardenStageInfo.stage === 'SPROUT' && '🌱'}
                    {gardenStageInfo.stage === 'PLANT' && '🪴'}
                    {gardenStageInfo.stage === 'TREE' && '🌳'}
                    {gardenStageInfo.stage === 'BEAUTIFUL_GARDEN' && '🌳🌻🌲'}
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                    {(
                      [
                        { id: 'SEED', label: 'Seed' },
                        { id: 'SPROUT', label: 'Sprout' },
                        { id: 'PLANT', label: 'Plant' },
                        { id: 'TREE', label: 'Tree' },
                        { id: 'BEAUTIFUL_GARDEN', label: 'Garden' },
                      ] as { id: GardenStage; label: string }[]
                    ).map((st) => (
                      <div
                        key={st.id}
                        className={`py-1.5 rounded-lg font-bold ${
                          gardenStageInfo.stage === st.id
                            ? 'bg-[#16C784] text-black'
                            : 'bg-neutral-200 dark:bg-[#191919] text-[#888888]'
                        }`}
                      >
                        {st.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#888888]">
                  <span>Total Sessions Nurtured: {focusSessions.length}</span>
                  {gardenStageInfo.nextSessionsNeeded > 0 && (
                    <span className="text-[#16C784] font-semibold">
                      {gardenStageInfo.nextSessionsNeeded} more sessions to next stage
                    </span>
                  )}
                </div>
              </div>

              {/* Weekly Focus Performance Bar Chart & Level Roadmap */}
              <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">
                    WEEKLY FOCUS ANALYTICS & LEVELS
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                    Last 7 Days Focus Minutes & Gamification Levels
                  </h3>
                </div>

                {/* 7-Day Bar Chart */}
                <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 px-2 bg-neutral-50 dark:bg-[#111111] rounded-2xl p-4 border border-neutral-200 dark:border-[#262626]">
                  {[
                    { day: 'Mon', mins: 140 },
                    { day: 'Tue', mins: 165 },
                    { day: 'Wed', mins: 120 },
                    { day: 'Thu', mins: 190 },
                    { day: 'Fri', mins: 150 },
                    { day: 'Sat', mins: 210 },
                    { day: 'Today', mins: completedMinutesToday },
                  ].map((bar) => {
                    const heightPct = Math.min(100, Math.max(12, Math.round((bar.mins / 220) * 100)));
                    return (
                      <div key={bar.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="font-mono tabular-nums text-[10px] text-[#888888]">
                          {bar.mins}m
                        </span>
                        <div className="w-full max-w-[36px] bg-neutral-200 dark:bg-[#1F1F1F] rounded-t-lg overflow-hidden flex items-end h-28">
                          <div
                            className={`w-full rounded-t-lg transition-all ${
                              bar.day === 'Today'
                                ? 'bg-[#FF8A00]'
                                : 'bg-gradient-to-t from-[#FF6D00]/70 to-[#FFA726]'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                          {bar.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 5 Gamification Levels Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { lv: 1, name: 'Beginner', min: 0 },
                    { lv: 2, name: 'Disciplined', min: 100 },
                    { lv: 3, name: 'Consistent', min: 300 },
                    { lv: 4, name: 'Focus Master', min: 600 },
                    { lv: 5, name: 'Unstoppable', min: 1000 },
                  ].map((item) => {
                    const unlocked = focusCoins >= item.min;
                    return (
                      <div
                        key={item.lv}
                        className={`p-2.5 rounded-xl border text-center ${
                          unlocked
                            ? 'bg-[#FF8A00]/15 border-[#FF8A00] text-neutral-900 dark:text-white'
                            : 'bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] text-[#888888]'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold text-[#FF8A00]">
                          LEVEL {item.lv}
                        </div>
                        <div className="text-xs font-bold mt-0.5">{item.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 18: DAILY CHALLENGES */}
            <section className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">DAILY CHALLENGES & MILESTONES</span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                    Complete Genuine Activities to Earn Focus Coins
                  </h3>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newChallengeTitle.trim()) return;
                    setDailyChallenges((prev) => [
                      ...prev,
                      {
                        id: `dc_custom_${Date.now()}`,
                        title: newChallengeTitle.trim(),
                        description: 'Custom personal discipline challenge',
                        targetValue: 1,
                        currentValue: 0,
                        unit: 'task',
                        rewardCoins: 40,
                        completed: false,
                        isCustom: true,
                      },
                    ]);
                    setNewChallengeTitle('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newChallengeTitle}
                    onChange={(e) => setNewChallengeTitle(e.target.value)}
                    placeholder="Add custom daily challenge..."
                    className="h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#FF8A00] text-black font-bold text-xs whitespace-nowrap"
                  >
                    + Add Challenge
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyChallenges.map((dc) => {
                  const pct = Math.min(100, Math.round((dc.currentValue / dc.targetValue) * 100));
                  return (
                    <div
                      key={dc.id}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        dc.completed
                          ? 'bg-[#16C784]/10 border-[#16C784]/50'
                          : 'bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-neutral-900 dark:text-white">
                            {dc.title}
                          </div>
                          <p className="text-xs text-[#888888] mt-0.5">{dc.description}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#FFA726] shrink-0">
                          +{dc.rewardCoins} 🪙
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono tabular-nums text-[#888888]">
                            {dc.currentValue} / {dc.targetValue} {dc.unit}
                          </span>
                          {dc.completed ? (
                            <span className="text-[#16C784] font-bold">Completed ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = dc.currentValue + 1;
                                const nowDone = nextVal >= dc.targetValue;
                                if (nowDone && !dc.completed) {
                                  setFocusCoins((c) => c + dc.rewardCoins);
                                  soundEngine.playSuccessChime();
                                }
                                setDailyChallenges((prev) =>
                                  prev.map((item) =>
                                    item.id === dc.id
                                      ? { ...item, currentValue: nextVal, completed: nowDone }
                                      : item
                                  )
                                );
                              }}
                              className="text-[#FF8A00] font-bold hover:underline"
                            >
                              + Log Progress
                            </button>
                          )}
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-[#191919] overflow-hidden">
                          <div
                            className={`h-full ${dc.completed ? 'bg-[#16C784]' : 'bg-[#FF8A00]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 19 & 21: DAILY REFLECTION & SLEEP / BEDTIME SYSTEM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Reflection (Section 19) */}
              <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">EVENING SELF-ACCOUNTABILITY</span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                    Daily Reflection Journal
                  </h3>
                </div>

                <form onSubmit={handleSaveReflection} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-[#888888] mb-1">
                      1. What did you accomplish today?
                    </label>
                    <input
                      type="text"
                      required
                      value={reflectionForm.accomplishment}
                      onChange={(e) =>
                        setReflectionForm({ ...reflectionForm, accomplishment: e.target.value })
                      }
                      placeholder="e.g., Solved 60 RRB math questions & 3 focus blocks"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#888888]">2. Did you complete your main daily goal?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setReflectionForm({ ...reflectionForm, completedMainGoal: true })
                        }
                        className={`px-3 py-1 rounded-lg font-bold ${
                          reflectionForm.completedMainGoal
                            ? 'bg-[#16C784] text-black'
                            : 'bg-neutral-100 dark:bg-[#111111] text-[#888888]'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReflectionForm({ ...reflectionForm, completedMainGoal: false })
                        }
                        className={`px-3 py-1 rounded-lg font-bold ${
                          !reflectionForm.completedMainGoal
                            ? 'bg-[#FF4545] text-white'
                            : 'bg-neutral-100 dark:bg-[#111111] text-[#888888]'
                        }`}
                      >
                        Not Yet
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#888888] mb-1">
                      3. What distracted you today?
                    </label>
                    <input
                      type="text"
                      value={reflectionForm.biggestDistraction}
                      onChange={(e) =>
                        setReflectionForm({ ...reflectionForm, biggestDistraction: e.target.value })
                      }
                      placeholder="e.g., Evening phone notifications"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#888888] mb-1">
                      4. What will you improve tomorrow?
                    </label>
                    <input
                      type="text"
                      value={reflectionForm.improvementForTomorrow}
                      onChange={(e) =>
                        setReflectionForm({
                          ...reflectionForm,
                          improvementForTomorrow: e.target.value,
                        })
                      }
                      placeholder="e.g., Start first focus session 20 minutes earlier"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs text-neutral-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs cursor-pointer"
                  >
                    Save Daily Reflection (+25 Focus Coins)
                  </button>
                </form>

                {/* Recent Reflections Summary */}
                <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-[#262626]">
                  <div className="text-xs font-bold text-[#888888]">WEEKLY REFLECTION LOG</div>
                  {reflections.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#FFA726]">
                        <span>{r.date}</span>
                        <span>{r.completedMainGoal ? 'Goal Achieved ✓' : 'Partial Day'}</span>
                      </div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {r.accomplishment}
                      </div>
                      {r.improvementForTomorrow && (
                        <div className="text-[#888888]">Next: {r.improvementForTomorrow}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleep and Bedtime Readiness System (Section 21) */}
              <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">
                    SLEEP & BEDTIME DISCIPLINE
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                    Night Preparation & Morning Readiness Checklists
                  </h3>
                  <p className="text-xs text-[#888888] mt-1">
                    Recommended bedtime calculated from your desired wake-up time ({profile.desiredWakeUpTime}) for 5 full 90-minute sleep cycles (7.5 hours).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                    <span className="text-xs text-[#888888] block">Desired Wake-Up</span>
                    <span className="font-mono text-2xl font-bold text-[#FF8A00]">
                      {profile.desiredWakeUpTime}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                    <span className="text-xs text-[#888888] block">Recommended Bedtime</span>
                    <span className="font-mono text-2xl font-bold text-[#16C784]">
                      {profile.usualSleepTime}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#FFA726]">NIGHT PREPARATION CHECKLIST</div>
                  {Object.entries(nightChecklist).map(([item, checked]) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setNightChecklist({ ...nightChecklist, [item]: !checked })
                        }
                        className="accent-[#FF8A00] w-4 h-4"
                      />
                      <span className={checked ? 'line-through text-[#888888]' : ''}>{item}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#16C784]">MORNING READINESS CHECKLIST</div>
                  {Object.entries(morningChecklist).map(([item, checked]) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setMorningChecklist({ ...morningChecklist, [item]: !checked })
                        }
                        className="accent-[#16C784] w-4 h-4"
                      />
                      <span className={checked ? 'line-through text-[#888888]' : ''}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SECTION 5: PROFILE, SETTINGS, PERMISSIONS, ANDROID STUDIO CODE & ABOUT
           ================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-8">
            {/* Theme, Personal Goals & Data Backup Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#FF8A00]">PREFERENCES & THEME</span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                      Appearance, Sound & Personal Profile
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOnboardingModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#FF8A00] text-black font-bold text-xs"
                  >
                    Edit Onboarding Profile
                  </button>
                </div>

                {/* Theme Mode Switcher: Dark AMOLED vs Light Mode */}
                <div className="space-y-2">
                  <label className="block text-xs text-[#888888]">
                    Display Theme (AMOLED Deep Black #080808 vs Pure White Light Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, themeMode: 'dark-amoled' })}
                      className={`h-12 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                        profile.themeMode !== 'light'
                          ? 'bg-[#FF8A00] text-black border-[#FF8A00]'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark AMOLED Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, themeMode: 'light' })}
                      className={`h-12 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                        profile.themeMode === 'light'
                          ? 'bg-[#FF8A00] text-black border-[#FF8A00]'
                          : 'bg-[#111111] text-white border-[#2E2E2E]'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light Mode</span>
                    </button>
                  </div>
                </div>

                {/* Backup, Restore & Delete Data */}
                <div className="pt-4 border-t border-neutral-200 dark:border-[#262626] space-y-3">
                  <div className="text-xs font-bold text-[#FFA726]">
                    LOCAL DATA BACKUP & PRIVACY CONTROLS
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleExportBackupJson}
                      className="h-10 px-4 rounded-xl bg-neutral-100 dark:bg-[#111111] border border-neutral-300 dark:border-[#2E2E2E] text-xs font-semibold flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#FF8A00]" />
                      <span>Export Local Backup (.JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(STORAGE_KEY);
                        setProfile(DEFAULT_PROFILE);
                        setAlarms(DEFAULT_ALARMS);
                        setFocusSessions(DEFAULT_SESSIONS);
                        setFocusCoins(100);
                      }}
                      className="h-10 px-4 rounded-xl bg-[#FF4545]/15 border border-[#FF4545]/40 text-xs font-bold text-[#FF4545] flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete & Reset All Local Data</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 24: Android Permission Management Explanations */}
              <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">
                    TRANSPARENT ANDROID PERMISSION GOVERNANCE
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                    Why FocusRise Requests Each Native Permission
                  </h3>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(
                    [
                      {
                        key: 'scheduleExactAlarm',
                        title: 'SCHEDULE_EXACT_ALARM',
                        desc: 'Triggers wake-up alarms at the exact minute even in Android Doze mode.',
                      },
                      {
                        key: 'postNotifications',
                        title: 'POST_NOTIFICATIONS',
                        desc: 'Delivers offline morning motivation, break completion, and Future Self reminders.',
                      },
                      {
                        key: 'accessNotificationPolicyDnd',
                        title: 'ACCESS_NOTIFICATION_POLICY (DND)',
                        desc: 'Silences interruptions during Focus sessions and restores your previous DND setting after.',
                      },
                      {
                        key: 'packageUsageStats',
                        title: 'PACKAGE_USAGE_STATS',
                        desc: 'Monitors time spent on selected distracting apps locally without uploading data.',
                      },
                      {
                        key: 'accessibilityService',
                        title: 'AccessibilityService (Focus Blocker)',
                        desc: 'Detects when a blocked app opens during an active Focus timer to show your WHY shield.',
                      },
                      {
                        key: 'cameraQr',
                        title: 'CAMERA (QR Wake-Up Challenge)',
                        desc: 'Used strictly when scanning your away-from-bed QR code to dismiss an alarm.',
                      },
                    ] as { key: keyof AndroidPermissionStatus; title: string; desc: string }[]
                  ).map((perm) => (
                    <div
                      key={perm.key}
                      className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                          {perm.title}
                        </div>
                        <p className="text-[11px] text-[#888888] mt-0.5">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPermissions({
                            ...permissions,
                            [perm.key]: !permissions[perm.key],
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                          permissions[perm.key]
                            ? 'bg-[#16C784] text-black'
                            : 'bg-neutral-200 dark:bg-[#242424] text-[#888888]'
                        }`}
                      >
                        {permissions[perm.key] ? 'Granted' : 'Denied'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 29: ANDROID STUDIO KOTLIN + JETPACK COMPOSE + APK BUILD DELIVERABLE HUB */}
            <section className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#191919] border-2 border-[#FF8A00] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>NATIVE ANDROID STUDIO PROJECT & APK BUILD DELIVERABLES</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    Kotlin + Jetpack Compose + Room + AlarmManager Source & APK Guide
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAndroidBundle}
                  className="h-11 px-5 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete Kotlin Project Bundle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-2">
                  {ANDROID_PROJECT_FILES.map((file, idx) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedAndroidFileIdx(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedAndroidFileIdx === idx
                          ? 'bg-[#FF8A00]/15 border-[#FF8A00] text-neutral-900 dark:text-white'
                          : 'bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] text-[#888888] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        {file.title}
                      </div>
                      <div className="font-mono text-[10px] text-[#FFA726] truncate mt-0.5">
                        {file.path}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-8 rounded-2xl bg-[#080808] border border-[#2A2A2A] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                    <span className="font-mono text-xs text-[#FFA726]">
                      {ANDROID_PROJECT_FILES[selectedAndroidFileIdx].path}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          ANDROID_PROJECT_FILES[selectedAndroidFileIdx].code
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#191919] hover:bg-[#262626] text-xs font-medium text-white flex items-center gap-1.5"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#16C784]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#FF8A00]" />
                          <span>Copy File</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-neutral-200 overflow-x-auto max-h-96 leading-relaxed">
                    {ANDROID_PROJECT_FILES[selectedAndroidFileIdx].code}
                  </pre>
                </div>
              </div>
            </section>

            {/* About Application & Mandatory Developer Credit */}
            <section className="rounded-3xl p-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF8A00]/15 border border-[#FF8A00] text-[#FF8A00]">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                FOCUSRISE 👑
              </h3>
              <p className="text-sm text-[#FFA726] font-semibold">
                “Wake Up. Think Fast. Stay Focused. Win Your Future.”
              </p>
              <p className="text-xs text-[#888888] max-w-xl mx-auto">
                The purpose of FocusRise is not to keep users inside the application. The purpose is
                to help users spend less time on their phones and more time building their future.
              </p>
              <div className="pt-4 border-t border-neutral-200 dark:border-[#262626] text-sm font-extrabold tracking-wide text-[#FF8A00]">
                Developed by Sravan King 👑
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Subtle Footer Credit */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 border-t border-neutral-200 dark:border-[#1E1E1E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888888]">
        <div>FocusRise 👑 — Wake Up. Think Fast. Stay Focused. Win Your Future.</div>
        <div className="font-bold text-neutral-900 dark:text-white">
          Developed by Sravan King 👑
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (5 Main Sections: HOME, FOCUS, WAKEUP, PROGRESS, PROFILE) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-md border-t border-neutral-200 dark:border-[#222222] grid grid-cols-5 items-center">
        {(
          [
            { id: 'HOME', label: 'HOME', icon: Home },
            { id: 'FOCUS', label: 'FOCUS', icon: Target },
            { id: 'WAKEUP', label: 'WAKEUP', icon: AlarmClock },
            { id: 'PROGRESS', label: 'PROGRESS', icon: TrendingUp },
            { id: 'PROFILE', label: 'PROFILE', icon: User },
          ] as { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[]
        ).map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
                active ? 'text-[#FF8A00]' : 'text-[#888888]'
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Full-Screen Progressive Snooze Alarm Challenge Modal */}
      {activeRingingAlarm && (
        <AlarmChallengeModal
          alarm={activeRingingAlarm}
          registeredQrCode={profile.registeredQrCode}
          onDismissSuccess={handleAlarmDismissSuccess}
          onSnoozeTriggered={handleAlarmSnoozeTriggered}
        />
      )}

      {/* Onboarding / Mission Editor Modal */}
      {showOnboardingModal && (
        <OnboardingModal
          initialProfile={profile}
          onSaveProfile={(updated) => setProfile(updated)}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      {/* Distraction Blocker Shield Simulation Modal */}
      {blockedAppAttemptModal && (
        <div className="fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111111] border-2 border-[#FF8A00] p-6 sm:p-8 text-center text-white space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FF4545]/15 border border-[#FF4545] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7 text-[#FF4545]" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#FF8A00]">
                FOCUSRISE 👑 DISTRACTION SHIELD
              </span>
              <h3 className="text-2xl font-extrabold">
                {blockedAppAttemptModal.appName} is Blocked!
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-[#191919] border border-[#2A2A2A] space-y-1">
              <div className="text-xs text-[#888888]">REMEMBER YOUR MISSION:</div>
              <div className="text-base font-bold text-[#FF8A00]">
                {profile.primaryGoalTitle}
              </div>
              <p className="text-xs text-neutral-300 italic mt-1">“{profile.whyImportant}”</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setBlockedAppAttemptModal(null)}
                className="w-full h-12 rounded-xl bg-[#FF8A00] text-black font-extrabold text-sm"
              >
                Return to My Mission 🔥
              </button>
              <button
                type="button"
                onClick={() => setBlockedAppAttemptModal(null)}
                className="w-full h-10 rounded-xl bg-[#191919] text-xs font-medium text-[#888888] hover:text-white"
              >
                Emergency 2-Minute Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
