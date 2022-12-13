import ROM from '../../src/rom'

let rom = new ROM(new Uint8Array([0,0,0,0,0,0,0,0,]))

describe('ROMのテスト', () => {
    test('ROM test1', () => {
        expect(rom.size).toBe(8)
    })
})
