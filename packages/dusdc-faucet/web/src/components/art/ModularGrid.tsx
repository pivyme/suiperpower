import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/providers/ThemeProvider'

interface Cell {
  x: number
  y: number
  row: number
  col: number
  size: number
  targetOpacity: number
  currentOpacity: number
  accentAmount: number
  phase: number
  speed: number
}

interface ModularGridProps {
  columns?: number
  rows?: number
  gap?: number
  className?: string
}

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

export default function ModularGrid({
  columns = 8,
  rows = 12,
  gap = 6,
  className = '',
}: ModularGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cellsRef = useRef<Cell[]>([])
  const animationRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const { theme } = useTheme()

  const initializeCells = useCallback(
    (width: number, height: number) => {
      const cells: Cell[] = []
      const seed = 42

      const cellWidth = (width - gap * (columns + 1)) / columns
      const cellHeight = (height - gap * (rows + 1)) / rows
      const cellSize = Math.min(cellWidth, cellHeight)

      const totalWidth = columns * cellSize + (columns + 1) * gap
      const totalHeight = rows * cellSize + (rows + 1) * gap
      const offsetX = (width - totalWidth) / 2
      const offsetY = (height - totalHeight) / 2

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const idx = row * columns + col
          const rand = seededRandom(seed + idx)
          const rand2 = seededRandom(seed + idx + 100)

          cells.push({
            x: offsetX + gap + col * (cellSize + gap),
            y: offsetY + gap + row * (cellSize + gap),
            row,
            col,
            size: cellSize,
            targetOpacity: 0,
            currentOpacity: rand * 0.15,
            accentAmount: 0,
            phase: rand * Math.PI * 2,
            speed: 0.008 + rand2 * 0.012,
          })
        }
      }

      cellsRef.current = cells
    },
    [columns, rows, gap]
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const cells = cellsRef.current
      const time = timeRef.current
      const isDark = theme === 'dark'

      ctx.clearRect(0, 0, width, height)

      const baseColor = isDark ? [163, 163, 163] : [82, 82, 82]
      const accentColor = [254, 153, 0] // #fe9900

      cells.forEach((cell) => {
        // Moving wave for accent - diagonal sweep across grid
        const accentWave1 = Math.sin(time * 0.015 + cell.row * 0.4 + cell.col * 0.3)
        const accentWave2 = Math.sin(time * 0.012 - cell.col * 0.5 + cell.row * 0.2)
        const accentWave3 = Math.sin(time * 0.018 + (cell.row + cell.col) * 0.25)
        const targetAccent = Math.max(0, (accentWave1 + accentWave2 + accentWave3) / 3 - 0.3) * 2

        // Smooth transition for accent
        cell.accentAmount += (targetAccent - cell.accentAmount) * 0.08

        const wave = Math.sin(time * cell.speed + cell.phase)
        const wave2 = Math.sin(time * cell.speed * 0.7 + cell.phase + Math.PI / 3)
        const combined = (wave + wave2) / 2

        const baseOpacity = 0.02 + cell.accentAmount * 0.15
        const opacityRange = 0.08 + cell.accentAmount * 0.2
        cell.targetOpacity = baseOpacity + (combined + 1) * opacityRange

        cell.currentOpacity += (cell.targetOpacity - cell.currentOpacity) * 0.06

        // Blend between base and accent color
        const r = Math.round(baseColor[0] + (accentColor[0] - baseColor[0]) * cell.accentAmount)
        const g = Math.round(baseColor[1] + (accentColor[1] - baseColor[1]) * cell.accentAmount)
        const b = Math.round(baseColor[2] + (accentColor[2] - baseColor[2]) * cell.accentAmount)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${cell.currentOpacity})`

        const cornerRadius = 3
        const x = cell.x
        const y = cell.y
        const s = cell.size

        ctx.beginPath()
        ctx.moveTo(x + cornerRadius, y)
        ctx.lineTo(x + s - cornerRadius, y)
        ctx.quadraticCurveTo(x + s, y, x + s, y + cornerRadius)
        ctx.lineTo(x + s, y + s - cornerRadius)
        ctx.quadraticCurveTo(x + s, y + s, x + s - cornerRadius, y + s)
        ctx.lineTo(x + cornerRadius, y + s)
        ctx.quadraticCurveTo(x, y + s, x, y + s - cornerRadius)
        ctx.lineTo(x, y + cornerRadius)
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
        ctx.closePath()
        ctx.fill()
      })

      timeRef.current += 1
    },
    [theme]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)

      initializeCells(rect.width, rect.height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        draw(ctx, rect.width, rect.height)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initializeCells, draw])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  )
}
