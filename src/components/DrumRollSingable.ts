import Singable from "./Singable"
import DrumRollStructure, { DrumRollRowStructure } from "./DrumRollStructure"
import DrumRollEditor from "./editor/DrumRollEditor"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import Key, {Timeline} from "../Key"
import {flatten} from "lodash"

export default class DrumRollSingable extends Singable {
  data: DrumRollStructure
  op: OutEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      cellsPerBeat: 4,
      length: 4,
      rows: Array<DrumRollRowStructure>()
    }
    this.name = "new drum roll object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new DrumRollEditor(parent, this.data)
  }

  sing(): Timeline {
    return new Timeline(
      this.data.length,
      flatten<Key>(this.data.rows.map(row => {
        return row.cells
          .map((c, ind) => [c, ind])
          .filter(([c, ind]) => c)
          .map(([c, ind]) => new Key(
            (ind as number) / this.data.cellsPerBeat, 
            1 / this.data.cellsPerBeat,
            row.key, 1.0, 9
            ))
      })) as Array<Key>
    )
  }
}