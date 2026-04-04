import { parseApiError } from '@/lib/errors'

export const API_BASE_URL = 'https://svapp-backend-production.up.railway.app'

/**
 * Low-level fetch wrapper — throws a structured error with { status, message }.
 */
async function apiFetch(path, options = {}) {
    let res
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Merchant-Api-Key': import.meta.env.MERCHANT_API_KEY || '',
                ...(options.headers || {})
            },
        })
    } catch {
        // Network failure (no internet, CORS, timeout)
        throw new Error(parseApiError(0))
    }

    let data = {}
    try {
        data = await res.json()
    } catch {
        // Non-JSON response (unlikely but handle gracefully)
        if (!res.ok) throw new Error(parseApiError(res.status))
        return {}
    }

    if (!res.ok) {
        throw new Error(parseApiError(res.status, data.detail))
    }

    return data
}

/**
 * Merchant API — no JWT required.
 * QR codes contain ONLY the raw proof_token string (plain text, no JSON wrapper).
 */
export const api = {
    /**
     * GET /merchant/health
     * Call on dashboard load to confirm backend is reachable.
     */
    async healthCheck() {
        const data = await apiFetch('/merchant/health')
        return data.status === 'ok'
    },

    /**
     * POST /merchant/validate
     * Validate the student's proof_token scanned from QR.
     * Returns offer + student details on PASS; throws on FAIL.
     */
    async validateEntitlement(proofToken) {
        const data = await apiFetch('/merchant/validate', {
            method: 'POST',
            body: JSON.stringify({ proof_token: proofToken }),
        })

        // Backend may return 200 with success:false (soft fail)
        if (!data.success || data.status === 'FAIL') {
            throw new Error(data.reason || 'Token validation failed. Try scanning again.')
        }

        return data
    },

    /**
     * POST /merchant/confirm
     * Confirm redemption. Discount calculated server-side — never on frontend.
     *
     * @param {string} proofToken   Raw proof_token string from QR
     * @param {string} merchantPin  Merchant PIN
     * @param {number} totalAmount  Bill total before discount (AED)
     */
    async confirmRedemption({ proofToken, merchantPin, totalAmount }) {
        return apiFetch('/merchant/confirm', {
            method: 'POST',
            body: JSON.stringify({
                proof_token: proofToken,
                merchant_pin: merchantPin,
                total_bill_amount: parseFloat(totalAmount),
            }),
        })
    },

    /**
     * POST /merchant/void
     * Void a confirmed redemption within the 2-hour window.
     *
     * @param {string} redemptionId UUID from confirm response
     * @param {string} merchantPin  Merchant PIN
     * @param {string} reason       Min 3 chars, max 500 chars
     */
    async voidRedemption({ redemptionId, merchantPin, reason }) {
        return apiFetch('/merchant/void', {
            method: 'POST',
            body: JSON.stringify({
                redemption_id: redemptionId,
                merchant_pin: merchantPin,
                reason,
            }),
        })
    },
}
