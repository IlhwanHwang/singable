import Component from "./Component"
import {createDivNode, createButtonNode} from "../utils/singable"
import Singable from "./Singable"
import DrumRollSingable from "./DrumRollSingable";
import TransposeSingable from "./TransposeSingable";


export default class SingablePanel extends Component {

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100vw",
        n.style.height = "50vh",
        n.style.boxSizing = "border-box"
      },
      [
        createButtonNode(n => {
          n.innerText = "New drum roll"
          n.onclick = e => {
            // this.nodes.push(new Singable(this))
            const newSingable = new DrumRollSingable(this)
            newSingable.update()
          }
          n.style.pointerEvents = "auto"
        }),
        createButtonNode(n => {
          n.innerText = "New transpose"
          n.onclick = e => {
            // this.nodes.push(new Singable(this))
            const newSingable = new TransposeSingable(this)
            newSingable.update()
          }
          n.style.pointerEvents = "auto"
        })
      ]
    )
    return [newDiv, newDiv]
  }
}