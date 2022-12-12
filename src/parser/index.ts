/*

https://www.nesdev.org/wiki/INES
An iNES file consists of the following sections, in order:

Header (16 bytes)
Trainer, if present (0 or 512 bytes)
PRG ROM data (16384 * x bytes)
CHR ROM data, if present (8192 * y bytes)
PlayChoice INST-ROM, if present (0 or 8192 bytes)
PlayChoice PROM, if present (16 bytes Data, 16 bytes CounterOut) (this is often missing, see PC10 ROM-Images for details)

*/





const NES_HEADER_SIZE = 0x0010 //16bit
/*
Some ROM-Images additionally contain a 128-byte (or sometimes 127-byte) title at the end of the file.

The format of the header is as follows:

0-3: Constant $4E $45 $53 $1A ("NES" followed by MS-DOS end-of-file)
4: Size of PRG ROM in 16 KB units
5: Size of CHR ROM in 8 KB units (Value 0 means the board uses CHR RAM)
6: Flags 6 - Mapper, mirroring, battery, trainer
7: Flags 7 - Mapper, VS/Playchoice, NES 2.0
8: Flags 8 - PRG-RAM size (rarely used extension)
9: Flags 9 - TV system (rarely used extension)
10: Flags 10 - TV system, PRG-RAM presence (unofficial, rarely used extension)
11-15: Unused padding (should be filled with zero, but some rippers put their name across bytes 7-15)
 */

const PROGRAM_ROM_SIZE = 0x4000       //ROM
const CHARACTOER_ROM_SIZE = 0x2000    //CHAR ROM

//
//メモリ？
export type NesROM = {
  isHorizontalMirror: boolean
  characterROM: Uint8Array
  programROM: Uint8Array
}


export const parse = (nesBuffer: ArrayBuffer): NesROM => {
  const nes = new Uint8Array(nesBuffer)
  if ([].slice.call(nes, 0, 3).map(v => String.fromCharCode(v)).join('') !== 'NES') {
    throw new Error('This file is not NES format.')
  }
  
  const programROMPages = nes[4]
  // console.debug('program   ROM pages = ', programROMPages)

  const characterROMPages = nes[5]
  // console.debug('charactor ROM pages = ', characterROMPages)

  const isHorizontalMirror = !(nes[6] & 0x01)
  const mapper = (((nes[6] & 0xF0) >> 4)|nes[7] & 0xF0)
  // console.debug('mapper', mapper)

  const characterROMStart = NES_HEADER_SIZE + programROMPages * PROGRAM_ROM_SIZE
  const characterROMEnd = characterROMStart + characterROMPages * CHARACTOER_ROM_SIZE


  // console.debug('charROM start = ', characterROMStart)
  // console.debug('charROM end   = ', characterROMEnd)
  // console.debug('prom pages = ', programROMPages)
  const nesROM: NesROM = {
    isHorizontalMirror,
    programROM: nes.slice(NES_HEADER_SIZE, characterROMStart - 1),
    characterROM: nes.slice(characterROMStart, characterROMEnd - 1),
  }
  return nesROM
}
