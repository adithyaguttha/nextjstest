'use client';

import { useRouter } from 'next/navigation';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push('/auth?tab=login');
    onClose();
  };

  const handleSignup = () => {
    router.push('/auth?tab=signup');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-full max-w-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in to save properties
          </h3>
          <p className="text-gray-600 mb-6">
            Create an account or sign in to save properties and get personalized recommendations.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleSignup}
              className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 