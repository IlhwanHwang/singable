import Component from "./Component"
import Singable from "./Singable"
import {createDivNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, { Timeline } from "../Key";

export interface AtChannelStructure {
  channel: number
}

export default class AtChannelSingable extends Singable {
  data: AtChannelStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      channel: 0
    }
    this.name = "new at-channel object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new AtChannelEditor(parent, this.data)
  }

  render(): [HTMLElement, HTMLElement] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Channel: ${this.data.channel + 1}`
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    const { length, keys } = (this.ip.findOut().parent as Singable).sing()
    return new Timeline(length, keys.map(key => {
      return key instanceof NoteKey
        ? key.replace({channel: this.data.channel})
        : key
    }))
  }
}

import {createSelectNode, createOptionNode} from "../utils/singable"
import { editorSingable } from "../renderer";
import { fillArray } from "../utils";


export class AtChannelEditor extends Component {
  data: AtChannelStructure

  constructor(parent: Component, data: AtChannelStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px orange",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      },
      [
        createSelectNode(n => {
          n.value = this.data.channel.toString()
          n.onchange = e => {
            this.data.channel = parseInt((e.target as HTMLOptionElement).value)
            editorSingable.get().update()
          }
        }, [
          ...fillArray(Array<number>(16), 0).map((_, ind) => {
            return createOptionNode(n => {
              n.value = ind.toString()
              n.innerText = (ind + 1).toString()
            })
          })
        ])
      ]
    )
    return [newDiv, newDiv]
  }
}