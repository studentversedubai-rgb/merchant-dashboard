import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function ScanStep({ onScanned, error }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const rafRef = useRef(null)

    const [scanning, setScanning] = useState(false)
    const [manualCode, setManualCode] = useState('')
    const [showManual, setShowManual] = useState(false)

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setScanning(false)
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            })
            streamRef.current = stream
            videoRef.current.srcObject = stream
            videoRef.current.play()
            setScanning(true)
        } catch {
            alert('Camera access denied. Please enable camera permissions.')
        }
    }

    useEffect(() => {
        if (!scanning) return
        const tick = () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            if (!video || !canvas || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(tick)
                return
            }
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(img.data, img.width, img.height)
            if (code) {
                stopCamera()
                handleCode(code.data)
            } else {
                rafRef.current = requestAnimationFrame(tick)
            }
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [scanning])

    useEffect(() => () => stopCamera(), [])

    const handleCode = (raw) => {
        let id = raw
        try {
            const parsed = JSON.parse(raw)
            id = parsed.entitlement_id || parsed.id || raw
        } catch { }
        onScanned(id)
    }

    const handleManualSubmit = (e) => {
        e.preventDefault()
        if (manualCode.trim()) onScanned(manualCode.trim())
    }

    return (
        <div className="space-y-6">
            {/* Scanner box */}
            <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black shadow-lg">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {/* Corner guides */}
                {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-52 h-52">
                            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sv-gold rounded-tl-lg" />
                            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sv-gold rounded-tr-lg" />
                            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sv-gold rounded-bl-lg" />
                            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sv-gold rounded-br-lg" />
                        </div>
                    </div>
                )}

                {!scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                        <Camera className="w-12 h-12 text-white/60" />
                        <p className="text-white/70 text-sm">Camera inactive</p>
                    </div>
                )}
            </div>

            {/* Camera button */}
            <Button
                size="lg"
                className="w-full"
                onClick={scanning ? stopCamera : startCamera}
                variant={scanning ? 'outline' : 'default'}
            >
                <Camera className="w-5 h-5 mr-2" />
                {scanning ? 'Stop Scanner' : 'Start Camera Scanner'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Manual entry */}
            {!showManual ? (
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setShowManual(true)}
                >
                    <Keyboard className="w-5 h-5 mr-2" />
                    Enter Code Manually
                </Button>
            ) : (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                    <Label htmlFor="manual-code">Entitlement Code</Label>
                    <Input
                        id="manual-code"
                        placeholder="Paste or type entitlement ID"
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value)}
                        autoFocus
                    />
                    <Button type="submit" size="lg" className="w-full" disabled={!manualCode.trim()}>
                        Validate Code
                    </Button>
                </form>
            )}

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
