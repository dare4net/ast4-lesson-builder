import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface PollVoteRequest {
    lessonId: string
    componentId: string
    optionId: string
}

interface PollData {
    [componentId: string]: {
        votes: { [optionId: string]: number }
        totalVotes: number
    }
}

function getPollFilePath(lessonId: string): string {
    const dir = path.join(process.cwd(), 'data', 'polls')
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    return path.join(dir, `${lessonId}.json`)
}

function readPollData(lessonId: string): PollData {
    try {
        const filePath = getPollFilePath(lessonId)
        if (!fs.existsSync(filePath)) return {}
        const content = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(content) || {}
    } catch (err) {
        console.error(`[polls API] Read error for ${lessonId}:`, err)
        return {}
    }
}

function writePollData(lessonId: string, data: PollData): boolean {
    try {
        const filePath = getPollFilePath(lessonId)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (err) {
        console.error(`[polls API] Write error for ${lessonId}:`, err)
        return false
    }
}

/**
 * GET /api/polls?lessonId=...&componentId=...
 * Retrieves current vote totals for a poll component.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const lessonId = searchParams.get('lessonId') || 'default'
        const componentId = searchParams.get('componentId')

        if (!componentId) {
            return NextResponse.json({ error: 'componentId is required' }, { status: 400 })
        }

        const pollData = readPollData(lessonId)
        const componentPoll = pollData[componentId] || { votes: {}, totalVotes: 0 }

        return NextResponse.json({
            success: true,
            votes: componentPoll.votes,
            totalVotes: componentPoll.totalVotes
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to fetch poll results' }, { status: 500 })
    }
}

/**
 * POST /api/polls
 * Submits a vote for a poll option and returns updated aggregated results.
 */
export async function POST(req: NextRequest) {
    try {
        const body: PollVoteRequest = await req.json()
        const { lessonId = 'default', componentId, optionId } = body

        if (!componentId || !optionId) {
            return NextResponse.json({ error: 'componentId and optionId are required' }, { status: 400 })
        }

        const pollData = readPollData(lessonId)

        if (!pollData[componentId]) {
            pollData[componentId] = { votes: {}, totalVotes: 0 }
        }

        const componentPoll = pollData[componentId]
        componentPoll.votes[optionId] = (componentPoll.votes[optionId] || 0) + 1
        componentPoll.totalVotes = (componentPoll.totalVotes || 0) + 1

        writePollData(lessonId, pollData)

        return NextResponse.json({
            success: true,
            votes: componentPoll.votes,
            totalVotes: componentPoll.totalVotes
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to submit vote' }, { status: 500 })
    }
}
