export const STORAGE_KEYS = {
  DAILY_COMPLETIONS: 'daily-completions',
  DAILY_NOTES: 'daily-notes',
  DAILY_SCHEDULE: 'daily-schedule',
  INTERVIEW_QUESTIONS: 'interview-questions',
  PROJECTS_DATA: 'projects-data',
  TASKS: 'samundar-tasks',
  REVISION_SCHEDULER_ITEMS: 'revision-scheduler-items',
  COMMAND_CENTER: 'samundar-command-center',
  COMMAND_CENTER_STICKY: 'command-center-sticky',

  FOUNDATION_OS: 'foundation-os-completed',
  FOUNDATION_DBMS: 'foundation-dbms-completed',
  FOUNDATION_CN: 'foundation-cn-completed',
  SYSTEM_DESIGN_CONCEPTS: 'system-design-concepts-completed',
  SYSTEM_DESIGN_PROBLEMS: 'system-design-problems-completed',
  BACKEND_JAVA: 'backend-java-completed',
  BACKEND_SPRINGBOOT: 'backend-springboot-completed',
  FRONTEND_REACT: 'frontend-react-completed',
  FRONTEND_NEXTJS: 'frontend-nextjs-completed',
  FRONTEND_MFE: 'frontend-mfe-completed',
  DEVOPS_CLOUD_DEVOPS: 'devops-cloud-devops-completed',
  DEVOPS_CLOUD_DOCKER: 'devops-cloud-docker-completed',
  DEVOPS_CLOUD_KUBERNETES: 'devops-cloud-kubernetes-completed',
  DEVOPS_CLOUD_AWS: 'devops-cloud-aws-completed',
  DATABASES_SQL: 'databases-sql-completed',
  DATABASES_NOSQL: 'databases-nosql-completed',
  DATABASES_LEETCODE: 'completed-databases-leetcode',
  APTITUDE: 'aptitude-completed',
} as const;

export function completedKey(prefix: string): string {
  return `${prefix}-completed`;
}

export function commandCenterKey(email: string): string {
  return `samundar-command-center-${email}`;
}
