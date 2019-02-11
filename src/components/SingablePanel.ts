import Component from "./Component"
import {createDivNode, createButtonNode} from "../utils/singable"
import Singable from "./Singable"
import DrumRollSingable from "./DrumRollSingable";
import TransposeSingable from "./TransposeSingable";
import OutputSingable from "./OutputSingable"

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
            const newSingable = new DrumRollSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New transpose"
          n.onclick = e => {
            const newSingable = new TransposeSingable(this)
            newSingable.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "New output"
          n.onclick = e => {
            const newSingable = new OutputSingable(this)
            newSingable.update()
          }
        })
      ]
    )
    return [newDiv, newDiv]
  }
}