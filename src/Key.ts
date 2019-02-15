import { Track, Writer, Utils, NoteEvent, ProgramChangeEvent } from "midi-writer-js"
import { writeFile } from "fs"
import { range } from "lodash"


export const pitchMax = 127
export const pitchMin = 0


export class BaseKey {
  timing: number

  constructor(timing: number) {
    this.timing = timing
  }

  replace(part: Partial<BaseKey>) {
    return new BaseKey(
      part.timing || this.timing
    )
  }
}

export class ProgramChangeKey extends BaseKey {
  instrument: number
  channel: number

  constructor(timing: number, instrument: number, channel: number) {
    super(timing)
    this.instrument = instrument
    this.channel = channel
  }

  replace(part: Partial<ProgramChangeKey>) {
    return new ProgramChangeKey(
      part.timing || this.timing, 
      part.instrument || this.instrument, 
      part.channel || this.channel,
    )
  }
}

export default class NoteKey extends BaseKey {
  length: number
  pitch: number
  velocity: number
  channel: number

  constructor(timing: number, length: number, tone: number, velocity: number = 1, channel: number = 1) {
    super(timing)
    this.length = length
    this.pitch = tone
    this.velocity = velocity
    this.channel = channel
  }

  replace(part: Partial<NoteKey>) {
    return new NoteKey(
      part.timing || this.timing, 
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
      if (k instanceof NoteKey) {
        return new NoteEvent({ 
          pitch: k.pitch, 
          velocity: Math.floor(k.velocity * 99 + 1), 
          channel: k.channel, 
          duration: range(k.length / 8).map(_ => "32"),
          startTick: ticksPerBeat * k.timing
        })
      }
      else if (k instanceof ProgramChangeKey) {
        const programChangeKey = new ProgramChangeEvent({
          instrument: k.instrument - 1
        }) as any as {type: string, data: Uint8Array}
        programChangeKey.data[1] = 0xC0 + k.channel - 1
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