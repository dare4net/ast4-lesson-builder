import Link from 'next/link'

export default function PublicProfileNotFound() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-16">
            <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-3">
                <h1 className="text-2xl font-extrabold text-slate-800">Profile not found</h1>
                <p className="text-sm font-medium text-slate-500">
                    This profile is private or doesn&apos;t exist.
                </p>
                <Link href="/" className="inline-block text-sm font-extrabold text-[#1CB0F6]">
                    Back home
                </Link>
            </div>
        </main>
    )
}
