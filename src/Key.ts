export const pitchMax = 127
export const pitchMin = 0

export default class Key {
  start: number
  length: number
  pitch: number
  velocity: number
  channel: number

  constructor(start: number, length: number, tone: number, velocity: number = 1, channel: number = 0) {
    this.start = start
    this.length = length
    this.pitch = tone
    this.velocity = velocity
    this.channel = channel
  }

  replace(part: Partial<Key>) {
    return new Key(
      part.start || this.start, 
      part.length || this.length, 
      part.pitch || this.pitch, 
      part.velocity || this.velocity, 
      part.channel || this.channel
    )
  }
}


export class Timeline {
  keys: Array<Key>
  length: number

  constructor(length: number, keys: Array<Key> = new Array<Key>()) {
    this.length = length
    this.keys = keys
  }

  clone() {
    return new Timeline(this.length, [...this.keys])
  }

  toMidi(fname: string) {

  }
}



export function pitchNotation(pitch: number) {
  const octave = Math.floor(pitch / 12) - 1
  const tone = [ "C", "C#", "D", "D#", "E", "E#", "F", "F#", "G", "G#", "A", "A#", "B"][pitch % 12]
  return `${tone}${octave}`
}