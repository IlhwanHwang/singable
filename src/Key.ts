export default class Key {
  start: number
  length: number
  tone: number
  velocity: number
  channel: number

  constructor(start: number, length: number, tone: number, velocity: number = 1, channel: number = 0) {
    this.start = start
    this.length = length
    this.tone = tone
    this.velocity = velocity
    this.channel = channel
  }

  replace(part: Partial<Key>) {
    return new Key(
      part.start || this.start, 
      part.length || this.length, 
      part.tone || this.tone, 
      part.velocity || this.velocity, 
      part.channel || this.channel
    )
  }
}


import {MidiWriter} from "midi-writer-js"

MidiPlayer.Player

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