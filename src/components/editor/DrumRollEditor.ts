import Component from "../Component"
import {createDivNode, createButtonNode} from "../../utils/node"
import DrumRollStructure from "../DrumRollStructure"


export default class DrumRollEditor extends Component {
  data: DrumRollStructure

  constructor(parent: Component, data: DrumRollStructure) {
    super(parent)
    this.data = data
    this.update()
  }

  render(): [Node, Node] {
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
            this.data.rows.push({
              name: "new drumroll row",
              beats: Array<boolean>(this.data.length)
            })
          }
        })
      ]
    )
    return [newDiv, newDiv]
  }
}