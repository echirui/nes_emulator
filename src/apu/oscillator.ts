/*
 *
 *
*/

import pulse from './pulse'

export type Kind = 'square' | 'triangle'

export type OscillatorOption = {
  kind?: Kind
  frequency?: number
  harmonics?: { real: number; imag: number; }
}

export default class Oscillator {
  context: AudioContext
  oscillator: OscillatorNode
  gain: GainNode
  playing: boolean
  type: Kind
  waves: {
    [key: string]: PeriodicWave,
  }

  constructor(type?: Kind) {
    try {
      //const AudioContext = window.AudioContext || window.webkitAudioContext
      const AudioContext = window.AudioContext
      this.context = new AudioContext()
    } catch (e) {
      throw new Error('Web Audio is not supported in this browser!')
    }
    this.type = type || 'square'
    this.oscillator = this.createOscillator({ kind: this.type })

    this.waves = {
      '0.125': this.context.createPeriodicWave(pulse['0.125'].real, pulse['0.125'].imag),
      '0.25': this.context.createPeriodicWave(pulse['0.25'].real, pulse['0.25'].imag),
      '0.5': this.context.createPeriodicWave(pulse['0.5'].real, pulse['0.5'].imag),
      '0.75': this.context.createPeriodicWave(pulse['0.75'].real, pulse['0.75'].imag),
    }

    this.setPulseWidth(0.5)
    this.playing = false
  }

  start() {
    if (this.playing) {
      this.stop()
    }
    this.playing = true
    this.oscillator.start(0)
  }

  stop() {
    if (this.playing) {
      this.playing = false
      this.oscillator.stop(this.context.currentTime)
      this.oscillator = this.createOscillator()
      this.setPulseWidth(0.5)
    }
  }

  close() {
    this.context.close()
  }

  createOscillator(options: OscillatorOption = {}): OscillatorNode {
    const oscillator = this.context.createOscillator()
    if (options.kind) {
      oscillator.type = options.kind
    }
    if (options.frequency) oscillator.frequency.value = options.frequency
    if (options.harmonics) {
      const waveform = this.context.createPeriodicWave(
        new Float32Array(options.harmonics.real),
        new Float32Array(options.harmonics.imag)
      )
      oscillator.setPeriodicWave(waveform)
    }

    this.gain = this.context.createGain()
    this.gain.gain.value = 0.01
    oscillator.connect(this.gain)
    this.gain.connect(this.context.destination)
    return oscillator
  }
  
  setPulseWidth(pulseWidth: number) {
    this.oscillator.setPeriodicWave(this.waves[`${pulseWidth}`])
    this.oscillator.setPeriodicWave(this.waves[`${pulseWidth}`])
  }

  setFrequency(frequency: number) {
    this.oscillator.frequency.value = frequency
  }

  changeFrequency(frequency: number) {
    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime)
  }

  setVolume(volume: number) {
    volume = Math.max(0, Math.min(1, volume))
    this.gain.gain.value = volume
  }
}
