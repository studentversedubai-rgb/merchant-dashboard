import { useEffect, useRef } from 'react'

/**
 * Renders a high-quality galaxy background onto a fixed canvas.
 * Layers (bottom to top):
 *   1. Deep space base (#080C1F)
 *   2. Milky Way diagonal band — soft blue/indigo smear
 *   3. Nebula glow — off-center blue radial bloom
 *   4. Secondary violet smudge — depth/atmosphere
 *   5. Star field — thousands of tiny dots, varied size + opacity
 *   6. Bright feature stars — soft glow halos
 */
export default function StarfieldCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Render at device pixel ratio for crisp 4K output
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W   = window.innerWidth
    const H   = window.innerHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    // ── 1. Base ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, W, H)

    // ── 2. Milky Way band — diagonal smear, top-right to bottom-left ─────────
    // Multiple overlapping soft ellipses at low opacity to build up the band
    const bandAngle = -35 * (Math.PI / 180) // diagonal tilt
    ctx.save()
    ctx.translate(W * 0.5, H * 0.5)
    ctx.rotate(bandAngle)

    const bandLayers = [
      { w: W * 1.8, h: H * 0.18, opacity: 0.045, color: '60, 80, 180' },
      { w: W * 1.6, h: H * 0.10, opacity: 0.055, color: '50, 70, 160' },
      { w: W * 1.4, h: H * 0.06, opacity: 0.040, color: '70, 90, 200' },
      { w: W * 1.2, h: H * 0.03, opacity: 0.030, color: '80, 100, 220' },
    ]

    bandLayers.forEach(({ w, h, opacity, color }) => {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.5)
      grad.addColorStop(0,   `rgba(${color}, ${opacity})`)
      grad.addColorStop(0.5, `rgba(${color}, ${opacity * 0.4})`)
      grad.addColorStop(1,   `rgba(${color}, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()

    // ── 3. Primary nebula glow — soft blue bloom, slightly right of center ───
    const nebulaX = W * 0.58
    const nebulaY = H * 0.44
    const nebulaR = W * 0.50

    const nebula = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, nebulaR)
    nebula.addColorStop(0,    'rgba(41, 98, 255, 0.08)')
    nebula.addColorStop(0.3,  'rgba(41, 98, 255, 0.04)')
    nebula.addColorStop(0.65, 'rgba(30, 60, 180, 0.02)')
    nebula.addColorStop(1,    'rgba(30, 60, 180, 0)')
    ctx.fillStyle = nebula
    ctx.fillRect(0, 0, W, H)

    // ── 4. Secondary violet/indigo smudge — bottom-left atmosphere ───────────
    const smudgeX = W * 0.15
    const smudgeY = H * 0.78
    const smudgeR = W * 0.38

    const smudge = ctx.createRadialGradient(smudgeX, smudgeY, 0, smudgeX, smudgeY, smudgeR)
    smudge.addColorStop(0,   'rgba(80, 30, 160, 0.05)')
    smudge.addColorStop(0.5, 'rgba(60, 20, 120, 0.02)')
    smudge.addColorStop(1,   'rgba(60, 20, 120, 0)')
    ctx.fillStyle = smudge
    ctx.fillRect(0, 0, W, H)

    // Tiny top-right accent smudge
    const smudge2 = ctx.createRadialGradient(W * 0.88, H * 0.12, 0, W * 0.88, H * 0.12, W * 0.22)
    smudge2.addColorStop(0,   'rgba(41, 98, 255, 0.07)')
    smudge2.addColorStop(1,   'rgba(41, 98, 255, 0)')
    ctx.fillStyle = smudge2
    ctx.fillRect(0, 0, W, H)

    // ── 5. Star field ─────────────────────────────────────────────────────────
    // Seeded-style distribution — denser near the Milky Way band
    const totalStars = Math.floor((W * H) / 3800)

    for (let i = 0; i < totalStars; i++) {
      const x = Math.random() * W
      const y = Math.random() * H

      // Bias: slightly more stars near the band diagonal
      const bandBias = getBandDensity(x, y, W, H, bandAngle)
      if (Math.random() > 0.55 + bandBias * 0.45) continue

      // Size distribution: 90% tiny (0.3–0.8px), 9% small (0.8–1.3px), 1% medium (1.3–1.8px)
      const roll = Math.random()
      const radius = roll < 0.90
        ? Math.random() * 0.5 + 0.3
        : roll < 0.99
        ? Math.random() * 0.5 + 0.8
        : Math.random() * 0.5 + 1.3

      // Opacity: dimmer stars more common
      const opacity = Math.random() < 0.7
        ? Math.random() * 0.35 + 0.12   // dim: 0.12–0.47
        : Math.random() * 0.30 + 0.45   // bright: 0.45–0.75

      // Slight blue tint on some stars near the band
      const tint = bandBias > 0.3 && Math.random() < 0.25
        ? `rgba(200, 220, 255, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = tint
      ctx.fill()
    }

    // ── 6. Feature stars — bright with soft glow halos ────────────────────────
    const featureCount = Math.floor(W / 80) // ~16 on 1280px wide
    for (let i = 0; i < featureCount; i++) {
      const x       = Math.random() * W
      const y       = Math.random() * H
      const coreR   = Math.random() * 0.7 + 0.8   // 0.8–1.5px core
      const glowR   = coreR * (Math.random() * 4 + 5) // 5–9x glow radius
      const opacity = Math.random() * 0.25 + 0.65  // 0.65–0.90

      // Soft glow halo
      const halo = ctx.createRadialGradient(x, y, 0, x, y, glowR)
      halo.addColorStop(0,   `rgba(255, 255, 255, ${opacity * 0.25})`)
      halo.addColorStop(0.4, `rgba(220, 235, 255, ${opacity * 0.08})`)
      halo.addColorStop(1,   'rgba(200, 220, 255, 0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(x, y, glowR, 0, Math.PI * 2)
      ctx.fill()

      // Bright core
      ctx.beginPath()
      ctx.arc(x, y, coreR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.fill()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

/**
 * Returns 0–1 density bias based on proximity to the Milky Way band diagonal.
 * Stars closer to the band axis get a higher density value.
 */
function getBandDensity(x, y, W, H, angle) {
  const cx = W * 0.5
  const cy = H * 0.5
  const dx = x - cx
  const dy = y - cy
  // Perpendicular distance from the rotated band axis
  const perp = Math.abs(-Math.sin(angle) * dx + Math.cos(angle) * dy)
  const bandHalfWidth = H * 0.22
  return Math.max(0, 1 - perp / bandHalfWidth)
}
