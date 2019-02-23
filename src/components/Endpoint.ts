import Component, { Container } from "./Component"
import Singable from "./Singable"
import { createButtonNode } from "../utils/singable";
import { outConnectionFocus, connections } from "../renderer"
import { nativeImage } from "electron";

export class Endpoint extends Component {
  color: string
  position: number
  uniqueName: string

  constructor(parent: Component, parentTarget: string = "default", uniqueName: string, position = 0.5) {
    super(parent)
    const s = this.parent as Singable
    s.endpoints.push(this)
    this.position = position
    this.uniqueName = uniqueName
  }

  destroy() {
    super.destroy()
    const s = this.parent as Singable
    s.endpoints = s.endpoints.filter(e => e !== this)
  }

  render(): [HTMLElement, Container] {
    const newButton = createButtonNode(n => {
      n.style.color = this.color
      n.style.position = "absolute"
      n.style.top = `${this.position * 120}px`
      n.style.width = "20px"
      n.style.height = "20px"
    })
    return [newButton,  { default: newButton }]
  }
}

export class OutEndpoint extends Endpoint {
  constructor(parent: Component, parentTarget: string = "default", uniqueName = "out-endpoint", position = 0.5) {
    super(parent, parentTarget, uniqueName, position)
    this.color = "blue"
  }

  render(): [HTMLElement, Container] {
    const [newButton, _] = super.render()
    newButton.innerText = "o"
    newButton.style.left = "160px"
    newButton.onclick = e => {
      outConnectionFocus.set(this)
    }
    return [newButton, { default: newButton }]
  }
}


export class InEndpoint extends Endpoint {
  constructor(parent: Component, parentTarget: string = "default", uniqueName = "in-endpoint", position = 0.5) {
    super(parent, parentTarget, uniqueName, position)
    this.color = "red"
  }

  render(): [HTMLElement, Container] {
    const [newButton, _] = super.render()
    newButton.innerText = "i"
    newButton.style.right = "160px"
    newButton.onclick = e => {
      if (outConnectionFocus.get() !== null) {
        connections.add(outConnectionFocus.get(), this)
      }
    }
    return [newButton, { default: newButton }]
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