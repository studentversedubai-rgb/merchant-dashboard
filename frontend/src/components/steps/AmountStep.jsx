import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function AmountStep({ entitlement, onConfirm, onBack, loading, error }) {
    const [amount, setAmount] = useState('')

    // Preview only — actual discount calculated server-side
    const discountPct = entitlement?.discount_percentage || 0
    const total = parseFloat(amount) || 0
    const discountAmt = +(total * (discountPct / 100)).toFixed(2)
    const finalAmt = +(total - discountAmt).toFixed(2)

    const handleSubmit = (e) => {
        e.preventDefault()
        // Only send totalAmount — backend calculates discount
        if (total > 0) onConfirm({ totalAmount: total })
    }

    return (
        <div className="space-y-6">
            {/* Discount badge */}
            <div className="rounded-2xl bg-sv-gold p-5 text-white text-center">
                <p className="text-sm font-medium opacity-90 mb-1">Student Discount</p>
                <p className="text-5xl font-bold">{discountPct}%</p>
                <p className="text-sm opacity-80 mt-1">{entitlement?.offer_title}</p>
            </div>

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
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="pl-10 text-xl font-bold text-center"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Calculation breakdown */}
                {total > 0 && (
                    <Card className="border-gray-100">
                        <CardContent className="pt-4 pb-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Original Amount</span>
                                <span>AED {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-sv-gold font-semibold">
                                <span>Discount ({discountPct}%)</span>
                                <span>− AED {discountAmt.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between font-bold text-gray-900">
                                <span>Customer Pays</span>
                                <span className="text-sv-purple text-lg">AED {finalAmt.toFixed(2)}</span>
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
                    disabled={total <= 0 || loading}
                >
                    {loading ? 'Processing…' : 'Confirm Redemption'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="w-full text-gray-500"
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Back
                </Button>
            </form>
        </div>
    )
}
