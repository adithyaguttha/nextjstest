'use client';

import { Toaster } from 'react-hot-toast';

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          marginTop: '4rem', // Add margin to position below navbar
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        },
      }}
    />
  );
} 