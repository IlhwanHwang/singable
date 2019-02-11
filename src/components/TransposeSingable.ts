import Component from "./Component"
import Singable from "./Singable"
import {editorBase, editorSingable} from "../renderer"
import TransposeEditor from "./editor/TransposeEditor";
import {createDivNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";

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

  create() {
    super.create()
    const target = this.target
    target.onmousedown = e => {
      if (editorSingable.get() !== this) {
        if (editorSingable.get() !== null) {
          editorSingable.get().editor.destroy()
        }
        this.editor = new TransposeEditor(editorBase, this.data)
        this.editor.update()
        editorSingable.set(this)
      }
    }
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
}