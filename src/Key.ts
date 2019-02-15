import { Track, Writer, Utils, NoteEvent, ProgramChangeEvent } from "midi-writer-js"
import { writeFile } from "fs"

export const pitchMax = 127
export const pitchMin = 0


interface BaseKey {}

export class ProgramChangeKey implements BaseKey {
  instrument: number
  channel: number

  constructor(instrument: number, channel: number) {
    this.instrument = instrument
    this.channel = channel
  }
}

export default class Key implements BaseKey {
  start: number
  length: number
  pitch: number
  velocity: number
  channel: number

  constructor(start: number, length: number, tone: number, velocity: number = 1, channel: number = 1) {
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
  keys: Array<BaseKey>
  length: number

  constructor(length: number, keys: Array<BaseKey> = new Array<BaseKey>()) {
    this.length = length
    this.keys = keys
  }

  clone() {
    return new Timeline(this.length, [...this.keys])
  }

  toFile(fname: string) {
    const track = new Track()
    const ticksPerBeat = Utils.getTickDuration("4")
    const events = this.keys.map(k => {
      if (k instanceof Key) {
        return new NoteEvent({ 
          pitch: k.pitch, 
          velocity: Math.floor(k.velocity * 99 + 1), 
          channel: k.channel, 
          duration: Math.floor(4 / k.length).toString(),
          startTick: ticksPerBeat * k.start
        })
      }
      else if (k instanceof ProgramChangeKey) {
        const programChangeKey = new ProgramChangeEvent({
          instrument: k.instrument - 1
        }) as any as {type: string, data: Uint8Array}
        programChangeKey.data[1] = 0xC0 + k.channel
        return programChangeKey
      }
    })
  
    events.forEach(e => {
      track.addEvent(e, {})
    })
  
    const write = new Writer(track);
    writeFile(fname, write.buildFile(), err => {})
  }
}



export function pitchNotation(pitch: number) {
  const octave = Math.floor(pitch / 12) - 1
  const tone = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][pitch % 12]
  return `${tone}${octave}`
}