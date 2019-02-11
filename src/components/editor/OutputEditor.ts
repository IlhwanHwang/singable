import Component from "../Component"
import { createDivNode } from "../../utils/singable";

export default class OutputEditor extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode()
    return [newDiv, newDiv]
  }
}