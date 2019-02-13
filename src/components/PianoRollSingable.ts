import Singable from "./Singable"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import Key, {Timeline} from "../Key"
import {flatten} from "lodash"
import { createDivNode } from "../utils/singable";

export interface PianoRollStructure {
  keys: Array<Key>
  length: number
}

export default class PianoRollSingable extends Singable {
  data: PianoRollStructure
  op: OutEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      length: 16,
      keys: Array<Key>()
    }
    this.name = "new piano roll object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new PianoRollEditor(parent, this.data)
  }

  sing(): Timeline {
    return new Timeline(
      this.data.length,
      [...this.data.keys]
    )
  }
}

export class PianoRollEditor extends Component {
  data: PianoRollStructure

  constructor(parent: Component, data: PianoRollStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "100%"
      n.style.display = "flex"
    }, [
      createDivNode(n => {
        n.style.width = "40px"
        n.style.height = "100%"
        n.style.border = "solid 1px blue"
      }),
      createDivNode(n => {
        n.style.width = "calc(100% - 40px)"
        n.style.height = "100%"
        n.style.border = "solid 1px blue"
      })
    ])
    return [newDiv, newDiv]
  }
}