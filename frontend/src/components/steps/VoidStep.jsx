import { useState } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

/**
 * VoidStep — allows the merchant to void a redemption within 2 hours.
 * Calls POST /merchant/void with redemption_id, merchant_pin, reason.
 * Void window enforcement is handled entirely server-side.
 */
export default function VoidStep({ redemptionId, onVoid, onBack, loading, error }) {
    const [pin, setPin] = useState('')
    const [reason, setReason] = useState('')
    const [show, setShow] = useState(false)

    const reasonLen = reason.trim().length
    const pinOk = pin.trim().length >= 4
    const reasonOk = reasonLen >= 3 && reasonLen <= 500
    const canSubmit = pinOk && reasonOk && !loading

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!canSubmit) return
        onVoid({ pin: pin.trim(), reason: reason.trim() })
    }

    return (
        <div className="space-y-6">
            {/* Warning card */}
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">Voiding a redemption</p>
                        <p className="text-xs text-red-500 mt-1">
                            This will cancel the redemption. Only allowed within 2 hours of confirmation,
                            on the same day. This action cannot be undone.
                        </p>
                        {redemptionId && (
                            <p className="text-xs text-red-400 mt-1 font-mono">
                                Ref: #{String(redemptionId).slice(0, 8).toUpperCase()}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* PIN */}
                <div className="space-y-2">
                    <Label htmlFor="void-pin">Merchant PIN</Label>
                    <div className="relative">
                        <Input
                            id="void-pin"
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
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <Label htmlFor="void-reason">
                        Reason for Void
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                            ({reasonLen}/500)
                        </span>
                    </Label>
                    <textarea
                        id="void-reason"
                        rows={3}
                        placeholder="e.g. Customer returned item, billing error, etc."
                        value={reason}
                        onChange={e => setReason(e.target.value.slice(0, 500))}
                        disabled={loading}
                        className={[
                            'w-full rounded-md border px-3 py-2 text-sm resize-none',
                            'focus:outline-none focus:ring-2 focus:ring-sv-purple/30',
                            'disabled:opacity-50',
                            reasonLen > 0 && !reasonOk ? 'border-red-300' : 'border-gray-200',
                        ].join(' ')}
                    />
                    {reasonLen > 0 && reasonLen < 3 && (
                        <p className="text-xs text-red-500">Reason must be at least 3 characters.</p>
                    )}
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
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={!canSubmit}
                >
                    {loading ? 'Processing Void…' : 'Confirm Void'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="w-full text-gray-500"
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Cancel
                </Button>
            </form>
        </div>
    )
}
