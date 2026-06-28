'use client';

import { motion } from 'framer-motion';
import {
  Target, Quote, Heart, MapPin, Award, TrendingUp,
  ChevronRight, Brain, Zap, BookOpen, Star, Sparkles, Rocket,
  Clock, CircleDot, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mission = {
  title: 'Become a World-Class Software Engineer',
  description:
    'Master the fundamentals, build at scale, and contribute to systems that impact millions. Continuously push the boundaries of what I can build and understand, while mentoring the next generation of engineers.',
};

const targetCompanies = [
  { name: 'Google', level: 'L4 \u2014 Senior SWE', icon: 'G', accent: 'text-blue-400' },
  { name: 'Microsoft', level: 'Senior SWE', icon: 'M', accent: 'text-emerald-400' },
  { name: 'DE Shaw', level: 'Tech Lead', icon: 'D', accent: 'text-purple-400' },
  { name: 'Stripe', level: 'Staff SWE', icon: 'S', accent: 'text-amber-400' },
];

const milestones = [
  { year: 'Year 1', title: 'Master DSA & System Design', desc: '200+ LeetCode, design 10+ systems', status: 'in-progress' },
  { year: 'Year 2', title: 'Deep dive into Distributed Systems', desc: 'Build a distributed KV store, MIT 6.824', status: 'upcoming' },
  { year: 'Year 3', title: 'Ship Production Systems', desc: 'Lead end-to-end, own infra', status: 'upcoming' },
  { year: 'Year 5', title: 'Senior Engineer', desc: 'Architect, mentor, drive strategy', status: 'upcoming' },
  { year: 'Year 10', title: 'Staff / Principal Engineer', desc: 'Org-wide impact, industry recognition', status: 'upcoming' },
];

const goals = {
  five: {
    title: '5-Year Goal',
    subtitle: 'Senior Engineer at a Top Tech Company',
    points: [
      'Master distributed systems & large-scale architecture',
      'Ship products used by millions of users',
      'Mentor 3+ junior engineers to their next level',
      'Contribute to open-source projects meaningfully',
      'Build a strong technical writing & speaking portfolio',
    ],
  },
  ten: {
    title: '10-Year Goal',
    subtitle: 'Staff/Principal or Distinguished Engineer',
    points: [
      'Define technical strategy for a major org',
      'Recognized expert in Distributed Systems / Infra',
      'Author influential talks, papers, or blog posts',
      'Build and lead high-performing teams',
      'Drive industry-level change through systems',
    ],
  },
};

const philosophy = {
  quote:
    'Software engineering is not about knowing all the answers \u2014 it\u2019s about having the intellectual honesty to ask the right questions, the discipline to build robust systems, and the humility to keep learning every single day.',
};

const principles = [
  { text: 'First Principles Thinking', icon: Brain },
  { text: 'Write Code, Ship Code', icon: Zap },
  { text: 'Fundamentals Over Frameworks', icon: BookOpen },
  { text: 'Measure What Matters', icon: TrendingUp },
  { text: 'Teach to Learn', icon: Heart },
  { text: 'Bias for Action', icon: Zap },
  { text: 'Own Your Outcomes', icon: Target },
  { text: 'Think in Systems', icon: Award },
];

const easeOut = [0.25, 0.4, 0.25, 1] as const;

const fadeUp = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: easeOut } },
});

export default function CareerPage() {
  return (
    <div className="space-y-12 md:space-y-16 p-4 md:p-8 lg:p-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex items-center gap-2 mb-3"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-[0.15em]">Career Path</span>
          <span className="text-zinc-700 mx-1">/</span>
          <span className="text-xs text-zinc-500">Vision</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: easeOut }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 leading-tight"
        >
          Career Mission Control
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-base text-zinc-500 mt-3 max-w-xl leading-relaxed"
        >
          The compass for your professional journey
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-wrap items-center gap-4 mt-6 text-xs text-zinc-600"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-blue-400/70" />
            Active since 2024
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-emerald-400/70" />
            10 year roadmap
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5">
            <CircleDot className="h-3 w-3 text-purple-400/70" />
            5 milestones
          </span>
        </motion.div>
      </motion.div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-3.5 w-3.5 text-blue-400" />
          <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Mission</h2>
        </div>
        <p className="text-lg md:text-xl text-zinc-200 leading-relaxed font-medium">
          {mission.title}
        </p>
        <p className="text-sm text-zinc-500 mt-3 leading-relaxed max-w-2xl">
          {mission.description}
        </p>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Target Companies</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          {targetCompanies.map((c, i) => (
            <motion.div
              key={c.name}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp(i)}
              className="flex items-center gap-3"
            >
              <span className={cn('text-lg font-bold w-6', c.accent)}>{c.icon}</span>
              <div>
                <p className="text-sm font-medium text-zinc-300">{c.name}</p>
                <p className="text-xs text-zinc-600">{c.level}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Milestones</h2>
        </div>
        <div className="space-y-0">
          {milestones.map((m, i) => {
            const isActive = m.status === 'in-progress';
            const isLast = i === milestones.length - 1;
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp(i)}
                className={cn(
                  'relative flex gap-5 py-4',
                  !isLast && 'border-b border-zinc-800/40',
                )}
              >
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'h-2.5 w-2.5 rounded-full mt-1.5',
                    isActive ? 'bg-blue-400' : 'bg-zinc-700',
                  )} />
                  {!isLast && <div className="w-px flex-1 bg-zinc-800/60 mt-1.5" />}
                </div>
                <div className="flex-1 pb-0.5">
                  <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                    <span className={cn(
                      'text-xs font-semibold',
                      isActive ? 'text-blue-400' : 'text-zinc-600',
                    )}>
                      {m.year}
                    </span>
                    <span className={cn(
                      'text-[10px] font-medium',
                      isActive ? 'text-blue-400/80' : 'text-zinc-600',
                    )}>
                      {isActive ? '\u2014 In Progress' : '\u2014 Planned'}
                    </span>
                  </div>
                  <p className={cn(
                    'text-sm',
                    isActive ? 'text-zinc-200 font-medium' : 'text-zinc-400',
                  )}>
                    {m.title}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">{m.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-3.5 w-3.5 text-emerald-400" />
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">5-Year Goal</h2>
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-4">{goals.five.subtitle}</p>
          <ul className="space-y-2.5">
            {goals.five.points.map((point, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp(i)}
                className="flex items-start gap-2.5 text-sm text-zinc-500"
              >
                <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400/70" />
                {point}
              </motion.li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-3.5 w-3.5 text-purple-400" />
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">10-Year Goal</h2>
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-4">{goals.ten.subtitle}</p>
          <ul className="space-y-2.5">
            {goals.ten.points.map((point, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp(i)}
                className="flex items-start gap-2.5 text-sm text-zinc-500"
              >
                <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-400/70" />
                {point}
              </motion.li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <Quote className="h-3.5 w-3.5 text-amber-400/70" />
          <h2 className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest">Philosophy</h2>
        </div>
        <div className="relative pl-6 border-l-2 border-amber-500/20">
          <span className="absolute -top-1 -left-1.5 text-3xl leading-none text-amber-500/20 font-serif select-none">&ldquo;</span>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed italic">
            {philosophy.quote}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <Heart className="h-3.5 w-3.5 text-zinc-500" />
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Core Principles</h2>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.text}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp(i)}
                className="flex items-center gap-2 text-sm text-zinc-400"
              >
                <Icon className="h-3.5 w-3.5 text-zinc-600" />
                {p.text}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}


