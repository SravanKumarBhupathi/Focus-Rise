import { MainTab, NotificationItem, UserProfile } from '../types/focusrise';

export interface RawMotivationalTemplate {
  category: NotificationItem['category'];
  title: string;
  body: string;
  actionTab: MainTab;
}

export const MOTIVATIONAL_TEMPLATES: RawMotivationalTemplate[] = [
  {
    category: 'Morning Motivation',
    title: '🌅 GOOD MORNING, FUTURE CHAMPION!',
    body: 'Your dream of {goal} deserves more than yesterday’s excuses. Start strong today! 🔥',
    actionTab: 'HOME',
  },
  {
    category: 'Morning Motivation',
    title: '☀️ WAKE UP & CONQUER, {name}!',
    body: 'While others hit snooze, you build your edge. {daysLeft} days left until your target date.',
    actionTab: 'WAKEUP',
  },
  {
    category: 'Goal Reminder',
    title: '🎯 REMEMBER YOUR MISSION: {goal}',
    body: 'Why you started: "{why}". Every focused minute takes you closer to your goal.',
    actionTab: 'HOME',
  },
  {
    category: 'Focus Reminder',
    title: '🔥 TIME TO LOCK IN!',
    body: 'Your daily target is {targetHours} hours. Start a deep focus block now and protect your attention.',
    actionTab: 'FOCUS',
  },
  {
    category: 'Discipline',
    title: '⚡ DISCIPLINE OVER DOPAMINE',
    body: 'Put down {distraction}. 30 minutes of deep work right now will outlast 3 hours of scrolling.',
    actionTab: 'FOCUS',
  },
  {
    category: 'Break Over',
    title: '⏰ BREAK OVER!',
    body: 'Your future is calling. Return to your mission: {goal}! 📚',
    actionTab: 'FOCUS',
  },
  {
    category: 'Study Boost',
    title: '🧠 SHARP MIND, FAST CALCULATIONS',
    body: 'Spend 5 minutes in Morning Maths Master to boost your calculation speed for {goal}.',
    actionTab: 'WAKEUP',
  },
  {
    category: 'Confidence',
    title: '👑 BUILT FOR GREATNESS',
    body: 'Hard problems build unstoppable minds. Trust your preparation and keep pushing forward.',
    actionTab: 'PROGRESS',
  },
  {
    category: 'Competition',
    title: '🏆 OUTWORK THE COMPETITION',
    body: 'Thousands are preparing for {goal} right now. Make sure nobody out-disciplines you today.',
    actionTab: 'FOCUS',
  },
  {
    category: 'Evening Reflection',
    title: '🌙 DID YOU MOVE CLOSER TO YOUR DREAM TODAY?',
    body: 'Log your 60-second Daily Reflection and prepare your bedtime checklist for tomorrow.',
    actionTab: 'PROGRESS',
  },
  {
    category: 'Wake-Up Streak',
    title: '🔥 KEEP YOUR WAKE-UP STREAK ALIVE!',
    body: 'Set your Smart Alarm and place your QR code away from bed for a zero-snooze morning.',
    actionTab: 'WAKEUP',
  },
  {
    category: 'Comeback',
    title: '🚀 EVERY CHAMPION HAS TOUGH DAYS',
    body: 'Missed a session? Reset right now with a crisp 15-minute focus sprint. Never miss twice!',
    actionTab: 'FOCUS',
  },
  {
    category: 'Future Self',
    title: '💌 MESSAGE FROM YOUR FUTURE SELF',
    body: 'Hey {name}! I’m your future successful self. I know today is difficult, but please don’t give up on {goal}.',
    actionTab: 'HOME',
  },
];

export function generatePersonalizedNotification(
  profile: UserProfile,
  daysRemaining: number,
  preferredCategory?: NotificationItem['category'],
  recentNotificationTitles: string[] = []
): NotificationItem {
  const candidates = preferredCategory
    ? MOTIVATIONAL_TEMPLATES.filter((t) => t.category === preferredCategory)
    : MOTIVATIONAL_TEMPLATES;

  const nonRepeating = candidates.filter((c) => !recentNotificationTitles.includes(c.title));
  const pool = nonRepeating.length > 0 ? nonRepeating : candidates;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const interpolate = (text: string) =>
    text
      .replace(/\{name\}/g, profile.name || 'Champion')
      .replace(/\{goal\}/g, profile.primaryGoalTitle || 'Your Ultimate Goal')
      .replace(/\{why\}/g, profile.whyImportant || 'To build a proud future')
      .replace(/\{daysLeft\}/g, String(Math.max(1, daysRemaining)))
      .replace(/\{targetHours\}/g, String(profile.dailyFocusTargetHours || 3))
      .replace(/\{distraction\}/g, profile.biggestDistraction || 'social media');

  const now = new Date();
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: chosen.category,
    title: interpolate(chosen.title),
    body: interpolate(chosen.body),
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionTab: chosen.actionTab,
    read: false,
  };
}
