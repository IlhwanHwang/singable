import Component from "./Component"
import Singable from "./Singable"
import {editorBase, editorSingable} from "../renderer"
import AtChannelEditor from "./editor/AtChannelEditor";
import {createDivNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";

export interface AtChannelStructure {
  channel: number
}

export default class AtChannelSingable extends Singable {
  data: AtChannelStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      channel: 0
    }
    this.name = "new at-channel object"
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
        this.editor = new AtChannelEditor(editorBase, this.data)
        this.editor.update()
        editorSingable.set(this)
      }
    }
  }

  render(): [HTMLElement, HTMLElement] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Channel: ${this.data.channel + 1}`
      })
    )
    return [newDiv, container]
  }
}