import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'samundar-data');

function read(name) {
  const p = join(DATA, name);
  if (!existsSync(p)) { console.error(`Missing: ${p}`); return []; }
  return JSON.parse(readFileSync(p, 'utf-8'));
}

// --- Load skeleton ---
const nodes = read('nodes.json');
const dsaPillar = nodes.find(n => n.id === 'pillar-dsa');
if (!dsaPillar) { console.error('pillar-dsa not found'); process.exit(1); }

const dsaDomains = nodes.filter(n => n.type === 'DOMAIN' && n.parentId === 'pillar-dsa').sort((a,b) => a.order - b.order);
const dsaModules = nodes.filter(n => n.type === 'MODULE' && dsaDomains.some(d => d.id === n.parentId));

// --- Helpers ---
const R = (arr) => arr[Math.random() * arr.length | 0];
const diffWeight = { BEGINNER: 1, EASY: 2, MEDIUM: 4, HARD: 2, EXPERT: 1 };

function mkSig(id, name) {
  return {
    howToIdentify: `Look for ${name.toLowerCase()} patterns in the problem statement.`,
    commonKeywords: [name, id.replace(/-/g,' '), 'algorithm', 'technique'],
    inputClues: ['array', 'string', 'input constraints'],
    constraintClues: ['size', 'range', 'time complexity hints'],
    optimizationSignals: ['brute force is too slow', 'need O(n) or O(n log n)'],
    interviewTriggers: ['asked in coding interviews', 'frequently tested'],
    whenNotToUse: 'When a simpler approach exists or problem constraints are very small.',
    commonConfusions: ['edge cases with empty input', 'off-by-one errors'],
  };
}
function mkMistakes() {
  return {
    implementationMistakes: ['off-by-one errors', 'not handling edge cases'],
    patternRecognitionMistakes: ['forcing wrong pattern', 'overcomplicating'],
    complexityMistakes: ['ignoring space complexity', 'unnecessary copies'],
    edgeCaseMistakes: ['empty input', 'single element', 'duplicates'],
    interviewMistakes: ['not explaining approach first', 'silent coding'],
  };
}
function mkCompany(dflt = 'LOW') {
  return { google: dflt, meta: dflt, amazon: dflt, uber: dflt, databricks: dflt, deShaw: dflt, microsoft: dflt, apple: dflt, bloomberg: dflt, netflix: dflt };
}
function mkHeatmap(total, completed = 0) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return {
    totalProblems: total, completedProblems: completed, completionPercentage: Math.round(pct),
    lastActivityDate: null, currentStreak: 0, longestStreak: 0,
    heatScore: 0, masteryLevel: 0,
  };
}
function mkActivity() {
  return {
    completed: false, attemptCount: 0, solveCount: 0,
    firstSolvedDate: null, lastSolvedDate: null, revisionCount: 0, activityLog: [],
  };
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// --- Pattern & Problem definitions ---
// Key: topic module id
// Value: { patterns: [{ name, difficulty, importance, problems: [{ name, url, difficulty, companyFreq }] }] }
const content = {
  'mod-array-manipulation': {
    patterns: [
      {
        name: 'Two Pointers', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Two Sum', 'https://leetcode.com/problems/two-sum', 'EASY', 'VERY_HIGH'],
          ['Container With Most Water', 'https://leetcode.com/problems/container-with-most-water', 'MEDIUM', 'HIGH'],
          ['3Sum', 'https://leetcode.com/problems/3sum', 'MEDIUM', 'VERY_HIGH'],
          ['Remove Duplicates from Sorted Array', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array', 'EASY', 'MEDIUM'],
          ['Move Zeroes', 'https://leetcode.com/problems/move-zeroes', 'EASY', 'HIGH'],
        ],
      },
      {
        name: 'Sliding Window', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Best Time to Buy and Sell Stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock', 'EASY', 'VERY_HIGH'],
          ['Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters', 'MEDIUM', 'VERY_HIGH'],
          ['Minimum Window Substring', 'https://leetcode.com/problems/minimum-window-substring', 'HARD', 'HIGH'],
          ['Sliding Window Maximum', 'https://leetcode.com/problems/sliding-window-maximum', 'HARD', 'HIGH'],
          ['Longest Repeating Character Replacement', 'https://leetcode.com/problems/longest-repeating-character-replacement', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'Prefix Sum', difficulty: 'EASY', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Range Sum Query - Immutable', 'https://leetcode.com/problems/range-sum-query-immutable', 'EASY', 'MEDIUM'],
          ['Subarray Sum Equals K', 'https://leetcode.com/problems/subarray-sum-equals-k', 'MEDIUM', 'VERY_HIGH'],
          ['Product of Array Except Self', 'https://leetcode.com/problems/product-of-array-except-self', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
    ],
  },
  'mod-string-algorithms': {
    patterns: [
      {
        name: 'String Manipulation', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Valid Anagram', 'https://leetcode.com/problems/valid-anagram', 'EASY', 'VERY_HIGH'],
          ['Group Anagrams', 'https://leetcode.com/problems/group-anagrams', 'MEDIUM', 'VERY_HIGH'],
          ['Longest Palindromic Substring', 'https://leetcode.com/problems/longest-palindromic-substring', 'MEDIUM', 'HIGH'],
          ['Valid Palindrome', 'https://leetcode.com/problems/valid-palindrome', 'EASY', 'HIGH'],
        ],
      },
      {
        name: 'Pattern Matching', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Implement strStr()', 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string', 'EASY', 'MEDIUM'],
          ['Repeated DNA Sequences', 'https://leetcode.com/problems/repeated-dna-sequences', 'MEDIUM', 'MEDIUM'],
          ['Longest Common Prefix', 'https://leetcode.com/problems/longest-common-prefix', 'EASY', 'HIGH'],
        ],
      },
    ],
  },
  'mod-linked-lists': {
    patterns: [
      {
        name: 'Fast & Slow Pointers', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Linked List Cycle', 'https://leetcode.com/problems/linked-list-cycle', 'EASY', 'VERY_HIGH'],
          ['Middle of the Linked List', 'https://leetcode.com/problems/middle-of-the-linked-list', 'EASY', 'HIGH'],
          ['Palindrome Linked List', 'https://leetcode.com/problems/palindrome-linked-list', 'EASY', 'HIGH'],
          ['Reorder List', 'https://leetcode.com/problems/reorder-list', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'List Manipulation', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Reverse Linked List', 'https://leetcode.com/problems/reverse-linked-list', 'EASY', 'VERY_HIGH'],
          ['Merge Two Sorted Lists', 'https://leetcode.com/problems/merge-two-sorted-lists', 'EASY', 'VERY_HIGH'],
          ['Remove Nth Node From End of List', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list', 'MEDIUM', 'HIGH'],
          ['Copy List with Random Pointer', 'https://leetcode.com/problems/copy-list-with-random-pointer', 'MEDIUM', 'MEDIUM'],
          ['Add Two Numbers', 'https://leetcode.com/problems/add-two-numbers', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
    ],
  },
  'mod-binary-trees': {
    patterns: [
      {
        name: 'Tree Traversal', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Binary Tree Inorder Traversal', 'https://leetcode.com/problems/binary-tree-inorder-traversal', 'EASY', 'VERY_HIGH'],
          ['Binary Tree Level Order Traversal', 'https://leetcode.com/problems/binary-tree-level-order-traversal', 'MEDIUM', 'VERY_HIGH'],
          ['Maximum Depth of Binary Tree', 'https://leetcode.com/problems/maximum-depth-of-binary-tree', 'EASY', 'VERY_HIGH'],
          ['Symmetric Tree', 'https://leetcode.com/problems/symmetric-tree', 'EASY', 'HIGH'],
          ['Binary Tree Right Side View', 'https://leetcode.com/problems/binary-tree-right-side-view', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'Tree Construction', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Construct Binary Tree from Preorder and Inorder Traversal', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal', 'MEDIUM', 'HIGH'],
          ['Serialize and Deserialize Binary Tree', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree', 'HARD', 'HIGH'],
          ['Flatten Binary Tree to Linked List', 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'Tree Path Problems', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Path Sum', 'https://leetcode.com/problems/path-sum', 'EASY', 'HIGH'],
          ['Binary Tree Maximum Path Sum', 'https://leetcode.com/problems/binary-tree-maximum-path-sum', 'HARD', 'VERY_HIGH'],
          ['Diameter of Binary Tree', 'https://leetcode.com/problems/diameter-of-binary-tree', 'EASY', 'HIGH'],
          ['Lowest Common Ancestor of a Binary Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
    ],
  },
  'mod-bst': {
    patterns: [
      {
        name: 'BST Operations', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Validate Binary Search Tree', 'https://leetcode.com/problems/validate-binary-search-tree', 'MEDIUM', 'VERY_HIGH'],
          ['Kth Smallest Element in a BST', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst', 'MEDIUM', 'HIGH'],
          ['Lowest Common Ancestor of a BST', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree', 'MEDIUM', 'HIGH'],
          ['Convert Sorted Array to Binary Search Tree', 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree', 'EASY', 'MEDIUM'],
        ],
      },
      {
        name: 'Balanced BST', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Balance a Binary Search Tree', 'https://leetcode.com/problems/balance-a-binary-search-tree', 'MEDIUM', 'MEDIUM'],
          ['Convert BST to Greater Tree', 'https://leetcode.com/problems/convert-bst-to-greater-tree', 'MEDIUM', 'LOW'],
        ],
      },
    ],
  },
  'mod-graph-traversal': {
    patterns: [
      {
        name: 'BFS', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Number of Islands', 'https://leetcode.com/problems/number-of-islands', 'MEDIUM', 'VERY_HIGH'],
          ['Rotting Oranges', 'https://leetcode.com/problems/rotting-oranges', 'MEDIUM', 'HIGH'],
          ['Word Ladder', 'https://leetcode.com/problems/word-ladder', 'HARD', 'VERY_HIGH'],
        ],
      },
      {
        name: 'DFS', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Flood Fill', 'https://leetcode.com/problems/flood-fill', 'EASY', 'HIGH'],
          ['Clone Graph', 'https://leetcode.com/problems/clone-graph', 'MEDIUM', 'HIGH'],
          ['Course Schedule', 'https://leetcode.com/problems/course-schedule', 'MEDIUM', 'VERY_HIGH'],
          ['Course Schedule II', 'https://leetcode.com/problems/course-schedule-ii', 'MEDIUM', 'HIGH'],
        ],
      },
      {
        name: 'Topological Sort', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Alien Dictionary', 'https://leetcode.com/problems/alien-dictionary', 'HARD', 'HIGH'],
          ['Minimum Height Trees', 'https://leetcode.com/problems/minimum-height-trees', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-shortest-paths': {
    patterns: [
      {
        name: 'Dijkstra & Bellman-Ford', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Network Delay Time', 'https://leetcode.com/problems/network-delay-time', 'MEDIUM', 'HIGH'],
          ['Cheapest Flights Within K Stops', 'https://leetcode.com/problems/cheapest-flights-within-k-stops', 'MEDIUM', 'HIGH'],
          ['Path with Maximum Probability', 'https://leetcode.com/problems/path-with-maximum-probability', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'Floyd-Warshall', difficulty: 'HARD', importance: 'MEDIUM', freq: 'LOW',
        problems: [
          ['Find the City With the Smallest Number of Neighbors', 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-mst-union-find': {
    patterns: [
      {
        name: 'Union-Find', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Number of Connected Components in an Undirected Graph', 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph', 'MEDIUM', 'HIGH'],
          ['Graph Valid Tree', 'https://leetcode.com/problems/graph-valid-tree', 'MEDIUM', 'HIGH'],
          ['Accounts Merge', 'https://leetcode.com/problems/accounts-merge', 'MEDIUM', 'HIGH'],
          ['Longest Consecutive Sequence', 'https://leetcode.com/problems/longest-consecutive-sequence', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
      {
        name: 'Minimum Spanning Tree', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'LOW',
        problems: [
          ['Min Cost to Connect All Points', 'https://leetcode.com/problems/min-cost-to-connect-all-points', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-dp-fundamentals': {
    patterns: [
      {
        name: 'Memoization', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Fibonacci Number', 'https://leetcode.com/problems/fibonacci-number', 'EASY', 'HIGH'],
          ['Climbing Stairs', 'https://leetcode.com/problems/climbing-stairs', 'EASY', 'VERY_HIGH'],
          ['Coin Change', 'https://leetcode.com/problems/coin-change', 'MEDIUM', 'VERY_HIGH'],
          ['Word Break', 'https://leetcode.com/problems/word-break', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
      {
        name: 'Tabulation', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'MEDIUM',
        problems: [
          ['House Robber', 'https://leetcode.com/problems/house-robber', 'MEDIUM', 'VERY_HIGH'],
          ['Coin Change II', 'https://leetcode.com/problems/coin-change-ii', 'MEDIUM', 'HIGH'],
          ['Target Sum', 'https://leetcode.com/problems/target-sum', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-dp-classic': {
    patterns: [
      {
        name: 'Knapsack & Partition', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Partition Equal Subset Sum', 'https://leetcode.com/problems/partition-equal-subset-sum', 'MEDIUM', 'VERY_HIGH'],
          ['Last Stone Weight II', 'https://leetcode.com/problems/last-stone-weight-ii', 'MEDIUM', 'MEDIUM'],
          ['Ones and Zeroes', 'https://leetcode.com/problems/ones-and-zeroes', 'MEDIUM', 'MEDIUM'],
        ],
      },
      {
        name: 'LCS & LIS', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'VERY_HIGH',
        problems: [
          ['Longest Increasing Subsequence', 'https://leetcode.com/problems/longest-increasing-subsequence', 'MEDIUM', 'VERY_HIGH'],
          ['Longest Common Subsequence', 'https://leetcode.com/problems/longest-common-subsequence', 'MEDIUM', 'VERY_HIGH'],
          ['Edit Distance', 'https://leetcode.com/problems/edit-distance', 'MEDIUM', 'VERY_HIGH'],
          ['Distinct Subsequences', 'https://leetcode.com/problems/distinct-subsequences', 'HARD', 'HIGH'],
        ],
      },
      {
        name: 'Matrix DP', difficulty: 'MEDIUM', importance: 'MEDIUM', freq: 'MEDIUM',
        problems: [
          ['Unique Paths', 'https://leetcode.com/problems/unique-paths', 'MEDIUM', 'VERY_HIGH'],
          ['Minimum Path Sum', 'https://leetcode.com/problems/minimum-path-sum', 'MEDIUM', 'HIGH'],
          ['Maximal Square', 'https://leetcode.com/problems/maximal-square', 'MEDIUM', 'HIGH'],
        ],
      },
    ],
  },
  'mod-dp-on-trees': {
    patterns: [
      {
        name: 'Tree DP', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'MEDIUM',
        problems: [
          ['House Robber III', 'https://leetcode.com/problems/house-robber-iii', 'MEDIUM', 'HIGH'],
          ['Binary Tree Cameras', 'https://leetcode.com/problems/binary-tree-cameras', 'HARD', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-recursion-fundamentals': {
    patterns: [
      {
        name: 'Recursive Thinking', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Pow(x, n)', 'https://leetcode.com/problems/powx-n', 'MEDIUM', 'VERY_HIGH'],
          ['Generate Parentheses', 'https://leetcode.com/problems/generate-parentheses', 'MEDIUM', 'VERY_HIGH'],
          ['K-th Symbol in Grammar', 'https://leetcode.com/problems/k-th-symbol-in-grammar', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-backtracking': {
    patterns: [
      {
        name: 'Subsets & Permutations', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'VERY_HIGH',
        problems: [
          ['Subsets', 'https://leetcode.com/problems/subsets', 'MEDIUM', 'VERY_HIGH'],
          ['Permutations', 'https://leetcode.com/problems/permutations', 'MEDIUM', 'VERY_HIGH'],
          ['Combination Sum', 'https://leetcode.com/problems/combination-sum', 'MEDIUM', 'VERY_HIGH'],
          ['Letter Combinations of a Phone Number', 'https://leetcode.com/problems/letter-combinations-of-a-phone-number', 'MEDIUM', 'VERY_HIGH'],
          ['Word Search', 'https://leetcode.com/problems/word-search', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
      {
        name: 'Constraint Satisfaction', difficulty: 'HARD', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['N-Queens', 'https://leetcode.com/problems/n-queens', 'HARD', 'VERY_HIGH'],
          ['Sudoku Solver', 'https://leetcode.com/problems/sudoku-solver', 'HARD', 'HIGH'],
          ['Partition to K Equal Sum Subsets', 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets', 'MEDIUM', 'MEDIUM'],
        ],
      },
    ],
  },
  'mod-sorting': {
    patterns: [
      {
        name: 'Comparison Sort', difficulty: 'EASY', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Sort an Array', 'https://leetcode.com/problems/sort-an-array', 'MEDIUM', 'HIGH'],
          ['Merge Intervals', 'https://leetcode.com/problems/merge-intervals', 'MEDIUM', 'VERY_HIGH'],
          ['Sort Colors', 'https://leetcode.com/problems/sort-colors', 'MEDIUM', 'HIGH'],
          ['Kth Largest Element in an Array', 'https://leetcode.com/problems/kth-largest-element-in-an-array', 'MEDIUM', 'VERY_HIGH'],
          ['Meeting Rooms II', 'https://leetcode.com/problems/meeting-rooms-ii', 'MEDIUM', 'VERY_HIGH'],
        ],
      },
      {
        name: 'Linear-Time Sort', difficulty: 'MEDIUM', importance: 'LOW', freq: 'LOW',
        problems: [
          ['Maximum Gap', 'https://leetcode.com/problems/maximum-gap', 'HARD', 'LOW'],
        ],
      },
    ],
  },
  'mod-binary-search': {
    patterns: [
      {
        name: 'Classic Binary Search', difficulty: 'EASY', importance: 'HIGH', freq: 'VERY_HIGH',
        problems: [
          ['Binary Search', 'https://leetcode.com/problems/binary-search', 'EASY', 'VERY_HIGH'],
          ['Search in Rotated Sorted Array', 'https://leetcode.com/problems/search-in-rotated-sorted-array', 'MEDIUM', 'VERY_HIGH'],
          ['Find First and Last Position of Element in Sorted Array', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array', 'MEDIUM', 'VERY_HIGH'],
          ['Search a 2D Matrix', 'https://leetcode.com/problems/search-a-2d-matrix', 'MEDIUM', 'HIGH'],
        ],
      },
      {
        name: 'Search Space Optimization', difficulty: 'MEDIUM', importance: 'HIGH', freq: 'HIGH',
        problems: [
          ['Find Minimum in Rotated Sorted Array', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array', 'MEDIUM', 'VERY_HIGH'],
          ['Koko Eating Bananas', 'https://leetcode.com/problems/koko-eating-bananas', 'MEDIUM', 'HIGH'],
          ['Split Array Largest Sum', 'https://leetcode.com/problems/split-array-largest-sum', 'HARD', 'HIGH'],
          ['Median of Two Sorted Arrays', 'https://leetcode.com/problems/median-of-two-sorted-arrays', 'HARD', 'VERY_HIGH'],
        ],
      },
    ],
  },
};

// --- Build tracker ---
const compMap = (freq) => {
  const base = mkCompany('LOW');
  if (freq === 'VERY_HIGH') return { ...base, google: 'CRITICAL', meta: 'HIGH', amazon: 'CRITICAL', microsoft: 'HIGH', bloomberg: 'HIGH', deShaw: 'MEDIUM' };
  if (freq === 'HIGH') return { ...base, google: 'HIGH', meta: 'MEDIUM', amazon: 'HIGH', microsoft: 'MEDIUM', bloomberg: 'MEDIUM' };
  if (freq === 'MEDIUM') return { ...base, google: 'MEDIUM', amazon: 'MEDIUM', microsoft: 'LOW' };
  return base;
};

function buildProblems(patternName, problems) {
  return problems.map(([name, url, difficulty, freq]) => ({
    id: `prob-${slug(name)}`,
    name, url, source: 'LEETCODE', difficulty, completed: false,
    pattern: patternName,
    whyItBelongs: `Classic ${patternName} problem on LeetCode.`,
    interviewFrequency: freq, ...compMap(freq),
    notes: '', attempts: 0, lastSolved: null, revisionCount: 0,
    activity: mkActivity(),
  }));
}

function buildPattern(patDef, modId, domainId) {
  const pid = `${slug(patDef.name)}`;
  const problems = buildProblems(patDef.name, patDef.problems);
  const easy = problems.filter(p => p.difficulty === 'EASY').length;
  const medium = problems.filter(p => p.difficulty === 'MEDIUM').length;
  const hard = problems.filter(p => p.difficulty === 'HARD').length;
  const total = problems.length;
  return {
    id: pid, name: patDef.name, description: `${patDef.name} — a key DSA pattern under this topic.`,
    difficulty: patDef.difficulty, importance: patDef.importance,
    estimatedHours: total * 1.5, masteryLevel: 0,
    interviewFrequency: patDef.freq, companyRelevance: compMap(patDef.freq),
    patternRecognitionSignals: mkSig(pid, patDef.name),
    commonMistakes: mkMistakes(),
    revisionSchedule: [
      { day: 1, recallAccuracy: null, confidence: null, timeToSolveMinutes: null, mistakes: [], notes: '' },
      { day: 7, recallAccuracy: null, confidence: null, timeToSolveMinutes: null, mistakes: [], notes: '' },
      { day: 30, recallAccuracy: null, confidence: null, timeToSolveMinutes: null, mistakes: [], notes: '' },
    ],
    problems, heatmap: mkHeatmap(total),
    difficultyBreakdown: { easy, medium, hard },
  };
}

function buildTopic(mod) {
  const domain = dsaDomains.find(d => d.id === mod.parentId);
  const domainId = domain ? domain.id : 'unknown';
  const defs = content[mod.id] || { patterns: [] };
  const patterns = defs.patterns.map(p => buildPattern(p, mod.id, domainId));
  const totalP = patterns.length;
  return {
    id: mod.id.replace('mod-', ''),
    name: mod.name, description: mod.description,
    difficulty: 'MEDIUM', importance: 'HIGH',
    estimatedStudyHours: totalP * 3, estimatedPracticeHours: totalP * 5,
    masteryLevel: 0, totalPatterns: totalP,
    companyRelevance: mkCompany('MEDIUM'),
    patterns,
    heatmap: {
      totalPatterns: totalP, completedPatterns: 0, completionPercentage: 0,
      heatScore: 0, masteryLevel: 0, lastActivityDate: null,
    },
  };
}

function buildDomain(domainNode) {
  const modules = dsaModules.filter(m => m.parentId === domainNode.id);
  const topics = modules.map(m => buildTopic(m));
  const tCount = topics.length;
  return {
    id: domainNode.id.replace('domain-', ''),
    name: domainNode.name, description: domainNode.description,
    difficulty: 'MEDIUM', importance: 'HIGH',
    estimatedHours: topics.reduce((a, t) => a + t.estimatedStudyHours + t.estimatedPracticeHours, 0),
    totalTopics: tCount, topics,
    heatmap: {
      totalTopics: tCount, completedTopics: 0, completionPercentage: 0,
      heatScore: 0, masteryLevel: 0,
    },
  };
}

const domains = dsaDomains.map(d => buildDomain(d));
const totalProblems = domains.reduce((a, d) => a + d.topics.reduce((b, t) => b + t.patterns.reduce((c, p) => c + p.problems.length, 0), 0), 0);

const tracker = {
  pillar: {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Foundational problem-solving skills using data structures and algorithmic techniques.',
    domains,
  },
  dailyActivities: [],
  dashboard: {
    totalProblemsSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
    patternsMastered: 0, topicsMastered: 0, domainsMastered: 0,
    currentStreak: 0, longestStreak: 0, averageSolveTime: 0, averageRevisionTime: 0,
    interviewReadinessPercent: 0, overallDSACompletionPercent: 0,
    overallMasteryScore: 0, heatScore: 0, lastActiveDate: null,
  },
};

const outPath = join(DATA, 'dsa-tracker.json');
writeFileSync(outPath, JSON.stringify(tracker, null, 2), 'utf-8');
console.log(`Generated ${outPath}`);
console.log(`Domains: ${domains.length}`);
console.log(`Topics:  ${domains.reduce((a, d) => a + d.topics.length, 0)}`);
console.log(`Patterns:${domains.reduce((a, d) => a + d.topics.reduce((b, t) => b + t.patterns.length, 0), 0)}`);
console.log(`Problems:${totalProblems}`);
