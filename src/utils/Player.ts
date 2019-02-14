import {Player as MidiPlayer} from "midi-player-js"
import { ChildProcess } from "child_process";
import {spawn} from "child_process"

export default class Player {
  macPlayer: ChildProcess
  windowPlayer: MidiPlayer
  OS: string

  constructor() {
    if (navigator.platform.indexOf("Mac") !== -1) {
      this.OS = "mac"
    }
    else {
      this.OS = "windows"
    }
  }

  play(fname: string) {
    if (this.OS === "mac") {
      this.macPlayer = spawn("timidity", [fname])
    }
    else if (this.OS === "windows") {
      const player = new MidiPlayer()
      player.loadFile(fname)
      player.play()
      this.windowPlayer = player
    }
  }

  stop() {
    if (this.OS === "mac") {
      this.macPlayer.kill()
    }
    else if (this.OS === "windows") {
      this.windowPlayer.stop()
    }
  }
}