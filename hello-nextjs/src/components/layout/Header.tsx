'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/create', label: '创建项目' },
    { href: '/projects', label: '我的项目' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Spring FES Video
          </Link>

          {!isAuthPage && (
            <>
              <nav className="hidden md:flex items-center gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <LogoutButton />
              </nav>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </>
          )}

          {isAuthPage && (
            <nav className="flex items-center gap-4">
              <LogoutButton />
            </nav>
          )}
        </div>

        {mobileMenuOpen && !isAuthPage && (
          <nav className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <LogoutButton />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
