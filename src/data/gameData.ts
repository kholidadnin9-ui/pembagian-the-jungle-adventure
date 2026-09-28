export interface Question {
  id: number;
  dividend: number;
  divisor: number;
  quotient: number;
  options: number[];
  hint?: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  questions: Question[];
}

// Generate high quality, age-appropriate (Grade 1-3 SD) division questions
// Level 1: Pembagian sangat dasar (bagi 1 dan 2, angka sampai 20)
// Level 2: Pembagian dengan 3 dan 4 (angka sampai 40)
// Level 3: Pembagian dengan 5 dan 10 (angka sampai 60)
// Level 4: Pembagian dengan 6, 7, dan 8 (angka sampai 80)
// Level 5: Pembagian tantangan gabungan (sampai 100)

export const LEVEL_DATA: LevelConfig[] = [
  {
    id: 1,
    title: 'Level 1',
    name: 'Dasar 1 & 2',
    description: 'Pembagian mudah angka 1 & 2 (Hasil 1 - 10)',
    color: '#22c55e', // Emerald/Green
    badgeBg: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-green-600',
    borderColor: '#15803d',
    shadowColor: '#14532d',
    questions: [
      { id: 1, dividend: 6, divisor: 2, quotient: 3, options: [3, 2, 4], hint: '6 dibagi 2 sama dengan berapa?' },
      { id: 2, dividend: 8, divisor: 2, quotient: 4, options: [3, 4, 5], hint: '8 kue dibagi untuk 2 teman' },
      { id: 3, dividend: 10, divisor: 2, quotient: 5, options: [5, 4, 6], hint: '10 apel dibagi 2 kelompok' },
      { id: 4, dividend: 4, divisor: 2, quotient: 2, options: [1, 2, 3] },
      { id: 5, dividend: 12, divisor: 2, quotient: 6, options: [5, 6, 7] },
      { id: 6, dividend: 14, divisor: 2, quotient: 7, options: [6, 7, 8] },
      { id: 7, dividend: 5, divisor: 1, quotient: 5, options: [4, 5, 1] },
      { id: 8, dividend: 16, divisor: 2, quotient: 8, options: [7, 8, 9] },
      { id: 9, dividend: 18, divisor: 2, quotient: 9, options: [8, 9, 10] },
      { id: 10, dividend: 20, divisor: 2, quotient: 10, options: [9, 10, 8] },
    ],
  },
  {
    id: 2,
    title: 'Level 2',
    name: 'Bagi 3 & 4',
    description: 'Pembagian ceria angka 3 & 4 (Hasil 1 - 10)',
    color: '#0ea5e9', // Sky blue
    badgeBg: 'bg-sky-500',
    gradient: 'from-sky-400 to-blue-600',
    borderColor: '#0369a1',
    shadowColor: '#0c4a6e',
    questions: [
      { id: 1, dividend: 9, divisor: 3, quotient: 3, options: [2, 3, 4] },
      { id: 2, dividend: 12, divisor: 3, quotient: 4, options: [3, 4, 5] },
      { id: 3, dividend: 15, divisor: 3, quotient: 5, options: [4, 5, 6] },
      { id: 4, dividend: 16, divisor: 4, quotient: 4, options: [3, 4, 5] },
      { id: 5, dividend: 20, divisor: 4, quotient: 5, options: [4, 5, 6] },
      { id: 6, dividend: 18, divisor: 3, quotient: 6, options: [5, 6, 7] },
      { id: 7, dividend: 24, divisor: 4, quotient: 6, options: [6, 7, 8] },
      { id: 8, dividend: 21, divisor: 3, quotient: 7, options: [6, 7, 8] },
      { id: 9, dividend: 28, divisor: 4, quotient: 7, options: [7, 8, 9] },
      { id: 10, dividend: 36, divisor: 4, quotient: 9, options: [8, 9, 10] },
    ],
  },
  {
    id: 3,
    title: 'Level 3',
    name: 'Bagi 5 & 10',
    description: 'Pembagian seru angka 5 & 10 (Hasil 1 - 10)',
    color: '#f97316', // Orange
    badgeBg: 'bg-orange-500',
    gradient: 'from-amber-400 to-orange-600',
    borderColor: '#c2410c',
    shadowColor: '#7c2d12',
    questions: [
      { id: 1, dividend: 15, divisor: 5, quotient: 3, options: [2, 3, 4] },
      { id: 2, dividend: 20, divisor: 5, quotient: 4, options: [3, 4, 5] },
      { id: 3, dividend: 25, divisor: 5, quotient: 5, options: [4, 5, 6] },
      { id: 4, dividend: 30, divisor: 5, quotient: 6, options: [5, 6, 7] },
      { id: 5, dividend: 30, divisor: 10, quotient: 3, options: [2, 3, 4] },
      { id: 6, dividend: 35, divisor: 5, quotient: 7, options: [6, 7, 8] },
      { id: 7, dividend: 40, divisor: 5, quotient: 8, options: [7, 8, 9] },
      { id: 8, dividend: 50, divisor: 10, quotient: 5, options: [4, 5, 6] },
      { id: 9, dividend: 45, divisor: 5, quotient: 9, options: [8, 9, 10] },
      { id: 10, dividend: 50, divisor: 5, quotient: 10, options: [9, 10, 8] },
    ],
  },
  {
    id: 4,
    title: 'Level 4',
    name: 'Bagi 6, 7 & 8',
    description: 'Petualangan rimba angka 6, 7 & 8',
    color: '#a855f7', // Purple
    badgeBg: 'bg-purple-500',
    gradient: 'from-purple-400 to-violet-600',
    borderColor: '#7e22ce',
    shadowColor: '#581c87',
    questions: [
      { id: 1, dividend: 24, divisor: 6, quotient: 4, options: [3, 4, 5] },
      { id: 2, dividend: 30, divisor: 6, quotient: 5, options: [4, 5, 6] },
      { id: 3, dividend: 28, divisor: 7, quotient: 4, options: [3, 4, 5] },
      { id: 4, dividend: 35, divisor: 7, quotient: 5, options: [4, 5, 6] },
      { id: 5, dividend: 32, divisor: 8, quotient: 4, options: [3, 4, 5] },
      { id: 6, dividend: 42, divisor: 6, quotient: 7, options: [6, 7, 8] },
      { id: 7, dividend: 48, divisor: 6, quotient: 8, options: [7, 8, 9] },
      { id: 8, dividend: 49, divisor: 7, quotient: 7, options: [6, 7, 8] },
      { id: 9, dividend: 56, divisor: 8, quotient: 7, options: [6, 7, 8] },
      { id: 10, dividend: 64, divisor: 8, quotient: 8, options: [7, 8, 9] },
    ],
  },
  {
    id: 5,
    title: 'Level 5',
    name: 'Tantangan Juara',
    description: 'Tantangan pembagian angka hingga 100!',
    color: '#ef4444', // Red/Crimson
    badgeBg: 'bg-red-500',
    gradient: 'from-rose-400 to-red-600',
    borderColor: '#b91c1c',
    shadowColor: '#7f1d1d',
    questions: [
      { id: 1, dividend: 45, divisor: 9, quotient: 5, options: [4, 5, 6] },
      { id: 2, dividend: 54, divisor: 9, quotient: 6, options: [5, 6, 7] },
      { id: 3, dividend: 63, divisor: 9, quotient: 7, options: [6, 7, 8] },
      { id: 4, dividend: 72, divisor: 8, quotient: 9, options: [8, 9, 10] },
      { id: 5, dividend: 70, divisor: 10, quotient: 7, options: [6, 7, 8] },
      { id: 6, dividend: 81, divisor: 9, quotient: 9, options: [8, 9, 7] },
      { id: 7, dividend: 80, divisor: 10, quotient: 8, options: [7, 8, 9] },
      { id: 8, dividend: 72, divisor: 9, quotient: 8, options: [7, 8, 9] },
      { id: 9, dividend: 90, divisor: 10, quotient: 9, options: [8, 9, 10] },
      { id: 10, dividend: 100, divisor: 10, quotient: 10, options: [9, 10, 8] },
    ],
  },
];
