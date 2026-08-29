import Link from 'next/link'
import { PRIDE_INDEX_PATH } from '@/lib/pride-paths'

export default function PublicProfileNotFound() {
    return (
        <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Profile not found</h1>
            <p className="text-sm font-medium text-slate-500">
                This profile is private or doesn&apos;t exist.
            </p>
            <Link href={PRIDE_INDEX_PATH} className="inline-block text-sm font-extrabold text-[#1CB0F6]">
                Back to Pride
            </Link>
        </div>
    )
}
