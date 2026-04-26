import { useEffect, useState } from 'react'

/**
 * SuccessStep — shows backend-calculated redemption summary.
 * All financial values come directly from POST /merchant/confirm response.
 */
export default function SuccessStep({ result, redemptionId, onReset, onVoid }) {
    const totalBill      = parseFloat(result?.total_bill     || 0)
    const discountAmount = parseFloat(result?.discount_amount || 0)
    const finalAmount    = parseFloat(result?.final_amount   || 0)
    const savings        = parseFloat(result?.savings        || discountAmount)
    const refId          = (result?.redemption_id || redemptionId || '').slice(0, 8).toUpperCase()

    // Auto-trigger neon checkbox animation on mount
    const [checked, setChecked] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setChecked(true), 200)
        return () => clearTimeout(t)
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>

            {/* Neon checkbox — auto-animates on mount */}
            <label className={`neon-checkbox${checked ? ' checked' : ''}`}>
                <input type="checkbox" readOnly checked={checked} />
                <div className="neon-checkbox__frame">
                    <div className="neon-checkbox__box" />
                    <div className="neon-checkbox__check-container">
                        <svg className="neon-checkbox__check" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="neon-checkbox__glow" />
                    <div className="neon-checkbox__borders">
                        <span /><span /><span /><span />
                    </div>
                    <div className="neon-checkbox__particles">
                        <span /><span /><span /><span /><span /><span />
                        <span /><span /><span /><span /><span /><span />
                    </div>
                    <div className="neon-checkbox__rings">
                        <div className="ring" /><div className="ring" /><div className="ring" />
                    </div>
                    <div className="neon-checkbox__sparks">
                        <span /><span /><span /><span />
                    </div>
                </div>
            </label>

            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                    Redemption Successful
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    The student offer has been applied
                    {result?.redeemed_at ? ` at ${new Date(result.redeemed_at).toLocaleTimeString()}` : ''}
                </p>
            </div>

            {/* Financial summary */}
            <div className="sv-glass-strong" style={{ width: '100%', textAlign: 'left', overflow: 'hidden' }}>
                {[
                    { label: 'Original Amount',  value: `AED ${totalBill.toFixed(2)}`,       color: 'rgba(255,255,255,0.7)' },
                    { label: 'Discount Applied', value: `− AED ${discountAmount.toFixed(2)}`, color: '#FFB800', bold: true },
                    { label: 'Customer Paid',    value: `AED ${finalAmount.toFixed(2)}`,      color: '#2962FF', bold: true, large: true },
                    { label: 'Reference',        value: refId ? `#${refId}` : '—',            color: 'rgba(255,255,255,0.35)', mono: true },
                ].map(({ label, value, color, bold, large, mono }, i, arr) => (
                    <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.875rem 1.5rem',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                        <span style={{
                            color, fontWeight: bold ? 700 : 500,
                            fontSize: large ? '1.05rem' : '0.875rem',
                            fontFamily: mono ? 'monospace' : undefined,
                        }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ width: '100%' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2962FF', margin: 0 }}>
                    Student saved AED {savings.toFixed(2)} today 🎉
                </p>
            </div>

            <button className="sv-btn-next-customer" onClick={onReset}>
                Scan Next Customer
            </button>

            {(result?.redemption_id || redemptionId) && (
                <button
                    className="sv-btn-void"
                    onClick={onVoid}
                >
                    Void this redemption
                </button>
            )}
        </div>
    )
}
