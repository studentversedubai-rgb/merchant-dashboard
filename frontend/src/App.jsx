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
const STEP_VOID = 4   // accessible from success via "Void" button

const STEP_LABELS = ['Scan', 'PIN', 'Amount', 'Done']

// ── Step Progress Indicator ───────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEP_LABELS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  done ? 'bg-sv-gold border-sv-gold text-white'
                    : active ? 'bg-sv-purple border-sv-purple text-white'
                      : 'bg-white border-gray-200 text-gray-400',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-sv-purple' : done ? 'text-sv-gold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 ${done ? 'bg-sv-gold' : 'bg-gray-200'}`} />
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
    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex gap-2 items-start">
      <span className="text-red-500 text-lg leading-none mt-0.5">⚠</span>
      <div>
        <p className="text-sm font-semibold text-red-700">Service temporarily unavailable</p>
        <p className="text-xs text-red-500 mt-0.5">Backend is unreachable. Please refresh and try again.</p>
      </div>
    </div>
  )
}

// ── Loading Overlay ───────────────────────────────────────────────────────────
function LoadingOverlay({ message = 'Please wait…' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
        <div className="w-10 h-10 border-4 border-sv-purple/20 border-t-sv-purple rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // ── State machine ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_SCAN)

  // Validate payload
  const [proofToken, setProofToken] = useState(null)   // raw proof_token from QR
  const [entitlement, setEntitlement] = useState(null)   // validate response data

  // Confirm payload
  const [merchantPin, setMerchantPin] = useState(null)
  const [result, setResult] = useState(null)   // confirm response data
  const [redemptionId, setRedemptionId] = useState(null)   // for void

  // UI state
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Please wait…')
  const [error, setError] = useState(null)
  const [serviceOk, setServiceOk] = useState(true)   // health check

  // Guard: prevent duplicate API calls
  const pendingRef = useRef(false)

  // ── Health check on mount ──────────────────────────────────────────────────
  useEffect(() => {
    api.healthCheck()
      .then(ok => setServiceOk(ok))
      .catch(() => setServiceOk(false))
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearError = () => setError(null)
  const startLoad = (msg) => { setLoadingMsg(msg); setLoading(true) }
  const stopLoad = () => setLoading(false)

  // ── Full reset → back to scan step ────────────────────────────────────────
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

  // ── STEP 0 → 1 : Validate QR token ────────────────────────────────────────
  const handleScanned = async (rawToken) => {
    if (pendingRef.current) return  // prevent duplicate calls
    pendingRef.current = true
    clearError()
    startLoad('Validating QR code…')
    try {
      const data = await api.validateEntitlement(rawToken)
      // Parse discount_value ("50%") into numeric for preview display in AmountStep
      const discountPct = data.discount_value
        ? parseFloat(data.discount_value.replace('%', ''))
        : null
      setProofToken(rawToken)
      setEntitlement({ ...data, discount_percentage: discountPct })
      setStep(STEP_PIN)
    } catch (e) {
      setError(e.message)
      // Auto-reset scanner after 2 seconds on failure
      setTimeout(() => {
        setError(null)
        pendingRef.current = false
      }, 2000)
    } finally {
      stopLoad()
    }
  }

  // ── STEP 1 → 2 : Store PIN (no API call) ──────────────────────────────────
  const handlePinVerified = (pin) => {
    clearError()
    setMerchantPin(pin)
    setStep(STEP_AMOUNT)
  }

  // ── STEP 2 → 3 : Confirm redemption ───────────────────────────────────────
  // Discount is NEVER calculated here — backend owns that.
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
      // Clear proof_token — single use; cannot resubmit
      setProofToken(null)
      setStep(STEP_SUCCESS)
    } catch (e) {
      setError(e.message)
      // If token expired or already used, force back to scan after 3s
      const msg = (e.message || '').toLowerCase()
      if (msg.includes('expired') || msg.includes('already been redeemed') || msg.includes('not redeemable')) {
        setTimeout(handleReset, 3000)
      }
    } finally {
      stopLoad()
      pendingRef.current = false
    }
  }

  // ── STEP 4 : Void ──────────────────────────────────────────────────────────
  const handleVoid = async ({ pin, reason }) => {
    if (pendingRef.current || !redemptionId) return
    pendingRef.current = true
    clearError()
    startLoad('Processing void…')
    try {
      await api.voidRedemption({ redemptionId, merchantPin: pin, reason })
      // Success: full reset after void
      handleReset()
    } catch (e) {
      setError(e.message)
    } finally {
      stopLoad()
      pendingRef.current = false
    }
  }

  // ── Titles ─────────────────────────────────────────────────────────────────
  const titles = {
    [STEP_SCAN]: { title: 'Scan Student QR', sub: 'Point camera at the student\'s QR code' },
    [STEP_PIN]: { title: 'Enter Merchant PIN', sub: 'Verify your identity with your PIN' },
    [STEP_AMOUNT]: { title: 'Enter Bill Amount', sub: 'Enter the total bill before discount' },
    [STEP_SUCCESS]: { title: '', sub: '' },
    [STEP_VOID]: { title: 'Void Redemption', sub: 'Cancel this redemption within the 2-hour window' },
  }

  const showProgressBar = step < STEP_SUCCESS

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-sv-purple shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col items-center gap-1">
          <img src={logoWithName} alt="StudentVerse" className="h-10 object-contain" />
          <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
            Merchant Validator
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Health check banner */}
        {!serviceOk && <ServiceUnavailableBanner />}

        {/* Progress indicator (scan / pin / amount steps only) */}
        {showProgressBar && <StepIndicator current={step} />}

        {/* Step heading */}
        {titles[step]?.title && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">{titles[step].title}</h1>
            {titles[step].sub && (
              <p className="text-sm text-gray-500 mt-0.5">{titles[step].sub}</p>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {loading && <LoadingOverlay message={loadingMsg} />}

        {/* Steps */}
        {step === STEP_SCAN && (
          <ScanStep
            onScanned={handleScanned}
            error={error}
            disabled={loading || !serviceOk}
          />
        )}

        {step === STEP_PIN && (
          <PinStep
            entitlement={entitlement}
            onVerify={handlePinVerified}
            onBack={handleReset}
            loading={loading}
            error={error}
          />
        )}

        {step === STEP_AMOUNT && (
          <AmountStep
            entitlement={entitlement}
            onConfirm={handleConfirm}
            onBack={() => { clearError(); pendingRef.current = false; setStep(STEP_PIN) }}
            loading={loading}
            error={error}
          />
        )}

        {step === STEP_SUCCESS && (
          <SuccessStep
            result={result}
            redemptionId={redemptionId}
            onReset={handleReset}
            onVoid={() => { clearError(); setStep(STEP_VOID) }}
          />
        )}

        {step === STEP_VOID && (
          <VoidStep
            redemptionId={redemptionId}
            onVoid={handleVoid}
            onBack={() => { clearError(); setStep(STEP_SUCCESS) }}
            loading={loading}
            error={error}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} StudentVerse · Merchant Portal
      </footer>
    </div>
  )
}
