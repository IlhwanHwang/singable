import Component, { Container } from "./Component"
import Singable from "./Singable"
import {editorBase} from "../renderer"
import { createDivNode, createInputNode, createButtonNode } from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, {Timeline} from "../Key"
import BaseEditor from "./BaseEditor";

export interface TransposeStructure {
  semitones: number
}

export default class TransposeSingable extends Singable {
  className: string = "transpose"
  data: TransposeStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.data = {
      semitones: 0
    }
    this.name = "new transpose object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new TransposeEditor(parent, parentTarget, this)
  }

  render(): [HTMLElement, Container] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Semitones: ${this.data.semitones}`
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    const { length, keys } = (this.ip.findOut().parent as Singable).sing()
    return new Timeline(length, keys.map(key => {
      return key instanceof NoteKey
        ? key.replace({pitch: key.pitch + this.data.semitones})
        : key
    }))
  }
}

export class TransposeEditor extends BaseEditor {
  data: TransposeStructure
  editing: boolean = false
  semitonesInput: string

  constructor(parent: Component, parentTarget: string = "default", singable: TransposeSingable) {
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
        this.editing
          ? createInputNode(n => {
              n.value = this.data.semitones.toString()
              n.onchange = e => {
                this.semitonesInput = (e.target as HTMLInputElement).value
              }
            })
          : createDivNode(n => {
              n.innerText = this.data.semitones.toString()
            }),
        createButtonNode(n => {
          n.innerText = "Edit"
          n.onclick = e => {
            if (this.editing) {
              try {
                this.data.semitones = parseInt(this.semitonesInput)
                this.singable.update()
              } catch (e) {
                // pass
              }
              this.editing = false
            }
            else {
              this.editing = true
            }
            this.update()
          }
        })
      ]
    )
    return [newDiv, { default: newDiv }]
  }
}