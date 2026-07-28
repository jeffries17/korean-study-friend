import nodemailer from "nodemailer"
import { dbGetAllCards, dbGetReviewLog, dbGetNewCardsSeenToday } from "@/lib/db"
import { getDueCards, getStruggleCards, NEW_WORDS_GOAL } from "@/lib/srs"
import { getStreak } from "@/lib/stats"

export async function GET() {
  return send()
}

export async function POST() {
  return send()
}

async function send() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, REMINDER_TO } = process.env
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !REMINDER_TO) {
    return Response.json({ error: "Email env vars not configured" }, { status: 500 })
  }

  const [cards, log, newWordsToday] = await Promise.all([
    dbGetAllCards(REMINDER_TO),
    dbGetReviewLog(REMINDER_TO),
    dbGetNewCardsSeenToday(REMINDER_TO),
  ])

  const streak = getStreak(log)
  const dueCards = getDueCards(cards)
  const dueTotal = dueCards.length
  const struggleCount = getStruggleCards(cards).length
  // Most overdue card, if any — otherwise the next new (unseen) card.
  const word = dueCards[0]?.korean ?? cards.find((c) => c.srs.repetitions === 0)?.korean

  const subject = dueTotal > 0
    ? `${dueTotal} card${dueTotal !== 1 ? "s" : ""} due — keep it going`
    : "Time to practice Korean 🍜"

  const streakLine = streak > 0
    ? `<p style="font-size:13px;color:#555;margin:0 0 20px">
        🔥 You're on a <strong>${streak}-day streak</strong>. Don't break it!
       </p>`
    : `<p style="font-size:13px;color:#555;margin:0 0 20px">
        A few minutes a day keeps the forgetting curve away.
       </p>`

  const statLine = `<p style="font-size:13px;color:#555;margin:0 0 20px">
      ${dueTotal > 0 ? `<strong>${dueTotal}</strong> due for review` : "Nothing due for review"}
      · <strong>${newWordsToday}/${NEW_WORDS_GOAL}</strong> new words learned today
      ${struggleCount > 0 ? `· <strong>${struggleCount}</strong> struggling` : ""}
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
  ${statLine}
  ${wordBlock}
  <a href="${appUrl}/review"
     style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:32px">
    Start Review →
  </a>
  <p style="font-size:11px;color:#bbb;margin:0">
    Gongbu Buddy · <a href="${appUrl}" style="color:#bbb">Open app</a>
  </p>
</body>
</html>`

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from: `"Gongbu Buddy 🍜" <${GMAIL_USER}>`,
    to: REMINDER_TO,
    subject,
    html,
  })

  return Response.json({ ok: true, sentTo: REMINDER_TO })
}
