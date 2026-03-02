/**
 * Unified error handler for all merchant API calls.
 * Maps HTTP status codes and backend messages to clean human-readable strings.
 */

export function parseApiError(status, detail = '', fallback = 'Something went wrong.') {
  const msg = (detail || '').toLowerCase()

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

  if (status === 400) {
    if (msg.includes('expired') || msg.includes('invalid or expired') || msg.includes('not found')) {
      return 'QR code has expired. Ask the student to regenerate and scan again.'
    }
    if (msg.includes('already used') || msg.includes('entitlement is used')) {
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
    return detail || fallback
  }

  return detail || fallback
}
