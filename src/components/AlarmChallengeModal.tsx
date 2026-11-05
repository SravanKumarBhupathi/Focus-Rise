import React, { useEffect, useState, useRef } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldAlert,
  Brain,
  Zap,
  Camera,
} from 'lucide-react';
import { AlarmItem, ChallengeMode, DifficultyLevel, MathQuestion } from '../types/focusrise';
import {
  BRAIN_CHALLENGE_BANK,
  formatDifficultyLabel,
  generateChallengeQuestions,
  getProgressiveDifficulty,
  validateMathAnswer,
} from '../services/mathEngine';
import { soundEngine } from '../services/soundEngine';

interface AlarmChallengeModalProps {
  alarm: AlarmItem;
  registeredQrCode: string;
  onDismissSuccess: (alarmId: string, snoozeCount: number, finalDifficulty: DifficultyLevel, questionsSolved: number, emergency: boolean) => void;
  onSnoozeTriggered: (alarmId: string, newSnoozeCount: number) => void;
}

export const AlarmChallengeModal: React.FC<AlarmChallengeModalProps> = ({
  alarm,
  registeredQrCode,
  onDismissSuccess,
  onSnoozeTriggered,
}) => {
  const [snoozeCount, setSnoozeCount] = useState<number>(alarm.currentSnoozeCount || 0);
  const [activeMode, setActiveMode] = useState<ChallengeMode>(alarm.challengeMode || 'MATH');
  const currentDifficulty = getProgressiveDifficulty(snoozeCount, alarm.baseDifficulty);

  const [questions, setQuestions] = useState<MathQuestion[]>(() =>
    generateChallengeQuestions(currentDifficulty, alarm.questionCount || 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [mutedPreview, setMutedPreview] = useState(false);

  // Memory Challenge state
  const [memorySequence, setMemorySequence] = useState<string>('');
  const [showMemoryDigits, setShowMemoryDigits] = useState(true);
  const [memoryInput, setMemoryInput] = useState('');

  // Reflex Challenge state
  const [reflexNumbers, setReflexNumbers] = useState<number[]>([]);
  const [reflexSelected, setReflexSelected] = useState<number[]>([]);
  const [reflexTask, setReflexTask] = useState<'EVEN' | 'ASCENDING'>('EVEN');

  // QR Scanner state
  const [qrInputCode, setQrInputCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Emergency Dismissal state
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyInput, setEmergencyInput] = useState('');

  useEffect(() => {
    soundEngine.startAlarmSound(alarm.soundType, alarm.gradualVolume, alarm.vibrate);
    return () => {
      soundEngine.stopAlarmSound();
    };
  }, [alarm.soundType, alarm.gradualVolume, alarm.vibrate]);

  // Regenerate questions if snoozeCount changes
  useEffect(() => {
    const diff = getProgressiveDifficulty(snoozeCount, alarm.baseDifficulty);
    setQuestions(generateChallengeQuestions(diff, alarm.questionCount || 10));
    setCurrentIndex(0);
    setAnswerInput('');
    setFeedback(null);
  }, [snoozeCount, alarm.baseDifficulty, alarm.questionCount]);

  // Setup Memory sequence when entering MEMORY mode
  useEffect(() => {
    if (activeMode === 'MEMORY') {
      const length = Math.min(8, 5 + Math.floor(snoozeCount / 2));
      let seq = '';
      for (let i = 0; i < length; i++) {
        seq += Math.floor(Math.random() * 9) + 1;
      }
      setMemorySequence(seq);
      setShowMemoryDigits(true);
      setMemoryInput('');
      const timer = setTimeout(() => setShowMemoryDigits(false), 3200);
      return () => clearTimeout(timer);
    }
    if (activeMode === 'REFLEX') {
      const nums: number[] = [];
      while (nums.length < 6) {
        const n = Math.floor(Math.random() * 88) + 11;
        if (!nums.includes(n)) nums.push(n);
      }
      // Ensure at least 2 even numbers
      if (nums.filter((x) => x % 2 === 0).length < 2) {
        nums[0] = 24;
        nums[1] = 48;
      }
      setReflexNumbers(nums);
      setReflexSelected([]);
      setReflexTask(currentIndex % 2 === 0 ? 'EVEN' : 'ASCENDING');
    }
  }, [activeMode, currentIndex, snoozeCount]);

  // Clean up camera if opened
  useEffect(() => {
    if (!cameraActive && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  }, [cameraActive]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || questions[0];
  const remainingQuestions = Math.max(0, totalQuestions - currentIndex);
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

  const advanceOrComplete = () => {
    soundEngine.playSuccessChime();
    if (currentIndex + 1 >= totalQuestions) {
      soundEngine.stopAlarmSound();
      onDismissSuccess(alarm.id, snoozeCount, currentDifficulty, totalQuestions, false);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswerInput('');
      setFeedback({ type: 'success', message: 'Correct! Moving to next challenge.' });
      setTimeout(() => setFeedback(null), 900);
    }
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;
    if (validateMathAnswer(currentQuestion, answerInput)) {
      advanceOrComplete();
    } else {
      setFeedback({
        type: 'error',
        message: `Incorrect answer. Try again! Hint: ${currentQuestion.hint}`,
      });
    }
  };

  const handleSnooze = () => {
    if (snoozeCount >= alarm.maxSnoozeCount) {
      setFeedback({
        type: 'error',
        message: `Maximum snooze limit (${alarm.maxSnoozeCount}) reached! Complete the challenge to wake up.`,
      });
      return;
    }
    const nextSnooze = snoozeCount + 1;
    setSnoozeCount(nextSnooze);
    onSnoozeTriggered(alarm.id, nextSnooze);
    const nextDiff = formatDifficultyLabel(getProgressiveDifficulty(nextSnooze, alarm.baseDifficulty));
    setFeedback({
      type: 'error',
      message: `Snoozed (#${nextSnooze})! Challenge difficulty escalated to ${nextDiff}.`,
    });
  };

  const toggleSoundMute = () => {
    if (mutedPreview) {
      soundEngine.startAlarmSound(alarm.soundType, alarm.gradualVolume, alarm.vibrate);
      setMutedPreview(false);
    } else {
      soundEngine.stopAlarmSound();
      setMutedPreview(true);
    }
  };

  const startQrCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
      setFeedback({
        type: 'error',
        message: 'Camera permission unavailable in browser frame. Enter or click your registered QR token below.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#111111] border-2 border-[#FF8A00] rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(255,138,0,0.2)]">
        {/* Top Alarm Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#242424]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF8A00]">
              <Flame className="w-4 h-4 text-[#FF6D00]" />
              <span>SMART WAKE-UP CHALLENGE</span>
              <span aria-hidden="true">·</span>
              <span>{alarm.label || 'Morning Mission'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              WAKE UP, CHAMPION! 🔥
            </h2>
          </div>

          <button
            type="button"
            onClick={toggleSoundMute}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-[#191919] border border-[#2E2E2E] hover:border-[#FF8A00] flex items-center justify-center gap-1.5 text-xs font-medium text-[#888888] hover:text-white transition-colors"
            title="Toggle alarm tone while solving"
          >
            {mutedPreview ? (
              <>
                <VolumeX className="w-4 h-4 text-[#FF4545]" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FF8A00]" />
                <span>Ringing</span>
              </>
            )}
          </button>
        </div>

        {/* Metadata Telemetry Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs">
          <div className="bg-[#191919] border border-[#262626] rounded-xl p-3">
            <span className="text-[#888888] block">Snooze Count</span>
            <span className="font-mono tabular-nums text-lg font-bold text-white">
              {snoozeCount} / {alarm.maxSnoozeCount}
            </span>
          </div>
          <div className="bg-[#191919] border border-[#262626] rounded-xl p-3">
            <span className="text-[#888888] block">Difficulty</span>
            <span className="font-mono text-sm font-bold text-[#FF8A00]">
              {formatDifficultyLabel(currentDifficulty)}
            </span>
          </div>
          <div className="bg-[#191919] border border-[#262626] rounded-xl p-3">
            <span className="text-[#888888] block">Solved</span>
            <span className="font-mono tabular-nums text-lg font-bold text-[#16C784]">
              {String(currentIndex).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>
          <div className="bg-[#191919] border border-[#262626] rounded-xl p-3">
            <span className="text-[#888888] block">Remaining</span>
            <span className="font-mono tabular-nums text-lg font-bold text-[#FFA726]">
              {remainingQuestions} Left
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono font-semibold text-white">
              Question {String(currentIndex + 1).padStart(2, '0')}/{String(totalQuestions).padStart(2, '0')}
            </span>
            <span className="font-mono tabular-nums text-[#FF8A00]">{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-[#191919] rounded-full overflow-hidden border border-[#2A2A2A]">
            <div
              className="h-full bg-gradient-to-r from-[#FF6D00] to-[#FFA726] transition-all duration-200"
              style={{ width: `${Math.max(6, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Challenge Mode Switcher (Allows testing all brain challenges) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
          {(
            [
              { id: 'MATH', label: 'Progressive Math' },
              { id: 'MEMORY', label: 'Memory Sequence' },
              { id: 'NUMBER_SERIES', label: 'Number Series' },
              { id: 'BRAIN_TEASER', label: 'Brain Teaser' },
              { id: 'REFLEX', label: 'Reflex Grid' },
              { id: 'QR_CODE', label: 'QR Scan' },
            ] as { id: ChallengeMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeMode === tab.id
                  ? 'bg-[#FF8A00] text-black font-semibold'
                  : 'bg-[#191919] text-[#888888] hover:text-white border border-[#282828]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Challenge Body by Active Mode */}
        {activeMode === 'MATH' && currentQuestion && (
          <form onSubmit={handleMathSubmit} className="space-y-4">
            <div className="bg-[#191919] border border-[#2E2E2E] rounded-2xl p-6 text-center">
              <div className="text-xs text-[#888888] mb-2">
                <span>Category: {currentQuestion.category}</span>
                <span className="mx-2">·</span>
                <span>Level: {formatDifficultyLabel(currentDifficulty)}</span>
              </div>
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-white tracking-tight my-3">
                {currentQuestion.prompt}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Enter exact answer..."
                autoFocus
                className="flex-1 h-12 px-4 rounded-xl bg-[#080808] border-2 border-[#333333] focus:border-[#FF8A00] text-white font-mono text-lg outline-none"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-sm tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                SUBMIT ANSWER
              </button>
            </div>
          </form>
        )}

        {activeMode === 'MEMORY' && (
          <div className="bg-[#191919] border border-[#2E2E2E] rounded-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-[#FFA726]">
              <Brain className="w-4 h-4" />
              <span>Memorize the number sequence before it disappears</span>
            </div>
            {showMemoryDigits ? (
              <div className="font-mono text-4xl font-bold tracking-widest text-[#FF8A00] py-4">
                {memorySequence}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={memoryInput}
                  onChange={(e) => setMemoryInput(e.target.value)}
                  placeholder="Reproduce the sequence..."
                  className="w-full h-12 px-4 rounded-xl bg-[#080808] border border-[#FF8A00] text-center font-mono text-xl text-white outline-none"
                />
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemoryDigits(true);
                      setTimeout(() => setShowMemoryDigits(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#242424] text-xs font-medium text-white"
                  >
                    Peek Again (2s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (memoryInput.trim() === memorySequence) {
                        advanceOrComplete();
                      } else {
                        setFeedback({ type: 'error', message: 'Sequence mismatch! Peek again and retry.' });
                      }
                    }}
                    className="px-6 py-2 rounded-xl bg-[#FF8A00] text-black font-bold text-xs"
                  >
                    Verify Sequence
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeMode === 'NUMBER_SERIES' || activeMode === 'BRAIN_TEASER') && (
          <div className="bg-[#191919] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
            {(() => {
              const items = BRAIN_CHALLENGE_BANK.filter((b) =>
                activeMode === 'NUMBER_SERIES' ? b.type === 'NUMBER_SERIES' : b.type === 'BRAIN_TEASER'
              );
              const item = items[currentIndex % items.length] || BRAIN_CHALLENGE_BANK[0];
              return (
                <>
                  <p className="text-base sm:text-lg font-semibold text-white">{item.prompt}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {item.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          if (opt === item.correctOption) {
                            advanceOrComplete();
                          } else {
                            setFeedback({ type: 'error', message: `Not quite! Hint: ${item.explanation}` });
                          }
                        }}
                        className="h-12 px-4 rounded-xl bg-[#080808] hover:bg-[#222222] border border-[#333333] hover:border-[#FF8A00] font-mono text-sm font-semibold text-white transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeMode === 'REFLEX' && (
          <div className="bg-[#191919] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#FFA726]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Zap className="w-4 h-4" />
                {reflexTask === 'EVEN'
                  ? 'Tap ALL EVEN numbers below:'
                  : 'Tap the LARGEST number in the grid:'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {reflexNumbers.map((num) => {
                const selected = reflexSelected.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (reflexTask === 'ASCENDING') {
                        const maxNum = Math.max(...reflexNumbers);
                        if (num === maxNum) {
                          advanceOrComplete();
                        } else {
                          setFeedback({ type: 'error', message: `${num} is not the largest number!` });
                        }
                      } else {
                        const nextSel = selected
                          ? reflexSelected.filter((x) => x !== num)
                          : [...reflexSelected, num];
                        setReflexSelected(nextSel);
                        const allEvens = reflexNumbers.filter((x) => x % 2 === 0);
                        if (
                          nextSel.length === allEvens.length &&
                          allEvens.every((ev) => nextSel.includes(ev))
                        ) {
                          advanceOrComplete();
                        }
                      }
                    }}
                    className={`h-14 rounded-xl font-mono text-lg font-bold border transition-all ${
                      selected
                        ? 'bg-[#FF8A00] text-black border-[#FF8A00]'
                        : 'bg-[#080808] text-white border-[#333333] hover:border-[#FF8A00]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeMode === 'QR_CODE' && (
          <div className="bg-[#191919] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <QrCode className="w-5 h-5 text-[#FF8A00]" />
                <span>Scan Registered Away-From-Bed QR Code</span>
              </div>
              <button
                type="button"
                onClick={startQrCamera}
                className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-xs font-medium text-white flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF8A00]" />
                Open Camera
              </button>
            </div>

            {cameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black h-44 border border-[#FF8A00]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-xs text-[#888888]">
              Registered QR Code Key: <code className="text-[#FFA726] font-mono">{registeredQrCode}</code>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrInputCode}
                onChange={(e) => setQrInputCode(e.target.value)}
                placeholder={`Enter or scan "${registeredQrCode}"`}
                className="flex-1 h-11 px-3 rounded-xl bg-[#080808] border border-[#333333] text-sm font-mono text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (qrInputCode.trim().toUpperCase() === registeredQrCode.toUpperCase()) {
                    soundEngine.stopAlarmSound();
                    onDismissSuccess(alarm.id, snoozeCount, currentDifficulty, totalQuestions, false);
                  } else {
                    setFeedback({ type: 'error', message: 'QR Code does not match your registered wake-up code.' });
                  }
                }}
                className="px-4 h-11 rounded-xl bg-[#FF8A00] text-black font-bold text-xs whitespace-nowrap"
              >
                Verify QR
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-[#16C784]/15 border-[#16C784] text-[#16C784]'
                : 'bg-[#FF4545]/15 border-[#FF4545] text-[#FF4545]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Bottom Actions: Progressive Snooze & Emergency Dismissal */}
        <div className="mt-6 pt-4 border-t border-[#242424] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSnooze}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#191919] hover:bg-[#252525] border border-[#333333] text-xs font-semibold text-[#FFA726] transition-colors"
          >
            Snooze (+{alarm.snoozeMinutes}m · Escalates Difficulty)
          </button>

          <button
            type="button"
            onClick={() => setShowEmergencyConfirm(!showEmergencyConfirm)}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-[#888888] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-[#FF4545]" />
            Emergency Dismissal
          </button>
        </div>

        {showEmergencyConfirm && (
          <div className="mt-3 p-4 rounded-2xl bg-[#191919] border border-[#FF4545]/50 space-y-3">
            <p className="text-xs text-[#888888]">
              Safety Fallback: Alarms are never impossible to dismiss. Type{' '}
              <strong className="text-white font-mono">AWAKE</strong> below to dismiss immediately.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={emergencyInput}
                onChange={(e) => setEmergencyInput(e.target.value)}
                placeholder="Type AWAKE"
                className="flex-1 h-10 px-3 rounded-lg bg-[#080808] border border-[#333333] text-xs font-mono text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (emergencyInput.trim().toUpperCase() === 'AWAKE') {
                    soundEngine.stopAlarmSound();
                    onDismissSuccess(alarm.id, snoozeCount, currentDifficulty, currentIndex, true);
                  }
                }}
                className="px-4 h-10 rounded-lg bg-[#FF4545] text-white text-xs font-bold"
              >
                Emergency Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
