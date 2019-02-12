import Component from "../Component"
import {createDivNode, createButtonNode} from "../../utils/singable"
import DrumRollStructure from "../DrumRollStructure"
import DrumRollRowEditor from "./DrumRollRowEditor";
import { fillArray, filled } from "../../utils";


export default class DrumRollEditor extends Component {
  data: DrumRollStructure

  constructor(parent: Component, data: DrumRollStructure) {
    super(parent)
    this.data = data
  }

  removeChild(child: Component) {
    if (child instanceof DrumRollRowEditor) {
      this.data.rows = this.data.rows.filter(d => {
        return d !== child.data
      })
    }
    super.removeChild(child)
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
        createButtonNode(n => {
          n.innerText = "Add new drumroll row"
          n.onclick = e => {
            const newDR = new DrumRollRowEditor(this, {
              name: "new drumroll row",
              cells: filled(false, this.data.length * this.data.cellsPerBeat),
              cellsPerBeat: this.data.cellsPerBeat,
              key: 0
            })
            newDR.update()
            // TODO: Smarter data sync
            this.data.rows.push(newDR.data)
          }
        }),
      ]
    )
    this.data.rows.forEach(dr => {
      new DrumRollRowEditor(this, dr)
    })
    return [newDiv, newDiv]
  }
}