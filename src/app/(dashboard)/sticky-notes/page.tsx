'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { LazyAppear } from "@/components/shared/LazyAppear";
import { useProfile } from "@/components/providers/ProfileProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/toast";
import {
  StickyNote,
  Plus,
  Trash2,
} from "lucide-react";

interface StickyNoteItem {
  id: string;
  text: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
}

const colorStyles = {
  yellow: {
    bg: 'bg-amber-100/95 border-amber-200 text-amber-950 placeholder:text-amber-800/40',
    border: 'border-t-amber-300',
    dot: 'bg-amber-400',
    input: 'text-amber-900',
    btn: 'text-amber-800 hover:bg-amber-200/40'
  },
  blue: {
    bg: 'bg-sky-100/95 border-sky-200 text-sky-950 placeholder:text-sky-800/40',
    border: 'border-t-sky-300',
    dot: 'bg-sky-400',
    input: 'text-sky-900',
    btn: 'text-sky-800 hover:bg-sky-200/40'
  },
  green: {
    bg: 'bg-emerald-100/95 border-emerald-200 text-emerald-950 placeholder:text-emerald-800/40',
    border: 'border-t-emerald-300',
    dot: 'bg-emerald-400',
    input: 'text-emerald-900',
    btn: 'text-emerald-800 hover:bg-emerald-200/40'
  },
  pink: {
    bg: 'bg-pink-100/95 border-pink-200 text-pink-950 placeholder:text-pink-800/40',
    border: 'border-t-pink-300',
    dot: 'bg-pink-400',
    input: 'text-pink-900',
    btn: 'text-pink-800 hover:bg-pink-200/40'
  }
};

