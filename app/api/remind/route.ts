import nodemailer from "nodemailer"

export async function GET() {
  return send({})
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return send(body)
}

async function send({ streak, word }: { streak?: number; word?: string } = {}) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, REMINDER_TO } = process.env
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !REMINDER_TO) {
    return Response.json({ error: "Email env vars not configured" }, { status: 500 })
  }

  const subject = word
    ? `${word} — time to practice!`
    : "Time to practice Korean 🍜"

  const streakLine = streak && streak > 0
    ? `<p style="font-size:13px;color:#555;margin:0 0 20px">
        🔥 You're on a <strong>${streak}-day streak</strong>. Don't break it!
       </p>`
    : `<p style="font-size:13px;color:#555;margin:0 0 20px">
        A few minutes a day keeps the forgetting curve away.
       </p>`

  const wordBlock = word
    ? `<div style="background:#f5f5f5;border-radius:10px;padding:16px 20px;margin:0 0 24px;display:inline-block">
        <p style="font-size:11px;color:#888;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">Up next</p>
        <p style="font-size:28px;font-weight:700;color:#111;margin:0">${word}</p>
       </div>`
    : ""

  const html = `<!DOCTYPE html>
<html>
<body style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px 24px;max-width:480px;margin:0 auto">
  <p style="font-size:36px;margin:0 0 16px">🍜</p>
  <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 8px">Time to practice Korean!</h1>
  ${streakLine}
  ${wordBlock}
  <a href="${appUrl}/review"
     style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:32px">
    Start Review →
  </a>
  <p style="font-size:11px;color:#bbb;margin:0">
    Korean Study Friend · <a href="${appUrl}" style="color:#bbb">Open app</a>
  </p>
</body>
</html>`

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from: `"Korean Study Friend 🍜" <${GMAIL_USER}>`,
    to: REMINDER_TO,
    subject,
    html,
  })

  return Response.json({ ok: true, sentTo: REMINDER_TO })
}
