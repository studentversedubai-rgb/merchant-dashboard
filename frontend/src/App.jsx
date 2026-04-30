import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import ScanStep from '@/components/steps/ScanStep'
import PinStep from '@/components/steps/PinStep'
import AmountStep from '@/components/steps/AmountStep'
import SuccessStep from '@/components/steps/SuccessStep'
import VoidStep from '@/components/steps/VoidStep'

const logoWithName = '/assets/svlogoname.png'

// ── Steps ────────────────────────────────────────────────────────────────────
const STEP_SCAN = 0
const STEP_PIN = 1
const STEP_AMOUNT = 2
const STEP_SUCCESS = 3
const STEP_VOID = 4

const STEP_LABELS = ['Scan', 'PIN', 'Amount', 'Done']

// ── Step Progress Indicator ───────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const done = i < current
        const active = i === current
        const upcoming = i > current

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2" style={{ width: 80 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  zIndex: 2,
                  background: done
                    ? 'linear-gradient(135deg, #7B2CBF, #2962FF)'
                    : active
                      ? 'linear-gradient(135deg, #2962FF, #7B2CBF)'
                      : 'rgba(255, 255, 255, 0.02)',
                  border: upcoming
                    ? '1.5px solid rgba(255, 255, 255, 0.12)'
                    : 'none',
                  boxShadow: done
                    ? '0 0 20px rgba(123, 44, 191, 0.35)'
                    : active
                      ? '0 0 24px rgba(41, 98, 255, 0.45)'
                      : 'none',
                  animation: active ? 'sv-pulseGlow 2.4s ease-in-out infinite' : 'none',
                }}
              >
                <span style={{ color: upcoming ? 'rgba(255, 255, 255, 0.25)' : '#fff' }}>
                  {done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i + 1}
                </span>
              </div>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: active ? '#ffffff' : done ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                transition: 'color 0.4s ease',
              }}>
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div style={{
                width: 40,
                height: 2,
                margin: '0 -20px 24px -20px',
                background: done
                  ? 'linear-gradient(90deg, #7B2CBF, #2962FF)'
                  : 'rgba(255, 255, 255, 0.08)',
                boxShadow: done ? '0 0 12px rgba(41, 98, 255, 0.35)' : 'none',
                transition: 'all 0.4s ease',
                zIndex: 1,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Service Unavailable banner ────────────────────────────────────────────────
function ServiceUnavailableBanner() {
  return (
    <div style={{
      marginBottom: '1.5rem',
      borderRadius: '16px',
      padding: '0.75rem 1rem',
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      backdropFilter: 'blur(16px)',
    }}>
      <span style={{ color: '#ef4444', fontSize: '1rem', lineHeight: 1, marginTop: 2 }}>⚠</span>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444', margin: 0 }}>
          Service temporarily unavailable
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(239,68,68,0.65)', margin: '2px 0 0' }}>
          Backend is unreachable. Please refresh and try again.
        </p>
      </div>
    </div>
  )
}

// ── Loading Overlay ───────────────────────────────────────────────────────────
function LoadingOverlay({ message = 'Please wait…' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      background: 'rgba(8,12,31,0.85)',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        background: 'rgba(8,12,31,0.8)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(40px) saturate(200%)',
        boxShadow: '0 8px 32px rgba(31,38,135,0.25), inset 0 1px 2px rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(41,98,255,0.2)',
          borderTopColor: '#2962FF',
          animation: 'sv-spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
          {message}
        </p>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(STEP_SCAN)
  const [proofToken, setProofToken] = useState(null)
  const [entitlement, setEntitlement] = useState(null)
  const [merchantPin, setMerchantPin] = useState(null)
  const [result, setResult] = useState(null)
  const [redemptionId, setRedemptionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Please wait…')
  const [error, setError] = useState(null)
  const [serviceOk, setServiceOk] = useState(true)
  const pendingRef = useRef(false)

  useEffect(() => {
    api.healthCheck()
      .then(ok => setServiceOk(ok))
      .catch(() => setServiceOk(false))
  }, [])

  const clearError = () => setError(null)
  const startLoad = (msg) => { setLoadingMsg(msg); setLoading(true) }
  const stopLoad = () => setLoading(false)

  const handleReset = () => {
    setStep(STEP_SCAN)
    setProofToken(null)
    setEntitlement(null)
    setMerchantPin(null)
    setResult(null)
    setRedemptionId(null)
    clearError()
    pendingRef.current = false
  }

  const handleScanned = async (rawToken) => {
    if (pendingRef.current) return
    pendingRef.current = true
    clearError()
    startLoad('Validating QR code…')
    try {
      const data = await api.validateEntitlement(rawToken)
      const discountPct = data.discount_value
        ? parseFloat(data.discount_value.replace('%', ''))
        : null
      setProofToken(rawToken)
      setEntitlement({ ...data, discount_percentage: discountPct })
      setStep(STEP_PIN)
      pendingRef.current = false
    } catch (e) {
      setError(e.message)
      setTimeout(() => { setError(null); pendingRef.current = false }, 2000)
    } finally {
      stopLoad()
    }
  }

  const handlePinVerified = async (pin) => {
    if (pendingRef.current || !proofToken) return
    pendingRef.current = true
    clearError()
    startLoad('Verifying PIN…')
    try {
      await api.verifyPin({ proofToken, merchantPin: pin })
      setMerchantPin(pin)
      setStep(STEP_AMOUNT)
    } catch (e) {
      setError(e.message)
    } finally {
      stopLoad()
      pendingRef.current = false
    }
  }

  const handleConfirm = async ({ totalAmount }) => {
    if (pendingRef.current || !proofToken) return
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError('Please enter a valid bill amount greater than 0.')
      return
    }
    pendingRef.current = true
    clearError()
    startLoad('Confirming redemption…')
    try {
      const data = await api.confirmRedemption({ proofToken, merchantPin, totalAmount })
      setResult(data)
      setRedemptionId(data.redemption_id || null)
      setProofToken(null)
      setStep(STEP_SUCCESS)
    } catch (e) {
      setError(e.message)
      const msg = (e.message || '').toLowerCase()
      if (msg.includes('expired') || msg.includes('already been redeemed') || msg.includes('not redeemable')) {
        setTimeout(handleReset, 3000)
      }
    } finally {
      stopLoad()
      pendingRef.current = false
    }
  }

  const handleVoid = async ({ pin, reason }) => {
    if (pendingRef.current || !redemptionId) return
    pendingRef.current = true
    clearError()
    startLoad('Processing void…')
    try {
      await api.voidRedemption({ redemptionId, merchantPin: pin, reason })
      handleReset()
    } catch (e) {
      setError(e.message)
    } finally {
      stopLoad()
      pendingRef.current = false
    }
  }

  const titles = {
    [STEP_SCAN]: { title: 'Scan Student QR', sub: "Point camera at the student's QR code" },
    [STEP_PIN]: { title: 'Enter Merchant PIN', sub: 'Verify your identity with your PIN' },
    [STEP_AMOUNT]: { title: 'Enter Bill Amount', sub: 'Enter the total bill before discount' },
    [STEP_SUCCESS]: { title: '', sub: '' },
    [STEP_VOID]: { title: 'Void Redemption', sub: 'Cancel this redemption within the 2-hour window' },
  }

  const showProgressBar = step < STEP_SUCCESS


  return (
    <>
      {/* ── Galaxy starfield layer ── */}
      <div id="sv-stars" aria-hidden="true" />



      {/* ── Page shell ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          background: 'rgba(0,0,0,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <img src={logoWithName} alt="StudentVerse" style={{ height: 40, objectFit: 'contain' }} />
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.35)',
            }}>
              Merchant Validator
            </span>
          </div>
        </header>

        {/* Main — top-aligned, NOT vertically centered */}
        <main style={{
          flex: 1,
          maxWidth: 520,
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.25rem 3rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {!serviceOk && <ServiceUnavailableBanner />}

          {showProgressBar && <StepIndicator current={step} />}

          {titles[step]?.title && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{
                fontSize: 'clamp(1.4rem, 4vw, 1.75rem)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                margin: 0,
              }}>
                {titles[step].title}
              </h1>
              {titles[step].sub && (
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
                  {titles[step].sub}
                </p>
              )}
            </div>
          )}

          {loading && <LoadingOverlay message={loadingMsg} />}

          {step === STEP_SCAN && (
            <ScanStep onScanned={handleScanned} error={error} disabled={loading || !serviceOk} />
          )}
          {step === STEP_PIN && (
            <PinStep entitlement={entitlement} onVerify={handlePinVerified} onBack={handleReset} loading={loading} error={error} />
          )}
          {step === STEP_AMOUNT && (
            <AmountStep entitlement={entitlement} onConfirm={handleConfirm} onBack={() => { clearError(); pendingRef.current = false; setStep(STEP_PIN) }} loading={loading} error={error} />
          )}
          {step === STEP_SUCCESS && (
            <SuccessStep result={result} redemptionId={redemptionId} onReset={handleReset} onVoid={() => { clearError(); setStep(STEP_VOID) }} />
          )}
          {step === STEP_VOID && (
            <VoidStep redemptionId={redemptionId} onVoid={handleVoid} onBack={() => { clearError(); setStep(STEP_SUCCESS) }} loading={loading} error={error} />
          )}
        </main>

        {/* Footer */}
        <footer style={{
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', zIndex: 1,
        }}>
          © {new Date().getFullYear()} StudentVerse · Merchant Portal
        </footer>
      </div>
    </>
  )
}
