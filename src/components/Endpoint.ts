import Component from "./Component"
import { createButtonNode } from "../utils/singable";
import { outConnectionFocus, connections } from "../renderer"
import { nativeImage } from "electron";

export class Endpoint extends Component {
  color: string
  position: number

  constructor(parent: Component, position = 0.5) {
    super(parent)
    this.position = position
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
}