import CPU from '../../src/cpu';
import RAM from '../../src/ram';
import ROM from '../../src/rom';
import Interrupts from '../../src/interrupts';
import type {Byte, Word} from '../../src/types/common';
import * as op from '../../src/cpu/opcode';

const defaultRegisters = {
    A: 0x00,
    X: 0x00,
    Y: 0x00,
    P: {
      negative: false,
      overflow: false,
      reserved: true,
      break: true,
      decimal: false,
      interrupt: true,
      zero: false,
      carry: false,
    },
    SP: 0x01FD,
    PC: 0x0000,
}

// Mock
class CpuBus {
    ram: RAM
    programROM: ROM

    constructor(ram: RAM, programROM: ROM) {
      this.ram = ram;
      this.programROM = programROM;
    }

    // for mock
    set ROM(rom: ROM) {
        this.programROM = rom;
    }

    readByCpu(addr: Word): Byte {
        if (addr >= 0x8000) {
            return this.programROM.read(addr - 0x8000);
        }
        return this.ram.read(addr);
    }

    writeByCpu(addr: Word, data: Byte) {
        this.ram.write(addr, data);
    }
}

let cpu: CPU
let bus: CpuBus
let mockedROM: ROM
let mockedMemory: RAM
let mockedIntterrupts = new Interrupts()

beforeEach(() => {
    mockedMemory = new RAM(0x10000)
    bus = new CpuBus(mockedMemory, mockedROM)
    cpu = new CPU(bus, mockedIntterrupts)
    cpu.registers.PC = 0x8000
})

