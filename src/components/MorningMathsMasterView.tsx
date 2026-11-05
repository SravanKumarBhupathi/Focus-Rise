import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Calculator, HelpCircle, Award } from 'lucide-react';
import { MORNING_MATHS_MODULES } from '../services/morningMathsData';
import { soundEngine } from '../services/soundEngine';

interface MorningMathsMasterViewProps {
  completedTricks: string[];
  onCompleteTrickPractice: (trickId: string, questionsAnswered: number) => void;
}

export const MorningMathsMasterView: React.FC<MorningMathsMasterViewProps> = ({
  completedTricks,
  onCompleteTrickPractice,
}) => {
  const [subView, setSubView] = useState<'TRICKS' | 'TABLES_1_30' | 'SQUARES_CUBES'>('TRICKS');
  const [selectedTrickId, setSelectedTrickId] = useState<string>(MORNING_MATHS_MODULES[0].id);
  const [selectedTable, setSelectedTable] = useState<number>(17);

  // Practice state per question index
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  const activeTrick =
    MORNING_MATHS_MODULES.find((m) => m.id === selectedTrickId) || MORNING_MATHS_MODULES[0];

  const handleCheckPractice = (qIndex: number, expected: number) => {
    const key = `${activeTrick.id}_${qIndex}`;
    const raw = (userAnswers[key] || '').trim();
    const num = parseFloat(raw);
    if (!isNaN(num) && Math.abs(num - expected) < 0.01) {
      soundEngine.playSuccessChime();
      const nextVerified = { ...verifiedMap, [key]: true };
      setVerifiedMap(nextVerified);

      // Check if all practice questions for this trick are solved
      const allSolved = activeTrick.practiceQuestions.every(
        (_, idx) => nextVerified[`${activeTrick.id}_${idx}`]
      );
      if (allSolved) {
        onCompleteTrickPractice(activeTrick.id, activeTrick.practiceQuestions.length);
      } else {
        onCompleteTrickPractice(activeTrick.id, 1);
      }
    } else {
      setVerifiedMap({ ...verifiedMap, [key]: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF8A00]">
            <Calculator className="w-4 h-4" />
            <span>MORNING MATHS MASTER</span>
            <span aria-hidden="true">·</span>
            <span>{completedTricks.length}/{MORNING_MATHS_MODULES.length} Modules Mastered</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            Competitive Mental Mathematics & Speed Shortcuts
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => setSubView('TRICKS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subView === 'TRICKS'
                ? 'bg-[#FF8A00] text-black'
                : 'text-neutral-600 dark:text-[#888888] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            11 Speed Tricks
          </button>
          <button
            type="button"
            onClick={() => setSubView('TABLES_1_30')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subView === 'TABLES_1_30'
                ? 'bg-[#FF8A00] text-black'
                : 'text-neutral-600 dark:text-[#888888] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Tables 1–30
          </button>
          <button
            type="button"
            onClick={() => setSubView('SQUARES_CUBES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subView === 'SQUARES_CUBES'
                ? 'bg-[#FF8A00] text-black'
                : 'text-neutral-600 dark:text-[#888888] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Squares 1–50 & Cubes
          </button>
        </div>
      </div>

      {subView === 'TRICKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 11 Modules List */}
          <div className="lg:col-span-4 space-y-2">
            {MORNING_MATHS_MODULES.map((mod, index) => {
              const isSelected = mod.id === activeTrick.id;
              const isMastered = completedTricks.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedTrickId(mod.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FF8A00]/10 border-[#FF8A00] text-neutral-900 dark:text-white'
                      : 'bg-white dark:bg-[#191919] border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-neutral-300 hover:border-[#FF8A00]/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#888888] font-mono">
                      {String(index + 1).padStart(2, '0')} · {mod.category}
                    </div>
                    <div className="text-sm font-semibold truncate mt-0.5">{mod.title}</div>
                  </div>
                  {isMastered && <CheckCircle2 className="w-4 h-4 text-[#16C784] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Trick Lesson & Interactive Practice */}
          <div className="lg:col-span-8 bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-[#2A2A2A]">
              <div>
                <span className="text-xs font-semibold text-[#FF8A00]">{activeTrick.category}</span>
                <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  {activeTrick.title}
                </h4>
              </div>
              {completedTricks.includes(activeTrick.id) && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16C784]">
                  <Award className="w-4 h-4" />
                  Mastered
                </span>
              )}
            </div>

            {/* 1. Concept & 2. Shortcut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] mb-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. CORE CONCEPT</span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {activeTrick.concept}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-[#FF8A00]/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFA726] mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. SPEED SHORTCUT FORMULA</span>
                </div>
                <p className="font-mono text-sm font-semibold text-neutral-900 dark:text-white leading-relaxed">
                  {activeTrick.shortcutFormula}
                </p>
              </div>
            </div>

            {/* 3. Worked Example */}
            <div className="p-5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
              <div className="text-xs font-bold text-[#FF8A00] mb-2">
                3. STEP-BY-STEP WORKED EXAMPLE
              </div>
              <div className="font-mono text-lg font-bold text-neutral-900 dark:text-white mb-3">
                Problem: {activeTrick.workedExample.problem}
              </div>
              <ol className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300 list-decimal list-inside">
                {activeTrick.workedExample.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-[#262626] font-mono text-sm font-bold text-[#16C784]">
                Final Answer: {activeTrick.workedExample.finalAnswer}
              </div>
            </div>

            {/* 4, 5, 6. Interactive Practice Questions, Correct Answer & Explanation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF8A00]">
                  4. PRACTICE QUESTIONS (SOLVE TO MASTER)
                </span>
                <span className="text-xs text-[#888888]">
                  Includes instant validation & explanation
                </span>
              </div>

              <div className="space-y-3">
                {activeTrick.practiceQuestions.map((pq, idx) => {
                  const key = `${activeTrick.id}_${idx}`;
                  const status = verifiedMap[key];
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                          Q{idx + 1}. {pq.question}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={userAnswers[key] || ''}
                            onChange={(e) =>
                              setUserAnswers({ ...userAnswers, [key]: e.target.value })
                            }
                            placeholder="Your answer"
                            className="w-32 h-10 px-3 rounded-lg bg-white dark:bg-[#191919] border border-neutral-300 dark:border-[#333333] font-mono text-sm text-neutral-900 dark:text-white outline-none focus:border-[#FF8A00]"
                          />
                          <button
                            type="button"
                            onClick={() => handleCheckPractice(idx, pq.answer)}
                            className="h-10 px-4 rounded-lg bg-[#FF8A00] hover:bg-[#FFA726] text-black font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                          >
                            Check
                          </button>
                        </div>
                      </div>

                      {status !== undefined && (
                        <div
                          className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                            status
                              ? 'bg-[#16C784]/15 text-[#16C784]'
                              : 'bg-[#FF4545]/15 text-[#FF4545]'
                          }`}
                        >
                          {status ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          ) : (
                            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold">
                              {status
                                ? `Correct! Answer: ${pq.answer}`
                                : `Try Again! Correct Answer is ${pq.answer}`}
                            </div>
                            <div className="mt-0.5 opacity-90">Explanation: {pq.explanation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {subView === 'TABLES_1_30' && (
        <div className="bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-6 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
              Interactive Multiplication Tables (1 to 30)
            </h4>
            <p className="text-xs text-[#888888] mt-1">
              Select any base number from 1 to 30 to master competitive exam speed tables.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedTable(num)}
                className={`w-10 h-10 rounded-lg font-mono text-xs font-bold transition-colors ${
                  selectedTable === num
                    ? 'bg-[#FF8A00] text-black'
                    : 'bg-neutral-100 dark:bg-[#111111] text-neutral-700 dark:text-neutral-300 hover:border-[#FF8A00] border border-transparent'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((mult) => (
              <div
                key={mult}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] font-mono text-sm flex items-center justify-between"
              >
                <span className="text-[#888888]">
                  {selectedTable} × {mult}
                </span>
                <span className="font-bold text-[#FF8A00] tabular-nums">
                  {selectedTable * mult}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subView === 'SQUARES_CUBES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
              Squares 1 to 50 Reference
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] font-mono text-xs flex items-center justify-between"
                >
                  <span className="text-[#888888]">{n}²</span>
                  <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                    {n * n}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
              Cubes 1 to 25 Reference
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] font-mono text-xs flex items-center justify-between"
                >
                  <span className="text-[#888888]">{n}³</span>
                  <span className="font-bold text-[#FFA726] tabular-nums">{n * n * n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
