import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import OutputSingable from "./components/OutputSingable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import { forEach, centerOf } from "./utils";
import Player from "./utils/Player"
import { drawLine, drawClear } from "./utils/draw"
import Watchable from "./utils/Watchable"
import Connection from "./components/Connection"
import { OutEndpoint, InEndpoint } from "./components/Endpoint";
import { createDivNode, createButtonNode } from "./utils/singable";
import MasterTab from "./components/MasterTab"

export const editorSingable = new Watchable<Singable>(null)
export const outConnectionFocus = new Watchable<OutEndpoint>(null)

export const rootComp = new Component()

new MasterTab(rootComp)

const layoutPanels = new class extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100vw"
      n.style.height = "calc(100vh - 24px)"
    })
    return [newDiv, newDiv]
  }
}(rootComp)

const layoutSingablePanel = new class extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "50%"
    })
    return [newDiv, newDiv]
  }
}(layoutPanels)

const layoutEditor = new class extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "50%"
    })
    return [newDiv, newDiv]
  }
}(layoutPanels)

export const singablePanel = new SingablePanel(layoutSingablePanel)
export const editorBase = new EditorBase(layoutEditor)
// const commonEditor = new CommonEditor(editorBase)

const outConnectionFocusActions = {
  clickSet: false,

  mousemove(e: Event) {
    const me = e as MouseEvent
    const [x1, y1] = [me.x, me.y]
    const [x2, y2] = centerOf(outConnectionFocus.get().element)
    const singablePanelX = singablePanel.element.getBoundingClientRect().left
    const singablePanelY = singablePanel.element.getBoundingClientRect().top
    const line = drawLine("out-conneciton-focus", x1 - singablePanelX, y1 - singablePanelY, x2 - singablePanelX, y2 - singablePanelY)
    line.style.stroke = "red"
    line.style.strokeWidth = "3"
  },

  mouseup(e: Event) {
    this.clickSet = true
  },

  click(e: Event) {
    if (this.clickSet) {
      outConnectionFocus.set(null)
      drawClear("out-conneciton-focus")
      this.clickSet = false
    }
  }
}

outConnectionFocus.watch(() => {
  if (outConnectionFocus.get() === null) {
    forEach(outConnectionFocusActions, (key, func) => {
      window.removeEventListener(key, func)
    })
  } else {
    forEach(outConnectionFocusActions, (key, func) => {
      window.addEventListener(key, func)
    })
  }
})

class Connections extends Watchable<Array<Connection>> {
  add(op: OutEndpoint, ip: InEndpoint) {
    const duplicated = this.value.filter(cn => { return cn.ip === ip }).length > 0
    if (duplicated) {
      return false
    }
    else {
      this.set(this.get().concat(new Connection(singablePanel, op, ip)))
      return true
    }
  }

  remove(op: OutEndpoint = null, ip: InEndpoint = null) {
    if (op !== null && ip !== null) {
      const removed = this.value.filter(cn => !(cn.op === op && cn.ip === ip))
      this.value.filter(cn => (cn.op === op && cn.ip === ip)).forEach(cn => cn.destroy())
      this.set(removed)
    }
    else if (ip !== null) {
      const removed = this.value.filter(cn => !(cn.ip === ip))
      this.value.filter(cn => cn.ip === ip).forEach(cn => cn.destroy())
      this.set(removed)
    }
    else if (op !== null) {
      const removed = this.value.filter(cn => !(cn.op === op))
      this.value.filter(cn => cn.op === op).forEach(cn => cn.destroy())
      this.set(removed)
    }
  }
}

export const connections = new Connections([])

connections.watch(() => {
  connections.get().forEach(cn => cn.update())
})

rootComp.update()
editorSingable.watch(editorBase)

require("./initialSetting")