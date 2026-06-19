'use client';

import * as React from 'react';
import { FolderOpen, CheckCircle2, Sparkles, Layers, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ProjectStatus = 'IDEA' | 'IN_PROGRESS' | 'COMPLETED' | 'MAINTAINING' | 'ARCHIVED';

interface ProjectFeature {
  name: string;
  done: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  technologies: string[];
  features: ProjectFeature[];
  linkedConcepts: number;
  vision: string;
  architecture: string;
  lessons: string;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  IDEA: { label: 'Idea', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-950 text-blue-300 border-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  MAINTAINING: { label: 'Maintaining', className: 'bg-amber-950 text-amber-300 border-amber-800' },
  ARCHIVED: { label: 'Archived', className: 'bg-zinc-900 text-zinc-500 border-zinc-800' },
};

const projects: Project[] = [
  {
    id: '1',
    name: 'Notification Service',
    description: 'Real-time notification delivery system with multi-channel support.',
    status: 'IN_PROGRESS',
    technologies: ['Go', 'Redis', 'Kafka', 'PostgreSQL', 'gRPC'],
    features: [
      { name: 'Email dispatch', done: true },
      { name: 'Push notifications', done: true },
      { name: 'SMS integration', done: false },
      { name: 'Template engine', done: true },
      { name: 'Delivery tracking', done: false },
    ],
    linkedConcepts: 12,
    vision: 'Build a unified notification gateway that handles billions of events daily with sub-100ms latency, supporting email, SMS, push, and webhook delivery with intelligent routing and retry logic.',
    architecture: 'Microservices architecture with Go services communicating over gRPC. Kafka for event ingestion, Redis for deduplication and rate limiting, PostgreSQL for audit logging. Template service handles rendering via Handlebars-style templates.',
    lessons: 'Event-driven design requires careful idempotency handling. Redis streams are a simpler alternative to Kafka for smaller volumes. Template caching significantly reduces rendering latency.',
  },
  {
    id: '2',
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with marketplace capabilities.',
    status: 'COMPLETED',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Prisma', 'tRPC'],
    features: [
      { name: 'Product catalog', done: true },
      { name: 'Cart & checkout', done: true },
      { name: 'Payment processing', done: true },
      { name: 'Order management', done: true },
      { name: 'Admin dashboard', done: true },
    ],
    linkedConcepts: 8,
    vision: 'Create a modern e-commerce platform with seamless checkout, real-time inventory management, and a marketplace allowing third-party sellers to list products with commission-based revenue.',
    architecture: 'Next.js app router with server components for product pages. tRPC for type-safe API communication. Prisma ORM with PostgreSQL. Stripe for payment intents. Redis for session and cart storage.',
    lessons: 'Server components dramatically reduce client bundle size for product listings. Optimistic UI updates for cart operations improve perceived performance. Stripe webhook idempotency is critical.',
  },
  {
    id: '3',
    name: 'Task Management System',
    description: 'Kanban-style project management with real-time collaboration.',
    status: 'IN_PROGRESS',
    technologies: ['React', 'Node.js', 'Socket.IO', 'MongoDB', 'Docker'],
    features: [
      { name: 'Board view', done: true },
      { name: 'Real-time sync', done: true },
      { name: 'File attachments', done: false },
      { name: 'User assignments', done: true },
      { name: 'Activity log', done: false },
    ],
    linkedConcepts: 15,
    vision: 'A drag-and-drop project management tool that supports real-time collaboration, file sharing, and integrations with GitHub and Slack, designed for engineering teams.',
    architecture: 'React frontend with react-beautiful-dnd for drag-and-drop. Node.js/Express backend with Socket.IO for WebSocket-based real-time updates. MongoDB for flexible schema. Docker Compose for local dev.',
    lessons: 'Optimistic updates with WebSocket acknowledgment callbacks prevent state conflicts. MongoDB change streams simplify real-time sync. Schema validation at the application layer is essential with NoSQL.',
  },
  {
    id: '4',
    name: 'API Gateway',
    description: 'Lightweight API gateway with rate limiting and auth.',
    status: 'IDEA',
    technologies: ['Rust', 'Tokio', 'Hyper', 'JWT', 'Redis'],
    features: [
      { name: 'Route forwarding', done: false },
      { name: 'Rate limiting', done: false },
      { name: 'JWT validation', done: false },
      { name: 'Metrics export', done: false },
      { name: 'Circuit breaker', done: false },
    ],
    linkedConcepts: 6,
    vision: 'A high-performance API gateway written in Rust that handles authentication, rate limiting, request routing, and metrics collection with sub-millisecond overhead per request.',
    architecture: 'Built on Tokio async runtime with Hyper as the HTTP layer. JWT validation via jsonwebtoken crate. Sliding window rate limiting with Redis. Prometheus metrics export. Plugin system via trait objects.',
    lessons: 'N/A — still in ideation phase. Key research areas: zero-copy deserialization, connection pooling strategies, and hot-reloadable plugin architecture.',
  },
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('text-[10px] font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: () => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const doneCount = project.features.filter((f) => f.done).length;

  return (
    <Card
      className="group cursor-pointer border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200"
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium text-zinc-100 truncate">
              {project.name}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1 line-clamp-1">
              {project.description}
            </CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-normal bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              {tech}
            </Badge>
          ))}
        </div>

        <div className="space-y-1">
          {project.features.slice(0, expanded ? project.features.length : 3).map((feature) => (
            <div key={feature.name} className="flex items-center gap-2 text-xs">
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  feature.done ? 'bg-emerald-500' : 'bg-zinc-700'
                )}
              />
              <span className={cn(feature.done ? 'text-zinc-300' : 'text-zinc-600')}>
                {feature.name}
              </span>
            </div>
          ))}
          {!expanded && project.features.length > 3 && (
            <button
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5"
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            >
              +{project.features.length - 3} more
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-800">
          <Layers className="h-3 w-3" />
          <span>{project.linkedConcepts} linked concepts</span>
          <button
            className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            <span>Details</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ExpandedDialog({ project, open, onOpenChange }: { project: Project | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <DialogTitle className="text-lg text-zinc-100">{project.name}</DialogTitle>
            <StatusBadge status={project.status} />
          </div>
          <DialogDescription className="text-sm text-zinc-500">
            {project.description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Vision</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.vision}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Architecture</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.architecture}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Lessons Learned</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.lessons}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-400">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const [dialogProject, setDialogProject] = React.useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'text-blue-400' },
    { label: 'In Progress', value: projects.filter((p) => p.status === 'IN_PROGRESS').length, icon: Sparkles, color: 'text-amber-400' },
    { label: 'Completed', value: projects.filter((p) => p.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Concepts Used', value: projects.reduce((a, p) => a + p.linkedConcepts, 0), icon: Layers, color: 'text-violet-400' },
  ];

  const openDetail = (project: Project) => {
    setDialogProject(project);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Project Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">Track engineering projects end-to-end</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn('p-2.5 rounded-lg bg-zinc-800/50', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => openDetail(project)}
            />
          ))}
        </div>
      </div>
      <ExpandedDialog project={dialogProject} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
