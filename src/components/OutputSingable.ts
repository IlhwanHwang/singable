import Singable from "./Singable"
import OutputEditor from "./editor/OutputEditor"
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