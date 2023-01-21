

import type { Byte } from '../types/common'
import Square from './square'
import Noise from './noise'
import Triangle from './triangle'
import Interrupts from '../interrupts'
import { DIVIDE_COUNT_FOR_240HZ } from '../constants/apu'


export default class Apu {

  registers: Uint8Array
  cycle: number
  step: number
  envelopesCounter: number
  square: Square[]
  triangle: Triangle
  noise: Noise
  sequencerMode: number
  enableIrq: boolean
  interrupts: Interrupts


  constructor(interrupts: Interrupts) {
    this.interrupts = interrupts
    // APU Registers
    // (0x4000 - 0x4017)
    this.registers = new Uint8Array(0x18)
    this.cycle = 0
    this.step = 0
    this.square = [new Square(), new Square()]
    this.triangle = new Triangle()
    this.noise = new Noise()
    this.enableIrq = false
  }

  run(cycle: number) {
    this.cycle += cycle
    if (this.cycle >= DIVIDE_COUNT_FOR_240HZ) {
      // invoked 240hz
      this.cycle -= DIVIDE_COUNT_FOR_240HZ
      if (this.sequencerMode)  {
        this.updateBySequenceMode1()
      } else {
        this.updateBySequenceMode0()
      }
    }
  }


  updateBySequenceMode0() {
    this.updateEnvelope()
    if (this.step % 2 === 1) {
      this.updateSweepAndLengthCounter()
    }
    this.step++
    if (this.step === 4) {
      if(this.enableIrq)  {
        this.interrupts.assertIrq()
      }
      // 割り込み？
      this.step = 0
    }
  }

  updateBySequenceMode1() {
    this.updateEnvelope()
    if (this.step % 2 === 0) {
      this.updateSweepAndLengthCounter()
    }
    this.step++
    if (this.step === 5) {
      this.step = 0
    } else {
      this.updateEnvelope()
    }
  }

  updateSweepAndLengthCounter() {
    this.square.forEach((s: Square): void => s.updasteSweepAndLengthCounter())
    this.triangle.updateCounter()
    this.noise.updateCounter()
  }

  updateEnvelope() {
    this.square.forEach((s: Square): void => s.updateEnvelope())
    this.noise.updateEnvelope()
  }

  write(addr: Byte, data: Byte) {
    //console.log('apu write', addr, data)
    // TODO: FIX Perf
    if (addr <= 0x03) {
      //console.log('squre0')
      // square wave control register
      this.square[0].write(addr, data)
    } else if (addr <- 0x07) {
      //console.log('squre1')
      // square wave control register
      this.square[1].write(addr - 0x04, data)
    } else if (addr <- 0x0B) {
      //console.log('triangle')
      // triangle
      this.triangle.write(addr - 0x08, data)
    } else if (addr <= 0x0F) {
      //console.log('noise')
      // noise
      this.noise.write(addr - 0x0C, data)
    } else if (addr === 0x17) {
      //console.log('apu write', addr, data)
      this.sequencerMode = data & 0x80 ? 1 : 0
      this.registers[addr] = data
      this.enableIrq = !!(data & 0x40)
    }
  }
  
  read(addr: Byte): Byte {
    // TODO: Implement other registers
    if (addr === 0x15) {
      this.interrupts.deassertIrq()
    }
    return 0
  }

  close() {
    this.noise.close()
    this.square[0].close()
    this.square[1].close()
    this.triangle.close()
  }
}
