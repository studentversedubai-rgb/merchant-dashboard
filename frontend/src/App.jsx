import { useState } from 'react'
import { api } from '@/lib/api'
import ScanStep from '@/components/steps/ScanStep'
import PinStep from '@/components/steps/PinStep'
import AmountStep from '@/components/steps/AmountStep'
import SuccessStep from '@/components/steps/SuccessStep'
const logoWithName = '/assets/svlogoname.png'

// Step labels for progress indicator
const STEPS = ['Scan', 'PIN', 'Amount', 'Done']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  done
                    ? 'bg-sv-gold border-sv-gold text-white'
                    : active
                      ? 'bg-sv-purple border-sv-purple text-white'
                      : 'bg-white border-gray-200 text-gray-400',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-sv-purple' : done ? 'text-sv-gold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 ${done ? 'bg-sv-gold' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)          // 0=scan, 1=pin, 2=amount, 3=success
  const [proofToken, setProofToken] = useState(null)   // raw proof_token from QR
  const [redemptionId, setRedemptionId] = useState(null) // from confirm response
  const [entitlement, setEntitlement] = useState(null)
  const [merchantPin, setMerchantPin] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = () => setError(null)

  // Step 0 → 1: validate proof_token from QR
  // QR contains ONLY the raw proof_token string — no JSON wrapper.
  const handleScanned = async (rawToken) => {
    clearError()
    setLoading(true)
    try {
      const data = await api.validateEntitlement(rawToken)
      setProofToken(rawToken)
      setEntitlement(data)
      setStep(1)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 1 → 2: verify PIN (no API call yet, just store it)
  const handlePinVerified = (pin) => {
    clearError()
    setMerchantPin(pin)
    setStep(2)
  }

  // Step 2 → 3: confirm redemption
  // Discount is never computed here — backend calculates it.
  const handleConfirm = async ({ totalAmount }) => {
    clearError()
    setLoading(true)
    try {
      const data = await api.confirmRedemption({
        proofToken,
        merchantPin,
        totalAmount,
      })
      // Store redemption_id for optional void
      setRedemptionId(data.redemption_id || null)
      setResult(data)
      setStep(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(0)
    setProofToken(null)
    setRedemptionId(null)
    setEntitlement(null)
    setMerchantPin(null)
    setResult(null)
    clearError()
  }

  const stepTitles = ['Scan Student QR', 'Enter Merchant PIN', 'Enter Bill Amount', 'Redemption Complete']
  const stepSubtitles = [
    'Point camera at the student\'s QR code',
    'Verify your identity with your PIN',
    'Enter the total bill before discount',
    '',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-sv-purple shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col items-center gap-1">
          <img
            src={logoWithName}
            alt="StudentVerse"
            className="h-10 object-contain"
          />
          <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
            Merchant Validator
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step < 3 && <StepIndicator current={step} />}

        {/* Step heading */}
        {step < 3 && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">{stepTitles[step]}</h1>
            {stepSubtitles[step] && (
              <p className="text-sm text-gray-500 mt-0.5">{stepSubtitles[step]}</p>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
              <div className="w-10 h-10 border-4 border-sv-purple/20 border-t-sv-purple rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Please wait…</p>
            </div>
          </div>
        )}

        {/* Steps */}
        {step === 0 && <ScanStep onScanned={handleScanned} error={error} />}
        {step === 1 && (
          <PinStep
            entitlement={entitlement}
            onVerify={handlePinVerified}
            onBack={() => { handleReset() }}
            loading={loading}
            error={error}
          />
        )}
        {step === 2 && (
          <AmountStep
            entitlement={entitlement}
            onConfirm={handleConfirm}
            onBack={() => { clearError(); setStep(1) }}
            loading={loading}
            error={error}
          />
        )}
        {step === 3 && <SuccessStep result={result} onReset={handleReset} />}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} StudentVerse · Merchant Portal
      </footer>
    </div>
  )
}
