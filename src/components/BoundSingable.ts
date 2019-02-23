import Component, { Container } from "./Component"
import Singable from "./Singable"
import {createDivNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, { Timeline, ProgramChangeKey, pitchNotation, pitchMax, pitchMin } from "../Key";

export interface BoundStructure {
  upper: number
  lower: number
}

export default class BoundSingable extends Singable {
  className: string = "bound"
  data: BoundStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.data = {
      upper: 72,
      lower: 60
    }
    this.name = "new bound object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new BoundEditor(parent, parentTarget, this)
  }

  render(): [HTMLElement, Container] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Upper: ${pitchNotation(this.data.upper)}\nLower: ${pitchNotation(this.data.lower)}`
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    const { length, keys } = (this.ip.findOut().parent as Singable).sing()
    return new Timeline(length, keys.map(k => {
      if (k instanceof NoteKey) {
        const octaveDiffUpper = Math.ceil(Math.max(k.pitch - this.data.upper, 0) / 12)
        const octaveDiffLower = Math.ceil(Math.max(this.data.lower - k.pitch, 0) / 12)
        return k.replace({ pitch: k.pitch + octaveDiffLower * 12 - octaveDiffUpper * 12})
      }
      else {
        return k
      }
    }))
  }
}

import {createSelectNode, createOptionNode} from "../utils/singable"
import { range, toPairs } from "lodash";
import BaseEditor from "./BaseEditor";
import { instruments } from "../keys";


export class BoundEditor extends BaseEditor {
  data: BoundStructure

  constructor(parent: Component, parentTarget: string = "default", singable: BoundSingable) {
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
            this.data.upper = parseInt(n.value)
            this.singable.update()
          }
        }, [
          ...range(pitchMax, pitchMin, -1).map(pitch => {
            return createOptionNode(n => {
              n.value = pitch.toString()
              n.innerText = pitchNotation(pitch)
              if (pitch === this.data.upper) {
                n.selected = true
              }
            })
          })
        ]),
        createSelectNode(n => {
          n.onchange = e => {
            this.data.lower = parseInt(n.value)
            this.singable.update()
          }
        }, [
          ...range(pitchMax, pitchMin, -1).map(pitch => {
            return createOptionNode(n => {
              n.value = pitch.toString()
              n.innerText = pitchNotation(pitch)
              if (pitch === this.data.lower) {
                n.selected = true
              }
            })
          })
        ])
      ]
    )
    return [newDiv, { default: newDiv }]
  }
}