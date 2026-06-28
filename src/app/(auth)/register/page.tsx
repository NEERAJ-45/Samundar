'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Monitor, Cpu, ShieldAlert, Lock, User, Eye, EyeOff, CheckCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';

const ROLES = [
  'Fullstack Engineer',
  'Backend Specialist',
  'Frontend Architect',
  'DevOps & Cloud Engineer',
  'Computer Science Student',
];

function DecryptedText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*';
  useEffect(() => {
    let active = true;
    let iter = 0;
    const interval = setInterval(() => {
      if (!active) return;
      setDisplayText(text.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iter >= text.length) clearInterval(interval);
      iter += 0.5;
    }, 25);
    return () => { active = false; clearInterval(interval); };
  }, [text]);
  return <span>{displayText || text}</span>;
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillEmail = params.get('email') || '';

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState(prefillEmail);
  const [role,         setRole]         = useState(ROLES[0]);
  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [resetPin,     setResetPin]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [done,         setDone]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm)          { setError('Passwords do not match.'); return; }
    if (password.length < 6)           { setError('Password must be at least 6 characters.'); return; }
    if (resetPin && !/^\d{4,8}$/.test(resetPin)) { setError('Reset PIN must be 4-8 digits.'); return; }

    setIsLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, name, role, password, resetPin: resetPin || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        toast({ variant: 'destructive', title: 'Registration failed', description: data.error || 'Please try again.' });
        return;
      }

      // Auto sign-in
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Account created but sign-in failed. Please go to /login.');
        toast({ variant: 'destructive', title: 'Sign-in failed', description: 'Account created. Please log in manually.' });
        return;
      }

      setDone(true);
      toast({ title: 'Account created', description: 'Welcome to ProdigyOS!' });
      setTimeout(() => router.push('/'), 1200);
    } catch {
      setError('Server error. Please try again.');
      toast({ variant: 'destructive', title: 'Server error', description: 'Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-full max-w-lg my-8"
    >
      <div className="relative border border-zinc-800 bg-zinc-950 p-6 md:p-10 rounded-2xl shadow-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4"
          >
            <Monitor className="h-5 w-5 text-indigo-400" />
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            <DecryptedText text={done ? 'WELCOME ABOARD' : 'CREATE ACCOUNT'} />
          </h1>
          <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
            {done ? 'Redirecting to your dashboard…' : 'Register your ProdigyOS workspace.'}
          </p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
            <p className="text-sm text-zinc-300 font-medium">Account created successfully!</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Display Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Neeraj"
                      className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none cursor-pointer transition-all focus:ring-1 focus:ring-indigo-500/20"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-sm font-semibold">@</span>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Confirm <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="register-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter"
                      className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Reset PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Reset PIN <span className="text-zinc-500 font-normal">(optional but recommended — 4–8 digits)</span>
                </label>
                <input
                  id="register-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 8421"
                  className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 tracking-widest focus:ring-1 focus:ring-indigo-500/20"
                />
                <p className="text-[11px] text-zinc-600">This PIN lets you reset your password without email. Save it somewhere safe.</p>
              </div>

              <div className="pt-1">
                <button
                  id="register-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isLoading ? <Cpu className="h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Creating Account…' : 'Get Started'}
                </button>
              </div>

              <p className="text-center text-xs text-zinc-500">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Sign in</a>
              </p>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
