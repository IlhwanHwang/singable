import Component, { Container } from "./Component"
import Singable from "./Singable"
import {createDivNode, createOptionNode, createSelectNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, { Timeline } from "../Key";
import { minBy } from "lodash"

export interface SnapStructure {
  outliers: string
}

export default class SnapSingable extends Singable {
  className: string = "snap"
  data: SnapStructure
  op: OutEndpoint
  ipScale: InEndpoint
  ipMelody: InEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent, parentTarget)
    this.data = {
      outliers: "loop"
    }
    this.name = "new snap object"
    this.op = new OutEndpoint(this)
    this.ipScale = new InEndpoint(this, "default", "scale-endpoint", 1/3)
    this.ipMelody = new InEndpoint(this, "default", "melody-endpoint", 2/3)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new SnapEditor(parent, parentTarget, this)
  }

  sing(): Timeline {
    const timelineScale = (this.ipScale.findOut().parent as Singable).sing()
    const timelineMelody = (this.ipMelody.findOut().parent as Singable).sing()
    const scaleKeys = timelineScale.keys.filter(k => k instanceof NoteKey).map(k => k as NoteKey) 
    const melodyKeys = timelineMelody.keys.filter(k => k instanceof NoteKey).map(k => k as NoteKey)
    return new Timeline(timelineScale.length, melodyKeys.map(mk => {
      const keysAtTime = scaleKeys
        .filter(sk => sk.timing <= mk.timing && sk.timing + sk.length > mk.timing)
        .sort((a, b) => a.pitch - b.pitch)
      if (keysAtTime.length === 0) {
        return mk
      }
      else {
        const closest = minBy(keysAtTime, k => Math.abs((k.pitch - mk.pitch) % 12))
        const offsetRaw = (closest.pitch - mk.pitch + 12) % 12
        const offset = offsetRaw > 6 ? offsetRaw - 12 : offsetRaw
        return mk.replace({ pitch: mk.pitch + offset })
      }
    }))
  }
}

import BaseEditor from "./BaseEditor";


export class SnapEditor extends BaseEditor {
  data: SnapStructure

  constructor(parent: Component, parentTarget: string = "default", singable: SnapSingable) {
    super(parent, parentTarget, singable)
    this.data = singable.data
  }

  render(): [HTMLElement, Container] {
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
    return [newDiv, { default: newDiv }]
  }
}