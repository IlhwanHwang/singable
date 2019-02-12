import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import CommonEditor from "./components/editor/CommonEditor"
import { forEach, centerOf } from "./utils";
import { drawLine, drawClear } from "./utils/draw"
import Watchable from "./utils/Watchable"
import Connection from "./components/Connection"
import { OutEndpoint, InEndpoint } from "./components/Endpoint";
import { createDivNode, createButtonNode } from "./utils/singable";

export const editorSingable = new Watchable<Singable>(null)
export const outConnectionFocus = new Watchable<OutEndpoint>(null)

const root = new Component()

const layoutTab = new class extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100vw"
      n.style.height = "24px"
    }, [
      createButtonNode(n => {
        n.innerText = "Play"
        n.onclick = e => {
          
        }
      })
    ])
    return [newDiv, newDiv]
  }
}(root)

const layoutPanels = new class extends Component {
  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      n.style.width = "100vw"
      n.style.height = "calc(100vh - 24px)"
    })
    return [newDiv, newDiv]
  }
}(root)

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
const commonEditor = new CommonEditor(editorBase)

const outConnectionFocusActions = {
  clickSet: false,

  mousemove(e: Event) {
    const me = e as MouseEvent
    const [x1, y1] = [me.x, me.y]
    const [x2, y2] = centerOf(outConnectionFocus.get().target)
    const line = drawLine("out-conneciton-focus", x1, y1, x2, y2)
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

  remove(op: OutEndpoint, ip: InEndpoint) {
    const removed = this.value.filter(cn => { return !(cn.op === op && cn.ip === ip) })
    this.set(removed)
  }
}

export const connections = new Connections([])

connections.watch(() => {
  connections.get().forEach(cn => cn.update())
})

root.update()
editorSingable.watch(commonEditor)
eval("window.rootComp = root")