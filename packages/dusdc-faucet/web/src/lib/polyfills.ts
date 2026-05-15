import { Buffer } from 'node:buffer'

if (typeof window !== 'undefined') {
  ;(window as any).Buffer = Buffer
  ;(globalThis as any).Buffer = Buffer
}

export { Buffer }
