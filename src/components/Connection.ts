import Component from "./Component"
import Singable from "./Singable"
import {createButtonNode} from "../utils/singable"
import {centerOf} from "../utils"
import { drawLine, drawClear } from "../utils/draw";
import { connections } from "../renderer";

export default class Connection extends Component {
  s1: Singable
  s2: Singable

  constructor(parent: Component, s1: Singable, s2: Singable) {
    super(parent)
    this.s1 = s1
    this.s2 = s2
  }

  render(): [HTMLElement, HTMLElement] {
    const [x1, y1] = centerOf(this.s1.target.querySelector("button.out-connection"))
    const [x2, y2] = centerOf(this.s2.target.querySelector("button.in-connection"))

    const lineId = `connection-line-${this.s1.debugName}-${this.s2.debugName}`
    const line = drawLine(lineId, x1, y1, x2, y2)
    line.style.stroke = "blue"
    line.style.strokeWidth = "3"

    const newDiv = createButtonNode(n => {
      n.innerText = "Delete"
      n.style.position = "absolute"
      n.style.left = "0"
      n.style.top = "0"
      const x = Math.round(((x1 + x2) / 2))
      const y = Math.round(((y1 + y2) / 2))
      n.style.transform = `translate3D(${x}px, ${y}px, 0)`
      n.onclick = e => {
        this.destroy()
        drawClear(lineId)
        connections.remove(this.s1, this.s2)
      }
    })

    return [newDiv, newDiv]
  }
}