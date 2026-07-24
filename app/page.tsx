"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SplashScreen } from '@/components/splash-screen';
import { AnimatePresence } from 'framer-motion';
import { IdentitySelection } from '@/components/identity-selection';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showIdentitySelection, setShowIdentitySelection] = useState(false);

  const handleSplashFinished = () => {
    if (isAuthenticated) {
      router.push('/studio/programs');
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
