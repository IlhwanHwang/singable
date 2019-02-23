import Singable from "./Singable"
import Component from "./Component";
import { InEndpoint } from "./Endpoint";
import { Timeline } from "../Key";
import { NullEditor } from "./NullEditor";

export default class OutputSingable extends Singable {
  className: string = "output"
  ip: InEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.name = "new output"
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new NullEditor(parent)
  }

  sing(): Timeline {
    return (this.ip.findOut().parent as Singable).sing()
  }
}