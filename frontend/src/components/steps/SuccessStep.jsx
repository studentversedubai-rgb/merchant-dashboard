import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SuccessStep({ result, onReset }) {
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
                <p className="text-gray-500 mt-1 text-sm">The student offer has been applied</p>
            </div>

            {/* Details */}
            <Card className="border-gray-100 text-left">
                <CardContent className="pt-5 pb-5 space-y-3">
                    {[
                        // POST /merchant/confirm returns: total_bill, discount_amount, final_amount, savings, redemption_id
                        { label: 'Original Amount', value: `AED ${parseFloat(result?.total_bill || 0).toFixed(2)}` },
                        { label: 'Discount Applied', value: `AED ${parseFloat(result?.discount_amount || 0).toFixed(2)}` },
                        { label: 'Customer Paid', value: `AED ${parseFloat(result?.final_amount || 0).toFixed(2)}` },
                        { label: 'Reference', value: result?.redemption_id ? `#${result.redemption_id.slice(0, 8).toUpperCase()}` : '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm font-semibold text-gray-900">{value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Separator with discount highlight */}
            <div className="rounded-xl bg-sv-purple/5 border border-sv-purple/10 p-4">
                <p className="text-sv-purple font-semibold text-sm">
                    Student saved AED {parseFloat(result?.discount_amount || 0).toFixed(2)} today 🎉
                </p>
            </div>

            <Button size="lg" className="w-full" onClick={onReset}>
                Scan Next Customer
            </Button>
        </div>
    )
}
