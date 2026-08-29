import { redirect } from 'next/navigation'
import { publicProfilePath } from '@/lib/pride-paths'

export default async function LegacyPublicProfile({
    params,
}: {
    params: Promise<{ handle: string }>
}) {
    const { handle } = await params
    redirect(publicProfilePath(String(handle || '')))
}
