import Component from "./Component"
import Singable from "./Singable"
import { createButtonNode } from "../utils/singable";
import { outConnectionFocus, connections } from "../renderer"
import { nativeImage } from "electron";

export class Endpoint extends Component {
  color: string
  position: number

  constructor(parent: Component, position = 0.5) {
    super(parent)
    const s = this.parent as Singable
    s.endpoints.push(this)
    this.position = position
  }

  destroy() {
    super.destroy()
    const s = this.parent as Singable
    s.endpoints = s.endpoints.filter(e => e !== this)
  }

  render(): [HTMLElement, HTMLElement] {
    const newButton = createButtonNode(n => {
      n.style.color = this.color
      n.style.position = "absolute"
      n.style.top = `${this.position * 120}px`
      n.style.width = "20px"
      n.style.height = "20px"
    })
    return [newButton, newButton]
  }
}

export class OutEndpoint extends Endpoint {
  constructor(parent: Component, position = 0.5) {
    super(parent, position)
    this.color = "blue"
  }

  render(): [HTMLElement, HTMLElement] {
    const [newButton, _] = super.render()
    newButton.innerText = "o"
    newButton.style.left = "160px"
    newButton.onclick = e => {
      outConnectionFocus.set(this)
    }
    return [newButton, newButton]
  }
}


export class InEndpoint extends Endpoint {
  constructor(parent: Component, position = 0.5) {
    super(parent, position)
    this.color = "red"
  }

  render(): [HTMLElement, HTMLElement] {
    const [newButton, _] = super.render()
    newButton.innerText = "i"
    newButton.style.right = "160px"
    newButton.onclick = e => {
      if (outConnectionFocus.get() !== null) {
        connections.add(outConnectionFocus.get(), this)
      }
    }
    return [newButton, newButton]
  }

  findOut(): OutEndpoint {
    const matched = connections.get().filter(({ ip }) => ip === this)
    if (matched.length == 1) {
      return matched[0].op
    }
    else if (matched.length == 0) {
      return null
    }
    else {
      throw Error("Two or more output detected")
    }
  }
}