export default function StickyNotesPage() {
  const { userEmail, customDbUrl } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch sticky notes from MongoDB on load
  useEffect(() => {
    if (!mounted) return;
    async function loadStickyNotes() {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        };
        if (customDbUrl) {
          headers['x-mongodb-url'] = customDbUrl;
        }
        const res = await fetch(`/api/db/notes?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const resData = await res.json();
        if (resData.dbConnected && resData.data) {
          setDbConnected(true);
          const list = resData.data.filter((item: any) => item.storagePrefix === 'command-center-sticky');
          const parsed = list.map((item: any) => {
            let text = item.note;
            let color: 'yellow' | 'blue' | 'green' | 'pink' = 'yellow';
            if (item.note.startsWith('{')) {
              try {
                const parsedNote = JSON.parse(item.note);
                text = parsedNote.text;
                color = parsedNote.color || 'yellow';
              } catch {}
            }
            return { id: item.itemId, text, color };
          });
          setStickyNotes(parsed);
        }
      } catch (err) {
        console.error('Failed to load sticky notes:', err);
        toast({ variant: 'destructive', title: 'Failed to load sticky notes' });
      }
    }
    loadStickyNotes();
  }, [mounted, userEmail, customDbUrl]);

  // Helper to save sticky notes to database
  const saveStickyToDB = useCallback((id: string, text: string, color: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) {
      headers['x-mongodb-url'] = customDbUrl;
    }
    fetch('/api/db/notes', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storagePrefix: 'command-center-sticky',
        itemId: id,
        note: JSON.stringify({ text, color }),
        userEmail,
      }),
    }).catch(() => { toast({ variant: 'destructive', title: 'Failed to save sticky note' }); });
  }, [userEmail, customDbUrl]);

  // Add a new sticky note
  const addStickyNote = () => {
    const newId = String(Date.now());
    const newNote: StickyNoteItem = { id: newId, text: '', color: 'yellow' };
    setStickyNotes((prev) => [newNote, ...prev]);
    saveStickyToDB(newId, '', 'yellow');
  };

  // Update text
  const handleTextChange = (id: string, newText: string, color: 'yellow' | 'blue' | 'green' | 'pink') => {
    setStickyNotes((prev) => prev.map(n => n.id === id ? { ...n, text: newText } : n));
    saveStickyToDB(id, newText, color);
  };

  // Change color
  const handleColorChange = (id: string, text: string, newColor: 'yellow' | 'blue' | 'green' | 'pink') => {
    setStickyNotes((prev) => prev.map(n => n.id === id ? { ...n, color: newColor } : n));
    saveStickyToDB(id, text, newColor);
  };

  // Delete sticky note
  const deleteStickyNote = (id: string) => {
    setStickyNotes((prev) => prev.filter(n => n.id !== id));
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) {
      headers['x-mongodb-url'] = customDbUrl;
    }
    fetch('/api/db/notes', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storagePrefix: 'command-center-sticky',
        itemId: id,
        note: '', // triggers deletion
        userEmail,
      }),
    }).catch(() => { toast({ variant: 'destructive', title: 'Failed to delete sticky note' }); });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 space-y-8 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Digital Sticky Note Wall Header */}
        <LazyAppear>
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-200 flex items-center gap-2">
                <StickyNote className="h-6 w-6 text-amber-500" />
                Engineering Sticky Notes Wall
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Jot down task lists, API routes, SQL tables or reminders. Drag elastic notes anywhere on the whiteboard!
              </p>
            </div>
            <button
              onClick={addStickyNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-amber-950 transition-all cursor-pointer shadow shadow-amber-900/10"
            >
              <Plus size={15} />
              New Note
            </button>
          </div>
        </LazyAppear>

        {/* Notes Grid Display */}
        <LazyAppear delay={0.1}>
          {mounted && stickyNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/10 text-center my-8">
              <StickyNote className="h-10 w-10 text-zinc-600 mb-3 animate-bounce" />
              <p className="text-sm text-zinc-500">Your sticky note whiteboard is empty.</p>
              <button
                onClick={addStickyNote}
                className="mt-3 text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Create your first sticky note
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-2"
            >
              <AnimatePresence mode="popLayout">
                {mounted && stickyNotes.map((note, idx) => {
                  const style = colorStyles[note.color] || colorStyles.yellow;
                  const tilts = ['rotate-1', 'rotate-[-1deg]', 'rotate-[2deg]', 'rotate-[-2deg]'];
                  const tiltClass = tilts[idx % tilts.length];

                  return (
                    <motion.div
                      layout
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.8, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 15 }}
                      transition={{ type: "spring", stiffness: 150, damping: 15 }}
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.06}
                      whileDrag={{ scale: 1.05, rotate: 0, zIndex: 10, boxShadow: "0px 15px 30px rgba(0,0,0,0.5)" }}
                      className={cn(
                        "flex flex-col justify-between p-5 min-h-[220px] shadow-lg relative select-none overflow-hidden rounded-none border-t-[10px] transition-all cursor-grab active:cursor-grabbing",
                        style.bg,
                        style.border,
                        tiltClass
                      )}
                    >
                      {/* Paper shadow fold accent */}
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-black/5 rounded-tl-lg shadow-inner border-l border-t border-black/10 pointer-events-none" />
                      
                      {/* Content text-area */}
                      <textarea
                        value={note.text}
                        onChange={(e) => handleTextChange(note.id, e.target.value, note.color)}
                        placeholder="Write something down..."
                        className={cn(
                          "w-full min-h-[130px] bg-transparent border-none p-0 text-xl placeholder:text-black/35 outline-none focus:outline-none resize-none font-handwritten leading-relaxed select-text cursor-text",
                          style.input
                        )}
                      />

                      {/* Sticky Footer controls */}
                      <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-2">
                        {/* Interactive Color Switcher Dot Palette */}
                        <div className="flex items-center gap-1.5">
                          {(['yellow', 'blue', 'green', 'pink'] as const).map((colorOpt) => (
                            <button
                              key={colorOpt}
                              onClick={() => handleColorChange(note.id, note.text, colorOpt)}
                              className={cn(
                                "w-3 h-3 rounded-full border border-black/10 transition-transform hover:scale-125 cursor-pointer",
                                colorOpt === 'yellow' && 'bg-amber-400',
                                colorOpt === 'blue' && 'bg-sky-400',
                                colorOpt === 'green' && 'bg-emerald-400',
                                colorOpt === 'pink' && 'bg-pink-400',
                                note.color === colorOpt && 'scale-125 ring-1 ring-black/40'
                              )}
                              title={`Switch to ${colorOpt}`}
                            />
                          ))}
                        </div>

                        {/* Trash Delete Action */}
                        <button
                          onClick={() => deleteStickyNote(note.id)}
                          className={cn(
                            "p-1 rounded transition-colors cursor-pointer",
                            style.btn
                          )}
                          title="Remove note"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </LazyAppear>
      </div>
    </div>
  );
}
