import Singable from "./Singable"
import DrumRollStructure, { DrumRollRowStructure } from "./DrumRollStructure"
import DrumRollEditor from "./editor/DrumRollEditor"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import NoteKey, {Timeline} from "../Key"
import {flatten} from "lodash"

export default class DrumRollSingable extends Singable {
  className: string = "drumroll"
  data: DrumRollStructure
  op: OutEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.data = {
      cellsPerBeat: 4,
      length: 4,
      rows: Array<DrumRollRowStructure>()
    }
    this.name = "new drum roll object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new DrumRollEditor(parent, parentTarget, this)
  }

  sing(): Timeline {
    return new Timeline(
      this.data.length,
      flatten<NoteKey>(this.data.rows.map(row => {
        return row.cells
          .map((c, ind) => c
            ? new NoteKey(
                (ind as number) / this.data.cellsPerBeat, 
                1 / this.data.cellsPerBeat,
                row.key, 1.0, 10
              )
            : null)
          .filter(k => k !== null)
      })) as Array<NoteKey>
    )
  }
}