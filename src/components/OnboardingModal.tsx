import React, { useState } from 'react';
import { Crown, Target, Clock, ShieldAlert, Upload, CheckCircle2 } from 'lucide-react';
import { GoalCategory, UserProfile } from '../types/focusrise';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onClose?: () => void;
}

const GOAL_CATEGORIES: GoalCategory[] = [
  'Government Jobs (RRB, SSC, UPSC, Banking)',
  'Competitive Exams (JEE, NEET, GATE, CAT)',
  'Career & Software Engineering',
  'Business & Entrepreneurship',
  'Personal Growth & Fitness',
];

const COMMON_DISTRACTING_APPS = [
  'Instagram',
  'YouTube Shorts',
  'Reels / TikTok',
  'WhatsApp',
  'X (Twitter)',
  'Mobile Games',
  'Netflix / OTT',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onSaveProfile,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<UserProfile>(initialProfile);

  const toggleDistractingApp = (appName: string) => {
    const exists = form.distractingApps.includes(appName);
    const updated = exists
      ? form.distractingApps.filter((a) => a !== appName)
      : [...form.distractingApps, appName];
    setForm({ ...form, distractingApps: updated });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm({ ...form, goalPhotoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...form,
      onboardingCompleted: true,
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080808]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111111] border-2 border-[#FF8A00] rounded-3xl p-6 sm:p-8 text-white shadow-2xl my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#242424]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A00]">
              <Crown className="w-4 h-4" />
              <span>FOCUSRISE 👑 MISSION SETUP</span>
              <span aria-hidden="true">·</span>
              <span>STEP {step} OF 3</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              Wake Up. Think Fast. Stay Focused. Win Your Future.
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#191919] border border-[#2E2E2E] text-xs font-medium text-[#888888] hover:text-white"
            >
              Close
            </button>
          )}
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 gap-2 my-5">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s as 1 | 2 | 3)}
              className={`h-2 rounded-full transition-colors ${
                step >= s ? 'bg-[#FF8A00]' : 'bg-[#242424]'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleComplete} className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FFA726]">
                <Target className="w-4 h-4" />
                <span>01. Your Primary Goal & Mission Identity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    Your Name / Champion Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Sravan"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    1. What is your biggest goal?
                  </label>
                  <input
                    type="text"
                    required
                    value={form.primaryGoalTitle}
                    onChange={(e) => setForm({ ...form, primaryGoalTitle: e.target.value })}
                    placeholder="e.g., RRB NTPC & Group D Selection"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1.5">
                  2. What domain are you preparing for?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GOAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, goalCategory: cat })}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition-colors ${
                        form.goalCategory === cat
                          ? 'bg-[#FF8A00]/15 border-[#FF8A00] text-white font-semibold'
                          : 'bg-[#191919] border-[#282828] text-[#888888] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    3. What is your target achievement date?
                  </label>
                  <input
                    type="date"
                    required
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    Goal Photograph (Optional Local Upload)
                  </label>
                  <label className="h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] hover:border-[#FF8A00] flex items-center justify-center gap-2 text-xs text-[#FFA726] cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{form.goalPhotoUrl ? 'Goal Photo Attached ✓' : 'Upload Goal Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1.5">
                  4. Why is this goal deeply important to you? (Your WHY)
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.whyImportant}
                  onChange={(e) => setForm({ ...form, whyImportant: e.target.value })}
                  placeholder="e.g., To make my parents proud, achieve financial freedom, and prove my discipline."
                  className="w-full p-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-6 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs tracking-wide"
                >
                  Next: Distraction Audit →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FFA726]">
                <ShieldAlert className="w-4 h-4" />
                <span>02. Distraction Control & Personal Statement</span>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1.5">
                  5. What distracts you most when you try to study or work?
                </label>
                <input
                  type="text"
                  required
                  value={form.biggestDistraction}
                  onChange={(e) => setForm({ ...form, biggestDistraction: e.target.value })}
                  placeholder="e.g., Endless short-form videos and morning snoozing"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1.5">
                  6. Which applications consume most of your time? (Select to block during Focus)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DISTRACTING_APPS.map((app) => {
                    const active = form.distractingApps.includes(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() => toggleDistractingApp(app)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-[#FF8A00] text-black border-[#FF8A00] font-bold'
                            : 'bg-[#191919] text-[#888888] border-[#2E2E2E] hover:text-white'
                        }`}
                      >
                        {app}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1.5">
                  Personal Motivational Mantra (Displayed on Dashboard & Future Self Cards)
                </label>
                <input
                  type="text"
                  value={form.personalStatement}
                  onChange={(e) => setForm({ ...form, personalStatement: e.target.value })}
                  placeholder="e.g., Discipline today is victory tomorrow."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-4 rounded-xl bg-[#191919] border border-[#2E2E2E] text-xs font-medium text-[#888888] hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-11 px-6 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs tracking-wide"
                >
                  Next: Daily Schedule →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FFA726]">
                <Clock className="w-4 h-4" />
                <span>03. Daily Focus Target, Wake-Up & Sleep Rhythm</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    7. Daily Focus Target (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    step={0.5}
                    value={form.dailyFocusTargetHours}
                    onChange={(e) =>
                      setForm({ ...form, dailyFocusTargetHours: Number(e.target.value) || 3 })
                    }
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    8. Desired Wake-Up Time
                  </label>
                  <input
                    type="time"
                    value={form.desiredWakeUpTime}
                    onChange={(e) => setForm({ ...form, desiredWakeUpTime: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#888888] mb-1.5">
                    9. Usual Bedtime
                  </label>
                  <input
                    type="time"
                    value={form.usualSleepTime}
                    onChange={(e) => setForm({ ...form, usualSleepTime: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#191919] border border-[#2E2E2E] focus:border-[#FF8A00] text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#191919] border border-[#2E2E2E] text-xs text-[#888888] space-y-1">
                <div className="font-semibold text-white">
                  100% Offline-First & Local Privacy Guarantee
                </div>
                <p>
                  All your goals, alarms, focus sessions, and reflections are stored strictly on your
                  device. No mandatory login, no cloud tracking, and no subscriptions.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-4 rounded-xl bg-[#191919] border border-[#2E2E2E] text-xs font-medium text-[#888888] hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="h-12 px-7 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Launch FocusRise 👑</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
