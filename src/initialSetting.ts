import PianoRollSingable from "./components/PianoRollSingable"
import NoteKey, { pitch } from "./Key";
import ReharmonizeSingable from "./components/ReharmonizeSingable";
import {singablePanel, connections} from "./renderer"
import ParallelSingable from "./components/ParallelSingable";
import RepeatSingable from "./components/RepeatSingable";
import ArpeggioSingable from "./components/ArpeggioSingable";
import OutputSingable from "./components/OutputSingable";
import BoundSingable from "./components/BoundSingable";


const newMelody = new PianoRollSingable(singablePanel)
let timing = 0
newMelody.data.length = 64
let push = (length: number, pitch: number) => {
  newMelody.data.keys.push(new NoteKey(timing, length, pitch))
  timing += length
}

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

const newBound = new BoundSingable(singablePanel)
newBound.data.lower = pitch("C3")
newBound.data.upper = pitch("C4")

const newRiff = new PianoRollSingable(singablePanel)
timing = 0
newRiff.data.length = 4
push = (length: number, pitch: number) => {
  newRiff.data.keys.push(new NoteKey(timing, length, pitch))
  timing += length
}
push(1/2, pitch("C4"))
push(1/2, pitch("C##4"))
push(1/2, pitch("C#4"))
push(1/2, pitch("C##4"))
push(1/2, pitch("C4"))
push(1/2, pitch("C##4"))
push(1/2, pitch("C#4"))
push(1/2, pitch("C##4"))

const newRepeat = new RepeatSingable(singablePanel)
newRepeat.data.repeat = 16

const newArpeggio = new ArpeggioSingable(singablePanel)
const newParallel = new ParallelSingable(singablePanel)
const newOutput = new OutputSingable(singablePanel)


newMelody.update()
newReharmonize.update()
newBound.update()
newRiff.update()
newRepeat.update()
newArpeggio.update()
newParallel.update()
newOutput.update()

newRiff.moveTo(10, 0)
newRepeat.moveTo(240, 0)
newReharmonize.moveTo(240, 100)
newMelody.moveTo(10, 240)
newParallel.moveTo(500, 240)
newArpeggio.moveTo(480, 50)
newOutput.moveTo(750, 240)

connections.add(newMelody.op, newReharmonize.ip)
connections.add(newRiff.op, newRepeat.ip)
connections.add(newReharmonize.op, newBound.ip)
connections.add(newBound.op, newArpeggio.ipChord)
connections.add(newRepeat.op, newArpeggio.ipRiff)
connections.add(newMelody.op, newParallel.ipDummy[0])
connections.add(newArpeggio.op, newParallel.ipDummy[0])
connections.add(newParallel.op, newOutput.ip)