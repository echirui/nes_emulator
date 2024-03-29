

import { parse } from '../parser'
import Cpu from '../cpu'
import Apu from '../apu'
import Ppu from '../ppu'
import Rom from '../rom'
import Ram from '../ram'
import Dma from '../dma'
import CpuBus from '../bus/cpu-bus'
import PpuBus from '../bus/ppu-bus'
import Keypad from '../keypad'
import CanvasRenderer from '../renderer/canvas'
import Interrupts from '../interrupts'
import Debugger from '../debugger'


export class NES {
  cpu: Cpu
  ppu: Ppu
  apu: Apu
  cpuBus: CpuBus
  characterMem: Ram
  programROM: Rom
  ram: Ram
  ppuBus: PpuBus
  canvasRenderer: CanvasRenderer
  keypad: Keypad
  dma: Dma
  interrupts: Interrupts
  debugger: Debugger

  //frame: () => void

  constructor() {
    this.frame = this.frame.bind(this)
    this.canvasRenderer = new CanvasRenderer('nes')
  }

  // Memory map
  /*
  +----------------+----------------------------+----------------+
  | addr           |  description               |   mirror       |
  +----------------+----------------------------+----------------+
  | 0x0000-0x07FF  |  RAM                       |                |
  | 0x0800-0x1FFF  |  reserve                   | 0x0000-0x07FF  |
  | 0x2000-0x2007  |  I/O(PPU)                  |                |
  | 0x2008-0x3FFF  |  reserve                   | 0x2000-0x2007  |
  | 0x4000-0x401F  |  I/O(APU, etc)             |                |
  | 0x4020-0x5FFF  |  ex RAM                    |                |
  | 0x6000-0x7FFF  |  battery backup RAM        |                |
  | 0x8000-0xBFFF  |  program ROM LOW           |                |
  | 0xC000-0xFFFF  |  program ROM HIGH          |                |
  +----------------+----------------------------+----------------+
  */

  load(nes: ArrayBuffer) {
    const { characterROM, programROM, isHorizontalMirror } = parse(nes)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('start debug mode')
      const nesDebugger = new Debugger()
      nesDebugger.setup(programROM)
      nesDebugger.displayDisassembled()
    }
    const ppuConfig = {
      isHorizontalMirror,
    }
    this.keypad = new Keypad()
    this.ram = new Ram(2048)
    this.characterMem = new Ram(0x4000)
    // copy charactorROM to internal RAM
    for (let i = 0; i < characterROM.length; i++) {
      this.characterMem.write(i, characterROM[i])
    }

    this.programROM = new Rom(programROM)
    this.ppuBus = new PpuBus(this.characterMem)
    this.interrupts = new Interrupts()
    this.apu = new Apu(this.interrupts)
    this.ppu = new Ppu(this.ppuBus, this.interrupts, ppuConfig)
    this.dma = new Dma(this.ram, this.ppu)
    this.cpuBus = new CpuBus(
      this.ram,
      this.programROM,
      this.ppu,
      this.keypad,
      this.dma,
      this.apu
    )
    this.cpu = new Cpu(this.cpuBus, this.interrupts)
    this.cpu.reset()
  }

  frame() {
    // console.time('loop')
    while (true) {
      let cycle: number = 0
      if (this.dma.isDmaProcessing) {
        this.dma.runDma()
        cycle = 514
      }
      cycle += this.cpu.run()
      const renderingData = this.ppu.run(cycle * 3)
      this.apu.run(cycle)
      if (renderingData) {
        this.canvasRenderer.render(renderingData)
        break
      }
    }
    // console.timeEnd('loop')
    requestAnimationFrame(this.frame)
  }

  start() {
    requestAnimationFrame(this.frame)
  }

  close() {
    this.apu.close()
  }
}
