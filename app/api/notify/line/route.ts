import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, token } = await req.json()
    const lineToken = token || process.env.LINE_NOTIFY_TOKEN

    if (!lineToken) {
      return NextResponse.json({ error: 'ไม่มี LINE_NOTIFY_TOKEN' }, { status: 400 })
    }

    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lineToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message: `\n🦞 OpenClaw Alert\n${message}` }),
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    } else {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
