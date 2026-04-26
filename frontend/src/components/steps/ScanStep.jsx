import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ScanStep({ onScanned, error, disabled }) {
    const videoRef   = useRef(null)
    const canvasRef  = useRef(null)
    const streamRef  = useRef(null)
    const rafRef     = useRef(null)
    const scannedRef = useRef(false)

    const [scanning, setScanning] = useState(false)

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setScanning(false)
    }

    const startCamera = async () => {
        if (disabled) return
        scannedRef.current = false
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            })
            streamRef.current = stream
            videoRef.current.srcObject = stream
            videoRef.current.play()
            setScanning(true)
        } catch {
            alert('Camera access denied. Please enable camera permissions and try again.')
        }
    }

    // QR decode loop — unchanged
    useEffect(() => {
        if (!scanning) return
        const tick = () => {
            const video  = videoRef.current
            const canvas = canvasRef.current
            if (!video || !canvas || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(tick)
                return
            }
            canvas.width  = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)
            const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(img.data, img.width, img.height)
            if (code && !scannedRef.current) {
                scannedRef.current = true
                stopCamera()
                onScanned(code.data.trim())
            } else {
                rafRef.current = requestAnimationFrame(tick)
            }
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [scanning])

    useEffect(() => () => stopCamera(), [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Scanner card — rotating border light (no hover) ── */}
            <div
                className="scanner-card"
                style={{
                    width: '100%',
                    maxWidth: 360,
                    margin: '0 auto',
                    aspectRatio: '1 / 1',
                    borderRadius: '12px',
                    background: '#000000',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
            >
                {/* Inner mask — clips rotating line to border only, holds all content */}
                <div className="scanner-card-inner" style={{ borderRadius: '10px' }}>

                    {/* Video feed — always rendered, hidden when not scanning */}
                    <video
                        ref={videoRef}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 1 }}
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Scanning guide corners */}
                    {scanning && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none', zIndex: 2,
                        }}>
                            <div style={{ position: 'relative', width: 200, height: 200 }}>
                                {[
                                    { top: 0, left: 0, borderTop: '3px solid #FFB800', borderLeft: '3px solid #FFB800', borderTopLeftRadius: 8 },
                                    { top: 0, right: 0, borderTop: '3px solid #FFB800', borderRight: '3px solid #FFB800', borderTopRightRadius: 8 },
                                    { bottom: 0, left: 0, borderBottom: '3px solid #FFB800', borderLeft: '3px solid #FFB800', borderBottomLeftRadius: 8 },
                                    { bottom: 0, right: 0, borderBottom: '3px solid #FFB800', borderRight: '3px solid #FFB800', borderBottomRightRadius: 8 },
                                ].map((s, i) => (
                                    <span key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
                                ))}
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, height: 2,
                                    background: 'linear-gradient(90deg, transparent, #FFB800, transparent)',
                                    animation: 'scanline 2s ease-in-out infinite',
                                    top: 0,
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Inactive overlay */}
                    {!scanning && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: '0.75rem',
                            background: '#000000',
                            zIndex: 2,
                        }}>
                            <Camera style={{ width: 48, height: 48, color: '#ffffff' }} />
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', margin: 0 }}>
                                Camera inactive
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* Camera toggle buttons */}
            {scanning ? (
                <Button size="lg" className="w-full" onClick={stopCamera} variant="outline" disabled={disabled}>
                    <Camera style={{ width: 18, height: 18, marginRight: 8 }} />
                    Stop Scanner
                </Button>
            ) : (
                <button className="sv-btn-fancy" onClick={startCamera} disabled={disabled}>
                    <span className="top-key" />
                    <span className="sv-btn-fancy-text">Start Camera Scanner</span>
                    <Camera className="sv-btn-fancy-icon" style={{ width: 16, height: 16 }} />
                    <span className="bottom-key-1" />
                    <span className="bottom-key-2" />
                </button>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    borderRadius: '14px', padding: '0.75rem 1rem', textAlign: 'center',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    backdropFilter: 'blur(16px)',
                }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', margin: 0 }}>{error}</p>
                </div>
            )}
        </div>
    )
}
