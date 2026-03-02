import { useState } from 'react'
import { Eye, EyeOff, Tag, Store, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function PinStep({ entitlement, onVerify, onBack, loading, error }) {
    const [pin, setPin] = useState('')
    const [show, setShow] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = pin.trim()
        if (!trimmed || trimmed.length < 4) return
        onVerify(trimmed)
    }

    // Format discount info for display
    const discountLabel = entitlement?.discount_percentage != null
        ? `${entitlement.discount_percentage}% discount`
        : entitlement?.discount_value
            ? entitlement.discount_value
            : entitlement?.discount_description || ''

    return (
        <div className="space-y-6">
            {/* Offer summary card */}
            <Card className="border-sv-gold/30 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="flex items-center gap-2 text-sv-gold">
                        <Tag className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Validated Offer</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-lg leading-tight">
                            {entitlement?.offer_title || 'Student Offer'}
                        </p>
                        {discountLabel && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Percent className="w-3.5 h-3.5" />
                                {discountLabel}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Store className="w-4 h-4" />
                        <span>{entitlement?.merchant_name || 'Merchant'}</span>
                    </div>
                    {entitlement?.student_name && (
                        <p className="text-xs text-gray-400">Student: {entitlement.student_name}</p>
                    )}
                </CardContent>
            </Card>

            {/* PIN form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pin">Merchant PIN</Label>
                    <div className="relative">
                        <Input
                            id="pin"
                            type={show ? 'text' : 'password'}
                            inputMode="numeric"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            className="pr-12 text-center text-xl tracking-widest font-bold"
                            disabled={loading}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShow(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            tabIndex={-1}
                        >
                            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Minimum 4 digits</p>
                </div>

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-3 pb-3">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!pin.trim() || pin.trim().length < 4 || loading}
                >
                    {loading ? 'Processing…' : 'Continue to Bill Amount'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="w-full text-gray-500"
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Scan Again
                </Button>
            </form>
        </div>
    )
}
