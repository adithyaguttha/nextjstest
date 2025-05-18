'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = (path: string) => 
    `text-gray-300 hover:bg-[#033b7d] hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path ? 'bg-[#033b7d] text-white' : ''
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#044ca3] to-[#0366d6] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/logo.png"
                alt="Knock Knock Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="text-white text-xl font-bold">KNOCK KNOCK</div>
            </Link>
          </div>

          {/* Mobile Profile Section */}
          <div className="md:hidden flex items-center">
            {user ? (
              <div className="relative">
                <ProfileDropdown user={user} onSignOut={signOut} />
              </div>
            ) : (
              <Link
                href="/auth?tab=login"
                className="p-2 rounded-full text-blue-100 hover:text-white hover:bg-[#033b7d] focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>

          {/* Search Bar - Shows on scroll */}
          <div className={`hidden md:flex flex-1 max-w-md mx-8 transition-all duration-300 ease-in-out transform ${
            isScrolled 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full px-4 py-2 text-sm bg-white/10 text-white placeholder-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/20 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-[#033b7d] focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={navLinkClass('/')}
            >
              Home
            </Link>
            <Link
              href="/listings"
              className={navLinkClass('/listings')}
            >
              Listings
            </Link>
            <div className="ml-4 flex space-x-3">
              {user ? (
                <ProfileDropdown user={user} onSignOut={signOut} />
              ) : (
                <>
                  <Link
                    href="/auth?tab=login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-[#033b7d] hover:text-white transition-colors border border-blue-100 hover:border-[#033b7d]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth?tab=signup"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-white text-[#044ca3] hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Mobile Search Bar - Always visible */}
            <div className="px-4 pt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-900 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#044ca3] focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 px-4 pt-4 pb-3 space-y-1 overflow-y-auto">
              <Link
                href="/"
                className={navLinkClass('/')}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/listings"
                className={navLinkClass('/listings')}
                onClick={() => setIsOpen(false)}
              >
                Listings
              </Link>
            </div>

            {/* Mobile Auth Buttons - Only show if user is not authenticated */}
            {!user && (
              <div className="px-4 py-4 border-t border-gray-200">
                <Link
                  href="/auth?tab=login"
                  className="block w-full px-4 py-2 mb-3 rounded-md text-sm font-medium text-[#044ca3] hover:bg-blue-50 transition-colors border border-[#044ca3] text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth?tab=signup"
                  className="block w-full px-4 py-2 rounded-md text-sm font-medium bg-[#044ca3] text-white hover:bg-[#033b7d] transition-colors shadow-sm hover:shadow text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}