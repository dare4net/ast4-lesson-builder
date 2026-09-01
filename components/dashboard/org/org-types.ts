export type StaffOrg = {
    org: {
        id: string
        name: string
        slug: string
        status: string
        seatCap: number
        seatsUsed: number
        seatsRemaining: number
    }
    membership: {
        role: string
        status: string
    }
}

export type MemberRow = {
    id: string
    userId: string
    role: string
    status: string
    inviteEmail?: string | null
    inviteToken?: string | null
}

export type CohortRow = {
    id: string
    name: string
    joinCode: string
    status: string
    memberCount: number
    programIds?: string[]
}

export type OrgProgramRow = {
    _id: string
    name: string
    is_published?: boolean
}
