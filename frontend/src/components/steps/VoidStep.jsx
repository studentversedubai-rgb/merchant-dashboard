import { useState } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * VoidStep — allows the merchant to void a redemption within 2 hours.
 * Calls POST /merchant/void with redemption_id, merchant_pin, reason.
 */
export default function VoidStep({ redemptionId, onVoid, onBack, loading, error }) {
    const [pin, setPin]     = useState('')
    const [reason, setReason] = useState('')
    const [show, setShow]   = useState(false)

    const reasonLen = reason.trim().length
    const pinOk     = pin.trim().length >= 4
    const reasonOk  = reasonLen >= 3 && reasonLen <= 500
    const canSubmit = pinOk && reasonOk && !loading

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!canSubmit) return
        onVoid({ pin: pin.trim(), reason: reason.trim() })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Warning card */}
            <div style={{
                borderRadius: '16px', padding: '1rem 1.25rem',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.22)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}>
                <AlertTriangle style={{ width: 18, height: 18, color: '#ef4444', marginTop: 2, flexShrink: 0 }} />
                <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444', margin: '0 0 4px' }}>
                        Voiding a redemption
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(239,68,68,0.65)', margin: 0, lineHeight: 1.5 }}>
                        This will cancel the redemption. Only allowed within 2 hours of confirmation,
                        on the same day. This action cannot be undone.
                    </p>
                    {redemptionId && (
                        <p style={{ fontSize: '0.72rem', color: 'rgba(239,68,68,0.45)', margin: '6px 0 0', fontFamily: 'monospace' }}>
                            Ref: #{String(redemptionId).slice(0, 8).toUpperCase()}
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* PIN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Label htmlFor="void-pin">Merchant PIN</Label>
                    <div style={{ position: 'relative' }}>
                        <Input
                            id="void-pin"
                            type={show ? 'text' : 'password'}
                            inputMode="numeric"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            style={{ paddingRight: 48, textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 700 }}
                            disabled={loading}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShow(s => !s)}
                            tabIndex={-1}
                            style={{
                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'rgba(255,255,255,0.3)', padding: 0,
                                transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                        >
                            {show ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                        </button>
                    </div>
                </div>

                {/* Reason */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Label htmlFor="void-reason">
                        Reason for Void
                        <span style={{ marginLeft: 8, fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>
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
                        style={{
                            width: '100%',
                            borderRadius: 14,
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            resize: 'none',
                            fontFamily: 'Outfit, Helvetica, Arial, sans-serif',
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${reasonLen > 0 && !reasonOk ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: '#ffffff',
                            outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                            lineHeight: 1.5,
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = 'rgba(0,240,255,0.4)'
                            e.target.style.boxShadow   = '0 0 0 4px rgba(0,240,255,0.08)'
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = reasonLen > 0 && !reasonOk ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'
                            e.target.style.boxShadow   = 'none'
                        }}
                    />
                    {reasonLen > 0 && reasonLen < 3 && (
                        <p style={{ fontSize: '0.72rem', color: '#ef4444', margin: 0 }}>
                            Reason must be at least 3 characters.
                        </p>
                    )}
                </div>

                {error && <ErrorBanner message={error} />}

                <Button type="submit" variant="destructive" size="lg" className="w-full" disabled={!canSubmit}>
                    {loading ? 'Processing Void…' : 'Confirm Void'}
                </Button>

                <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onBack} disabled={loading}>
                    ← Cancel
                </Button>
            </form>
        </div>
    )
}

function ErrorBanner({ message }) {
    return (
        <div style={{
            borderRadius: '14px', padding: '0.75rem 1rem', textAlign: 'center',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            backdropFilter: 'blur(16px)',
        }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', margin: 0 }}>{message}</p>
        </div>
    )
}
