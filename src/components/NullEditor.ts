import { createDivNode } from "../utils/singable";
import Component, { Container } from "./Component"

export class NullEditor extends Component {
  render(): [HTMLElement, Container] {
    const newDiv = createDivNode()
    return [newDiv, { default: newDiv }]
  }
}