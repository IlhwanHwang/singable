import Component from "./Component"
import Singable from "./Singable"
import {createDivNode} from "../utils/singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import NoteKey, { Timeline, ProgramChangeKey } from "../Key";

export interface AtChannelStructure {
  channel: number
  instrumentKey: number
}

export default class AtChannelSingable extends Singable {
  className: string = "at-channel"
  data: AtChannelStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      channel: 1,
      instrumentKey: 1
    }
    this.name = "new at-channel object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new AtChannelEditor(parent, this)
  }

  render(): [HTMLElement, HTMLElement] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = `Channel: ${this.data.channel}\nInstrument: ${instruments[this.data.instrumentKey.toString()]}`
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    const { length, keys } = (this.ip.findOut().parent as Singable).sing()
    return new Timeline(length, [
      new ProgramChangeKey(0, this.data.instrumentKey, this.data.channel),
      ...keys.map(key => {
        return key instanceof NoteKey
          ? key.replace({channel: this.data.channel})
          : key
      })
    ])
  }
}

import {createSelectNode, createOptionNode} from "../utils/singable"
import { range, toPairs } from "lodash";
import BaseEditor from "./BaseEditor";
import { instruments } from "../keys";


export class AtChannelEditor extends BaseEditor {
  data: AtChannelStructure

  constructor(parent: Component, singable: AtChannelSingable) {
    super(parent, singable)
    this.data = singable.data
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
          n.onchange = e => {
            this.data.channel = parseInt(n.value)
            this.singable.update()
          }
        }, [
          ...range(16).map((_, ind) => {
            return createOptionNode(n => {
              n.value = (ind + 1).toString()
              n.innerText = (ind + 1).toString()
              if (ind + 1 === this.data.channel) {
                n.selected = true
              }
            })
          })
        ]),
        createSelectNode(n => {
          n.onchange = e => {
            this.data.instrumentKey = parseInt(n.value)
            this.singable.update()
          }
        }, [
          ...toPairs(instruments)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([key, name]) => {
              return createOptionNode(n => {
                n.innerText = name
                n.value = key
                if (n.value === this.data.instrumentKey.toString()) {
                  n.selected = true
                }
            })
          })
        ])
      ]
    )
    return [newDiv, newDiv]
  }
}