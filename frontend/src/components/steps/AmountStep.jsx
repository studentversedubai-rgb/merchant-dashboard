import { useState, useEffect } from 'react'
import { DollarSign, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

/**
 * AmountStep — merchant enters the total bill amount.
 *
 * IMPORTANT: The preview below is a local estimate for the merchant's
 * reference only. The actual discount is ALWAYS calculated server-side
 * by POST /merchant/confirm. We never send or trust the local estimate.
 */
export default function AmountStep({ entitlement, onConfirm, onBack, loading, error }) {
    const [amount, setAmount] = useState('')
    const [confirmed, setConfirmed] = useState(false)

    useEffect(() => {
        if (!loading) setConfirmed(false)
    }, [loading])

    // ── Local preview (estimate only — not sent to API) ─────────────────────
    const discountPct = entitlement?.discount_percentage || 0
    const total = parseFloat(amount) || 0
    const estDiscount = +(total * (discountPct / 100)).toFixed(2)
    const estFinal = +(total - estDiscount).toFixed(2)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (total <= 0 || confirmed || loading) return
        setConfirmed(true)   // lock button immediately
        // Only totalAmount is sent — backend calculates the actual discount
        onConfirm({ totalAmount: total })
    }

    return (
        <div className="space-y-6">
            {/* Discount badge (from validate response, shown for reference) */}
            {discountPct > 0 && (
                <div className="rounded-2xl bg-sv-gold p-5 text-white text-center">
                    <p className="text-sm font-medium opacity-90 mb-1">Student Discount</p>
                    <p className="text-5xl font-bold">{discountPct}%</p>
                    <p className="text-sm opacity-80 mt-1">{entitlement?.offer_title}</p>
                </div>
            )}

            {/* Amount form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Bill Amount (AED)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); setConfirmed(false) }}
                            className="pl-10 text-xl font-bold text-center"
                            disabled={loading || confirmed}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Local estimate preview */}
                {total > 0 && discountPct > 0 && (
                    <Card className="border-gray-100">
                        <CardContent className="pt-4 pb-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                                <Info className="w-3.5 h-3.5" />
                                <span>Estimate — actual discount confirmed by server</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Original Amount</span>
                                <span>AED {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-sv-gold font-semibold">
                                <span>Discount ({discountPct}%)</span>
                                <span>− AED {estDiscount.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between font-bold text-gray-900">
                                <span>Est. Customer Pays</span>
                                <span className="text-sv-purple text-lg">AED {estFinal.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-3 pb-3">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={total <= 0 || loading || confirmed}
                >
                    {loading ? 'Processing…' : confirmed ? 'Submitting…' : 'Confirm Redemption'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="w-full text-gray-500"
                    onClick={onBack}
                    disabled={loading || confirmed}
                >
                    ← Back
                </Button>
            </form>
        </div>
    )
}
