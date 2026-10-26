// Turns what the user typed into a safe http(s) URL, or returns null if it isn't one.
export function normalizeUrl(input) {
  const text = (input ?? '').trim()
  if (!text) return null

  // "example.com" has no scheme, so add https://. "localhost:3000" looks like a scheme but isn't.
  const looksLikeScheme = /^[a-z][a-z\d+.-]*:/i.test(text)
  const looksLikeHostPort = /^[^/\s:]+:\d+(\/|$)/.test(text)
  const withScheme = looksLikeScheme && !looksLikeHostPort ? text : `https://${text}`

  try {
    const url = new URL(withScheme)
    // block javascript:, data:, file: and everything else
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}

export function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function getOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}