import Singable from "./Singable"
import OutputEditor from "./editor/OutputEditor"
import {editorBase, editorSingable} from "../renderer"
import Component from "./Component";
import { InEndpoint } from "./Endpoint";

export default class DrumRollSingable extends Singable {
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.name = "new output"
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
        this.editor = new OutputEditor(editorBase)
        this.editor.update()
        editorSingable.set(this)
      }
    }
  }
}