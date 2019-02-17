import PianoRollSingable from "./components/PianoRollSingable"
import NoteKey, { pitch } from "./Key";
import ReharmonizeSingable from "./components/ReharmonizeSingable";
import {singablePanel, connections} from "./renderer"
import ParallelSingable from "./components/ParallelSingable";
import RepeatSingable from "./components/RepeatSingable";
import ArpeggioSingable from "./components/ArpeggioSingable";
import OutputSingable from "./components/OutputSingable";


const newMelody = new PianoRollSingable(singablePanel)
let timing = 0
newMelody.data.length = 64
let push = (length: number, pitch: number) => {
  newMelody.data.keys.push(new NoteKey(timing, length, pitch))
  timing += length
}
newMelody.initX = 10
newMelody.initY = 200

push(1, pitch("B4"))
push(1, pitch("G4"))
push(1, pitch("E4"))
push(1, pitch("B4"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("B4"))
push(2, pitch("A4"))
push(1, pitch("A4"))
push(1, pitch("F#4"))
push(1, pitch("D4"))
push(1, pitch("A4"))
push(1/2, pitch("B4"))
push(1/2, pitch("B4"))
push(1/2, pitch("B4"))
push(1/2, pitch("A4"))
push(2, pitch("G4"))
push(1, pitch("B4"))
push(1, pitch("G4"))
push(1, pitch("E4"))
push(1, pitch("B4"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("B4"))
push(2, pitch("A4"))
push(1/2, pitch("B4"))
push(1/2, pitch("E5"))
push(1/2, pitch("G5"))
push(1/2, pitch("E5"))
push(1/2, pitch("D#5"))
push(1, pitch("D#5"))
push(1/2, pitch("D#5"))
push(1, pitch("E5"))
push(1, pitch("D#5"))
push(1, pitch("E5"))
push(1/2, pitch("E5"))
push(1/2, pitch("D5"))
push(2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("B4"))
push(3, pitch("A4"))
push(1/2, pitch("A4"))
push(1/2, pitch("A4"))
push(3/2, pitch("D5"))
push(1/2, pitch("E5"))
push(3/2, pitch("D5"))
push(1/2, pitch("C5"))
push(1/2, pitch("B4"))
push(1/2, pitch("B4"))
push(1/2, pitch("B4"))
push(1/2, pitch("A4"))
push(1, pitch("B4"))
push(1/2, pitch("E5"))
push(1/2, pitch("D5"))
push(3/2, pitch("C5"))
push(1/2, pitch("C5"))
timing += 1/2
push(1/2, pitch("C5"))
push(1/2, pitch("C5"))
push(1/2, pitch("B4"))
push(4, pitch("A4"))
push(1/2, pitch("B4"))
push(1/2, pitch("E5"))
push(1/2, pitch("G5"))
push(1/2, pitch("E5"))
push(1/2, pitch("D#5"))
push(1/2, pitch("E5"))
push(1/2, pitch("F#5"))
push(1/2, pitch("D#5"))
push(1, pitch("E5"))
push(1, pitch("D#5"))
push(2, pitch("E5"))


const newReharmonize = new ReharmonizeSingable(singablePanel)
newReharmonize.data.scale = {
  tonic: 4,
  quality: "minor"
}
newReharmonize.initX = 240
newReharmonize.initY = 100


const newRiff = new PianoRollSingable(singablePanel)
timing = 0
newRiff.data.length = 4
push = (length: number, pitch: number) => {
  newRiff.data.keys.push(new NoteKey(timing, length, pitch))
  timing += length
}
newRiff.initX = 10
newRiff.initY = 0
push(1/2, pitch("C5"))
push(1/2, pitch("C##5"))
push(1/2, pitch("C#5"))
push(1/2, pitch("C##5"))
push(1/2, pitch("C5"))
push(1/2, pitch("C##5"))
push(1/2, pitch("C#5"))
push(1/2, pitch("C##5"))


const newRepeat = new RepeatSingable(singablePanel)
newRepeat.initX = 240
newRepeat.initY = 0
newRepeat.data.repeat = 16


const newArpeggio = new ArpeggioSingable(singablePanel)
newArpeggio.initX = 480
newArpeggio.initY = 50


const newParallel = new ParallelSingable(singablePanel)
newParallel.initX = 500
newParallel.initY = 240


const newOutput = new OutputSingable(singablePanel)
newOutput.initX = 750
newOutput.initY = 240


newMelody.update()
newReharmonize.update()
newRiff.update()
newRepeat.update()
newArpeggio.update()
newParallel.update()
newOutput.update()

connections.add(newMelody.op, newReharmonize.ip)
connections.add(newRiff.op, newRepeat.ip)
connections.add(newReharmonize.op, newArpeggio.ipChord)
connections.add(newRepeat.op, newArpeggio.ipRiff)
connections.add(newMelody.op, newParallel.ipDummy[0])
connections.add(newArpeggio.op, newParallel.ipDummy[0])
connections.add(newParallel.op, newOutput.ip)