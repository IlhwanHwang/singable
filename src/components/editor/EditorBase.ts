import Component from "../Component"
import {createDivNode} from "../../utils/singable"


export default class EditorBase extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
      ]
    )
    return [newDiv, newDiv]
  }
}