import Component from "./Component"
import Singable from "./Singable"
import {createButtonNode} from "../utils/singable"
import {centerOf} from "../utils"
import { drawLine, drawClear } from "../utils/draw";
import { connections } from "../renderer";
import { OutEndpoint, InEndpoint } from "./Endpoint";
import SingablePanel from "./SingablePanel";

export default class Connection extends Component {
  op: OutEndpoint
  ip: InEndpoint
  lineId: string

  constructor(parent: Component, op: OutEndpoint, ip: InEndpoint) {
    super(parent)
    this.op = op
    this.ip = ip
    this.lineId = `connection-line-${this.op.systemName}-${this.ip.systemName}`
  }

  render(): [HTMLElement, HTMLElement] {
    const parent = (this.parent as SingablePanel)
    const parentX = parent.target.getBoundingClientRect().left
    const parentY = parent.target.getBoundingClientRect().top

    const [x1, y1] = centerOf(this.op.target)
    const [x2, y2] = centerOf(this.ip.target)
    const line = drawLine(this.lineId, x1 - parentX, y1 - parentY, x2 - parentX, y2 - parentY)
    line.style.stroke = "blue"
    line.style.strokeWidth = "3"

    const newDiv = createButtonNode(n => {
      n.innerText = "Delete"
      n.style.position = "absolute"
      const localX = ((x1 + x2) / 2 - parent.__translateX - parentX) / parent.zoom
      const localY = ((y1 + y2) / 2 - parent.__translateY - parentY) / parent.zoom
      n.style.left = `${localX}px`
      n.style.top = `${localY}px`
      // n.style.transform = `translate(${x}px, ${y}px)`
      n.onclick = e => {
        connections.remove(this.op, this.ip)
      }
    })

    return [newDiv, newDiv]
  }

  destroy() {
    drawClear(this.lineId)
    super.destroy()
  }
}