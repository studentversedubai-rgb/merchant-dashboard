import { useState } from 'react'
import { Eye, EyeOff, Tag, Store, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PinStep({ entitlement, onVerify, onBack, loading, error }) {
    const [pin, setPin]   = useState('')
    const [show, setShow] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = pin.trim()
        if (!trimmed || trimmed.length < 4) return
        onVerify(trimmed)
    }

    const discountLabel = entitlement?.discount_percentage != null
        ? `${entitlement.discount_percentage}% discount`
        : entitlement?.discount_value
            ? entitlement.discount_value
            : entitlement?.discount_description || ''

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Offer summary */}
            <div className="sv-glass-strong" style={{ padding: '1.25rem 1.5rem', background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                    <Tag style={{ width: 14, height: 14, color: '#FFB800' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#FFB800' }}>
                        Validated Offer
                    </span>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                    {entitlement?.offer_title || 'Student Offer'}
                </p>
                {discountLabel && (
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Percent style={{ width: 13, height: 13 }} />
                        {discountLabel}
                    </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
                    <Store style={{ width: 14, height: 14 }} />
                    <span>{entitlement?.merchant_name || 'Merchant'}</span>
                </div>
                {entitlement?.student_name && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>
                        Student: {entitlement.student_name}
                    </p>
                )}
            </div>

            {/* PIN form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Label htmlFor="pin">Merchant PIN</Label>
                    {/* FancyInput wrapper — eye toggle sits inside via relative wrapper */}
                    <div style={{ position: 'relative' }}>
                        <Input
                            id="pin"
                            type={show ? 'text' : 'password'}
                            inputMode="numeric"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 700, paddingRight: 40 }}
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
                                color: 'rgba(255,255,255,0.3)', padding: 0, zIndex: 10,
                                transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                        >
                            {show ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Minimum 4 digits</p>
                </div>

                {error && <ErrorBanner message={error} />}

                <button
                    type="submit"
                    className={`sv-animated-btn${pin.trim().length >= 4 && !loading ? ' ready' : ''}`}
                    disabled={!pin.trim() || pin.trim().length < 4 || loading}
                >
                    <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" /></svg>
                    <span className="text">{loading ? 'Processing…' : 'Continue to Bill Amount'}</span>
                    <span className="circle" />
                    <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" /></svg>
                </button>

                <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onBack} disabled={loading}>
                    ← Scan Again
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
