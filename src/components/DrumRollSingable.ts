import Singable from "./Singable"
import DrumRollStructure from "./DrumRollStructure"
import DrumRollEditor from "./editor/DrumRollEditor"
import {editorBase, editorSingable, setEditorSingable} from "../renderer"
import Component from "./Component";

export default class DrumRollSingable extends Singable {
  data: DrumRollStructure

  constructor(parent: Component) {
    super(parent)
    this.data.length = 16
  }

  create() {
    super.create()
    const target = this.target as HTMLElement
    target.onmousedown = e => {
      console.log("DOWN!")
      if (editorSingable !== this) {
        if (editorSingable !== null) {
          editorSingable.editor.destroy()
        }
        this.editor = new DrumRollEditor(editorBase, this.data)
        setEditorSingable(this)
      }
    }
  }
}