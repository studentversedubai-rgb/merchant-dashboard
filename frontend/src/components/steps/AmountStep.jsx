import { useState, useEffect } from 'react'
import { DollarSign, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * AmountStep — merchant enters the total bill amount.
 * Preview is a local estimate only. Actual discount is calculated server-side.
 */
export default function AmountStep({ entitlement, onConfirm, onBack, loading, error }) {
    const [amount, setAmount]       = useState('')
    const [confirmed, setConfirmed] = useState(false)

    useEffect(() => {
        if (!loading) setConfirmed(false)
    }, [loading])

    const discountPct = entitlement?.discount_percentage || 0
    const total       = parseFloat(amount) || 0
    const estDiscount = +(total * (discountPct / 100)).toFixed(2)
    const estFinal    = +(total - estDiscount).toFixed(2)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (total <= 0 || confirmed || loading) return
        setConfirmed(true)
        onConfirm({ totalAmount: total })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Discount badge */}
            {discountPct > 0 && (
                <div style={{
                    borderRadius: '20px', padding: '1.25rem', textAlign: 'center',
                    background: 'transparent',
                    border: '1px solid rgba(255,184,0,0.25)',
                }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,184,0,0.75)', margin: '0 0 4px' }}>
                        Student Discount
                    </p>
                    <p style={{
                        fontSize: 'clamp(3rem, 10vw, 4rem)', fontWeight: 900, lineHeight: 1,
                        letterSpacing: '-0.04em', margin: '0 0 4px',
                        background: 'linear-gradient(90deg, #FFB800, #FF9100)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        {discountPct}%
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                        {entitlement?.offer_title}
                    </p>
                </div>
            )}

            {/* Amount form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Label htmlFor="amount">Bill Amount (AED)</Label>
                    {/* Dirham logo sits inside the fancy input wrapper */}
                    <div style={{ position: 'relative' }}>
                        <img 
                            src="/Dirham logo.svg" 
                            alt="AED"
                            style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                width: 18, height: 18, opacity: 0.5, zIndex: 10,
                                pointerEvents: 'none',
                            }} 
                        />
                        <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); setConfirmed(false) }}
                            style={{ paddingLeft: 36, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}
                            disabled={loading || confirmed}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Estimate preview */}
                {total > 0 && discountPct > 0 && (
                    <div className="sv-glass" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                            <Info style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                                Estimate — actual discount confirmed by server
                            </span>
                        </div>
                        {[
                            { label: 'Original Amount', value: `AED ${total.toFixed(2)}`, color: 'rgba(255,255,255,0.65)' },
                            { label: `Discount (${discountPct}%)`, value: `− AED ${estDiscount.toFixed(2)}`, color: '#FFB800' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                                <span style={{ color, fontWeight: 600 }}>{value}</span>
                            </div>
                        ))}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Est. Customer Pays</span>
                            <span style={{
                                fontSize: '1.1rem', fontWeight: 700,
                                color: '#2962FF',
                            }}>
                                AED {estFinal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {error && <ErrorBanner message={error} />}

                <button
                    type="submit"
                    className={`sv-animated-btn${total > 0 && !loading && !confirmed ? ' ready' : ''}`}
                    disabled={total <= 0 || loading || confirmed}
                >
                    <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" /></svg>
                    <span className="text">{loading ? 'Processing…' : confirmed ? 'Submitting…' : 'Confirm Redemption'}</span>
                    <span className="circle" />
                    <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" /></svg>
                </button>

                <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onBack} disabled={loading || confirmed}>
                    ← Back
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
