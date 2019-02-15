import { createDivNode } from "../utils/singable";
import Component from "./Component"

export class NullEditor extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode()
    return [newDiv, newDiv]
  }
}