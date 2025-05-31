'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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

          {/* Hamburger Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-[#033b7d] focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 bg-white">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-xl font-bold text-gray-900">Menu</SheetTitle>
                </SheetHeader>
                
                {/* Mobile Navigation Links */}
                <div className="flex-1 p-4">
                  <div className="flex flex-col space-y-1">
                    <Link
                      href="/"
                      className="px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-[#044ca3] rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/listings"
                      className="px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-[#044ca3] rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Listings
                    </Link>
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                {!user && (
                  <div className="p-4 border-t border-gray-200">
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
              </SheetContent>
            </Sheet>
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
    </nav>
  );
}