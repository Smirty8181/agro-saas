<template>
  <Teleport to="body">
    <div class="tetris-overlay fixed inset-0 z-[100000] flex items-center justify-center bg-[#0f0a06]/90 p-4 backdrop-blur-md">
      <div class="tetris-shell relative w-full max-w-lg overflow-hidden rounded-[32px] border border-[#B89B72]/40 bg-gradient-to-br from-[#1a1410] via-[#2a2018] to-[#1a1410] p-6 shadow-[0_0_80px_rgba(184,155,114,0.25)]">
        <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#B89B72]/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#6FCF97]/15 blur-3xl"></div>

        <div class="relative flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-[#B89B72]">Easter egg</p>
            <h2 class="mt-1 bg-gradient-to-r from-[#F2C94C] via-[#B89B72] to-[#6FCF97] bg-clip-text text-3xl font-black text-transparent">
              Agro Tetris
            </h2>
            <p class="mt-2 text-sm text-[#E8DDCB]/70">Стрелки · Space — сброс · P — пауза · Esc — выход</p>
          </div>
          <button
            type="button"
            class="rounded-2xl border border-[#B89B72]/30 bg-white/5 px-4 py-2 text-sm font-semibold text-[#E8DDCB] transition hover:bg-white/10"
            @click="$emit('close')"
          >
            Закрыть
          </button>
        </div>

        <div class="relative mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
          <div class="rounded-[24px] border border-[#B89B72]/25 bg-black/40 p-2 shadow-inner">
            <canvas ref="canvasRef" width="240" height="480" class="block rounded-[18px]" />
          </div>

          <div class="w-full max-w-[160px] space-y-4 text-sm text-[#E8DDCB]">
            <div class="rounded-3xl border border-[#B89B72]/20 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-widest text-[#B89B72]/80">Счёт</p>
              <p class="mt-1 text-2xl font-bold tabular-nums">{{ score }}</p>
            </div>
            <div class="rounded-3xl border border-[#B89B72]/20 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-widest text-[#B89B72]/80">Линии</p>
              <p class="mt-1 text-2xl font-bold tabular-nums">{{ lines }}</p>
            </div>
            <div class="rounded-3xl border border-[#B89B72]/20 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-widest text-[#B89B72]/80">Уровень</p>
              <p class="mt-1 text-2xl font-bold tabular-nums">{{ level }}</p>
            </div>
            <div class="rounded-3xl border border-[#B89B72]/20 bg-white/5 p-4">
              <p class="mb-2 text-xs uppercase tracking-widest text-[#B89B72]/80">Следующая</p>
              <canvas ref="nextRef" width="80" height="80" class="mx-auto block" />
            </div>
            <p v-if="paused" class="text-center text-xs font-semibold text-[#F2C94C]">ПАУЗА</p>
            <p v-if="gameOver" class="text-center text-xs font-semibold text-rose-400">Игра окончена · Enter — заново</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{ close: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const nextRef = ref<HTMLCanvasElement | null>(null)

const COLS = 10
const ROWS = 20
const BLOCK = 24

const colors = ['#F2C94C', '#6FCF97', '#B89B72', '#F2994A', '#56CCF2', '#BB6BD9', '#EB5757']

const shapes: number[][][] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]]
]

const score = ref(0)
const lines = ref(0)
const level = ref(1)
const paused = ref(false)
const gameOver = ref(false)

let board: number[][] = []
let piece = { shape: [] as number[][], color: 0, x: 0, y: 0, rot: 0 }
let nextPiece = { shape: [] as number[][], color: 0 }
let dropTimer = 0
let lastTime = 0
let raf = 0

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function randomPiece() {
  const idx = Math.floor(Math.random() * shapes.length)
  return { shape: shapes[idx].map((row) => [...row]), color: idx + 1 }
}

function rotate(shape: number[][]) {
  const rows = shape.length
  const cols = shape[0].length
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) rotated[c][rows - 1 - r] = shape[r][c]
  }
  return rotated
}

