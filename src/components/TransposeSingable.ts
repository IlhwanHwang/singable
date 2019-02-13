import Component from "./Component"
import Singable from "./Singable"
import {editorBase, editorSingable} from "../renderer"
import { createDivNode, createInputNode, createButtonNode } from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import {Timeline} from "../Key"

export interface TransposeStructure {
  semitones: number
}

export default class TransposeSingable extends Singable {
  data: TransposeStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      semitones: 0
    }
    this.name = "new transpose object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new TransposeEditor(editorBase, this.data)
  }

  render(): [HTMLElement, HTMLElement] {
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
    return new Timeline(length, keys.map(key => key.replace({tone: key.tone + this.data.semitones})))
  }
}

export class TransposeEditor extends Component {
  data: TransposeStructure
  editing: boolean = false
  semitonesInput: string

  constructor(parent: Component, data: TransposeStructure) {
    super(parent)
    this.data = data
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
                editorSingable.get().update()
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