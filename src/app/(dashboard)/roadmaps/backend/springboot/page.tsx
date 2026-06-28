'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Spring Boot topics...</p>
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
const STORAGE_PREFIX = 'backend-springboot';

const springQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 701 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/spring-boot/';

  // 1-35 Core Spring & Web APIs, 36-50 Microservices
  if (index < 35) {
    const coreTopics = [
      'Spring Framework Architecture & Modules overview',
      'What is Dependency Injection (DI) & Inversion of Control (IoC)?',
      'Understanding ApplicationContext vs BeanFactory',
      'Spring Bean Scopes (Singleton, Prototype, Request, Session)',
      'Spring Bean Lifecycle: Initialization & Destruction phases',
      'Spring Annotations: @Component, @Service, @Repository, @Controller',
      'Spring Dependency Injection: Constructor-based vs Setter-based',
      'Spring Aspect Oriented Programming (AOP) core concepts',
      'AOP: Pointcuts, Advices (Before, After, Around) & JoinPoints',
      'Spring MVC Architecture: DispatcherServlet flow',
      'Difference between @Controller and @RestController',
      '@RequestMapping vs @GetMapping, @PostMapping annotations',
      'Handling Request parameters: @RequestParam, @PathVariable, @RequestBody',
      'HTTP Status Codes Mapping: @ResponseStatus & ResponseEntity',
      'Global Exception Handling: @ControllerAdvice & @ExceptionHandler',
      'Spring Boot Starters: What are they and how do they work?',
      'Spring Boot Auto-Configuration: How @EnableAutoConfiguration works',
      'Spring Boot Configuration: application.properties vs application.yml',
      'Spring Boot Profiles: Managing Environment-specific configs',
      'Spring Data JPA: Entity mappings (@Entity, @Table, @Id)',
      'JPA Relationships: @OneToOne, @OneToMany, @ManyToOne, @ManyToMany',
      'Spring Data JPA Repositories: JpaRepository vs CrudRepository',
      'JPA Query Methods & @Query Annotation (JPQL vs Native SQL)',
      'JPA Pagination and Sorting mechanics',
      'Understanding Spring Transaction Management (@Transactional)',
      'Transaction Isolation Levels and Propagation behaviors in Spring',
      'JPA N+1 Query Problem & how to solve it (FetchType.LAZY vs EAGER)',
      'JPA Entity lifecycle states: Transient, Managed, Detached, Removed',
      'Spring Security Core: SecurityFilterChain and Filter registration',
      'User Authentication: AuthenticationManager and UserDetailsService',
      'Token-Based Auth: Implementing JWT in Spring Boot Security',
      'Role-Based Access Control (RBAC) in Spring Security',
      'Spring Security OAuth2 Client & Resource Server flow',
      'Spring Boot Actuator: Monitoring endpoints (/health, /metrics)',
      'Spring Boot Testing: @SpringBootTest, @WebMvcTest & MockMvc'
    ];
    title = coreTopics[index % coreTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Dependency Injection')) link = 'https://www.geeksforgeeks.org/dependency-injection-in-spring/';
    else if (title.includes('ApplicationContext')) link = 'https://www.geeksforgeeks.org/difference-between-beanfactory-and-applicationcontext-in-spring/';
    else if (title.includes('Scopes')) link = 'https://www.geeksforgeeks.org/spring-bean-scopes/';
    else if (title.includes('Lifecycle')) link = 'https://www.geeksforgeeks.org/spring-bean-life-cycle/';
    else if (title.includes('Annotations')) link = 'https://www.geeksforgeeks.org/spring-annotations/';
    else if (title.includes('AOP')) link = 'https://www.geeksforgeeks.org/spring-aop-tutorial-with-examples/';
    else if (title.includes('MVC')) link = 'https://www.geeksforgeeks.org/spring-mvc-framework-tutorial/';
    else if (title.includes('@Controller vs')) link = 'https://www.geeksforgeeks.org/difference-between-controller-and-restcontroller-annotation-in-spring-boot/';
    else if (title.includes('Exception Handling')) link = 'https://www.geeksforgeeks.org/exception-handling-in-spring-boot/';
    else if (title.includes('Auto-Configuration')) link = 'https://www.geeksforgeeks.org/spring-boot-auto-configuration/';
    else if (title.includes('JPA')) link = 'https://www.geeksforgeeks.org/spring-boot-jpa-tutorial/';
    else if (title.includes('@Transactional')) link = 'https://www.geeksforgeeks.org/spring-transaction-management/';
    else if (title.includes('Security')) link = 'https://www.geeksforgeeks.org/spring-security-tutorial/';
    else if (title.includes('Actuator')) link = 'https://www.geeksforgeeks.org/spring-boot-actuator/';
    else link = 'https://www.geeksforgeeks.org/spring-boot-tutorial/';
  } else {
    const microTopics = [
      'Microservices Architecture principles & transition from Monolith',
      'Spring Cloud Eureka: Service Registry & Service Discovery',
      'Spring Cloud Gateway: Routing, Filters & API Gateways',
      'Feign Client: Declarative REST clients in Spring Boot',
      'Load Balancing in Microservices: Spring Cloud LoadBalancer',
      'Fault Tolerance: Resilience4j Circuit Breaker patterns',
      'Distributed Configuration Management: Spring Cloud Config Server',
      'Distributed Tracing: Spring Cloud Sleuth & Zipkin integration',
      'Event-Driven Microservices: Spring Cloud Stream & Kafka/RabbitMQ',
      'Database-per-Microservice pattern & data synchronization',
      'Saga Pattern in Distributed Transactions management',
      'API Gateway Rate Limiting & Auth integration in Gateway',
      'Deploying Spring Boot: Dockerfile optimization for JVM',
      'Containerizing Spring Boot: Layered JARs & Spring Boot Maven plugin',
      'Deploying Spring Boot to Kubernetes: Pod resources & probes'
    ];
    title = microTopics[(index - 35) % microTopics.length];
    difficulty = 'HARD';
    if (title.includes('Eureka')) link = 'https://www.geeksforgeeks.org/spring-cloud-service-registration-and-discovery-using-eureka/';
    else if (title.includes('Gateway')) link = 'https://www.geeksforgeeks.org/spring-cloud-api-gateway/';
    else if (title.includes('Feign')) link = 'https://www.geeksforgeeks.org/spring-cloud-declarative-rest-client-using-feign-client/';
    else if (title.includes('Circuit Breaker')) link = 'https://www.geeksforgeeks.org/spring-boot-resilience4j-circuit-breaker/';
    else if (title.includes('Config Server')) link = 'https://www.geeksforgeeks.org/spring-cloud-config-server-and-config-client/';
    else if (title.includes('Saga')) link = 'https://www.geeksforgeeks.org/saga-design-pattern-in-microservices/';
    else if (title.includes('Docker')) link = 'https://www.geeksforgeeks.org/containerizing-spring-boot-application-using-docker/';
    else link = 'https://www.geeksforgeeks.org/spring-boot-microservices-tutorial/';
  }

  return { id, title, difficulty, link };
});

export default function SpringBootQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/backend"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Backend Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Spring Boot Roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              IoC, dependency injection, AOP, Spring Data JPA, security filters, and microservices cloud patterns.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={springQuestions}
          storagePrefix="backend-springboot"
          searchPlaceholder="Search Spring Boot topics..."
        />
      </div>
    </div>
  );
}