function collides(shape: number[][], px: number, py: number) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = px + c
      const y = py + r
      if (x < 0 || x >= COLS || y >= ROWS) return true
      if (y >= 0 && board[y][x]) return true
    }
  }
  return false
}

function mergePiece() {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && piece.y + r >= 0) board[piece.y + r][piece.x + c] = piece.color
    })
  })
}

function clearLines() {
  let cleared = 0
  board = board.filter((row) => {
    if (row.every(Boolean)) {
      cleared++
      return false
    }
    return true
  })
  while (board.length < ROWS) board.unshift(Array(COLS).fill(0))
  if (cleared) {
    lines.value += cleared
    score.value += [0, 100, 300, 500, 800][cleared] * level.value
    level.value = 1 + Math.floor(lines.value / 10)
  }
}

function spawn() {
  piece = { ...nextPiece, x: 3, y: -1, rot: 0, shape: nextPiece.shape.map((r) => [...r]) }
  nextPiece = randomPiece()
  if (collides(piece.shape, piece.x, piece.y)) gameOver.value = true
}

function hardDrop() {
  if (gameOver.value || paused.value) return
  while (!collides(piece.shape, piece.x, piece.y + 1)) piece.y++
  lockPiece()
}

function lockPiece() {
  mergePiece()
  clearLines()
  spawn()
}

function move(dx: number) {
  if (gameOver.value || paused.value) return
  if (!collides(piece.shape, piece.x + dx, piece.y)) piece.x += dx
}

function softDrop() {
  if (gameOver.value || paused.value) return
  if (!collides(piece.shape, piece.x, piece.y + 1)) {
    piece.y++
    score.value += 1
  } else {
    lockPiece()
  }
}

function turn() {
  if (gameOver.value || paused.value) return
  const rotated = rotate(piece.shape)
  if (!collides(rotated, piece.x, piece.y)) piece.shape = rotated
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, colorIdx: number, size = BLOCK) {
  const color = colors[(colorIdx - 1) % colors.length]
  ctx.fillStyle = color
  ctx.fillRect(x * size, y * size, size - 1, size - 1)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(x * size, y * size, size - 1, 4)
}

function drawBoard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#120e0a'
  ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK)
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) drawBlock(ctx, c, r, cell)
    })
  })
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) drawBlock(ctx, piece.x + c, piece.y + r, piece.color)
    })
  })
}

function drawNext() {
  const canvas = nextRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#120e0a'
  ctx.fillRect(0, 0, 80, 80)
  const shape = nextPiece.shape
  const offsetX = Math.floor((4 - shape[0].length) / 2)
  const offsetY = Math.floor((4 - shape.length) / 2)
  shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) drawBlock(ctx, offsetX + c, offsetY + r, nextPiece.color, 16)
    })
  })
}

function resetGame() {
  board = emptyBoard()
  score.value = 0
  lines.value = 0
  level.value = 1
  paused.value = false
  gameOver.value = false
  nextPiece = randomPiece()
  spawn()
}

function tick(time: number) {
  const delta = time - lastTime
  lastTime = time
  if (!paused.value && !gameOver.value) {
    dropTimer += delta
    const speed = Math.max(120, 650 - level.value * 45)
    if (dropTimer > speed) {
      dropTimer = 0
      softDrop()
    }
  }

  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) drawBoard(ctx)
  }
  drawNext()
  raf = requestAnimationFrame(tick)
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key === 'p' || event.key === 'P' || event.key === 'з' || event.key === 'З') {
    paused.value = !paused.value
    return
  }
  if (gameOver.value && event.key === 'Enter') {
    resetGame()
    return
  }
  if (event.key === 'ArrowLeft') move(-1)
  else if (event.key === 'ArrowRight') move(1)
  else if (event.key === 'ArrowDown') softDrop()
  else if (event.key === 'ArrowUp') turn()
  else if (event.key === ' ') {
    event.preventDefault()
    hardDrop()
  }
}

onMounted(() => {
  resetGame()
  lastTime = performance.now()
  raf = requestAnimationFrame(tick)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.tetris-shell {
  animation: tetrisPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes tetrisPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
