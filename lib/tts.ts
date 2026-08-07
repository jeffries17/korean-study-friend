export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function speakWithBrowserTTS(text: string, lang: string, onStart?: () => void, onEnd?: () => void): void {
  if (!isTTSAvailable()) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = 0.85
  const voices = window.speechSynthesis.getVoices()
  const koreanVoice = voices.find((v) => v.lang.startsWith("ko"))
  if (koreanVoice) utter.voice = koreanVoice
  utter.onstart = () => onStart?.()
  utter.onend = () => onEnd?.()
  utter.onerror = () => onEnd?.()
  window.speechSynthesis.speak(utter)
}

/**
 * Plays server-generated Korean TTS audio (consistent voice quality across
 * platforms), falling back to the browser's speechSynthesis if the request
 * or playback fails. Returns a function that stops playback.
 */
export function speak(
  text: string,
  lang = "ko-KR",
  opts: { onStart?: () => void; onEnd?: () => void } = {}
): () => void {
  const { onStart, onEnd } = opts
  let stopped = false

  const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`)
  audio.onplay = () => onStart?.()
  audio.onended = () => onEnd?.()
  audio.onerror = () => {
    if (!stopped) speakWithBrowserTTS(text, lang, onStart, onEnd)
  }
  audio.play().catch(() => {
    if (!stopped) speakWithBrowserTTS(text, lang, onStart, onEnd)
  })

  return () => {
    stopped = true
    audio.pause()
    if (isTTSAvailable()) window.speechSynthesis.cancel()
  }
}

/** Wait for voices to load (they load async in some browsers) */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) return resolve([])
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) return resolve(voices)
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }
  })
}
