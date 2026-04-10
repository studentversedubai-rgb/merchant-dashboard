/**
 * Unified error handler for all merchant API calls.
 * Maps HTTP status codes and backend messages to clean human-readable strings.
 */

/**
 * Normalise detail from API — Pydantic 422 returns an array of validation
 * objects; other endpoints return a plain string. Always returns a string.
 */
function extractDetail(detail) {
  if (!detail) return ''
  if (typeof detail === 'string') return detail
  // Pydantic validation error array: [{loc, msg, type}, ...]
  if (Array.isArray(detail)) {
    return detail.map(e => e.msg || JSON.stringify(e)).join('; ')
  }
  return String(detail)
}

export function parseApiError(status, rawDetail = '', fallback = 'Something went wrong.') {
  const detail = extractDetail(rawDetail)
  const msg = detail.toLowerCase()

  if (status === 0 || status === undefined) {
    return 'Network error. Check your internet connection and try again.'
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  if (status === 500) {
    return 'Server error. Please try again in a moment.'
  }

  if (status === 404) {
    return 'QR code not found. It may have already expired — ask the student to regenerate.'
  }

  if (status === 403) {
    return 'Access denied. Please contact support.'
  }

  // 422 = Pydantic / FastAPI validation error
  if (status === 422) {
    if (msg.includes('pin')) {
      return 'Incorrect PIN format. Please enter a 4–6 digit PIN and try again.'
    }
    if (msg.includes('proof_token') || msg.includes('token')) {
      return 'Invalid request. Please scan the QR code again.'
    }
    if (msg.includes('total_bill') || msg.includes('amount')) {
      return 'Please enter a valid bill amount greater than 0.'
    }
    return detail || 'Invalid request. Please check your input and try again.'
  }

  if (status === 400) {
    if (msg.includes('expired') || msg.includes('invalid or expired')) {
      return 'QR code has expired. Ask the student to regenerate and scan again.'
    }
    if (msg.includes('not found')) {
      return 'QR code not found. Ask the student to regenerate and scan again.'
    }
    if (msg.includes('already been redeemed') || msg.includes('already used') || msg.includes('entitlement is used')) {
      return 'This offer has already been redeemed.'
    }
    if (msg.includes('entitlement is')) {
      return `Offer is not redeemable right now (${detail}).`
    }
    if (msg.includes('pin') || msg.includes('invalid merchant pin')) {
      return 'Incorrect PIN. Please check your merchant PIN and try again.'
    }
    if (msg.includes('void window') || msg.includes('must void within')) {
      return 'Void window has passed. Redemptions can only be voided within 2 hours.'
    }
    if (msg.includes('same day')) {
      return 'Voiding is only allowed on the same day as the redemption.'
    }
    if (msg.includes('already voided')) {
      return 'This redemption has already been voided.'
    }
    if (msg.includes('cannot be confirmed') || msg.includes('not redeemable')) {
      return 'This offer cannot be confirmed. Please scan the QR code again.'
    }
    return detail || fallback
  }

  return detail || fallback
}
