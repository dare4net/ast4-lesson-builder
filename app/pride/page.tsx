import { redirect } from 'next/navigation'
import { PRIDE_INDEX_PATH } from '@/lib/pride-paths'

export default function LegacyPrideIndex() {
    redirect(PRIDE_INDEX_PATH)
}
