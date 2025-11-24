// src/components/layout/AppContent.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  return (
    <AuthProvider>
      <div>
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}