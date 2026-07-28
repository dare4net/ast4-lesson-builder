'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioProgramsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/studio');
    }, [router]);

    return null;
}
