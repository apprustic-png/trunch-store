'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, LogOut, ShieldCheck, Menu, Sparkles } from 'lucide-react';

export default function Header() {
  const { user, activeOrdersCount, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-50" style={{ boxShadow: '0 2px 20px rgba(196, 85, 115, 0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #c45573, #d4a853)' }} />
            <span className="relative font-serif text-xl font-bold text-white z-10">T</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-wider" style={{ color: '#2d2520' }}>
                TRUNCH
              </span>
              <span className="font-serif text-2xl font-light tracking-widest" style={{ color: '#c45573' }}>
                STORE
              </span>
            </div>
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase" style={{ color: '#b8a09a' }}>
              HAUTE COUTURE
            </p>
          </div>
        </Link>

        {/* Right Navigation */}
        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Client Button with Badge */}
              <Link
                href="/client"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: '#fdf3f6',
                  border: '1.5px solid #f4b8c8',
                  color: '#c45573',
                }}
              >
                <UserIcon className="w-4 h-4" />
                <span>Area Saya</span>
                {activeOrdersCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white rounded-full flex items-center justify-center shadow-md"
                    style={{ background: 'linear-gradient(135deg, #c45573, #e8839a)' }}
                  >
                    {activeOrdersCount}
                  </span>
                )}
              </Link>

              {/* Admin Link */}
              {user.email === 'apprustic@gmail.com' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition"
                  style={{
                    background: '#fff8ec',
                    border: '1.5px solid #d4a853',
                    color: '#b8860b',
                  }}
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={signOut}
                className="p-2.5 rounded-full transition"
                style={{ color: '#b8a09a' }}
                onMouseOver={e => (e.currentTarget.style.background = '#fdf3f6')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
