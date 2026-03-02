import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * SuccessStep — shows backend-calculated redemption summary.
 * All financial values come directly from POST /merchant/confirm response.
 * Nothing is computed on the frontend.
 */
export default function SuccessStep({ result, redemptionId, onReset, onVoid }) {
    // Backend fields from POST /merchant/confirm response:
    // total_bill, discount_amount, final_amount, savings, redemption_id, redeemed_at
    const totalBill = parseFloat(result?.total_bill || 0)
    const discountAmount = parseFloat(result?.discount_amount || 0)
    const finalAmount = parseFloat(result?.final_amount || 0)
    const savings = parseFloat(result?.savings || discountAmount)
    const refId = (result?.redemption_id || redemptionId || '').slice(0, 8).toUpperCase()

    return (
        <div className="space-y-6 text-center">
            {/* Success icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-sv-gold/10 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-sv-gold" />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900">Redemption Successful</h2>
                <p className="text-gray-500 mt-1 text-sm">
                    The student offer has been applied
                    {result?.redeemed_at ? ` at ${new Date(result.redeemed_at).toLocaleTimeString()}` : ''}
                </p>
            </div>

            {/* Backend-sourced financial summary */}
            <Card className="border-gray-100 text-left">
                <CardContent className="pt-5 pb-5 space-y-3">
                    {[
                        { label: 'Original Amount', value: `AED ${totalBill.toFixed(2)}` },
                        { label: 'Discount Applied', value: `− AED ${discountAmount.toFixed(2)}`, highlight: true },
                        { label: 'Customer Paid', value: `AED ${finalAmount.toFixed(2)}`, bold: true },
                        { label: 'Reference', value: refId ? `#${refId}` : '—' },
                    ].map(({ label, value, highlight, bold }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className={`text-sm font-semibold ${highlight ? 'text-sv-gold' : bold ? 'text-sv-purple text-base' : 'text-gray-900'}`}>
                                {value}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Savings highlight */}
            <div className="rounded-xl bg-sv-purple/5 border border-sv-purple/10 p-4">
                <p className="text-sv-purple font-semibold text-sm">
                    Student saved AED {savings.toFixed(2)} today 🎉
                </p>
            </div>

            {/* Actions */}
            <Button size="lg" className="w-full" onClick={onReset}>
                Scan Next Customer
            </Button>

            {/* Void option — only if we have a redemption_id */}
            {(result?.redemption_id || redemptionId) && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs"
                    onClick={onVoid}
                >
                    Void this redemption
                </Button>
            )}
        </div>
    )
}
