"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SplashScreen } from '@/components/splash-screen';
import { AnimatePresence } from 'framer-motion';
import { IdentitySelection } from '@/components/identity-selection';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showIdentitySelection, setShowIdentitySelection] = useState(false);

  const handleSplashFinished = () => {
    if (isAuthenticated) {
      router.push(user?.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student');
    } else {
      setShowSplash(false);
      setShowIdentitySelection(true);
    }
  };

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" onFinished={handleSplashFinished} isLoading={loading} />
      </AnimatePresence>
    );
  }

  if (showIdentitySelection) {
    return <IdentitySelection />;
  }

  return null;
}
