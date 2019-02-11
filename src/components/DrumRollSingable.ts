import Singable from "./Singable"
import DrumRollStructure, { DrumRollRowStructure } from "./DrumRollStructure"
import DrumRollEditor from "./editor/DrumRollEditor"
import {editorBase, editorSingable} from "../renderer"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";

export default class DrumRollSingable extends Singable {
  data: DrumRollStructure
  op: OutEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      length: 16,
      rows: Array<DrumRollRowStructure>()
    }
    this.name = "new drum roll object"
    this.op = new OutEndpoint(this)
  }

  create() {
    super.create()
    const target = this.target
    target.onmousedown = e => {
      if (editorSingable.get() !== this) {
        if (editorSingable.get() !== null) {
          editorSingable.get().editor.destroy()
        }
        this.editor = new DrumRollEditor(editorBase, this.data)
        this.editor.update()
        editorSingable.set(this)
      }
    }
  }
}