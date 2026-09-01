import { describe, expect, it } from 'vitest'
import {
    mapSuperadminOrgError,
    orgStatusTone,
} from '../lib/superadmin-org-errors'

describe('superadmin org errors', () => {
    it('maps seat cap and suspended codes to operator-friendly copy', () => {
        expect(
            mapSuperadminOrgError(
                { response: { data: { code: 'seat_cap', error: 'Org seat cap reached' } } },
                'fallback',
            ),
        ).toContain('seat cap')

        expect(
            mapSuperadminOrgError(
                { response: { data: { code: 'org_suspended', error: 'Org is suspended' } } },
                'fallback',
            ),
        ).toContain('suspended')
    })

    it('falls back to API message or default', () => {
        expect(
            mapSuperadminOrgError({ response: { data: { error: 'Custom message' } } }, 'fallback'),
        ).toBe('Custom message')
        expect(mapSuperadminOrgError({}, 'fallback')).toBe('fallback')
    })

    it('styles org status badges', () => {
        expect(orgStatusTone('suspended')).toContain('red')
        expect(orgStatusTone('active')).toContain('emerald')
    })
})
