import { redirect } from 'next/navigation'
import { prideBoardPath } from '@/lib/pride-paths'

export default async function LegacyPrideBoard({
    params,
}: {
    params: Promise<{ statKey: string }>
}) {
    const { statKey } = await params
    redirect(prideBoardPath(decodeURIComponent(String(statKey || ''))))
}
