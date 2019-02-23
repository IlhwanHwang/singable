import Component from "./Component"
import Singable from "./Singable"
import { OutEndpoint } from "./Endpoint";
import { Timeline } from "../Key";
import { NullEditor } from "./NullEditor";
import MultipleInputSingable from "./MultipleInputSingable";


export default class ParallelSingable extends MultipleInputSingable {
  className: string = "parallel"
  op: OutEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.name = "new parallel object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new NullEditor(parent, parentTarget)
  }

  sing(): Timeline {
    const timelines = this.ipConnected
      .map(ip => (ip.findOut().parent as Singable).sing())
    const length = Math.max(...timelines.map(tl => tl.length))
    const keys = timelines.map(tl => tl.keys).reduce((totalKeys, keys) => totalKeys.concat(keys))
    return new Timeline(length, keys)
  }
}