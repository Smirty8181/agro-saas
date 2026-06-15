<template>
  <canvas ref="canvasRef" class="pointer-events-none absolute inset-0 z-0 opacity-40" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
const columns: { x: number; y: number; speed: number; chars: string[] }[] = []

const glyphs = 'АГРО01УРОЖАЙПШЕНИЦАКУКУРУЗА0123456789'

function initColumns(width: number, height: number) {
  columns.length = 0
  const count = Math.floor(width / 18)
  for (let i = 0; i < count; i++) {
    columns.push({
      x: i * 18,
      y: Math.random() * height,
      speed: 2 + Math.random() * 5,
      chars: Array.from({ length: 12 + Math.floor(Math.random() * 18) }, () =>
        glyphs[Math.floor(Math.random() * glyphs.length)]
      )
    })
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'rgba(15, 10, 6, 0.12)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = '14px monospace'
  columns.forEach((col) => {
    col.chars.forEach((char, index) => {
      const y = col.y - index * 18
      if (y < 0 || y > canvas.height) return
      ctx.fillStyle = index === 0 ? '#6FCF97' : `rgba(111, 207, 151, ${0.15 + index * 0.04})`
      ctx.fillText(char, col.x, y)
    })
    col.y += col.speed
    if (col.y - col.chars.length * 18 > canvas.height) {
      col.y = -Math.random() * canvas.height * 0.3
      col.chars = col.chars.map(() => glyphs[Math.floor(Math.random() * glyphs.length)])
    }
  })

  raf = requestAnimationFrame(draw)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  initColumns(canvas.width, canvas.height)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(draw)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>
