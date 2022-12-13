
import type { Byte, Word } from '../types/common'


export default class ROM {

  rom: Uint8Array

  constructor(data: Uint8Array) {
    this.rom = Uint8Array.from(data)
  }

  get size(): number {
    return this.rom.length
  }

  read(addr: Word): Byte {
    return this.rom[addr]
  }
}
