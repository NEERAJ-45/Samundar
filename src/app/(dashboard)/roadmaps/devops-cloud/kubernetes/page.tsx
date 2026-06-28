'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Kubernetes topics...</p>
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
const STORAGE_PREFIX = 'devops-cloud-kubernetes';

const k8sQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 1001 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/kubernetes-tutorial/';

  // 1-30 Pods & Workloads, 31-50 Networking & Services
  if (index < 30) {
    const workloadTopics = [
      'Kubernetes Architecture: Control Plane Components (API Server, etcd, Scheduler, Controller Manager)',
      'Kubernetes Architecture: Worker Node Components (Kubelet, Kube-proxy, Container Runtime)',
      'What is a Pod & why is it the smallest deployable unit?',
      'Pod Lifecycle states: Pending, Running, Succeeded, Failed, Unknown',
      'Configuring Pod Probes: Liveness, Readiness, and Startup Probes',
      'Resource Management: Defining CPU/Memory Requests and Limits in Pods',
      'Pod Termination Flow & Graceful Shutdown management',
      'Understanding ReplicaSets and dynamic scale-out controllers',
      'Deployments: Managing stateless applications & scaling replicas',
      'Deployment Strategies: RollingUpdate vs Recreate configurations',
      'Deployment Rollouts & Rollbacks (kubectl rollout undo)',
      'StatefulSets: Scaling stateful databases with stable network/storage identifiers',
      'DaemonSets: Deploying logging and monitoring agents on every node',
      'Jobs and CronJobs: Executing batch processes and scheduled tasks',
      'ConfigMaps: Injecting application configurations dynamically',
      'Secrets: Securing sensitive API keys, passwords, and tokens',
      'Kubernetes Security Contexts: Running pods as non-root users',
      'Service Accounts and Role-Based Access Control (RBAC) in Kubernetes',
      'Init Containers: Running initialization tasks before main containers start',
      'Sidecar Pattern: Deploying helper containers alongside main application',
      'Horizontal Pod Autoscaler (HPA) based on CPU/Memory utilization',
      'Vertical Pod Autoscaler (VPA) for dynamic scaling recommendations',
      'Kubelet garbage collection of unused images and dead containers',
      'Taints and Tolerations: Restricting pod scheduling on specific nodes',
      'Node Affinity vs Pod Affinity / Anti-Affinity rules',
      'Debugging Pods: kubectl describe, logs, and exec utilities',
      'Ephemeral Containers: Troubleshooting running pods dynamically',
      'Kubernetes API Primitives and Custom Resource Definitions (CRDs)',
      'Helm Package Manager: Managing Kubernetes releases with charts',
      'Kustomize: Declarative customizing of Kubernetes configurations'
    ];
    title = workloadTopics[index % workloadTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Architecture')) link = 'https://www.geeksforgeeks.org/kubernetes-architecture/';
    else if (title.includes('Pod Lifecycle')) link = 'https://www.geeksforgeeks.org/pod-lifecycle-in-kubernetes/';
    else if (title.includes('Probes')) link = 'https://www.geeksforgeeks.org/liveness-and-readiness-probes-in-kubernetes/';
    else if (title.includes('Deployments')) link = 'https://www.geeksforgeeks.org/kubernetes-deployments/';
    else if (title.includes('StatefulSets')) link = 'https://www.geeksforgeeks.org/kubernetes-statefulsets/';
    else if (title.includes('DaemonSets')) link = 'https://www.geeksforgeeks.org/kubernetes-daemonset/';
    else if (title.includes('Secrets')) link = 'https://www.geeksforgeeks.org/kubernetes-secrets/';
    else if (title.includes('RBAC')) link = 'https://www.geeksforgeeks.org/role-based-access-controlrbac-in-kubernetes/';
    else if (title.includes('Autoscaler')) link = 'https://www.geeksforgeeks.org/horizontal-pod-autoscaling-in-kubernetes/';
    else link = 'https://www.geeksforgeeks.org/kubernetes-concepts/';
  } else {
    const netTopics = [
      'Kubernetes Service Model: Why Pod IP addresses are ephemeral',
      'ClusterIP Services: Exposing applications internally inside cluster',
      'NodePort Services: Exposing applications on a static port on each Node',
      'LoadBalancer Services: Provisioning cloud-native load balancers',
      'ExternalName Services: Mapping cluster services to external DNS records',
      'Kubernetes Ingress: Exposing HTTP/HTTPS routes to external traffic',
      'Ingress Controllers: Setting up Nginx Ingress or ALB controller',
      'Kubernetes Network Policies: Securing pod-to-pod network traffic',
      'Container Network Interface (CNI): Flannel vs Calico vs Cilium',
      'CoreDNS in Kubernetes: Service lookup and DNS resolution flow',
      'Persistent Volumes (PV) & Persistent Volume Claims (PVC) storage model',
      'Dynamic Volume Provisioning using StorageClasses',
      'Kubernetes Volume Plugins: HostPath, EmptyDir, and CSI drivers',
      'Kube-Proxy Modes: Userspace, iptables, and IPVS architectures',
      'Service Meshes: Overview of Istio and Linkerd sidecars',
      'Multitenancy in Kubernetes: Managing Namespaces and ResourceQuotas',
      'API Server Rate Limiting & Flow Schema configurations',
      'Kubernetes Cluster Upgrades: Master and Node upgrade strategy',
      'Backing up cluster state: ETCD backup and restore processes',
      'Best Practices for building production-ready Kubernetes clusters'
    ];
    title = netTopics[(index - 30) % netTopics.length];
    difficulty = 'HARD';
    if (title.includes('Service Model')) link = 'https://www.geeksforgeeks.org/kubernetes-services/';
    else if (title.includes('Ingress')) link = 'https://www.geeksforgeeks.org/kubernetes-ingress/';
    else if (title.includes('Network Policies')) link = 'https://www.geeksforgeeks.org/kubernetes-network-policies/';
    else if (title.includes('Persistent Volumes')) link = 'https://www.geeksforgeeks.org/persistent-volume-pv-and-persistent-volume-claim-pvc-in-kubernetes/';
    else if (title.includes('Namespace')) link = 'https://www.geeksforgeeks.org/kubernetes-namespaces/';
    else if (title.includes('etcd')) link = 'https://www.geeksforgeeks.org/etcd-in-kubernetes/';
    else link = 'https://www.geeksforgeeks.org/kubernetes-networking-model/';
  }

  return { id, title, difficulty, link };
});

export default function KubernetesQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Kubernetes Orchestration</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Control plane components, pod lifecycle, deployments, statefulsets, cluster networking, and service routing.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={k8sQuestions}
          storagePrefix="devops-cloud-kubernetes"
          searchPlaceholder="Search Kubernetes topics..."
        />
      </div>
    </div>
  );
}
