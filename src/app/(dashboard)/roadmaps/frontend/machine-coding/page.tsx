'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading machine coding questions...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  link: string;
}

const GREAT_FRONTEND_BASE = 'https://www.greatfrontend.com/questions/practice';

const machineCodingQuestions: QuestionItem[] = [
  // Beginner (1-10) - EASY
  {
    id: 951,
    title: 'Accordion',
    description: 'Build a vertically stacked list of sections, each with a clickable title that toggles the visibility of its content.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/accordion`,
  },
  {
    id: 952,
    title: 'Contact Form',
    description: 'Build a form that collects user feedback and contact details, then submits them to a backend API.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/contact-form`,
  },
  {
    id: 953,
    title: 'Holy Grail',
    description: 'Build the classic holy grail layout consisting of a header, three columns (nav, main, aside), and a footer.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/holy-grail`,
  },
  {
    id: 954,
    title: 'Progress Bars',
    description: 'Build a list of progress bars that fill up gradually after being added to the page.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/progress-bars`,
  },
  {
    id: 955,
    title: 'Mortgage Calculator',
    description: 'Build a calculator that computes the monthly mortgage payment for a loan given principal, rate, and term.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/mortgage-calculator`,
  },
  {
    id: 956,
    title: 'Flight Booker',
    description: 'Build a flight booking component where users can select departure and return dates for a round trip.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/flight-booker`,
  },
  {
    id: 957,
    title: 'Generate Table',
    description: 'Build a component that generates an HTML table of numbers given the number of rows and columns.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/generate-table`,
  },
  {
    id: 958,
    title: 'Progress Bar',
    description: 'Build a single progress bar component that shows the percentage completion of an operation.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/progress-bar`,
  },
  {
    id: 959,
    title: 'Temperature Converter',
    description: 'Build a widget that converts temperature values between Celsius and Fahrenheit in real time.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/temperature-converter`,
  },
  {
    id: 960,
    title: 'Tweet',
    description: 'Build a component that resembles a Tweet from Twitter showing avatar, content, and engagement stats.',
    difficulty: 'EASY',
    link: `${GREAT_FRONTEND_BASE}/tweet`,
  },
  // Intermediate (11-41) - MEDIUM
  {
    id: 961,
    title: 'Tabs',
    description: 'Build a tabs component that displays one tab panel of content at a time when switching between tab elements.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/tabs`,
  },
  {
    id: 962,
    title: 'Data Table',
    description: 'Build a paginated data table that displays user information with pagination controls.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/data-table`,
  },
  {
    id: 963,
    title: 'Dice Roller',
    description: 'Build an app that simulates rolling 6-sided dice and displays the random results.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/dice-roller`,
  },
  {
    id: 964,
    title: 'File Explorer',
    description: 'Build a tree-like hierarchical file explorer to navigate files and directories.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/file-explorer`,
  },
  {
    id: 965,
    title: 'Like Button',
    description: 'Build a Like button that changes appearance between default, hovered, and liked states.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/like-button`,
  },
  {
    id: 966,
    title: 'Modal Dialog',
    description: 'Build a reusable modal dialog overlay component that can be opened and closed.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/modal-dialog`,
  },
  {
    id: 967,
    title: 'Star Rating',
    description: 'Build a star rating row where users click stars to select a rating value (1-5).',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/star-rating`,
  },
  {
    id: 968,
    title: 'Todo List',
    description: 'Build a todo list that lets users add new tasks and delete existing ones.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/todo-list`,
  },
  {
    id: 969,
    title: 'Traffic Light',
    description: 'Build a traffic light that cycles green → yellow → red at predetermined intervals indefinitely.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/traffic-light`,
  },
  {
    id: 970,
    title: 'Digital Clock',
    description: 'Build a 7-segment styled digital clock that displays the current time updating every second.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/digital-clock`,
  },
  {
    id: 971,
    title: 'Tic-tac-toe',
    description: 'Build the classic 3x3 tic-tac-toe game playable by two alternating players.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/tic-tac-toe`,
  },
  {
    id: 972,
    title: 'Image Carousel',
    description: 'Build an image carousel that displays a sequence of images with next/prev navigation.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/image-carousel`,
  },
  {
    id: 973,
    title: 'Job Board',
    description: 'Build a job board that fetches and displays the latest job postings from Hacker News.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/job-board`,
  },
  {
    id: 974,
    title: 'Stopwatch',
    description: 'Build a stopwatch widget that tracks elapsed time with start, stop, and reset controls.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/stopwatch`,
  },
  {
    id: 975,
    title: 'Transfer List',
    description: 'Build a component with two lists and buttons to transfer selected items between them.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/transfer-list`,
  },
  {
    id: 976,
    title: 'Accordion II',
    description: 'Build an accessible accordion with correct ARIA roles, states, and properties.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/accordion-ii`,
  },
  {
    id: 977,
    title: 'Accordion III',
    description: 'Build a fully accessible accordion with full keyboard navigation per ARIA specs.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/accordion-iii`,
  },
  {
    id: 978,
    title: 'Analog Clock',
    description: 'Build an analog clock with hour, minute, and second hands that move like a real clock.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/analog-clock`,
  },
  {
    id: 979,
    title: 'Data Table II',
    description: 'Build a data table with sortable columns for all user fields.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/data-table-ii`,
  },
  {
    id: 980,
    title: 'File Explorer II',
    description: 'Build a semi-accessible file explorer with correct ARIA roles, states, and properties.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/file-explorer-ii`,
  },
  {
    id: 981,
    title: 'File Explorer III',
    description: 'Build a file explorer using a flat DOM structure instead of nested elements.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/file-explorer-iii`,
  },
  {
    id: 982,
    title: 'Grid Lights',
    description: 'Build a grid of lights where cells light up on click and deactivate in reverse activation order.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/grid-lights`,
  },
  {
    id: 983,
    title: 'Modal Dialog II',
    description: 'Build a semi-accessible modal with proper ARIA roles, states, and properties.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/modal-dialog-ii`,
  },
  {
    id: 984,
    title: 'Modal Dialog III',
    description: 'Build a moderately-accessible modal that supports close on Esc, backdrop click, and close button.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/modal-dialog-iii`,
  },
  {
    id: 985,
    title: 'Progress Bars II',
    description: 'Build a list of progress bars that fill up gradually one at a time in sequence.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/progress-bars-ii`,
  },
  {
    id: 986,
    title: 'Tabs II',
    description: 'Build a semi-accessible tabs component with correct ARIA roles, states, and properties.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/tabs-ii`,
  },
  {
    id: 987,
    title: 'Tabs III',
    description: 'Build a fully accessible tabs component with full keyboard navigation per ARIA specs.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/tabs-iii`,
  },
  {
    id: 988,
    title: 'Progress Bars III',
    description: 'Build a list of progress bars that fill up concurrently but limited to 3 at a time.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/progress-bars-iii`,
  },
  {
    id: 989,
    title: 'Birth Year Histogram',
    description: 'Build a widget that fetches birth year data from an API and plots a histogram chart.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/birth-year-histogram`,
  },
  {
    id: 990,
    title: 'Connect Four',
    description: 'Build the classic two-player Connect Four game where players drop colored discs into a 7x6 grid.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/connect-four`,
  },
  {
    id: 991,
    title: 'Image Carousel II',
    description: 'Build an image carousel with smooth CSS transitions between slides for fluid navigation.',
    difficulty: 'MEDIUM',
    link: `${GREAT_FRONTEND_BASE}/image-carousel-ii`,
  },
  // Advanced (42-50) - HARD
  {
    id: 992,
    title: 'Nested Checkboxes',
    description: 'Build a nested checkbox tree with parent-child selection logic (checking a parent selects all children).',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/nested-checkboxes`,
  },
  {
    id: 993,
    title: 'Auth Code Input',
    description: 'Build a 6-digit authorization code input with auto-focus and auto-advance between input boxes.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/auth-code-input`,
  },
  {
    id: 994,
    title: 'Progress Bars IV',
    description: 'Build concurrent progress bars (limit 3) with pause and resume controls for each.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/progress-bars-iv`,
  },
  {
    id: 995,
    title: 'Data Table III',
    description: 'Build a generalized data table with combined pagination and sorting features.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/data-table-iii`,
  },
  {
    id: 996,
    title: 'Modal Dialog IV',
    description: 'Build a fully-accessible modal with full keyboard interaction support per ARIA specs.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/modal-dialog-iv`,
  },
  {
    id: 997,
    title: 'Selectable Cells',
    description: 'Build a grid interface where users can click and drag to select multiple adjacent cells.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/selectable-cells`,
  },
  {
    id: 998,
    title: 'Wordle',
    description: 'Build the Wordle word-guessing game with colored tile feedback for correct and misplaced letters.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/wordle`,
  },
  {
    id: 999,
    title: 'Tic-tac-toe II',
    description: 'Build an N x N tic-tac-toe game requiring M consecutive marks in a row to win.',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/tic-tac-toe-ii`,
  },
  {
    id: 1000,
    title: 'Image Carousel III',
    description: 'Build a smooth-transition image carousel with minimal DOM footprint (only 3 slides rendered at once).',
    difficulty: 'HARD',
    link: `${GREAT_FRONTEND_BASE}/image-carousel-iii`,
  },
];

export default function MachineCodingPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/frontend"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Frontend Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">React Machine Coding Interview Questions</h1>
            <p className="text-sm text-zinc-500 mt-1">
              50 practice questions from GreatFrontEnd — build components ranging from simple accordions to advanced Wordle games.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={machineCodingQuestions}
          storagePrefix="frontend-machine-coding"
          searchPlaceholder="Search machine coding questions..."
        />
      </div>
    </div>
  );
}
