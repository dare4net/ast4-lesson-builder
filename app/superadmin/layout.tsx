import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Platform Console',
    robots: { index: false, follow: false },
};

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
