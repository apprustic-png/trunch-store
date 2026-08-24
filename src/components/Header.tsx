'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { user, activeOrdersCount, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-noir-900/90 border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-noir-900 rounded-full flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-amber-300">T</span>
            </div>
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-wider bg-gradient-to-r from-zinc-100 via-amber-100 to-zinc-300 bg-clip-text text-transparent">
              TRUNCH
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-sans">
              HAUTE COUTURE
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Client Button with Processing Badge */}
              <Link
                href="/client"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-sm font-medium transition-all shadow-sm hover:shadow-brand-500/10"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>Client</span>

                {activeOrdersCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-rose-500 rounded-full shadow-md animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </Link>

              {/* Admin shortcut if logged in as admin */}
              {user.email === 'apprustic@gmail.com' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={signOut}
                className="p-2 text-zinc-400 hover:text-zinc-200 transition rounded-full hover:bg-zinc-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-brand-600 text-white text-sm font-semibold shadow-lg hover:brightness-110 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
