export const API_BASE_URL = 'https://svapp-backend-production.up.railway.app'

export const api = {
    async validateEntitlement(entitlementId) {
        const res = await fetch(`${API_BASE_URL}/entitlements/validate?entitlement_id=${entitlementId}`, {
            method: 'POST',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Validation failed')
        return data
    },

    async confirmRedemption({ entitlementId, merchantPin, totalAmount, discountAmount }) {
        const res = await fetch(`${API_BASE_URL}/entitlements/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entitlement_id: entitlementId,
                merchant_pin: merchantPin,
                total_amount: parseFloat(totalAmount),
                discount_amount: parseFloat(discountAmount),
            }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Confirmation failed')
        return data
    },
}
