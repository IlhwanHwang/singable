import Component from "./Component"
import Singable from "./Singable"
import {createDivNode, createOptionNode, createSelectNode, createInputNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, { Timeline, ProgramChangeKey } from "../Key";

export interface ArpeggioStructure {
  outliers: string
  riff: {
    basePitch: number
  }
}

export default class ArpeggioSingable extends Singable {
  className: string = "arpeggio"
  data: ArpeggioStructure
  op: OutEndpoint
  ipChord: InEndpoint
  ipRiff: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      outliers: "loop",
      riff: {
        basePitch: 60
      }
    }
    this.name = "new arpeggio object"
    this.op = new OutEndpoint(this)
    this.ipChord = new InEndpoint(this, "chord-endpoint", 1/3)
    this.ipRiff = new InEndpoint(this, "riff-endpoint", 2/3)
  }

  getEditor(parent: Component): Component {
    return new ArpeggioEditor(parent, this)
  }

  sing(): Timeline {
    const timelineChord = (this.ipChord.findOut().parent as Singable).sing()
    const timelineRiff = (this.ipRiff.findOut().parent as Singable).sing()
    const chordKeys = timelineChord.keys.filter(k => k instanceof NoteKey).map(k => k as NoteKey) 
    const riffKeys = timelineRiff.keys.filter(k => k instanceof NoteKey).map(k => k as NoteKey)
    return new Timeline(timelineChord.length, riffKeys.map(rk => {
      const keysAtTime = chordKeys
        .filter(ck => ck.timing <= rk.timing && ck.timing + ck.length > rk.timing)
        .sort((a, b) => a.pitch - b.pitch)
      const indexRaw = (rk.pitch - this.data.riff.basePitch) % keysAtTime.length
      const index = indexRaw >= 0 ? indexRaw : indexRaw + keysAtTime.length
      const targetKey = (() => {
        if (this.data.outliers === "loop") {
          return keysAtTime[index]
        }
        else if (this.data.outliers === "octave") {
          const octave = Math.floor((rk.pitch - this.data.riff.basePitch) / 12)
          console.log(rk.pitch, this.data.riff.basePitch, octave)
          return keysAtTime[index].replace({ pitch: keysAtTime[index].pitch + octave * 12 })
        }
        else {
          return null
        }
      })()
      const velocity = targetKey.velocity * rk.velocity
      return rk.replace({ pitch: targetKey.pitch, velocity: velocity })
    }))
  }
}

import BaseEditor from "./BaseEditor";


export class ArpeggioEditor extends BaseEditor {
  data: ArpeggioStructure

  constructor(parent: Component, singable: ArpeggioSingable) {
    super(parent, singable)
    this.data = singable.data
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px orange",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        createSelectNode(n => {
          n.onchange = e => {
            this.data.outliers = n.value
          }
        },
          [["Loop", "loop"], ["Octave", "octave"]]
            .map(([text, value]) => createOptionNode(n => {
              n.innerText = text
              n.value = value
              if (n.value === this.data.outliers) {
                n.selected = true
              }
            }))  
        )
      ]
    )
    return [newDiv, newDiv]
  }
}