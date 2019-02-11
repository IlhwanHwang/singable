import Component from "../Component"
import {createDivNode} from "../../utils/node"


export default class EditorBase extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100vw",
        n.style.height = "50vh",
        n.style.boxSizing = "border-box"
      },
      [
      ]
    )
    return [newDiv, newDiv]
  }
}