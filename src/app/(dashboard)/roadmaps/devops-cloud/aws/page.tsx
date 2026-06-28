'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading AWS topics...</p>
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
const STORAGE_PREFIX = 'devops-cloud-aws';

const awsQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 1101 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/aws-tutorial/';

  // 1-35 Compute & Storage, 36-50 Networking & Security
  if (index < 35) {
    const computeTopics = [
      'AWS Global Infrastructure: Regions, Availability Zones (AZ), Edge Locations',
      'Identity and Access Management (IAM): Users, Groups, Roles, and Policies',
      'IAM Best Practices: Principle of Least Privilege and Multi-Factor Auth (MFA)',
      'Elastic Compute Cloud (EC2): Instance Types, AMI, and Key Pairs',
      'EC2 Purchasing Options: On-Demand, Savings Plans, Reserved, Spot Instances',
      'EC2 Security Groups: Stateful vs Stateless firewalls',
      'Elastic Load Balancing (ELB): Application Load Balancer (ALB) vs Network Load Balancer (NLB)',
      'AWS Auto Scaling: Scaling Policies (Target Tracking, Step, Simple)',
      'AWS Lambda: Serverless execution environment, event triggers, and execution timeouts',
      'AWS Lambda: Cold Start optimization techniques',
      'Simple Storage Service (S3): Buckets, Objects, and Key-value storage architecture',
      'S3 Storage Classes: Standard, Intelligent-Tiering, Standard-IA, Glacier',
      'S3 Security: Bucket Policies, IAM policies, and Access Control Lists (ACLs)',
      'S3 Lifecycle Policies: Automating object transitions and expirations',
      'Elastic Block Store (EBS): Volume types (gp3, io2) & Snapshots',
      'EBS vs Instance Store: Persistent vs Ephemeral storage',
      'Elastic File System (EFS): Shared network file system for EC2 instances',
      'AWS Relational Database Service (RDS): Multi-AZ deployments vs Read Replicas',
      'RDS Databases: Automated Backups, Manual Snapshots, and Point-in-Time recovery',
      'Amazon DynamoDB: Key-value NoSQL database, Partition Keys, and Sort Keys',
      'DynamoDB Throughput: Provisioned Capacity (RCU/WCU) vs On-Demand capacity',
      'DynamoDB Indexing: Local Secondary Indexes (LSI) vs Global Secondary Indexes (GSI)',
      'Amazon ElastiCache: Memcached vs Redis caches deployment',
      'AWS ECS (Elastic Container Service): Task Definitions, Tasks, and Services',
      'AWS Fargate: Serverless compute engine for containers in ECS/EKS',
      'AWS EKS (Elastic Kubernetes Service): Managed control planes and worker node groups',
      'AWS CloudFormation: Infrastructure as Code (IaC) templates and stack management',
      'AWS Elastic Beanstalk: Platform as a Service (PaaS) deployment helper',
      'AWS Step Functions: Orchestrating serverless microservices workflow',
      'AWS EventBridge: Event-driven serverless event bus integrations',
      'AWS SQS (Simple Queue Service): Standard vs FIFO queue message buffering',
      'AWS SNS (Simple Notification Service): Pub/sub messaging system',
      'AWS CloudWatch: Logs, Metrics, Alarms, and Event rules monitoring',
      'AWS CloudTrail: Auditing user activities and API calls operations',
      'AWS Secrets Manager vs Parameter Store configurations'
    ];
    title = computeTopics[index % computeTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Global Infrastructure')) link = 'https://www.geeksforgeeks.org/aws-global-infrastructure/';
    else if (title.includes('IAM')) link = 'https://www.geeksforgeeks.org/aws-identity-and-access-management-iam/';
    else if (title.includes('EC2')) link = 'https://www.geeksforgeeks.org/amazon-elastic-compute-cloud-amazon-ec2/';
    else if (title.includes('Lambda')) link = 'https://www.geeksforgeeks.org/aws-lambda/';
    else if (title.includes('S3')) link = 'https://www.geeksforgeeks.org/amazon-s3-simple-storage-service/';
    else if (title.includes('EBS')) link = 'https://www.geeksforgeeks.org/aws-ebselastic-block-store/';
    else if (title.includes('RDS')) link = 'https://www.geeksforgeeks.org/amazon-rds-relational-database-service/';
    else if (title.includes('DynamoDB')) link = 'https://www.geeksforgeeks.org/amazon-dynamodb/';
    else if (title.includes('SQS')) link = 'https://www.geeksforgeeks.org/amazon-sqssimple-queue-service/';
    else link = 'https://www.geeksforgeeks.org/aws-cloud-computing/';
  } else {
    const netTopics = [
      'Virtual Private Cloud (VPC): Subnets, Route Tables, and Internet Gateways (IGW)',
      'VPC Routing: Public Subnets vs Private Subnets configurations',
      'NAT Gateway vs NAT Instance: Exposing private subnet to outbound traffic',
      'VPC Peering: Connecting multiple Virtual Private Clouds securely',
      'AWS Transit Gateway: Central hub for interconnecting VPCs and on-premise networks',
      'AWS Direct Connect vs Site-to-Site VPN: Hybrid cloud connectivity options',
      'VPC Endpoints (Gateway vs Interface): Private connection to AWS services',
      'VPC Flow Logs: Capturing IP traffic information flowing through network interfaces',
      'Route 53: Public vs Private Hosted Zones hosting',
      'Route 53 Routing Policies: Latency, Weighted, Geolocation, Failover',
      'Amazon CloudFront: Content Delivery Network (CDN) edge caching architecture',
      'CloudFront Origin Access Control (OAC) for securing S3 buckets',
      'AWS WAF (Web Application Firewall): Protecting APIs from web exploits',
      'AWS Shield: Managed DDoS protection for CloudFront and ALB deployments',
      'AWS Well-Architected Framework: The Six Design Pillars'
    ];
    title = netTopics[(index - 35) % netTopics.length];
    difficulty = 'HARD';
    if (title.includes('VPC')) link = 'https://www.geeksforgeeks.org/amazon-virtual-private-cloudvpc/';
    else if (title.includes('Route 53')) link = 'https://www.geeksforgeeks.org/aws-route-53/';
    else if (title.includes('CloudFront')) link = 'https://www.geeksforgeeks.org/amazon-cloudfront/';
    else if (title.includes('WAF')) link = 'https://www.geeksforgeeks.org/aws-waf-web-application-firewall/';
    else link = 'https://www.geeksforgeeks.org/aws-networking/';
  }

  return { id, title, difficulty, link };
});

export default function AWSQuestionsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">AWS Cloud Engineering</h1>
            <p className="text-sm text-zinc-500 mt-1">
              IAM security, EC2 configurations, S3 policies, database scale, VPC subnets, and CloudFront distributions.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={awsQuestions}
          storagePrefix="devops-cloud-aws"
          searchPlaceholder="Search AWS topics..."
        />
      </div>
    </div>
  );
}
