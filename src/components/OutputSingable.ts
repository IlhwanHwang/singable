import Singable from "./Singable"
import Component from "./Component";
import { InEndpoint } from "./Endpoint";
import { Timeline } from "../Key";

export default class OutputSingable extends Singable {
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.name = "new output"
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new OutputEditor(parent)
  }

  sing(): Timeline {
    return (this.ip.findOut().parent as Singable).sing()
  }
}

import { createDivNode } from "../utils/singable";

export class OutputEditor extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode()
    return [newDiv, newDiv]
  }
}