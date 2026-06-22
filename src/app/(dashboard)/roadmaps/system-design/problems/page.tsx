'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading system design problems...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const problemsQuestions: QuestionItem[] = [
  { id: 501, title: 'Designing a URL Shortening Service (TinyURL)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/how-to-design-a-url-shortening-service-like-tinyurl-system-design/' },
  { id: 502, title: 'Designing Pastebin (Distributed text storage)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/design-a-document-sharing-service-like-pastebin/' },
  { id: 503, title: 'Designing Instagram (Photo sharing & feed creation)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/system-design-instagram/' },
  { id: 504, title: 'Designing Dropbox / Google Drive (Distributed file sync)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-a-distributed-file-storage-service-like-dropbox/' },
  { id: 505, title: 'Designing Facebook Messenger / WhatsApp (Real-time chat)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/whatsapp-system-design/' },
  { id: 506, title: 'Designing Twitter / X (Timeline generation & high write throughput)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-twitter-system-design/' },
  { id: 507, title: 'Designing YouTube / Netflix (Video streaming at scale)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/system-design-netflix/' },
  { id: 508, title: 'Designing Typeahead Suggestion (Search Autocomplete query service)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-a-search-autocomplete-system/' },
  { id: 509, title: 'Designing an API Rate Limiter (Token bucket vs sliding window)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-an-api-rate-limiter/' },
  { id: 510, title: 'Designing Twitter Search (Distributed text indexing)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/designing-twitter-search-system-design/' },
  { id: 511, title: 'Designing a Web Crawler (Scalable web page fetching & parsing)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-a-web-crawler/' },
  { id: 512, title: 'Designing Facebook Newsfeed (Feed aggregation & push/pull distribution)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-facebook-newsfeed-system-design/' },
  { id: 513, title: 'Designing Yelp / Nearby Friends (Proximity Server & Quadtrees)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/designing-yelp-or-nearby-friends-proximity-server/' },
  { id: 514, title: 'Designing Uber / Lyft Backend (Geospatial routing & matching)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/system-design-of-uber-app/' },
  { id: 515, title: 'Designing Ticketmaster (High concurrency seats reservation)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/designing-ticketmaster-system-design/' },
  { id: 516, title: 'YouTube Likes Counter (High-throughput sharded counters)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/design-a-highly-scalable-likes-counter-for-youtube/' },
  { id: 517, title: 'Designing Reddit / HackerNews (Upvoting, rankings & nesting comments)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/designing-reddit-or-hackernews-system-design/' },
  { id: 518, title: 'Designing a Notification Service (Push notification gateways)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-a-notification-service-system-design/' },
  { id: 519, title: 'Designing Google Calendar (Scheduling, invites & multi-timezone booking)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-google-calendar-system-design/' },
  { id: 520, title: 'Designing Recommendation System (Netflix Collaborative Filtering)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/designing-a-recommendation-system-system-design/' },
  { id: 521, title: 'Designing Gmail / Email Service (SMTP, IMAP, & search indices)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/design-an-email-service-like-gmail/' },
  { id: 522, title: 'Designing Google News (Clustering algorithms & scraping feeds)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-google-news-system-design/' },
  { id: 523, title: 'Designing Unique ID Generator in Distributed Systems (Snowflake)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/design-a-unique-id-generator-in-distributed-systems/' },
  { id: 524, title: 'Designing Code Judging System (LeetCode / execution sandbox)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/designing-an-online-judge-system-like-leetcode/' },
  { id: 525, title: 'Designing a Payment System (Idempotency & transaction state machine)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/design-a-payment-system-system-design/' },
  { id: 526, title: 'Designing Flash Sale System (High concurrency queue-based buying)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/how-to-design-a-flash-sale-system/' },
  { id: 527, title: 'Designing Reminder Alert System (Distributed Cron & scheduler)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/designing-a-distributed-scheduler-or-reminder-service/' }
];

export default function SystemDesignProblemsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/system-design"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Design Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">System Design Problems</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Step-by-step case studies for scaling consumer platforms, database counters, geospatial algorithms, and reservation systems.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={problemsQuestions}
          storagePrefix="system-design-problems"
          searchPlaceholder="Search problems..."
        />
      </div>
    </div>
  );
}
