import Component from "./Component"
import Singable from "./Singable"
import {editorBase} from "../renderer"
import { createDivNode, createInputNode, createButtonNode } from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, {Timeline} from "../Key"
import BaseEditor from "./BaseEditor";
import { range, flatten } from "lodash"

export interface RepeatStructure {
  repeat: number
}

export default class RepeatSingable extends Singable {
  data: RepeatStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      repeat: 1
    }
    this.name = "new Repeat object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new RepeatEditor(editorBase, this)
  }

  render(): [HTMLElement, HTMLElement] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Repeat: ${this.data.repeat}`
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    const { length, keys } = (this.ip.findOut().parent as Singable).sing()
    return new Timeline(
      length * this.data.repeat,
      flatten(
        range(this.data.repeat)
          .map(i => keys.map(k => k.replace({ timing: k.timing + length * i })))
      )
    )
  }
}

export class RepeatEditor extends BaseEditor {
  data: RepeatStructure
  editing: boolean = false
  semitonesInput: string

  constructor(parent: Component, singable: RepeatSingable) {
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
        this.editing
          ? createInputNode(n => {
              n.value = this.data.repeat.toString()
              n.onchange = e => {
                this.semitonesInput = (e.target as HTMLInputElement).value
              }
            })
          : createDivNode(n => {
              n.innerText = this.data.repeat.toString()
            }),
        createButtonNode(n => {
          n.innerText = "Edit"
          n.onclick = e => {
            if (this.editing) {
              try {
                this.data.repeat = parseInt(this.semitonesInput)
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
    return [newDiv, newDiv]
  }
}