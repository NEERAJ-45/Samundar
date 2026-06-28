'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Docker topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const USER_NAME = 'NEERAJ';
const STORAGE_PREFIX = 'devops-cloud-docker';

const dockerQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 901 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/docker-tutorial/';

  // 1-30 Container Basics, 31-50 Orchestration
  if (index < 30) {
    const basicTopics = [
      'What is Containerization and how does it differ from Virtualization?',
      'Docker Architecture: Client, Host, Daemon, Images, Containers, Registry',
      'Understanding Docker Images vs Docker Containers',
      'Writing a Dockerfile: Core instructions (FROM, RUN, COPY, ADD)',
      'Dockerfile: CMD vs ENTRYPOINT instructions explained',
      'Docker Image Layers and the Copy-on-Write mechanism',
      'Managing Docker Container States: run, start, stop, kill, rm',
      'Persisting Data: Docker Volumes vs Bind Mounts',
      'Persisting Data: Creating and sharing Named Volumes',
      'Docker Networking: Default Bridge network vs Custom User-defined Bridge',
      'Docker Networking: Host, Overlay, and None drivers',
      'Container Port Forwarding and Port Mapping (-p flag)',
      'Inspecting and Debugging containers: docker inspect & docker logs',
      'Executing commands inside running container: docker exec',
      'Environment Variables in Docker: ENV vs ARG instructions',
      'Reducing Image Size: Multi-stage Docker builds',
      'Dockerfile Best Practices: Minimizing layers and using .dockerignore',
      'Copying files: Docker COPY vs ADD differences',
      'Running containers in detached mode vs interactive mode (-d vs -it)',
      'Docker Registry: Authenticating & pushing/pulling images from Docker Hub',
      'Docker Tags and Image Versioning strategies',
      'Resource Constraints: Limiting container CPU and Memory usage',
      'Docker Daemon Configuration and TLS security setups',
      'Pruning unused Docker resources: system prune, image prune, volume prune',
      'Docker Commit vs Dockerfile for image creation',
      'Common Docker commands reference checklist',
      'Troubleshooting: Resolving Docker Daemon connection errors',
      'Docker Volume backups: Import and Export processes',
      'Dockerizing a simple static HTML/JS web server (Nginx)',
      'Dockerizing a Node.js Express application from scratch'
    ];
    title = basicTopics[index % basicTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Virtualization')) link = 'https://www.geeksforgeeks.org/difference-between-virtualization-and-containerization/';
    else if (title.includes('Architecture')) link = 'https://www.geeksforgeeks.org/docker-architecture/';
    else if (title.includes('Images vs Containers')) link = 'https://www.geeksforgeeks.org/difference-between-docker-image-and-docker-container/';
    else if (title.includes('CMD vs ENTRYPOINT')) link = 'https://www.geeksforgeeks.org/difference-between-cmd-and-entrypoint-in-dockerfile/';
    else if (title.includes('Volumes')) link = 'https://www.geeksforgeeks.org/docker-volumes/';
    else if (title.includes('Networking')) link = 'https://www.geeksforgeeks.org/docker-networking/';
    else if (title.includes('Multi-stage')) link = 'https://www.geeksforgeeks.org/multi-stage-filing-in-docker/';
    else if (title.includes('Best Practices')) link = 'https://www.geeksforgeeks.org/dockerfile-best-practices/';
    else link = 'https://www.geeksforgeeks.org/docker-introduction/';
  } else {
    const advTopics = [
      'What is Docker Compose & why do we use it?',
      'Writing docker-compose.yml: Services, Networks, and Volumes syntax',
      'Docker Compose CLI: up, down, start, stop, build, logs commands',
      'Managing multiple environments in Compose: docker-compose.override.yml',
      'Service dependencies in Compose: depends_on vs healthcheck waits',
      'Scale services in Docker Compose: scale flag and replicas',
      'Docker Compose Environment variables (.env file integration)',
      'Multi-container networking in Compose: isolated network bridges',
      'Dockerizing microservices: Spring Boot + PostgreSQL compose setup',
      'Docker Swarm Core Concepts: Nodes, Services, Tasks, and Stacks',
      'Swarm Initialization and cluster join tokens management',
      'Scaling services dynamically in a Docker Swarm cluster',
      'Swarm Overlay Networking & Routing Mesh load balancing',
      'Rolling updates and rollbacks implementation in Docker Swarm',
      'Securing secrets in Docker Compose and Swarm configurations',
      'Docker Content Trust (DCT) for verifying image signatures',
      'Integrating Docker with CI/CD: Building images on GitHub actions',
      'Vulnerability scanning of Docker Images using Trivy / Docker Scan',
      'Monitoring container resource utilization using docker stats',
      'Deploying Dockerized applications to production: Best practices checklist'
    ];
    title = advTopics[(index - 30) % advTopics.length];
    difficulty = 'HARD';
    if (title.includes('Compose')) link = 'https://www.geeksforgeeks.org/what-is-docker-compose/';
    else if (title.includes('compose.yml')) link = 'https://www.geeksforgeeks.org/docker-compose-workflow-and-configuration-options/';
    else if (title.includes('Swarm')) link = 'https://www.geeksforgeeks.org/docker-swarm-architecture/';
    else if (title.includes('vulnerability')) link = 'https://www.geeksforgeeks.org/vulnerability-scanning-in-docker/';
    else link = 'https://www.geeksforgeeks.org/docker-compose-vs-docker-swarm/';
  }

  return { id, title, difficulty, link };
});

export default function DockerQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/devops-cloud"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to DevOps Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Docker Containerization</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Virtualization vs Containerization, writing Dockerfiles, volumes, port forwarding, custom networks, and Compose configurations.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={dockerQuestions}
          storagePrefix="devops-cloud-docker"
          searchPlaceholder="Search Docker topics..."
        />
      </div>
    </div>
  );
}
