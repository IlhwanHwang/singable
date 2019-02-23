import Component from "./Component"
import Singable from "./Singable"
import { OutEndpoint } from "./Endpoint";
import { Timeline, BaseKey } from "../Key";
import { NullEditor } from "./NullEditor";
import MultipleInputSingable from "./MultipleInputSingable";


export default class EnumerateSingable extends MultipleInputSingable {
  className: string = "enumerate"
  op: OutEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.name = "new enumerate object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new NullEditor(parent)
  }

  sing(): Timeline {
    const timelines = this.ipConnected
      .map(ip => (ip.findOut().parent as Singable).sing())
    // const length = timelines.map(tl => tl.length).reduce((acc, x) => acc + x)
    let time = 0
    const totalKeys = Array<BaseKey>()
    for (const { keys, length } of timelines) {
      totalKeys.push(...keys.map(k => k.replace({ timing: k.timing + time })))
      time += length
    }
    return new Timeline(time, totalKeys)
  }
}