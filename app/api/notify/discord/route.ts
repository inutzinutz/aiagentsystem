import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, webhookUrl } = await req.json()
    const url = webhookUrl || process.env.DISCORD_WEBHOOK_URL

    if (!url) {
      return NextResponse.json({ error: 'ไม่มี DISCORD_WEBHOOK_URL' }, { status: 400 })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🦞 OpenClaw Alert',
          description: message,
          color: 0x7c3aed,
          timestamp: new Date().toISOString(),
          footer: { text: 'OpenClaw Mission Control' },
        }],
      }),
    })

    if (res.ok || res.status === 204) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: await res.text() }, { status: res.status })
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
