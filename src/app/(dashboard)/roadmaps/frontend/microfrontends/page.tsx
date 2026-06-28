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
      <p className="text-sm text-zinc-500">Loading MicroFrontends topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const microfrontendsQuestions: QuestionItem[] = [
  { id: 901, title: 'Introduction to MicroFrontends (MFE): monolithic UI decomposition and architectural pros/cons', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/micro-frontend-architecture/' },
  { id: 902, title: 'Integration Strategies: Build-time (npm packages/submodules) vs Run-time (dynamic script loads/iframes)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/micro-frontend-integration-techniques/' },
  { id: 903, title: 'Orchestration: client-side orchestrators, server-side layouts, and route handlers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/micro-frontend-integration-techniques/' },
  { id: 904, title: 'Webpack Module Federation: core concepts of Host, Remote, Container, and Shared packages', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/webpack-module-federation/' },
  { id: 905, title: 'Module Federation: configuring ModuleFederationPlugin inside standard webpack configurations', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/webpack-module-federation/' },
  { id: 906, title: 'Dynamically loaded remotes: loading remote entry points at runtime based on environment variables', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/webpack-module-federation/' },
  { id: 907, title: 'Single-SPA Framework: orchestrating independent apps, lifecycles, and layout engines', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/single-spa-micro-frontend-framework/' },
  { id: 908, title: 'Single-SPA applications: implementing bootstrap, mount, and unmount lifecycles', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/single-spa-lifecycles/' },
  { id: 909, title: 'Single-SPA parcels: rendering independent, framework-agnostic micro-UIs dynamically', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/single-spa-lifecycles/' },
  { id: 910, title: 'SystemJS & Import Maps: loading ES modules dynamically in the browser without bundler compilation', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/systemjs-in-micro-frontends/' },
  { id: 911, title: 'Library Sharing: singleton package configurations (React, React-DOM) under Module Federation', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sharing-libraries-in-micro-frontends/' },
  { id: 912, title: 'Version mismatch: handling shared library incompatibilities using semantic versioning rules', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sharing-libraries-in-micro-frontends/' },
  { id: 913, title: 'Server-Side Composition: Composing HTML fragments on the server side using Podium', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/server-side-composition-micro-frontends/' },
  { id: 914, title: 'Server-Side Composition: Tailor (Zalando) open-source streaming fragment orchestrator', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/server-side-composition-micro-frontends/' },
  { id: 915, title: 'iFrame-based Microfrontends: sandboxing capabilities, security benefits, and layout limitations', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/iframe-integration-in-micro-frontends/' },
  { id: 916, title: 'postMessage API: secure cross-document messaging between host window and remote iFrames', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/iframe-integration-in-micro-frontends/' },
  { id: 917, title: 'Web Components: creating custom elements (window.customElements.define) for framework-agnostic UIs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/web-components-in-micro-frontends/' },
  { id: 918, title: 'Shadow DOM: encapsulating DOM structures, scopes, and preventing global style leaks', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/web-components-in-micro-frontends/' },
  { id: 919, title: 'HTML Templates & Slots: templating reusable micro-elements natively in the browser', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/web-components-in-micro-frontends/' },
  { id: 920, title: 'Communication: Custom DOM Events (window.dispatchEvent) for decoupled cross-MFE messaging', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/communication-between-micro-frontends/' },
  { id: 921, title: 'Communication: BroadcastChannel API for synchronized client-side messaging across windows/tabs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/communication-between-micro-frontends/' },
  { id: 922, title: 'State Sharing: synchronizing shared states across MFEs using custom Zustand event-emitters', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/state-management-in-micro-frontends/' },
  { id: 923, title: 'Shared State: global redux store slices, action dispatching propagation in a federated architecture', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/state-management-in-micro-frontends/' },
  { id: 924, title: 'CSS Isolation: styling namespace configurations, scoped CSS Modules, and local variables', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/css-isolation-in-micro-frontends/' },
  { id: 925, title: 'Tailwind CSS isolation: using distinct prefixes (tw-) and selectors to prevent styling clashes', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/css-isolation-in-micro-frontends/' },
  { id: 926, title: 'Shared Design System: publishing components, tokens, and asset paths as shared remote modules', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/design-systems-in-micro-frontends/' },
  { id: 927, title: 'Asset Management: coordinating static files (fonts, images, SVGs) caching, routing, and hashing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/micro-frontend-asset-management/' },
  { id: 928, title: 'Independent CI/CD Pipelines: building, packaging, and deploying remotes without touching the host', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/deploying-micro-frontends/' },
  { id: 929, title: 'Fault Tolerance: handling loading timeouts, failed remotes, and showing custom crash fallbacks', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/fault-tolerance-in-micro-frontends/' },
  { id: 930, title: 'Routing Synchronization: coordinating orchestrator navigation state with sub-application route states', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/routing-in-micro-frontends/' },
  { id: 931, title: 'Performance: optimizing bundle chunking, lazy loading remote bundles, and Cumulative Layout Shift (CLS)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/micro-frontend-performance-optimization/' },
  { id: 932, title: 'CSS-in-JS challenges: runtime stylesheets injection from remote MFEs inside the host DOM', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/css-isolation-in-micro-frontends/' },
  { id: 933, title: 'Multi-version runtime coexistence: running different versions of the same library simultaneously', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/version-coexistence-in-micro-frontends/' },
  { id: 934, title: 'Security in MFEs: CORS policy setups, dynamic origin authorization, and JWT cookie routing', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/micro-frontend-security-best-practices/' },
  { id: 935, title: 'Automated testing in MFEs: mocking host context for local remote component development', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/testing-micro-frontends/' },
  { id: 936, title: 'End-to-End Testing: using Playwright and Cypress to test federated container compositions', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/testing-micro-frontends/' },
  { id: 937, title: 'Monorepo setups: managing host and remote applications under pnpm workspaces and Turborepo', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/turborepo-monorepo-setup/' },
  { id: 938, title: 'Shared code utilities: organizing shared network helpers, formatters, and authentication utilities', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sharing-libraries-in-micro-frontends/' },
  { id: 939, title: 'Dynamic route registration: remote MFEs exposing routes dynamically to a centralized router', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/routing-in-micro-frontends/' },
  { id: 940, title: 'Zero-Downtime deployments: blue-green deployment strategies for remote bundles on CDNs', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/deploying-micro-frontends/' },
  { id: 941, title: 'Hot Module Replacement (HMR) challenges in federated monorepos during local development', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/webpack-module-federation/' },
  { id: 942, title: 'Edge Side Includes (ESI) and server-side templates injection concepts', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/server-side-composition-micro-frontends/' },
  { id: 943, title: 'Next.js Federated architectures: setting up nextjs-mf plugin for Next.js host/remote structures', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/webpack-module-federation-with-nextjs/' },
  { id: 944, title: 'Memory leaks management: cleaning up global event listeners, timers, and DOM nodes on unmount', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/fault-tolerance-in-micro-frontends/' },
  { id: 945, title: 'Dependency updates: tracking and bumping dependencies across independent remote repos safely', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sharing-libraries-in-micro-frontends/' },
  { id: 946, title: 'Monitoring: logging client-side script errors, performance metrics, and asset load failures per MFE', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/fault-tolerance-in-micro-frontends/' },
  { id: 947, title: 'Local dev proxy configurations: routing production assets to local development servers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/deploying-micro-frontends/' },
  { id: 948, title: 'Analytics tracking: aggregating analytics events from different MFEs under a global dispatcher', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/communication-between-micro-frontends/' },
  { id: 949, title: 'Offline support: service workers configuration for caching multiple independent federated assets', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/micro-frontend-asset-management/' },
  { id: 950, title: 'UI shell pattern: creating a container application that handles global navigation, menus, and user profiles', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/micro-frontend-architecture/' }
];

export default function MicrofrontendsQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/frontend"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Frontend Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">MicroFrontends Architecture</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Webpack Module Federation configurations, Single-SPA framework lifecycles, and cross-application state/CSS scoping strategies.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={microfrontendsQuestions}
          storagePrefix="frontend-mfe"
          searchPlaceholder="Search MicroFrontends topics..."
        />
      </div>
    </div>
  );
}
