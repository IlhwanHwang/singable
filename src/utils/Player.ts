import { ChildProcess } from "child_process";
import {spawn} from "child_process"
import NoteKey, { Timeline, BaseKey } from "../Key";

export default class Player {
  macPlayer: ChildProcess
  windowPlayer: ChildProcess
  OS: string

  constructor() {
    if (navigator.platform.indexOf("Mac") !== -1) {
      this.OS = "mac"
    }
    else {
      this.OS = "windows"
    }
  }

  play(fname: string, onclose?: (code: number) => void) {
    if (this.OS === "mac") {
      this.macPlayer = spawn("timidity", [fname])
      this.macPlayer.on('close', onclose);
    }
    else if (this.OS === "windows") {
      this.windowPlayer = spawn("timidity", [fname])
      this.windowPlayer.on('close', onclose);
    }
  }

  stop() {
    if (this.OS === "mac") {
      this.macPlayer.kill()
    }
    else if (this.OS === "windows") {
      this.windowPlayer.kill()
    }
  }
}


export function playKey(key: BaseKey) {
  const timeline = new Timeline(key instanceof NoteKey ? key.length : 0, [key])
  timeline.toFile("temp.mid")
  new Player().play("temp.mid", () => {})
}