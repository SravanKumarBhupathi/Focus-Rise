import { MathTrickModule } from '../types/focusrise';

export const MORNING_MATHS_MODULES: MathTrickModule[] = [
  {
    id: 'trick_mult_11',
    title: 'Multiplication by 11',
    category: 'Speed Multiplication',
    concept: 'Multiplying any 2-digit or 3-digit number by 11 without traditional long multiplication by splitting the outer digits and summing adjacent digits in the middle.',
    shortcutFormula: 'For AB × 11 → Write [A] [A + B] [B]. If A + B ≥ 10, carry 1 to A.',
    workedExample: {
      problem: '45 × 11 = ?',
      steps: [
        'Separate the outer digits: 4 and 5.',
        'Add the two digits together: 4 + 5 = 9.',
        'Place 9 between 4 and 5 → 495.',
      ],
      finalAnswer: '495',
    },
    practiceQuestions: [
      { question: '36 × 11 = ?', answer: 396, explanation: 'Outer digits 3 and 6; middle is 3 + 6 = 9 → 396.' },
      { question: '78 × 11 = ?', answer: 858, explanation: '7 + 8 = 15. Keep 5 in middle, carry 1 to 7 → 858.' },
      { question: '63 × 11 = ?', answer: 693, explanation: 'Outer digits 6 and 3; middle is 6 + 3 = 9 → 693.' },
    ],
  },
  {
    id: 'trick_square_ending_5',
    title: 'Squaring Numbers Ending in 5',
    category: 'Vedic Squares',
    concept: 'Any number ending in 5 always has a square ending in 25. The leading digits are simply the prefix multiplied by the next consecutive integer.',
    shortcutFormula: '(N5)² = [N × (N + 1)] concatenated with 25',
    workedExample: {
      problem: '65² = ?',
      steps: [
        'Take the tens digit N = 6.',
        'Multiply N by (N + 1): 6 × 7 = 42.',
        'Append 25 to the right → 4225.',
      ],
      finalAnswer: '4225',
    },
    practiceQuestions: [
      { question: '35² = ?', answer: 1225, explanation: '3 × 4 = 12, append 25 → 1225.' },
      { question: '85² = ?', answer: 7225, explanation: '8 × 9 = 72, append 25 → 7225.' },
      { question: '105² = ?', answer: 11025, explanation: '10 × 11 = 110, append 25 → 11025.' },
    ],
  },
  {
    id: 'trick_mult_25',
    title: 'Multiplication by 25',
    category: 'Speed Multiplication',
    concept: 'Since 25 = 100 ÷ 4, multiplying any number by 25 is equivalent to dividing by 4 and multiplying by 100.',
    shortcutFormula: 'N × 25 = (N ÷ 4) × 100',
    workedExample: {
      problem: '68 × 25 = ?',
      steps: [
        'Divide 68 by 4: 68 ÷ 4 = 17.',
        'Multiply by 100 (append two zeros): 1700.',
      ],
      finalAnswer: '1700',
    },
    practiceQuestions: [
      { question: '48 × 25 = ?', answer: 1200, explanation: '48 ÷ 4 = 12 → 12 × 100 = 1200.' },
      { question: '96 × 25 = ?', answer: 2400, explanation: '96 ÷ 4 = 24 → 2400.' },
      { question: '124 × 25 = ?', answer: 3100, explanation: '124 ÷ 4 = 31 → 3100.' },
    ],
  },
  {
    id: 'trick_mult_99',
    title: 'Multiplication by 99',
    category: 'Speed Multiplication',
    concept: '99 is (100 - 1). For any 2-digit number N × 99, the left half is (N - 1) and the right half is its 99-complement (99 - (N - 1)).',
    shortcutFormula: 'N × 99 = [N - 1] | [100 - N]',
    workedExample: {
      problem: '74 × 99 = ?',
      steps: [
        'Subtract 1 from 74: 74 - 1 = 73 (Left part).',
        'Subtract 74 from 100: 100 - 74 = 26 (Right part).',
        'Combine both parts → 7326.',
      ],
      finalAnswer: '7326',
    },
    practiceQuestions: [
      { question: '43 × 99 = ?', answer: 4257, explanation: '43 - 1 = 42; 100 - 43 = 57 → 4257.' },
      { question: '88 × 99 = ?', answer: 8712, explanation: '88 - 1 = 87; 100 - 88 = 12 → 8712.' },
      { question: '65 × 99 = ?', answer: 6435, explanation: '65 - 1 = 64; 100 - 65 = 35 → 6435.' },
    ],
  },
  {
    id: 'trick_mult_general',
    title: 'Base-100 Multiplication Trick',
    category: 'Speed Multiplication',
    concept: 'Multiply numbers close to 100 in 3 seconds using their deficits from 100.',
    shortcutFormula: '(100 - a)(100 - b) = [100 - a - b] | [a × b (2 digits)]',
    workedExample: {
      problem: '96 × 94 = ?',
      steps: [
        'Deficits from 100: 96 is -4, 94 is -6.',
        'Cross subtract: 96 - 6 = 90 (or 94 - 4 = 90).',
        'Multiply deficits: (-4) × (-6) = 24 → 9024.',
      ],
      finalAnswer: '9024',
    },
    practiceQuestions: [
      { question: '97 × 95 = ?', answer: 9215, explanation: '97 - 5 = 92; 3 × 5 = 15 → 9215.' },
      { question: '98 × 92 = ?', answer: 9016, explanation: '98 - 8 = 90; 2 × 8 = 16 → 9016.' },
      { question: '93 × 96 = ?', answer: 8928, explanation: '93 - 4 = 89; 7 × 4 = 28 → 8928.' },
    ],
  },
  {
    id: 'trick_squares_1_50',
    title: 'Squares 1–50 (Base-50 Method)',
    category: 'Vedic Squares',
    concept: 'Find any square near 50 instantly using 25 as the anchor base.',
    shortcutFormula: '(50 ± d)² = [25 ± d] | [d² (as 2 digits)]',
    workedExample: {
      problem: '47² = ?',
      steps: [
        '47 is 3 less than 50 (d = -3).',
        'Subtract 3 from anchor 25: 25 - 3 = 22.',
        'Square the difference: (-3)² = 09 → 2209.',
      ],
      finalAnswer: '2209',
    },
    practiceQuestions: [
      { question: '48² = ?', answer: 2304, explanation: '25 - 2 = 23; 2² = 04 → 2304.' },
      { question: '54² = ?', answer: 2916, explanation: '25 + 4 = 29; 4² = 16 → 2916.' },
      { question: '44² = ?', answer: 1936, explanation: '25 - 6 = 19; 6² = 36 → 1936.' },
    ],
  },
  {
    id: 'trick_cubes',
    title: 'Cubes & Cube Root Estimation',
    category: 'Powers & Roots',
    concept: 'Every digit 0–9 maps to a unique last digit in its cube (2↔8, 3↔7, others stay unchanged). Use this to extract exact cube roots in 2 seconds.',
    shortcutFormula: 'Drop last 3 digits → find largest cube ≤ prefix | Match unit digit (2↔8, 3↔7)',
    workedExample: {
      problem: '∛17576 = ?',
      steps: [
        'Unit digit is 6 → cube root unit digit is 6.',
        'Ignore last 3 digits (576) → remaining prefix is 17.',
        'Largest cube ≤ 17 is 2³ = 8 (so tens digit is 2) → 26.',
      ],
      finalAnswer: '26',
    },
    practiceQuestions: [
      { question: '∛1728 = ?', answer: 12, explanation: 'Ends in 8 → unit digit 2. Prefix 1 → tens digit 1 → 12.' },
      { question: '∛9261 = ?', answer: 21, explanation: 'Ends in 1 → unit digit 1. Prefix 9 ≥ 2³(8) → 21.' },
      { question: '8³ = ?', answer: 512, explanation: '8 × 8 × 8 = 512.' },
    ],
  },
  {
    id: 'trick_percentage_shortcuts',
    title: 'Fraction-to-Percentage Shortcuts',
    category: 'Competitive Percentages',
    concept: 'Convert complex percentages into simple unit fractions (12.5% = 1/8, 37.5% = 3/8, 16.66% = 1/6, 62.5% = 5/8) used heavily in RRB, SSC, and Banking exams.',
    shortcutFormula: '12.5% = 1/8 | 37.5% = 3/8 | 62.5% = 5/8 | 87.5% = 7/8',
    workedExample: {
      problem: '37.5% of 640 = ?',
      steps: [
        'Replace 37.5% with its exact fraction 3/8.',
        'Divide 640 by 8: 640 ÷ 8 = 80.',
        'Multiply by 3: 80 × 3 = 240.',
      ],
      finalAnswer: '240',
    },
    practiceQuestions: [
      { question: '12.5% of 720 = ?', answer: 90, explanation: '1/8 of 720 = 90.' },
      { question: '62.5% of 400 = ?', answer: 250, explanation: '5/8 of 400 = 5 × 50 = 250.' },
      { question: '87.5% of 320 = ?', answer: 280, explanation: '7/8 of 320 = 7 × 40 = 280.' },
    ],
  },
  {
    id: 'trick_quick_division',
    title: 'Quick Division by 5, 25, and 125',
    category: 'Speed Division',
    concept: 'Never do long division for 5, 25, or 125. Multiply by 2, 4, or 8 respectively and shift the decimal point.',
    shortcutFormula: 'N ÷ 5 = (N × 2) ÷ 10 | N ÷ 25 = (N × 4) ÷ 100 | N ÷ 125 = (N × 8) ÷ 1000',
    workedExample: {
      problem: '1350 ÷ 25 = ?',
      steps: [
        'Drop two zeros by multiplying 13.5 by 4.',
        '13.5 × 2 = 27; 27 × 2 = 54.',
      ],
      finalAnswer: '54',
    },
    practiceQuestions: [
      { question: '420 ÷ 5 = ?', answer: 84, explanation: '42 × 2 = 84.' },
      { question: '1700 ÷ 25 = ?', answer: 68, explanation: '17 × 4 = 68.' },
      { question: '3000 ÷ 125 = ?', answer: 24, explanation: '3 × 8 = 24.' },
    ],
  },
  {
    id: 'trick_tables_1_30',
    title: 'Mastering Tables 1–30 (Split & Anchor)',
    category: 'Tables Mastery',
    concept: 'Calculate any multiplication table from 16 to 30 mentally by splitting into (20 ± d) or (Tens + Units).',
    shortcutFormula: 'For 29 × k → (30 × k) - k | For 19 × k → (20 × k) - k',
    workedExample: {
      problem: '29 × 8 = ?',
      steps: [
        'Round 29 up to 30: 30 × 8 = 240.',
        'Subtract one 8: 240 - 8 = 232.',
      ],
      finalAnswer: '232',
    },
    practiceQuestions: [
      { question: '19 × 9 = ?', answer: 171, explanation: '180 - 9 = 171.' },
      { question: '28 × 7 = ?', answer: 196, explanation: '210 - 14 = 196.' },
      { question: '24 × 8 = ?', answer: 192, explanation: '160 + 32 = 192.' },
    ],
  },
  {
    id: 'trick_competitive_exam',
    title: 'Competitive Exam Difference of Squares',
    category: 'Exam Shortcuts',
    concept: 'Use a² - b² = (a + b)(a - b) and (k - 1)(k + 1) = k² - 1 to solve RRB NTPC, SSC CGL, and Banking simplification questions in seconds.',
    shortcutFormula: 'a² - b² = (a + b)(a - b)',
    workedExample: {
      problem: '72² - 28² = ?',
      steps: [
        'Add the two bases: 72 + 28 = 100.',
        'Subtract the two bases: 72 - 28 = 44.',
        'Multiply: 100 × 44 = 4400.',
      ],
      finalAnswer: '4400',
    },
    practiceQuestions: [
      { question: '64² - 36² = ?', answer: 2800, explanation: '(64 + 36)(64 - 36) = 100 × 28 = 2800.' },
      { question: '24 × 26 = ?', answer: 624, explanation: '25² - 1 = 625 - 1 = 624.' },
      { question: '85² - 15² = ?', answer: 7000, explanation: '100 × 70 = 7000.' },
    ],
  },
];
