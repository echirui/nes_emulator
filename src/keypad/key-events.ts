

export default class KeyEvents {
  constructor() {
  }

  setup(onKeyDown: (index: number) => void, onKeyUp: (index: number) => void) {
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (onKeyDown) onKeyDown(this.getKeyIndex(event.keyCode))
      })

      document.addEventListener('keyup', (event: KeyboardEvent) => {
        if (onKeyDown) onKeyUp(this.getKeyIndex(event.keyCode))
      })
    }
  }

  getKeyIndex(keyCode: number): number {
    switch (keyCode) {
      case 88: return 0 // X A
      case 90: return 1 // Z B
      case 65: return 2 // A SELECT
      case 83: return 3 // S SELECT
      case 38: return 4 // ↑ ↑
      case 40: return 5 // ↓ ↓
      case 37: return 6 // ← ←
      case 39: return 7 // → →
    }
  }
}
