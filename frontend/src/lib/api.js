export const API_BASE_URL = 'https://svapp-backend-production.up.railway.app'

/**
 * Merchant API — no JWT required.
 * All QR tokens are raw proof_token strings (plain text, no JSON wrapper).
 */
export const api = {
    /**
     * POST /merchant/validate
     * Validate the student's proof_token from the scanned QR code.
     * Returns PASS with offer details, or FAIL with reason.
     */
    async validateEntitlement(proofToken) {
        const res = await fetch(`${API_BASE_URL}/merchant/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proof_token: proofToken }),
        })
        const data = await res.json()

        // Backend always returns 200 with success:false on FAIL —
        // but also raises 400/429 on rate-limit / bad input.
        if (!res.ok) {
            const status = res.status
            if (status === 400) throw new Error(data.detail || 'Invalid or expired token')
            if (status === 403) throw new Error(data.detail || 'Device error')
            if (status === 404) throw new Error('Token not found — QR may have expired')
            if (status === 429) throw new Error('Too many requests. Please wait and try again.')
            throw new Error(data.detail || 'Validation failed')
        }

        // Soft fail: { success: false, status: "FAIL", reason: "..." }
        if (!data.success || data.status === 'FAIL') {
            throw new Error(data.reason || 'Token validation failed')
        }

        return data
    },

    /**
     * POST /merchant/confirm
     * Confirm the redemption with merchant PIN and total bill amount.
     * Discount is calculated server-side — never on the frontend.
     *
     * @param {string} proofToken  - The raw proof_token from the QR code
     * @param {string} merchantPin - Merchant PIN entered by merchant
     * @param {number} totalAmount - Total bill before discount (AED)
     */
    async confirmRedemption({ proofToken, merchantPin, totalAmount }) {
        const res = await fetch(`${API_BASE_URL}/merchant/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proof_token: proofToken,
                merchant_pin: merchantPin,
                total_bill_amount: parseFloat(totalAmount),
            }),
        })
        const data = await res.json()

        if (!res.ok) {
            const status = res.status
            if (status === 400) {
                const msg = (data.detail || '').toLowerCase()
                if (msg.includes('expired') || msg.includes('invalid or expired') || msg.includes('not found')) {
                    throw new Error('QR code has expired. Ask the student to regenerate their QR code and scan again.')
                }
                if (msg.includes('pin')) {
                    throw new Error('Incorrect PIN. Please check your merchant PIN and try again.')
                }
                if (msg.includes('entitlement is')) {
                    throw new Error('This offer has already been redeemed or is no longer active.')
                }
                throw new Error(data.detail || 'Confirmation failed')
            }
            if (status === 429) throw new Error('Too many requests. Please wait and try again.')
            throw new Error(data.detail || 'Confirmation failed')
        }

        return data
    },

    /**
     * POST /merchant/void
     * Void a redemption within the 2-hour window.
     *
     * @param {string} redemptionId - UUID returned by confirmRedemption
     * @param {string} merchantPin  - Merchant PIN for authorization
     * @param {string} reason       - Required reason string (min 10 chars)
     */
    async voidRedemption({ redemptionId, merchantPin, reason }) {
        const res = await fetch(`${API_BASE_URL}/merchant/void`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                redemption_id: redemptionId,
                merchant_pin: merchantPin,
                reason: reason,
            }),
        })
        const data = await res.json()

        if (!res.ok) {
            const status = res.status
            if (status === 400) throw new Error(data.detail || 'Void failed')
            if (status === 429) throw new Error('Too many requests. Please wait and try again.')
            throw new Error(data.detail || 'Void failed')
        }

        return data
    },
}
