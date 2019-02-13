import Singable from "./Singable"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import Key, {Timeline} from "../Key"
import {flatten} from "lodash"
import { createDivNode } from "../utils/singable";
import Draggable from "./Draggable";

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
  mouseEnteredCount: number = 0

  constructor(parent: Component, data: PianoRollStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const container = createDivNode(n => {
      n.style.position = "relative"
      n.style.width = "100%"
      n.style.height = "300%"
      n.style.border = "solid 1px red"
      n.onmousedown = e => {
        if (this.mouseEnteredCount === 0) {
          const pianoKey = new PianoRollKey(this, new Key(0, 2, 0))
          pianoKey.x = e.x - this.container.getClientRects()[0].left
          pianoKey.y = e.y - this.container.getClientRects()[0].top
          pianoKey.update()
          pianoKey.target.onmousedown(e)
        }
        console.log("hello")
      }
    })
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
        n.style.overflow = "scroll"
      }, [
        container
      ])
    ])
    return [newDiv, container]
  }
}

class PianoRollKey extends Draggable {
  key: Key
  x: number
  y: number

  constructor(parent: Component, key: Key) {
    super(parent)
    this.key = key
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.position = "absolute"
      n.style.left = `${this.x}px`
      n.style.top = `${this.y}px`
      n.style.width = `${this.key.length * 48}px`
      n.style.height = "10px"
      n.style.backgroundColor = "red"
      n.onmouseenter = e => {
        (this.parent as PianoRollEditor).mouseEnteredCount += 1
      }
      n.onmouseleave = e => {
        (this.parent as PianoRollEditor).mouseEnteredCount -= 1
      }
    })
    return [newDiv, newDiv]
  }
}