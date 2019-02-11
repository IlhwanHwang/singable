import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import CommonEditor from "./components/editor/CommonEditor"
import { forEach, centerOf } from "./utils";
import { drawLine, drawClear } from "./utils/draw"
import Watchable from "./utils/Watchable"
import Connection from "./components/Connection"

export const editorSingable = new Watchable<Singable>(null)
export const outConnectionFocus = new Watchable<Singable>(null)

const root = new Component()
export const singablePanel = new SingablePanel(root)
export const editorBase = new EditorBase(root)
const commonEditor = new CommonEditor(editorBase)

const outConnectionFocusActions = {
  clickSet: false,

  mousemove(e: Event) {
    const me = e as MouseEvent
    const [x1, y1] = [me.x, me.y]
    const [x2, y2] = centerOf(outConnectionFocus.get().target.querySelector("button.out-connection"))
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
  add(s1: Singable, s2: Singable) {
    const duplicated = this.value.filter(cn => { return cn.s1 === s1 && cn.s2 === s2 }).length > 0
    if (duplicated) {
      return false
    }
    else {
      this.set(this.get().concat(new Connection(singablePanel, s1, s2)))
      return true
    }
  }

  remove(s1: Singable, s2: Singable) {
    const removed = this.value.filter(cn => { return !(cn.s1 === s1 && cn.s2 === s2) })
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