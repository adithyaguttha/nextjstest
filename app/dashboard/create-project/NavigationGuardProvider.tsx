'use client';
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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
  const unblockRef = useRef<(() => void) | null>(null);

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

  useEffect(() => {
    if (!ctx) return;
    const handleClick = (e: any) => {
      if (
        shouldBlock &&
        e.target.tagName === 'A' &&
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
    document.addEventListener('click', handleClick, true);

    // Handle browser back/forward (popstate)
    const handlePopState = (e: PopStateEvent) => {
      if (shouldBlock) {
        // Block popstate navigation and show modal
        e.preventDefault?.();
        blockPopRef.current = true;
        ctx.openModal(document.referrer || '/');
        // Push the current path back to history so the URL doesn't change
        window.history.pushState(null, '', lastPathRef.current);
      }
    };
    window.addEventListener('popstate', handlePopState);
    lastPathRef.current = pathname;

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, pathname, ctx]);

  // When user confirms navigation after popstate, go back
  useEffect(() => {
    if (ctx?.pendingHref && blockPopRef.current) {
      blockPopRef.current = false;
      window.history.back();
    }
  }, [ctx?.pendingHref]);
} 