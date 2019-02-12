import Component from "./Component"
import Singable from "./Singable"
import {createButtonNode} from "../utils/singable"
import {centerOf} from "../utils"
import { drawLine, drawClear } from "../utils/draw";
import { connections } from "../renderer";
import { OutEndpoint, InEndpoint } from "./Endpoint";

export default class Connection extends Component {
  op: OutEndpoint
  ip: InEndpoint
  lineId: string

  constructor(parent: Component, op: OutEndpoint, ip: InEndpoint) {
    super(parent)
    this.op = op
    this.ip = ip
    this.lineId = `connection-line-${this.op.debugName}-${this.ip.debugName}`
  }

  render(): [HTMLElement, HTMLElement] {
    const [x1, y1] = centerOf(this.op.target)
    const [x2, y2] = centerOf(this.ip.target)

    const line = drawLine(this.lineId, x1, y1, x2, y2)
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