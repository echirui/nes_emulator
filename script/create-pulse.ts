/*
 * TODO 一番初めに、写経したファイルなので、あとで見返す 
*/

import * as fs from 'fs'
import * as path from 'path'

const width = [0.125, 0.25, 0.5, 0.75]

const create = (pulseWidth: number) => {
  const real = [0]
  const imag = [0]
  for (let i = 1; i < 8192; i++ ) {
    const realTerm = 4 / (i * Math.PI) * Math.sin(Math.PI * i * pulseWidth)
    real.push(realTerm)
    imag.push(0)
  }
  return { real, imag }
}

const ws = width.map(w => create(w))

const json = `export default {
  ${width[0]}: {
    real: new Float32Array([${ws[0].real.toString()}]),
    imag: new Float32Array([${ws[0].real.toString()}]),
  },
  ${width[1]}: {
    real: new Float32Array([${ws[1].real.toString()}]),
    imag: new Float32Array([${ws[1].real.toString()}]),
  },
  ${width[2]}: {
    real: new Float32Array([${ws[2].real.toString()}]),
    imag: new Float32Array([${ws[2].real.toString()}]),
  },
  ${width[3]}: {
    real: new Float32Array([${ws[3].real.toString()}]),
    imag: new Float32Array([${ws[3].real.toString()}]),
  },
}`

fs.writeFileSync(path.resolve(__dirname, '../src/apu/pulse.ts'), json)
