"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Database, LogIn, Monitor, ShieldAlert, Cpu, CheckCircle2, ChevronRight, HelpCircle, User, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileData {
  email: string;
  name: string;
  role: string;
  goals?: string[];
  mongodbUrl?: string;
  password?: string;
}

interface ProfileContextType {
  userEmail: string;
  userName: string;
  userRole: string;
  customDbUrl: string;
  dbConnected: boolean;
  profile: ProfileData | null;
  loading: boolean;
  setProfileData: (data: ProfileData) => Promise<boolean>;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// React Bits style Decrypted Text effect
function DecryptedText({ text, speed = 25, delay = 350 }: { text: string; speed?: number; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*';

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      let iterations = 0;
      const interval = setInterval(() => {
        if (!active) return;
        
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iterations) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iterations >= text.length) {
          clearInterval(interval);
        }
        iterations += 1/2;
      }, speed);
    }, delay);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [text, speed, delay]);

  return <span>{displayText || text}</span>;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<number>(0);

  // Auth flow stages
  const [authStep, setAuthStep] = useState<'email' | 'login' | 'signup'>('email');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Profile fields state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Fullstack Engineer');
  const [passwordInput, setPasswordInput] = useState('');
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const logs = [
    "Initializing ProdigyOS v1.0.0...",
    "Core framework configurations verified. (NextJS 16.2.9 & React 19.2.4)",
    "Pinging MongoDB database connection client...",
    "Establishing user session parameters...",
    "Verifying profile configurations...",
  ];

  // Boot animation sequence
  useEffect(() => {
    if (!isBooting) return;

    const timer = setInterval(() => {
      if (currentLine < logs.length) {
        setBootLogs((prev) => [...prev, logs[currentLine]]);
        setCurrentLine((c) => c + 1);
        setBootProgress((p) => p + 20);
      } else {
        clearInterval(timer);
        
        // Check local storage for active profile
        const stored = localStorage.getItem('prodigy_user_profile');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setProfile(data);
            
            // Check connection to DB with the user's config
            checkDBConnection(data.mongodbUrl, data.email).then((connected) => {
              setDbConnected(connected);
              setBootLogs((prev) => [
                ...prev,
                connected 
                  ? `[ OK ] Connection established to MongoDB Atlas: ${data.email}` 
                  : `[ WARN ] MongoDB connection failed. Falling back to browser LocalStorage cache.`,
                "System startup complete. Launching dashboard..."
              ]);
              setBootProgress(100);
              
              setTimeout(() => {
                setIsBooting(false);
                setLoading(false);
              }, 800);
            });
          } catch {
            setLoading(false);
            setIsBooting(false);
          }
        } else {
          // If no profile, check default DB connection
          checkDBConnection('', '').then((connected) => {
            setDbConnected(connected);
            setBootLogs((prev) => [
              ...prev,
              connected 
                ? "[ OK ] Default database cluster connection established." 
                : "[ WARN ] Default MongoDB connection offline. Offline storage mode active.",
              "Prompting for user profile onboarding..."
            ]);
            setBootProgress(100);
            
            setTimeout(() => {
              setIsBooting(false);
              setLoading(false);
            }, 800);
          });
        }
      }
    }, 450);

    return () => clearInterval(timer);
  }, [currentLine, isBooting]);

  const checkDBConnection = async (mongodbUrl: string, email: string) => {
    try {
      const headers: Record<string, string> = {};
      if (mongodbUrl) headers['x-mongodb-url'] = mongodbUrl;
      if (email) headers['x-user-email'] = email;

      const res = await fetch(`/api/db/profile?email=${encodeURIComponent(email || 'test')}`, {
        headers
      });
      const data = await res.json();
      return !!data.dbConnected;
    } catch {
      return false;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    setIsCheckingEmail(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/db/profile?email=${encodeURIComponent(email)}&check=true`);
      const data = await res.json();
      return !!data.exists;
    } catch {
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const setProfileData = async (data: ProfileData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (data.mongodbUrl) {
        headers['x-mongodb-url'] = data.mongodbUrl;
      }

      // Save to MongoDB
      const res = await fetch('/api/db/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to authenticate profile.');
      }

      const profilePayload = resData.data;

      // Save to local storage
      localStorage.setItem('prodigy_user_profile', JSON.stringify(profilePayload));
      if (profilePayload.mongodbUrl) {
        localStorage.setItem('prodigy_mongodb_url', profilePayload.mongodbUrl);
      }
      
      setProfile(profilePayload);
      setDbConnected(resData.dbConnected ?? true);
      setIsBooting(false);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setSubmitError(err.message || 'Authentication failed.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('prodigy_user_profile');
    localStorage.removeItem('prodigy_mongodb_url');
    setProfile(null);
    setIsBooting(true);
    setBootLogs([]);
    setBootProgress(0);
    setCurrentLine(0);
    setAuthStep('email');
    setEmailInput('');
    setNameInput('');
    setPasswordInput('');
    setLoading(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setSubmitError('Email Address is required.');
      return;
    }
    const exists = await checkEmailExists(emailInput.trim());
    if (exists) {
      setAuthStep('login');
    } else {
      setAuthStep('signup');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setSubmitError('Password is required.');
      return;
    }

    if (authStep === 'login') {
      await setProfileData({
        email: emailInput.trim(),
        name: '',
        role: '',
        password: passwordInput
      });
    } else if (authStep === 'signup') {
      if (!nameInput.trim()) {
        setSubmitError('Display Name is required.');
        return;
      }
      await setProfileData({
        email: emailInput.trim(),
        name: nameInput.trim(),
        role: roleInput,
        password: passwordInput
      });
    }
  };

  const userEmail = profile?.email || 'NEERAJ';
  const userName = profile?.name || 'NEERAJ';
  const userRole = profile?.role || 'Engineer';
  const customDbUrl = profile?.mongodbUrl || '';

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <ProfileContext.Provider
      value={{
        userEmail,
        userName,
        userRole,
        customDbUrl,
        dbConnected,
        profile,
        loading,
        setProfileData,
        logout
      }}
    >
      {/* Booting Loading overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507] p-6 select-none"
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Pulsing ring indicator */}
              <div className="relative flex items-center justify-center w-20 h-20">
                {/* Rotating accent border */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-indigo-500/20 border-b-indigo-500/10 border-l-indigo-500/40"
                />
                {/* Glowing inner core */}
                <motion.div 
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30"
                >
                  <Cpu className="h-4.5 w-4.5 text-indigo-400" />
                </motion.div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold tracking-wider text-zinc-200">LAUNCHING PRODIGYOS</h3>
                <p className="text-[10px] tracking-widest text-indigo-405 font-bold uppercase">System Initializing • {bootProgress}%</p>
              </div>

              {/* Progress bar line */}
              <div className="h-[2px] w-48 bg-zinc-900 overflow-hidden rounded-full border border-zinc-900/60 relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full" 
                  style={{ width: `${bootProgress}%` }}
                  animate={{ width: `${bootProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Profile Creation Screen */}
      <AnimatePresence>
        {!isBooting && !profile && (
          <div className="fixed inset-0 z-45 flex items-center justify-center bg-[#07070a] p-6 select-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="w-full max-w-lg relative z-10 my-8"
            >
              {/* Card Container */}
              <div className="relative border border-zinc-800 bg-zinc-950 p-8 md:p-10 rounded-2xl shadow-xl overflow-hidden">
                <div className="text-center mb-8 relative z-10">
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring" }}
                    className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4"
                  >
                    <Monitor className="h-5.5 w-5.5 text-indigo-400" />
                  </motion.div>
                  
                  <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                    <DecryptedText text={authStep === 'login' ? "SIGN IN" : authStep === 'signup' ? "CREATE ACCOUNT" : "GET STARTED"} delay={100} />
                  </h1>
                  <p className="text-xs text-zinc-400 mt-2.5 max-w-sm mx-auto leading-relaxed">
                    {authStep === 'login' 
                      ? "Enter your profile credentials to access your study portal." 
                      : authStep === 'signup' 
                      ? "Configure details to register your new ProdigyOS account." 
                      : "Enter your email address to initialize or load your workspace."
                    }
                  </p>
                </div>

                {submitError && (
                  <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-400 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* STEP 1: Email Identification */}
                {authStep === 'email' && (
                  <form onSubmit={handleEmailSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-sm font-semibold select-none">
                          @
                        </span>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="user@domain.com"
                          className="relative w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/15"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckingEmail}
                      className="w-full bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl py-3 text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {isCheckingEmail ? 'Verifying Workspace...' : 'Continue'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {/* STEPS 2 & 3: Login or Signup Password Forms */}
                {authStep !== 'email' && (
                  <form onSubmit={handleAuthSubmit} className="space-y-5 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {authStep === 'signup' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                              Display Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 select-none">
                                <User className="h-4 w-4" />
                              </span>
                              <input
                                type="text"
                                required
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="e.g. Neeraj"
                                className="relative w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-205 outline-none transition-all placeholder:text-zinc-655 focus:ring-1 focus:ring-indigo-500/15"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300">Specialization Role</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 select-none">
                                <Cpu className="h-4 w-4" />
                              </span>
                              <select
                                value={roleInput}
                                onChange={(e) => setRoleInput(e.target.value)}
                                className="relative w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all cursor-pointer focus:ring-1 focus:ring-indigo-500/15"
                              >
                                <option value="Fullstack Engineer">Fullstack Engineer</option>
                                <option value="Backend Specialist">Backend Specialist</option>
                                <option value="Frontend Architect">Frontend Architect</option>
                                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                                <option value="Computer Science Student">Computer Science Student</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Password Input (Shared for both signup/login) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>{authStep === 'signup' ? 'Create Password' : 'Password'} <span className="text-red-500">*</span></span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 select-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="relative w-full bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500/15"
                        />
                      </div>
                    </div>

                    <div className="pt-2" />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('email');
                          setPasswordInput('');
                          setSubmitError('');
                        }}
                        className="flex-1 border border-zinc-800 hover:bg-zinc-900/60 text-zinc-300 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl py-3 text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <LogIn className="h-4 w-4" />
                        {isSubmitting 
                          ? (authStep === 'signup' ? 'Creating Account...' : 'Signing In...') 
                          : (authStep === 'signup' ? 'Get Started' : 'Sign In')
                        }
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Content */}
      {!isBooting && profile && children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
