


import { NES } from './nes'

//fetch ('./static/roms/n163_soundram.nes')
fetch ('./static/roms/nestest.nes')
//fetch ('./static/roms/firedemo.nes')
  .then((res) => res.arrayBuffer())
  .then((nesFile: ArrayBuffer)  => {
    const nes = new NES()
    nes.load(nesFile)
    nes.start()
  })
