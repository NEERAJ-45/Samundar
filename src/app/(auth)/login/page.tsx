'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Cpu, ShieldAlert, Lock, ArrowLeft, Eye, EyeOff, Mail, Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';

function DecryptedText({ text, delay = 100 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*';
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      let iterations = 0;
      const interval = setInterval(() => {
        if (!active) return;
        setDisplayText(
          text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        if (iterations >= text.length) clearInterval(interval);
        iterations += 0.5;
      }, 25);
    }, delay);
    return () => { active = false; clearTimeout(timeout); };
  }, [text, delay]);
  return <span>{displayText || text}</span>;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/command-center';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password) { setError('Password is required.'); return; }
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error === 'LOCKED') {
      setError('Account locked — too many failed attempts. Wait 15 minutes and try again.');
      toast({ variant: 'destructive', title: 'Account locked', description: 'Too many failed attempts. Wait 15 minutes.' });
    } else if (result?.error) {
      setError('Invalid email or password.');
      toast({ variant: 'destructive', title: 'Sign in failed', description: 'Invalid email or password.' });
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !pinInput || !newPassword) {
      setError('All fields are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), pin: pinInput, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Reset failed.');
        return;
      }

      const signInResult = await signIn('credentials', {
        email: email.trim(),
        password: newPassword,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push(callbackUrl);
      } else {
        setError('Password reset, but sign-in failed. Please log in manually.');
        toast({ variant: 'destructive', title: 'Sign-in failed', description: 'Password was reset. Please log in manually.' });
        setResetMode(false);
        setPassword('');
        setPinInput('');
        setNewPassword('');
      }
    } catch {
      setError('Server error. Try again.');
      toast({ variant: 'destructive', title: 'Server error', description: 'Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const title = resetMode ? 'RESET PASSWORD' : 'SIGN IN';
  const subtitle = resetMode
    ? 'Enter your reset PIN and a new password.'
    : 'Enter your credentials to access your workspace.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-full max-w-lg my-8"
    >
      <div className="relative border border-zinc-800 bg-zinc-950 p-8 md:p-10 rounded-2xl shadow-xl overflow-hidden">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4"
          >
            <Monitor className="h-5 w-5 text-indigo-400" />
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            <DecryptedText text={title} delay={50} />
          </h1>
          <p className="text-xs text-zinc-400 mt-2.5 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-400 flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {resetMode ? (
          /* ── Reset Password ──────────────────────────────────── */
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="user@domain.com"
                  className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Reset PIN <span className="text-red-500">*</span></label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setError(''); }}
                placeholder="4-6 digit PIN"
                className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20 tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">New Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                />
                <button type="button" onClick={() => setShowNewPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300">
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setResetMode(false); setError(''); }}
                className="flex-1 border border-zinc-800 hover:bg-zinc-900/60 text-zinc-300 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </form>
        ) : (
          /* ── Sign In ─────────────────────────────────────────── */
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="user@domain.com"
                  className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-zinc-500 mt-4">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Register here</a>
            </p>
          </form>
        )}
      </div>
    </motion.div>
  );
}
