import Component from "./Component"
import {createDivNode, createButtonNode} from "../utils/node"
import Singable from "./Singable"
import DrumRollSingable from "./DrumRollSingable";


export default class SingablePanel extends Component {

  render(): [Node, Node] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100vw",
        n.style.height = "50vh",
        n.style.boxSizing = "border-box"
      },
      [
        createButtonNode(n => {
          n.innerText = "New"
          n.onclick = e => {
            // this.nodes.push(new Singable(this))
            const newSingable = new DrumRollSingable(this)
            newSingable.update()
          }
        })
      ]
    )
    return [newDiv, newDiv]
  }
}