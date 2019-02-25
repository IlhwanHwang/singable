import { Track, Writer, Utils, NoteEvent, ProgramChangeEvent } from "midi-writer-js"
import { writeFileSync } from "fs"
import { range } from "lodash"
import { nvl } from "./utils";

export const pitchMax = 127
export const pitchMin = 0


const Constants = {
  HEADER_CHUNK_TYPE: [0x4d, 0x54, 0x68, 0x64],
  HEADER_CHUNK_LENGTH: [0x00, 0x00, 0x00, 0x06],
  HEADER_CHUNK_FORMAT0: [0x00, 0x00],
  HEADER_CHUNK_FORMAT1: [0x00, 0x01],
  HEADER_CHUNK_DIVISION: [0x00, 0x80],
  TRACK_CHUNK_TYPE: [0x4d, 0x54, 0x72, 0x6b],
  META_EVENT_ID: 0xFF,
  META_TEXT_ID: 0x01,
  META_COPYRIGHT_ID: 0x02,
  META_TRACK_NAME_ID: 0x03,
  META_INSTRUMENT_NAME_ID: 0x04,
  META_LYRIC_ID: 0x05,
  META_MARKER_ID: 0x06,
  META_CUE_POINT: 0x07,
  META_TEMPO_ID: 0x51,
  META_SMTPE_OFFSET: 0x54,
  META_TIME_SIGNATURE_ID: 0x58,
  META_KEY_SIGNATURE_ID: 0x59,
  META_END_OF_TRACK_ID: [0x2F, 0x00],
  CONTROLLER_CHANGE_STATUS: 0xB0,
  PROGRAM_CHANGE_STATUS: 0xC0
};


function numberToVariableLength(ticks: number) {
  let buffer = ticks & 0x7F;
  while (ticks = ticks >> 7) {
    buffer <<= 8;
    buffer |= ticks & 0x7F | 0x80;
  }
  const bList = [];
  while (true) {
    bList.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8
    }
    else {
      break;
    }
  }
  return bList;
}


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
      nvl(part.timing, this.timing), 
      nvl(part.instrument, this.instrument), 
      nvl(part.channel, this.channel),
    )
  }
}


export class BPMKey extends BaseKey {
  bpm: number

  constructor(timing: number, bpm: number) {
    super(timing)
    this.bpm = bpm
  }

  replace(part: Partial<BPMKey>) {
    return new BPMKey(
      nvl(part.timing, this.timing), 
      nvl(part.bpm, this.bpm)
    )
  }
}


export interface NoteKeyStructure {
  timing: number
  length: number
  pitch: number
  velocity: number
  channel: number
}

export default class NoteKey extends BaseKey {
  length: number
  pitch: number
  velocity: number
  channel: number

  static fromStructure(s: NoteKeyStructure) {
    return new NoteKey(s.timing, s.length, s.pitch, s.velocity, s.channel)
  }

  constructor(timing: number, length: number, pitch: number, velocity: number = 1, channel: number = 1) {
    super(timing)
    this.length = length
    this.pitch = pitch
    this.velocity = velocity
    this.channel = channel
  }

  replace(part: Partial<NoteKey>) {
    return new NoteKey(
      nvl(part.timing, this.timing), 
      nvl(part.length, this.length), 
      nvl(part.pitch, this.pitch), 
      nvl(part.velocity, this.velocity), 
      nvl(part.channel, this.channel)
    )
  }

  end() {
    return this.timing + this.length
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
    const beatOffset = -Math.min(...this.keys.map(k => k.timing))
    const events = this.keys.map(k => {
      if (k instanceof NoteKey) {
        return new NoteEvent({ 
          pitch: k.pitch, 
          velocity: Math.floor(k.velocity * 99 + 1), 
          channel: k.channel, 
          duration: range(k.length * 8).map(_ => "32"),
          startTick: ticksPerBeat * (k.timing + beatOffset)
        })
      }
      else if (k instanceof ProgramChangeKey) {
        const programChangeEvent = new ProgramChangeEvent({
          instrument: k.instrument - 1
        }) as any as {type: string, data: Uint8Array}
        programChangeEvent.data[1] = 0xC0 + k.channel - 1
        return programChangeEvent
      }
      else if (k instanceof BPMKey) {
        const tempo = Math.round(60000000 / k.bpm)
        return {
          type: "tempo",
          data: [
            0x00, Constants.META_EVENT_ID, Constants.META_TEMPO_ID,
            0x03,
            (tempo >> 16 & 0xFF), (tempo >> 8 & 0xFF), (tempo & 0xFF)]
        }
      }
    })
  
    events.forEach(e => {
      track.addEvent(e, {})
    })
  
    const write = new Writer(track);
    writeFileSync(fname, write.buildFile())
  }

  slice(timing: number, length: number) {
    const end = timing + length
    return new Timeline(length, this.keys
      .filter(k => {
        if (k instanceof NoteKey) {
          const keyEnd = k.timing + k.length
          return (k.timing >= timing && k.timing < end) || (keyEnd > timing && keyEnd <= end)
        }
        else {
          return true
        }
      })
      .map(k => {
        if (k instanceof NoteKey) {
          const keyEnd = k.timing + k.length
          const keyClipEnd = Math.min(keyEnd, end)
          const keyClipTiming = Math.max(k.timing, timing)
          return k.replace({timing: keyClipTiming, length: keyClipEnd - keyClipTiming})
        }
        else {
          return k
        }
      })
    )
  }

  merge(other: Timeline) {
    return new Timeline(Math.max(this.length, other.length), [...this.keys, ...other.keys])
  }
}



export function pitchNotation(pitch: number, includeOctave: boolean = true) {
  const octave = Math.floor(pitch / 12) - 1
  const tone = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][pitch % 12]
  return includeOctave ? `${tone}${octave}` : `${tone}`
}


export function pitch(notation: string) {
  const [_, tone, accidential, octave] = notation.match(RegExp("([A-G])([#bx]*)(-?[0-9]*)"))
  const countOccurance = (s: string, c: string) => s.split("").filter(d => d === c).length
  const semitones = countOccurance(accidential, "#") + countOccurance(accidential, "x") * 2 - countOccurance(accidential, "b")
  const basepitch = ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 } as { [index: string]: number })[tone]
  return basepitch + semitones + (parseInt(octave) + 1) * 12
}