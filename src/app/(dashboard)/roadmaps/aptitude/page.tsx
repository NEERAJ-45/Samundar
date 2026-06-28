'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Aptitude roadmap topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const aptitudeQuestions: QuestionItem[] = [
  { id: 501, title: 'Number Systems: Integers, Decimals, Fractions, and Place Values', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/number-system-in-quantitative-aptitude/' },
  { id: 502, title: 'Find HCF and LCM of Integers and Fractions', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/hcf-and-lcm/' },
  { id: 503, title: 'Simplification, Approximation, and Order of Operations (BODMAS)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/simplification-in-quantitative-aptitude/' },
  { id: 504, title: 'Square Roots, Cube Roots, and Surds & Indices properties', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/square-root-and-cube-root/' },
  { id: 505, title: 'Averages: Arithmetic Mean, Weighted Average, and Consecutive Numbers', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/average-quantitative-aptitude/' },
  { id: 506, title: 'Problems on Numbers: Formulating algebraic equations from text descriptions', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/problems-on-numbers/' },
  { id: 507, title: 'Problems on Ages: Ratio and age relations over time', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/problems-on-ages/' },
  { id: 508, title: 'Percentages: Basic fractional conversions and successive percentage changes', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/percentage-quantitative-aptitude/' },
  { id: 509, title: 'Profit and Loss: Cost Price, Selling Price, and profit/loss margins', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/profit-and-loss/' },
  { id: 510, title: 'Marked Price, Discount rate, and successive discount calculations', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/discounts-quantitative-aptitude/' },
  { id: 511, title: 'Ratio and Proportion: Mean, third, and fourth proportional rules', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/ratio-and-proportion/' },
  { id: 512, title: 'Partnership: Ratio of investments, duration, and profit sharing allocation', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/partnerships-in-quantitative-aptitude/' },
  { id: 513, title: 'Chain Rule: Direct and indirect proportions, work efficiency parameters', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/chain-rule/' },
  { id: 514, title: 'Time and Work: Work rates, individual & joint tasks, and wages distribution', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/time-and-work/' },
  { id: 515, title: 'Pipes and Cisterns: Inlet and outlet flow rates and leakage issues', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/pipes-and-cisterns/' },
  { id: 516, title: 'Time, Speed and Distance: Standard conversion rules and average speed formula', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/time-speed-and-distance/' },
  { id: 517, title: 'Problems on Trains: Relative speed, crossing platforms, and poles', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/problems-on-trains/' },
  { id: 518, title: 'Boats and Streams: Upstream speed, downstream speed, and still water speed', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/boats-and-streams/' },
  { id: 519, title: 'Alligation and Mixtures: Weighted average rule for mixtures of two commodities', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/mixture-and-alligation/' },
  { id: 520, title: 'Simple Interest: Formula, rate, time, and principal calculations', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/simple-interest/' },
  { id: 521, title: 'Compound Interest: Annual, half-yearly, and quarterly compounding formulas', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/compound-interest/' },
  { id: 522, title: 'Clocks: Angle between hands, clock gains and losses, reflection times', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/clocks-in-quantitative-aptitude/' },
  { id: 523, title: 'Calendar: Odd days concept, finding day of the week, leap year rules', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/calendar-in-quantitative-aptitude/' },
  { id: 524, title: 'Permutations and Combinations: Fundamental principles of counting, arrangements', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/permutations-and-combinations/' },
  { id: 525, title: 'Probability Basics: Coins, single/double dice throws, playing cards distributions', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/probability/' },
  { id: 526, title: 'Logarithms: Laws of logarithms, base conversions, and applications', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/logarithms/' },
  { id: 527, title: 'Heights and Distances: Angles of elevation and depression, trigonometric rules', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/heights-and-distances/' },
  { id: 528, title: 'Mensuration 2D: Areas and perimeters of triangles, rectangles, squares, circles', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/area-and-perimeter-of-2d-shapes/' },
  { id: 529, title: 'Mensuration 3D: Volume and surface area of cubes, cylinders, cones, spheres', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/volume-and-surface-area-of-3d-shapes/' },
  { id: 530, title: 'Data Interpretation: Reading and analyzing Tabular data charts', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/data-interpretation/' },
  { id: 531, title: 'Data Interpretation: Interpreting Bar Charts and Comparative Bar Graphs', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/bar-graph/' },
  { id: 532, title: 'Data Interpretation: Reading Pie Charts and sector degree conversions', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/pie-chart/' },
  { id: 533, title: 'Data Interpretation: Line Graphs analysis and trend tracking', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/line-graph/' },
  { id: 534, title: 'Logical Reasoning: Number Series completion and missing term puzzles', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/number-series/' },
  { id: 535, title: 'Logical Reasoning: Alphabet Series and alphanumeric series tracking', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/letter-series/' },
  { id: 536, title: 'Coding-Decoding: Letter shifting, direct substitution, and pattern identification', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/coding-decoding/' },
  { id: 537, title: 'Blood Relations: Drawing family trees, deciphering coded relations', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/blood-relation/' },
  { id: 538, title: 'Seating Arrangement: Linear seating facing North/South, circular seating', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/seating-arrangement-logical-reasoning/' },
  { id: 539, title: 'Direction Sense: Compass directions, angle rotations, and Pythagoras distances', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/direction-sense/' },
  { id: 540, title: 'Syllogism: Venn diagram rules, statements, and logical conclusions', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/syllogism-logical-reasoning/' },
  { id: 541, title: 'Critical Reasoning: Statement and Assumptions / Implicit statements', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/statement-and-assumptions/' },
  { id: 542, title: 'Critical Reasoning: Statement and Arguments / Strong vs Weak arguments', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/statement-and-arguments/' },
  { id: 543, title: 'Analytical Reasoning: Grid-based scheduling and distribution puzzles', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/analytical-puzzles/' },
  { id: 544, title: 'Input-Output Tracing: Step-by-step rearrangement of words and numbers', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/input-output-reasoning/' },
  { id: 545, title: 'Data Sufficiency: Evaluating if statements are enough to answer the question', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/data-sufficiency/' },
  { id: 546, title: 'Arithmetic Reasoning: Word problems testing arithmetic operations', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/arithmetic-reasoning/' },
  { id: 547, title: 'Analogy: Establishing word, number, and pattern relationships', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/analogies/' },
  { id: 548, title: 'Classification: Identifying the odd one out in lists and figures', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/classification/' },
  { id: 549, title: 'Non-Verbal Reasoning: Mirror images, water images, and paper folding', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/mirror-and-water-images/' },
  { id: 550, title: 'Non-Verbal Reasoning: Pattern completion and embedded figures identification', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/embedded-images-non-verbal-reasoning/' }
];

export default function AptitudeQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps Hub
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Aptitude & Logical Reasoning</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Quantitative aptitude, logical reasoning, critical thinking, data interpretation, and cognitive evaluations.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={aptitudeQuestions}
          storagePrefix="aptitude"
          searchPlaceholder="Search aptitude topics..."
        />
      </div>
    </div>
  );
}
