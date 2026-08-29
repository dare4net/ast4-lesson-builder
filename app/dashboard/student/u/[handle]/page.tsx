import { PublicProfileView } from '@/components/pride/public-profile'

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ handle: string }>
}) {
    const { handle: raw } = await params
    const handle = String(raw || '').trim().toLowerCase()
    return <PublicProfileView handle={handle} />
}
