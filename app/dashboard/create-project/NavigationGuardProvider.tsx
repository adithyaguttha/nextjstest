'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationGuardContextType {
  showModal: boolean;
  openModal: (nextHref: string) => void;
  closeModal: () => void;
  confirmNavigation: () => void;
  pendingHref: string | null;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const openModal = (nextHref: string) => {
    setShowModal(true);
    setPendingHref(nextHref);
  };
  const closeModal = () => {
    setShowModal(false);
    setPendingHref(null);
  };
  const confirmNavigation = () => {
    setShowModal(false);
    if (pendingHref) {
      window.location.href = pendingHref;
    }
    setPendingHref(null);
  };

  return (
    <NavigationGuardContext.Provider value={{ showModal, openModal, closeModal, confirmNavigation, pendingHref }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
            <p className="mb-4 text-gray-700">You have unsaved changes. Are you sure you want to leave this page? All form data will be lost.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={closeModal}
              >
                Stay
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={confirmNavigation}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard(shouldBlock: boolean) {
  const pathname = usePathname();
  const ctx = useContext(NavigationGuardContext);
  const lastPathRef = React.useRef(pathname);
  const blockPopRef = React.useRef(false);
  const isHandlingPopStateRef = React.useRef(false);

  // Update lastPathRef without triggering re-renders
  useEffect(() => {
    lastPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!ctx) return;

    const handleClick = (e: unknown) => {
      if (
        shouldBlock &&
        e instanceof MouseEvent &&
        e.target instanceof HTMLAnchorElement &&
        e.target.href &&
        !e.target.target &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        const isInternal = e.target.href.startsWith(window.location.origin);
        if (isInternal && e.target.pathname !== pathname) {
          e.preventDefault();
          e.stopPropagation();
          ctx.openModal(e.target.href);
        }
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      // Prevent multiple handlers from running simultaneously
      if (isHandlingPopStateRef.current) return;
      
      if (shouldBlock && !blockPopRef.current) {
        isHandlingPopStateRef.current = true;
        
        // Block popstate navigation and show modal
        e.preventDefault?.();
        blockPopRef.current = true;
        
        // Use setTimeout to break the synchronous update cycle
        setTimeout(() => {
          ctx.openModal(document.referrer || '/');
          // Use replaceState to avoid triggering another popstate
          window.history.replaceState(null, '', lastPathRef.current);
          isHandlingPopStateRef.current = false;
        }, 0);
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, ctx, pathname]);

  // When user confirms navigation after popstate, go back
  useEffect(() => {
    if (ctx?.pendingHref && blockPopRef.current) {
      blockPopRef.current = false;
      // Use setTimeout to break the synchronous update cycle
      setTimeout(() => {
        window.history.back();
      }, 0);
    }
  }, [ctx?.pendingHref]);
} 