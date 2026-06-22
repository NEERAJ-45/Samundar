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
      <p className="text-sm text-zinc-500">Loading DevOps topics...</p>
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
const STORAGE_PREFIX = 'devops-cloud-devops';

const devopsQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 1201 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/devops/';

  // 1-30 CI/CD, 31-50 Monitoring
  if (index < 30) {
    const cicdTopics = [
      'What is DevOps? Core principles (CALMS) and culture shift',
      'Version Control: Git Branching Strategies (GitFlow, GitHub Flow, Trunk-Based)',
      'Git Internals: commits, trees, blobs, and reflogs explained',
      'Git Merge vs Git Rebase: Core differences and usage guidelines',
      'CI/CD Pipeline Stages: Build, Test, Package, Deploy, Monitor',
      'Jenkins Architecture: Controller-Agent model and scaling builds',
      'Jenkins Pipelines: Declarative vs Scripted Jenkinsfile syntax',
      'Jenkins Plugins: Enhancing pipelines with custom integrations',
      'GitHub Actions: Workflows, Jobs, Steps, Runners, and Syntax',
      'GitHub Actions: Reusable workflows and custom actions creation',
      'GitHub Actions: Secrets management and environments security',
      'GitOps: Core principles and declarative continuous delivery',
      'ArgoCD: Sync Policies, Application manifests, and Auto-healing',
      'Infrastructure as Code (IaC): Declarative vs Imperative IaC',
      'Terraform Architecture: Providers, Resources, and State management',
      'Terraform State: Local vs Remote state storage, locking, and backends',
      'Terraform Variables, Outputs, and Modules for code reuse',
      'Terraform Commands lifecycle: init, plan, apply, destroy',
      'Configuration Management: Ansible Architecture (Agentless architecture)',
      'Ansible Playbooks: YAML tasks, Handlers, and Variables syntax',
      'Ansible Inventory: Dynamic inventories in cloud environments',
      'Continuous Deployment: Blue-Green Deployment strategy',
      'Continuous Deployment: Canary Deployments implementation',
      'Continuous Deployment: Rolling Updates vs Recreate deployments',
      'Securing CI/CD: Static Application Security Testing (SAST) integrations',
      'Securing CI/CD: Dynamic Application Security Testing (DAST) integrations',
      'Securing IaC: Scanning Terraform code using Checkov / Tfsec',
      'Artifact Management: JFrog Artifactory vs Nexus Repository',
      'Linux Administration Basics for DevOps: SSH keys, permissions, file systems',
      'Linux Networking: Netstat, Dig, IP route, Tcpdump commands'
    ];
    title = cicdTopics[index % cicdTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Git Branching')) link = 'https://www.geeksforgeeks.org/git-branching-strategies/';
    else if (title.includes('Merge vs')) link = 'https://www.geeksforgeeks.org/difference-between-git-merge-and-git-rebase/';
    else if (title.includes('CI/CD Pipeline')) link = 'https://www.geeksforgeeks.org/what-is-cicd-pipeline/';
    else if (title.includes('Jenkins Architecture')) link = 'https://www.geeksforgeeks.org/jenkins-architecture/';
    else if (title.includes('GitHub Actions')) link = 'https://www.geeksforgeeks.org/github-actions-introduction/';
    else if (title.includes('ArgoCD')) link = 'https://www.geeksforgeeks.org/what-is-argocd/';
    else if (title.includes('Infrastructure as Code')) link = 'https://www.geeksforgeeks.org/what-is-infrastructure-as-code-iac/';
    else if (title.includes('Terraform')) link = 'https://www.geeksforgeeks.org/introduction-to-terraform/';
    else if (title.includes('Ansible')) link = 'https://www.geeksforgeeks.org/introduction-to-ansible/';
    else if (title.includes('Blue-Green')) link = 'https://www.geeksforgeeks.org/what-is-blue-green-deployment/';
    else link = 'https://www.geeksforgeeks.org/introduction-to-devops/';
  } else {
    const monTopics = [
      'Site Reliability Engineering (SRE) vs DevOps: Core alignment',
      'SRE Metrics: Service Level Indicators (SLI) and Service Level Objectives (SLO)',
      'SRE Concepts: Service Level Agreements (SLA) & Error Budgets',
      'Monitoring vs Observability: Metrics, Logs, and Traces',
      'Prometheus Architecture: Pull model, TSDB, Exporters, and Alertmanager',
      'PromQL: Writing basic queries, rate(), increase(), sum() functions',
      'Grafana: Dashboard creation, data source integration, and variables',
      'Centralized Logging: ELK Stack (Elasticsearch, Logstash, Kibana) workflow',
      'Log Forwarding: Filebeat vs Fluentd agents comparison',
      'Distributed Tracing: Jaeger & OpenTelemetry standard integration',
      'Alerting Best Practices: Reducing alert fatigue in operations',
      'Incident Response: Post-mortems, root cause analysis, and runbooks',
      'Chaos Engineering: Principles and tools (Chaos Mesh, Gremlin)',
      'Load Testing: Generating traffic using JMeter, Locust, or K6',
      'High Availability: Disaster Recovery (DR) strategies (Backup, Pilot Light, Active-Active)',
      'SRE Runbooks and automation of operational tasks',
      'Configuring alerts in Prometheus Alertmanager with Slack/PagerDuty',
      'Monitoring Kubernetes: Prometheus Operator & Kube-State-Metrics',
      'SRE Incident Management Lifecycle phases',
      'DevOps Metrics: DORA metrics (Deployment Frequency, Lead Time, MTTR, CFR)'
    ];
    title = monTopics[(index - 30) % monTopics.length];
    difficulty = 'HARD';
    if (title.includes('SRE')) link = 'https://www.geeksforgeeks.org/site-reliability-engineering-sre/';
    else if (title.includes('SLI')) link = 'https://www.geeksforgeeks.org/difference-between-sli-slo-and-sla/';
    else if (title.includes('Prometheus')) link = 'https://www.geeksforgeeks.org/introduction-to-prometheus/';
    else if (title.includes('Grafana')) link = 'https://www.geeksforgeeks.org/introduction-to-grafana/';
    else if (title.includes('ELK')) link = 'https://www.geeksforgeeks.org/elk-stack/';
    else if (title.includes('DORA')) link = 'https://www.geeksforgeeks.org/dora-metrics-in-devops/';
    else link = 'https://www.geeksforgeeks.org/devops-monitoring-tools/';
  }

  return { id, title, difficulty, link };
});

export default function DevOpsQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/devops-cloud"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to DevOps Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">DevOps & CI/CD Pipelines</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Git Flow, pipelines (Jenkins, GitHub Actions), GitOps (ArgoCD), IaC (Terraform), and monitoring (Prometheus, Grafana, ELK).
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={devopsQuestions}
          storagePrefix="devops-cloud-devops"
          searchPlaceholder="Search DevOps topics..."
        />
      </div>
    </div>
  );
}