describe('CPU', () => {
    test('LDA_IMM', () => {
        mockedROM = new ROM(new Uint8Array([op.LDA_IMM, 0xAA]))
        bus.ROM = mockedROM
        const cycle = cpu.run()
        const expected = {
            ...defaultRegisters,
            P: { ...defaultRegisters.P, negative: true },
            PC: 0x8002,
            A: 0xAA,
        }
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(2)
    })

    test('LDA_ZERO', () => {
        mockedROM = new ROM(new Uint8Array([op.LDA_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xAA);
        const cycle = cpu.run();
        const expected = {
        ...defaultRegisters,
        P: { ...defaultRegisters.P, negative: true },
        PC: 0x8002,
        A: 0xAA,
        }
            expect(cpu.registers).toEqual(expected)
            expect(cycle).toBe(3)
    })

    test('LDA_ZEROX', () => {
        mockedROM = new ROM(new Uint8Array([op.LDA_ZEROX, 0xA5]))
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0xAA, 0xAA);
        const cycle = cpu.run();
        const expected = {
            ...defaultRegisters,
            P: { ...defaultRegisters.P, negative: true },
            PC: 0x8002,
            A: 0xAA,
            X: 0x05,
        }
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
    })

    test('LDA_ABS', () => {
        mockedROM = new ROM(new Uint8Array([op.LDA_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xAA);
        const cycle = cpu.run();
        const expected = {
            ...defaultRegisters,
            P: { ...defaultRegisters.P, negative: true },
            PC: 0x8003,
            A: 0xAA,
        }
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
    })

    test('LDA_ABSX', () => {
        mockedROM = new ROM(new Uint8Array([op.LDA_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xAA);
        const cycle = cpu.run();
        const expected = {
            ...defaultRegisters,
            P: { ...defaultRegisters.P, negative: true },
            PC: 0x8003,
            A: 0xAA,
            X: 0x05,
        }
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
    })

    test('LDA_ABSY',() => {
        mockedROM = new ROM(new Uint8Array([op.LDA_ABSY, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x05;
        mockedMemory.write(0x10AA, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8003,
          A: 0xAA,
          Y: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDA_INDX',() => {
        mockedROM = new ROM(new Uint8Array([op.LDA_INDX, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0xAA, 0xA0);
        mockedMemory.write(0xA0, 0xDE);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          A: 0xDE,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(6)
      });

      test('LDA_INDY',() => {
        mockedROM = new ROM(new Uint8Array([op.LDA_INDY, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x05;
        mockedMemory.write(0xA5, 0xA0);
        mockedMemory.write(0xA6, 0x10);
        mockedMemory.write(0x10A5, 0xDE);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          A: 0xDE,
          Y: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(5)
      });

      test('LDX_IMM',() => {
        mockedROM = new ROM(new Uint8Array([op.LDX_IMM, 0xAA]));
        bus.ROM = mockedROM;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          X: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(2)
      });

      test('LDX_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.LDX_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          X: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(3)
      });

      test('LDX_ZEROY',() => {
        mockedROM = new ROM(new Uint8Array([op.LDX_ZEROY, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x05;
        mockedMemory.write(0xAA, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          X: 0xAA,
          Y: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDX_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.LDX_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8003,
          X: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDX_ABSY',() => {
        mockedROM = new ROM(new Uint8Array([op.LDX_ABSY, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x05;
        mockedMemory.write(0x10AA, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8003,
          X: 0xAA,
          Y: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDY_IMM',() => {
        mockedROM = new ROM(new Uint8Array([op.LDY_IMM, 0xAA]));
        bus.ROM = mockedROM;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          Y: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(2)
      });

      test('LDY_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.LDY_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          Y: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(3)
      });

      test('LDY_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.LDY_ZEROX, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0xAA, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8002,
          Y: 0xAA,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDY_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.LDY_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8003,
          Y: 0xAA,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('LDY_ABSX',() => {
        mockedROM = new ROM(new Uint8Array([op.LDY_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xAA);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true },
          PC: 0x8003,
          Y: 0xAA,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected)
        expect(cycle).toBe(4)
      });

      test('STA_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ZERO, 0xDE]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xDE);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(3)
      });

      test('STA_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ZEROX, 0xA0]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xA5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STA_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10A5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STA_ABSX without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10AA);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STA_ABSX with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x65;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x110A);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(5)
      });

      test('STA_ABSY without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ABSY, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x05;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10AA);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STA_ABSY with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_ABSY, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0x65;
        cpu.registers.A = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x110A);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STA_INDX',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_INDX, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xA5;
        cpu.registers.X = 0x05;
        mockedMemory.write(0xAA, 0xDE);
        mockedMemory.write(0xAB, 0x10);
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10DE);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(7)
      });

      test('STA_INDY without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_INDY, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xA5;
        cpu.registers.Y = 0x05;
        mockedMemory.write(0xA5, 0xDE);
        mockedMemory.write(0xA6, 0x10);
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10E3);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(6)
      });

      test('STA_INDY with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.STA_INDY, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xA5;
        cpu.registers.Y = 0x25;
        mockedMemory.write(0xA5, 0xDE);
        mockedMemory.write(0xA6, 0x10);
        const cycle = cpu.run();
        const data = mockedMemory.read(0x1103);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(6)
      });

      test('STX_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.STX_ZERO, 0xDE]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xDE);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(3)
      });

      test('STX_ZEROY',() => {
        mockedROM = new ROM(new Uint8Array([op.STX_ZEROY, 0xA0]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0xA5;
        cpu.registers.Y = 0x05;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xA5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STX_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.STX_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10A5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STY_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.STY_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xA5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(3)
      });

      test('STY_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.STY_ZEROX, 0xA0]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        cpu.registers.Y = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0xA5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('STY_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.STY_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.Y = 0xA5;
        const cycle = cpu.run();
        const data = mockedMemory.read(0x10A5);
        expect(data).toEqual(0xA5)
        expect(cycle).toBe(4)
      });

      test('SEI',() => {
        mockedROM = new ROM(new Uint8Array([op.SEI]));
        bus.ROM = mockedROM;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, interrupt: true },
          PC: 0x8001,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('CLI',() => {
        mockedROM = new ROM(new Uint8Array([op.CLI]));
        bus.ROM = mockedROM;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, interrupt: false },
          PC: 0x8001,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('LSR',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xa5;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8001,
          A: 0x52,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('LSR_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(5)
        expect(mockedMemory.read(0xA5)).toBe(0x77);
      });

      test('LSR_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR_ZEROX, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xAA, 0xEF);
        cpu.registers.X = 0x05;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          X: 0x05,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0xAA)).toBe(0x77);
      });

      test('LSR_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8003,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10A5)).toBe(0x77);
      });

      test('LSR_ABSX without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8003,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10AA)).toBe(0x77);
      });

      test('LSR_ABSX with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.LSR_ABSX, 0x01, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0xFF;
        mockedMemory.write(0x1100, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8003,
          X: 0xFF,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(7)
        expect(mockedMemory.read(0x1100)).toBe(0x77);
      });

      test('ASL',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xa5;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true },
          PC: 0x8001,
          A: 0x4A,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('ASL_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, carry: true, negative: true },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(5)
        expect(mockedMemory.read(0xA5)).toBe(0xDE);
      });

      test('ASL_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL_ZEROX, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xAA, 0xEF);
        cpu.registers.X = 0x05;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          X: 0x05,
          P: { ...defaultRegisters.P, negative: true, carry: true },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0xAA)).toBe(0xDE);
      });

      test('ASL_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true, carry: true },
          PC: 0x8003,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10A5)).toBe(0xDE);
      });

      test('ASL_ABSX without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true, carry: true },
          PC: 0x8003,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10AA)).toBe(0xDE);
      });

      test('ASL_ABSX with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ASL_ABSX, 0x01, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.X = 0xFF;
        mockedMemory.write(0x1100, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true, carry: true },
          PC: 0x8003,
          X: 0xFF,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(7)
        expect(mockedMemory.read(0x1100)).toBe(0xDE);
      });

      test('ROR',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR]));
        bus.ROM = mockedROM;
        cpu.registers.A = 0xa5;
        cpu.registers.P.carry = true;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: true, carry: true  },
          PC: 0x8001,
          A: 0xD2,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('ROR_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xEF);
        cpu.registers.P.carry = true;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(5)
        expect(mockedMemory.read(0xA5)).toBe(0xF7);
      });

      test('ROR_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR_ZEROX, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xAA, 0xEF);
        cpu.registers.P.carry = true;
        cpu.registers.X = 0x05;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          X: 0x05,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0xAA)).toBe(0xF7);
      });

      test('ROR_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xEF);
        cpu.registers.P.carry = true;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10A5)).toBe(0xF7);
      });

      test('ROR_ABSX without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.P.carry = true;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10AA)).toBe(0xF7);
      });

      test('ROR_ABSX with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ROR_ABSX, 0x01, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.P.carry = true;
        cpu.registers.X = 0xFF;
        mockedMemory.write(0x1100, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
          X: 0xFF,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(7)
        expect(mockedMemory.read(0x1100)).toBe(0xF7);
      });

      test('ROL',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL]));
        bus.ROM = mockedROM;
        cpu.registers.P.carry = true;
        cpu.registers.A = 0xa5;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, negative: false, carry: true  },
          PC: 0x8001,
          A: 0x4B,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(2)
      });

      test('ROL_ZERO',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL_ZERO, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xA5, 0xEF);
        cpu.registers.P.carry = true;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(5)
        expect(mockedMemory.read(0xA5)).toBe(0xDF);
      });

      test('ROL_ZEROX',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL_ZEROX, 0xA5]));
        bus.ROM = mockedROM;
        mockedMemory.write(0xAA, 0xEF);
        cpu.registers.P.carry = true;
        cpu.registers.X = 0x05;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          X: 0x05,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8002,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0xAA)).toBe(0xDF);
      });

      test('ROL_ABS',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL_ABS, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        mockedMemory.write(0x10A5, 0xEF);
        cpu.registers.P.carry = true;
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10A5)).toBe(0xDF);
      });

      test('ROL_ABSX without page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL_ABSX, 0xA5, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.P.carry = true;
        cpu.registers.X = 0x05;
        mockedMemory.write(0x10AA, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
          X: 0x05,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(6)
        expect(mockedMemory.read(0x10AA)).toBe(0xDF);
      });

      test('ROL_ABSX with page cross',() => {
        mockedROM = new ROM(new Uint8Array([op.ROL_ABSX, 0x01, 0x10]));
        bus.ROM = mockedROM;
        cpu.registers.P.carry = true;
        cpu.registers.X = 0xFF;
        mockedMemory.write(0x1100, 0xEF);
        const cycle = cpu.run();
        const expected = {
          ...defaultRegisters,
          P: { ...defaultRegisters.P, zero: false, negative: true, carry: true  },
          PC: 0x8003,
          X: 0xFF,
        };
        expect(cpu.registers).toEqual(expected);
        expect(cycle).toBe(7)
        expect(mockedMemory.read(0x1100)).toBe(0xDF);
    })
})