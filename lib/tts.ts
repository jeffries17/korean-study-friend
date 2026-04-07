export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function speak(text: string, lang = "ko-KR"): void {
  if (!isTTSAvailable()) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = 0.85
  // Prefer a Korean voice if available
  const voices = window.speechSynthesis.getVoices()
  const koreanVoice = voices.find((v) => v.lang.startsWith("ko"))
  if (koreanVoice) utter.voice = koreanVoice
  window.speechSynthesis.speak(utter)
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
