import { NextRequest, NextResponse } from 'next/server'

const ORACLE_URL = process.env.ORACLE_URL || 'http://localhost:47778'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = req.nextUrl.searchParams.toString()
  const url = `${ORACLE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`

  try {
    const res = await fetch(url, { next: { revalidate: 0 } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Oracle offline' }, { status: 503 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `${ORACLE_URL}/api/${path}`
  const body = await req.json()

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Oracle offline' }, { status: 503 })
  }
}
