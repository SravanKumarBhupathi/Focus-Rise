import { DifficultyLevel, MathCategory, MathQuestion } from '../types/focusrise';

/**
 * Progressive Snooze Difficulty Mapper:
 * Initial Alarm (Snooze 0): EASY
 * First Snooze (1): EASY_MEDIUM
 * Second Snooze (2): MEDIUM
 * Third Snooze (3): MEDIUM_HARD
 * Fourth Snooze (4): HARD
 * Fifth Snooze+ (5+): EXPERT
 */
export function getProgressiveDifficulty(snoozeCount: number, baseDifficulty?: DifficultyLevel): DifficultyLevel {
  const levels: DifficultyLevel[] = [
    'EASY',
    'EASY_MEDIUM',
    'MEDIUM',
    'MEDIUM_HARD',
    'HARD',
    'EXPERT',
  ];
  const baseIdx = baseDifficulty ? Math.max(0, levels.indexOf(baseDifficulty)) : 0;
  const targetIdx = Math.min(levels.length - 1, baseIdx + Math.max(0, snoozeCount));
  return levels[targetIdx];
}

export function formatDifficultyLabel(diff: DifficultyLevel): string {
  switch (diff) {
    case 'EASY':
      return 'EASY';
    case 'EASY_MEDIUM':
      return 'EASY-TO-MEDIUM';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'MEDIUM_HARD':
      return 'MEDIUM-TO-HARD';
    case 'HARD':
      return 'HARD';
    case 'EXPERT':
      return 'EXPERT';
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BACKUP_QUESTIONS: Record<DifficultyLevel, Omit<MathQuestion, 'id'>[]> = {
  EASY: [
    { category: 'Addition', difficulty: 'EASY', prompt: '15 + 25 = ?', answer: 40, hint: 'Add tens and units', explanation: '15 + 25 = 40' },
    { category: 'Subtraction', difficulty: 'EASY', prompt: '80 - 35 = ?', answer: 45, hint: '80 - 30 - 5', explanation: '80 - 35 = 45' },
    { category: 'Multiplication', difficulty: 'EASY', prompt: '12 × 4 = ?', answer: 48, hint: '12 doubled twice', explanation: '12 × 4 = 48' },
    { category: 'Division', difficulty: 'EASY', prompt: '100 ÷ 5 = ?', answer: 20, hint: 'How many 5s in 100?', explanation: '100 ÷ 5 = 20' },
    { category: 'Addition', difficulty: 'EASY', prompt: '16 + 29 = ?', answer: 45, hint: '16 + 30 - 1', explanation: '16 + 29 = 45' },
    { category: 'Multiplication', difficulty: 'EASY', prompt: '9 × 7 = ?', answer: 63, hint: '70 - 7', explanation: '9 × 7 = 63' },
    { category: 'Division', difficulty: 'EASY', prompt: '144 ÷ 12 = ?', answer: 12, hint: '12 squared is 144', explanation: '144 ÷ 12 = 12' },
    { category: 'Subtraction', difficulty: 'EASY', prompt: '50 - 18 = ?', answer: 32, hint: '50 - 20 + 2', explanation: '50 - 18 = 32' },
    { category: 'Multiplication', difficulty: 'EASY', prompt: '15 × 3 = ?', answer: 45, hint: '15 + 15 + 15', explanation: '15 × 3 = 45' },
    { category: 'Addition', difficulty: 'EASY', prompt: '25 + 75 = ?', answer: 100, hint: 'Quarters of 100', explanation: '25 + 75 = 100' },
  ],
  EASY_MEDIUM: [
    { category: 'Tables 1-30', difficulty: 'EASY_MEDIUM', prompt: '18 × 6 = ?', answer: 108, hint: '(10 × 6) + (8 × 6)', explanation: '60 + 48 = 108' },
    { category: 'Squares & Roots', difficulty: 'EASY_MEDIUM', prompt: '14² = ?', answer: 196, hint: '14 × 14', explanation: '14² = 196' },
    { category: 'Percentages', difficulty: 'EASY_MEDIUM', prompt: '20% of 150 = ?', answer: 30, hint: '10% is 15, double it', explanation: '0.20 × 150 = 30' },
    { category: 'Missing Number', difficulty: 'EASY_MEDIUM', prompt: 'x + 37 = 92, x = ?', answer: 55, hint: '92 - 37', explanation: '92 - 37 = 55' },
    { category: 'BODMAS', difficulty: 'EASY_MEDIUM', prompt: '18 + (6 × 4) = ?', answer: 42, hint: 'Multiply first: 6 × 4 = 24', explanation: '18 + 24 = 42' },
    { category: 'Number Series', difficulty: 'EASY_MEDIUM', prompt: '3, 6, 12, 24, ?', answer: 48, hint: 'Each term doubles', explanation: '24 × 2 = 48' },
    { category: 'Division', difficulty: 'EASY_MEDIUM', prompt: '168 ÷ 8 = ?', answer: 21, hint: '(160 ÷ 8) + (8 ÷ 8)', explanation: '20 + 1 = 21' },
    { category: 'Subtraction', difficulty: 'EASY_MEDIUM', prompt: '210 - 85 = ?', answer: 125, hint: '210 - 80 - 5', explanation: '210 - 85 = 125' },
    { category: 'Fractions', difficulty: 'EASY_MEDIUM', prompt: '3/4 of 120 = ?', answer: 90, hint: '1/4 of 120 is 30, multiply by 3', explanation: '30 × 3 = 90' },
    { category: 'Tables 1-30', difficulty: 'EASY_MEDIUM', prompt: '23 × 5 = ?', answer: 115, hint: 'Half of 230', explanation: '23 × 5 = 115' },
  ],
  MEDIUM: [
    { category: 'Multiplication', difficulty: 'MEDIUM', prompt: '25 × 16 = ?', answer: 400, hint: '25 × 4 × 4', explanation: '100 × 4 = 400' },
    { category: 'Division', difficulty: 'MEDIUM', prompt: '144 ÷ 12 = ?', answer: 12, hint: '12 × 12 = 144', explanation: '144 ÷ 12 = 12' },
    { category: 'Percentages', difficulty: 'MEDIUM', prompt: '35% of 200 = ?', answer: 70, hint: '35 × 2', explanation: '(35/100) × 200 = 70' },
    { category: 'Tables 1-30', difficulty: 'MEDIUM', prompt: '19 × 7 = ?', answer: 133, hint: '(20 × 7) - 7', explanation: '140 - 7 = 133' },
    { category: 'Squares & Roots', difficulty: 'MEDIUM', prompt: '15² = ?', answer: 225, hint: '1 × 2 followed by 25', explanation: '15 × 15 = 225' },
    { category: 'Division', difficulty: 'MEDIUM', prompt: '225 ÷ 15 = ?', answer: 15, hint: 'Square root of 225', explanation: '225 ÷ 15 = 15' },
    { category: 'Percentages', difficulty: 'MEDIUM', prompt: '12.5% of 400 = ?', answer: 50, hint: '12.5% is 1/8', explanation: '400 ÷ 8 = 50' },
    { category: 'Mental Math Tricks', difficulty: 'MEDIUM', prompt: '125 × 8 = ?', answer: 1000, hint: '125 × 2 × 4', explanation: '125 × 8 = 1000' },
    { category: 'Mental Math Tricks', difficulty: 'MEDIUM', prompt: '45 × 11 = ?', answer: 495, hint: 'Split 4 and 5, put 4+5=9 in middle', explanation: '4_(4+5)_5 = 495' },
    { category: 'BODMAS', difficulty: 'MEDIUM', prompt: '240 - (15 × 8) = ?', answer: 120, hint: '15 × 8 = 120', explanation: '240 - 120 = 120' },
  ],
  MEDIUM_HARD: [
    { category: 'Squares & Roots', difficulty: 'MEDIUM_HARD', prompt: '35² = ?', answer: 1225, hint: '3 × 4 = 12, append 25', explanation: '35² = 1225' },
    { category: 'Cubes & Cube Roots', difficulty: 'MEDIUM_HARD', prompt: '7³ = ?', answer: 343, hint: '49 × 7', explanation: '7 × 7 × 7 = 343' },
    { category: 'Algebra', difficulty: 'MEDIUM_HARD', prompt: '3x - 14 = 46, x = ?', answer: 20, hint: '3x = 60', explanation: '60 ÷ 3 = 20' },
    { category: 'Percentages', difficulty: 'MEDIUM_HARD', prompt: '45% of 360 = ?', answer: 162, hint: '50% (180) minus 5% (18)', explanation: '180 - 18 = 162' },
    { category: 'Tables 1-30', difficulty: 'MEDIUM_HARD', prompt: '27 × 8 = ?', answer: 216, hint: '160 + 56', explanation: '27 × 8 = 216' },
    { category: 'Number Series', difficulty: 'MEDIUM_HARD', prompt: '4, 9, 19, 39, ?', answer: 79, hint: '×2 + 1 pattern', explanation: '39 × 2 + 1 = 79' },
    { category: 'Fractions', difficulty: 'MEDIUM_HARD', prompt: '(5/8) of 320 = ?', answer: 200, hint: '320 ÷ 8 = 40, × 5', explanation: '40 × 5 = 200' },
    { category: 'BODMAS', difficulty: 'MEDIUM_HARD', prompt: '(180 ÷ 15) + (14 × 6) = ?', answer: 96, hint: '12 + 84', explanation: '12 + 84 = 96' },
    { category: 'Mental Math Tricks', difficulty: 'MEDIUM_HARD', prompt: '64 × 25 = ?', answer: 1600, hint: 'Divide 64 by 4, multiply by 100', explanation: '(64 ÷ 4) × 100 = 1600' },
    { category: 'Squares & Roots', difficulty: 'MEDIUM_HARD', prompt: '√1296 = ?', answer: 36, hint: '30²=900, 40²=1600, ends in 6', explanation: '36 × 36 = 1296' },
  ],
  HARD: [
    { category: 'Competitive Exam Calc', difficulty: 'HARD', prompt: '125 × 24 = ?', answer: 3000, hint: '125 × 8 × 3', explanation: '1000 × 3 = 3000' },
    { category: 'Percentages', difficulty: 'HARD', prompt: '35% of 480 = ?', answer: 168, hint: '10% is 48; 30% is 144; 5% is 24', explanation: '144 + 24 = 168' },
    { category: 'Squares & Roots', difficulty: 'HARD', prompt: '48² = ?', answer: 2304, hint: '(50 - 2)² = 2500 - 200 + 4', explanation: '25 - 2 = 23, 2² = 04 -> 2304' },
    { category: 'Division', difficulty: 'HARD', prompt: '625 ÷ 25 = ?', answer: 25, hint: '25 squared is 625', explanation: '625 ÷ 25 = 25' },
    { category: 'Tables 1-30', difficulty: 'HARD', prompt: '17 × 19 = ?', answer: 323, hint: '18² - 1 = 324 - 1', explanation: '(18 - 1)(18 + 1) = 323' },
    { category: 'Percentages', difficulty: 'HARD', prompt: '15% of 760 = ?', answer: 114, hint: '10% (76) + 5% (38)', explanation: '76 + 38 = 114' },
    { category: 'BODMAS', difficulty: 'HARD', prompt: '(45 × 12) ÷ 9 = ?', answer: 60, hint: '(45 ÷ 9) × 12 = 5 × 12', explanation: '540 ÷ 9 = 60' },
    { category: 'Mental Math Tricks', difficulty: 'HARD', prompt: '999 × 7 = ?', answer: 6993, hint: '7000 - 7', explanation: '(1000 - 1) × 7 = 6993' },
    { category: 'Squares & Roots', difficulty: 'HARD', prompt: '√2025 = ?', answer: 45, hint: '20 = 4 × 5, ends in 25 -> 45', explanation: '45² = 2025' },
    { category: 'Percentages', difficulty: 'HARD', prompt: '125% of 640 = ?', answer: 800, hint: '(5/4) × 640 = 5 × 160', explanation: '640 + 160 = 800' },
  ],
  EXPERT: [
    { category: 'Competitive Exam Calc', difficulty: 'EXPERT', prompt: '(37.5% of 640) + 15² = ?', answer: 465, hint: '3/8 of 640 is 240; 15² is 225', explanation: '240 + 225 = 465' },
    { category: 'Algebra', difficulty: 'EXPERT', prompt: 'If 4x + 17 = 9x - 48, x = ?', answer: 13, hint: '5x = 65', explanation: '65 ÷ 5 = 13' },
    { category: 'Cubes & Cube Roots', difficulty: 'EXPERT', prompt: '∛1728 + 24² = ?', answer: 588, hint: '∛1728 = 12, 24² = 576', explanation: '12 + 576 = 588' },
    { category: 'Competitive Exam Calc', difficulty: 'EXPERT', prompt: '88 × 99 = ?', answer: 8712, hint: '(88 - 1) = 87; (99 - 87) = 12', explanation: '88 × (100 - 1) = 8712' },
    { category: 'BODMAS', difficulty: 'EXPERT', prompt: '(720 ÷ 16) × 14 - 130 = ?', answer: 500, hint: '45 × 14 = 630; 630 - 130', explanation: '630 - 130 = 500' },
    { category: 'Number Series', difficulty: 'EXPERT', prompt: '7, 15, 31, 63, 127, ?', answer: 255, hint: '2ⁿ - 1 or ×2 + 1', explanation: '127 × 2 + 1 = 255' },
    { category: 'Fractions', difficulty: 'EXPERT', prompt: '(7/12 of 360) + (5/9 of 270) = ?', answer: 360, hint: '210 + 150', explanation: '(7 × 30) + (5 × 30) = 360' },
    { category: 'Squares & Roots', difficulty: 'EXPERT', prompt: '65² - 35² = ?', answer: 3000, hint: '(a+b)(a-b) = 100 × 30', explanation: '(65+35)(65-35) = 100 × 30 = 3000' },
    { category: 'Percentages', difficulty: 'EXPERT', prompt: '66.66% of 450 + 25% of 320 = ?', answer: 380, hint: '(2/3 of 450 = 300) + 80', explanation: '300 + 80 = 380' },
    { category: 'Mental Math Tricks', difficulty: 'EXPERT', prompt: '375 × 16 = ?', answer: 6000, hint: '(3/8 × 1000) × 16 = 3 × 2000', explanation: '375 × 8 × 2 = 3000 × 2 = 6000' },
  ],
};

function generateDynamicQuestion(difficulty: DifficultyLevel, index: number): Omit<MathQuestion, 'id'> {
  const mode = index % 8;

  if (difficulty === 'EASY') {
    if (mode === 0) {
      const a = randInt(12, 65);
      const b = randInt(14, 55);
      return { category: 'Addition', difficulty, prompt: `${a} + ${b} = ?`, answer: a + b, hint: 'Add tens first, then units', explanation: `${a} + ${b} = ${a + b}` };
    }
    if (mode === 1) {
      const a = randInt(45, 99);
      const b = randInt(12, 42);
      return { category: 'Subtraction', difficulty, prompt: `${a} - ${b} = ?`, answer: a - b, hint: `Subtract ${Math.floor(b / 10) * 10} then ${b % 10}`, explanation: `${a} - ${b} = ${a - b}` };
    }
    if (mode === 2) {
      const a = randInt(6, 15);
      const b = randInt(3, 9);
      return { category: 'Multiplication', difficulty, prompt: `${a} × ${b} = ?`, answer: a * b, hint: `Multiplication table of ${a}`, explanation: `${a} × ${b} = ${a * b}` };
    }
    const divisor = randInt(3, 12);
    const quotient = randInt(4, 15);
    const dividend = divisor * quotient;
    return { category: 'Division', difficulty, prompt: `${dividend} ÷ ${divisor} = ?`, answer: quotient, hint: `${divisor} × ? = ${dividend}`, explanation: `${dividend} ÷ ${divisor} = ${quotient}` };
  }

  if (difficulty === 'EASY_MEDIUM') {
    if (mode === 0) {
      const a = randInt(13, 25);
      const b = randInt(5, 9);
      return { category: 'Tables 1-30', difficulty, prompt: `${a} × ${b} = ?`, answer: a * b, hint: `(${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b})`, explanation: `${a} × ${b} = ${a * b}` };
    }
    if (mode === 1) {
      const n = randInt(11, 20);
      return { category: 'Squares & Roots', difficulty, prompt: `${n}² = ?`, answer: n * n, hint: `${n} × ${n}`, explanation: `${n}² = ${n * n}` };
    }
    if (mode === 2) {
      const x = randInt(18, 65);
      const b = randInt(22, 49);
      return { category: 'Missing Number', difficulty, prompt: `x + ${b} = ${x + b}, x = ?`, answer: x, hint: `${x + b} - ${b}`, explanation: `x = ${x + b} - ${b} = ${x}` };
    }
    const base = randInt(2, 9) * 50;
    const pct = [10, 20, 25, 50][randInt(0, 3)];
    const ans = (base * pct) / 100;
    return { category: 'Percentages', difficulty, prompt: `${pct}% of ${base} = ?`, answer: ans, hint: `Find 10% (${base / 10}) and scale`, explanation: `${pct}% of ${base} = ${ans}` };
  }

  if (difficulty === 'MEDIUM') {
    if (mode === 0) {
      const a = randInt(21, 89);
      const sumMid = Math.floor(a / 10) + (a % 10);
      return { category: 'Mental Math Tricks', difficulty, prompt: `${a} × 11 = ?`, answer: a * 11, hint: `Multiply by 10 (${a * 10}) + ${a}`, explanation: `${a} × 11 = ${a * 11} (Digit sum trick: ${sumMid})` };
    }
    if (mode === 1) {
      const tens = randInt(1, 8);
      const n = tens * 10 + 5;
      return { category: 'Squares & Roots', difficulty, prompt: `${n}² = ?`, answer: n * n, hint: `${tens} × ${tens + 1} followed by 25`, explanation: `${tens}×${tens + 1}=${tens * (tens + 1)} -> ${n * n}` };
    }
    if (mode === 2) {
      const a = randInt(12, 28) * 4;
      return { category: 'Mental Math Tricks', difficulty, prompt: `${a} × 25 = ?`, answer: a * 25, hint: `Divide ${a} by 4, then multiply by 100`, explanation: `(${a} ÷ 4) × 100 = ${a * 25}` };
    }
    const a = randInt(120, 300);
    const b = randInt(11, 18);
    const c = randInt(5, 9);
    return { category: 'BODMAS', difficulty, prompt: `${a} + (${b} × ${c}) = ?`, answer: a + b * c, hint: `First compute ${b} × ${c} = ${b * c}`, explanation: `${a} + ${b * c} = ${a + b * c}` };
  }

  if (difficulty === 'MEDIUM_HARD') {
    if (mode === 0) {
      const n = randInt(4, 12);
      return { category: 'Cubes & Cube Roots', difficulty, prompt: `${n}³ = ?`, answer: n * n * n, hint: `${n * n} × ${n}`, explanation: `${n}³ = ${n * n * n}` };
    }
    if (mode === 1) {
      const x = randInt(9, 28);
      const coeff = randInt(3, 7);
      const sub = randInt(10, 35);
      const rhs = coeff * x - sub;
      return { category: 'Algebra', difficulty, prompt: `${coeff}x - ${sub} = ${rhs}, x = ?`, answer: x, hint: `Add ${sub} to ${rhs}, then divide by ${coeff}`, explanation: `${coeff}x = ${rhs + sub} -> x = ${x}` };
    }
    const mult = randInt(15, 45);
    const denom = 8;
    const num = [3, 5, 7][randInt(0, 2)];
    const total = mult * denom;
    return { category: 'Fractions', difficulty, prompt: `(${num}/${denom}) of ${total} = ?`, answer: num * mult, hint: `${total} ÷ ${denom} = ${mult}, then × ${num}`, explanation: `${num} × ${mult} = ${num * mult}` };
  }

  if (difficulty === 'HARD') {
    if (mode === 0) {
      const n = randInt(31, 59);
      return { category: 'Squares & Roots', difficulty, prompt: `${n}² = ?`, answer: n * n, hint: `Use base 50 method: 25 + (${n - 50}), then (${Math.abs(n - 50)})²`, explanation: `${n} × ${n} = ${n * n}` };
    }
    if (mode === 1) {
      const k = randInt(15, 32);
      const a = k - 1;
      const b = k + 1;
      return { category: 'Competitive Exam Calc', difficulty, prompt: `${a} × ${b} = ?`, answer: a * b, hint: `(${k} - 1)(${k} + 1) = ${k}² - 1`, explanation: `${k * k} - 1 = ${a * b}` };
    }
    const pct = [15, 35, 45, 75, 125][randInt(0, 4)];
    const base = randInt(6, 18) * 40;
    const ans = (pct * base) / 100;
    return { category: 'Percentages', difficulty, prompt: `${pct}% of ${base} = ?`, answer: ans, hint: `Split ${pct}% into 10% and 5% chunks`, explanation: `(${pct}/100) × ${base} = ${ans}` };
  }

  // EXPERT
  if (mode === 0) {
    const a = randInt(45, 85);
    const b = 100 - a;
    if (a > b) {
      return {
        category: 'Competitive Exam Calc',
        difficulty,
        prompt: `${a}² - ${b}² = ?`,
        answer: a * a - b * b,
        hint: `Use (a + b)(a - b) = (${a + b}) × (${a - b})`,
        explanation: `100 × ${a - b} = ${a * a - b * b}`,
      };
    }
  }
  const n = randInt(12, 25);
  const sq = n * n;
  const mult = randInt(8, 16) * 8;
  const ans = (3 * mult) / 8 + sq;
  return {
    category: 'Competitive Exam Calc',
    difficulty: 'EXPERT',
    prompt: `(37.5% of ${mult}) + ${n}² = ?`,
    answer: ans,
    hint: `37.5% = 3/8 -> (3/8 × ${mult}) + ${sq}`,
    explanation: `${(3 * mult) / 8} + ${sq} = ${ans}`,
  };
}

export function generateChallengeQuestions(difficulty: DifficultyLevel, count: number = 10): MathQuestion[] {
  const pool = [...BACKUP_QUESTIONS[difficulty]];
  const selected: MathQuestion[] = [];
  const usedPrompts = new Set<string>();

  // Mix curated examples + fresh dynamic questions without any duplicates
  for (let i = 0; i < count; i++) {
    let candidate: Omit<MathQuestion, 'id'>;
    if (i < Math.ceil(count * 0.5) && pool.length > 0) {
      const idx = randInt(0, pool.length - 1);
      candidate = pool.splice(idx, 1)[0];
    } else {
      candidate = generateDynamicQuestion(difficulty, i);
    }

    let attempts = 0;
    while (usedPrompts.has(candidate.prompt) && attempts < 15) {
      candidate = generateDynamicQuestion(difficulty, i + attempts + 1);
      attempts++;
    }

    usedPrompts.add(candidate.prompt);
    selected.push({
      ...candidate,
      id: `q_${difficulty}_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    });
  }

  return selected;
}

export function validateMathAnswer(question: MathQuestion, userInput: string): boolean {
  const cleaned = userInput.trim().replace(/,/g, '');
  if (!cleaned) return false;

  // Support fraction input like "3/4" if user enters a fraction
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return Math.abs(num / den - question.answer) <= (question.acceptableTolerance ?? 0.01);
      }
    }
  }

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return false;
  return Math.abs(parsed - question.answer) <= (question.acceptableTolerance ?? 0.01);
}

// Brain Teasers & Number Series Bank for Optional Brain Challenges
export interface BrainTeaserQuestion {
  id: string;
  type: 'NUMBER_SERIES' | 'BRAIN_TEASER';
  prompt: string;
  options: string[];
  correctOption: string;
  explanation: string;
}

export const BRAIN_CHALLENGE_BANK: BrainTeaserQuestion[] = [
  {
    id: 'bt_1',
    type: 'NUMBER_SERIES',
    prompt: 'Find the next number in the sequence: 2, 4, 8, 16, ?',
    options: ['24', '30', '32', '64'],
    correctOption: '32',
    explanation: 'Each number doubles the previous one: 16 × 2 = 32.',
  },
  {
    id: 'bt_2',
    type: 'NUMBER_SERIES',
    prompt: 'Find the next number in the sequence: 5, 10, 20, 40, ?',
    options: ['60', '75', '80', '100'],
    correctOption: '80',
    explanation: 'Geometric progression with ratio 2: 40 × 2 = 80.',
  },
  {
    id: 'bt_3',
    type: 'NUMBER_SERIES',
    prompt: 'Complete the competitive exam series: 3, 7, 15, 31, 63, ?',
    options: ['125', '126', '127', '129'],
    correctOption: '127',
    explanation: 'Pattern is (×2 + 1): 63 × 2 + 1 = 127.',
  },
  {
    id: 'bt_4',
    type: 'NUMBER_SERIES',
    prompt: 'Find the missing square term: 121, 144, 169, 196, ?',
    options: ['215', '225', '256', '289'],
    correctOption: '225',
    explanation: 'Consecutive squares: 11², 12², 13², 14², so next is 15² = 225.',
  },
  {
    id: 'bt_5',
    type: 'BRAIN_TEASER',
    prompt: 'A bat and a ball cost ₹110 in total. The bat costs ₹100 more than the ball. How much does the ball cost?',
    options: ['₹10', '₹5', '₹15', '₹20'],
    correctOption: '₹5',
    explanation: 'Ball = ₹5, Bat = ₹105 (which is ₹100 more than ₹5). Total = ₹110.',
  },
  {
    id: 'bt_6',
    type: 'BRAIN_TEASER',
    prompt: 'If 5 machines take 5 minutes to make 5 widgets, how many minutes would it take 100 machines to make 100 widgets?',
    options: ['100 minutes', '5 minutes', '20 minutes', '50 minutes'],
    correctOption: '5 minutes',
    explanation: 'Each machine makes 1 widget in 5 minutes, so 100 machines working simultaneously take 5 minutes.',
  },
  {
    id: 'bt_7',
    type: 'BRAIN_TEASER',
    prompt: 'In a lake, there is a patch of lily pads that doubles in size every day. If it takes 48 days to cover the entire lake, how many days to cover half the lake?',
    options: ['24 days', '46 days', '47 days', '36 days'],
    correctOption: '47 days',
    explanation: 'Since it doubles every day, the day before it is full (Day 48) it must be half full (Day 47).',
  },
];
