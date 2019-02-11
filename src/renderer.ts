import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import CommonEditor from "./components/editor/CommonEditor"
import { forEach, centerOf } from "./utils";
import { drawLine, drawClear } from "./utils/draw"
import Watchable from "./utils/Watchable"

export const editorSingable = new Watchable<Singable>(null)
export const outConnectionFocus = new Watchable<Singable>(null)

const root = new Component()
new SingablePanel(root)
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

class Connections extends Watchable<Array<[Singable, Singable]>> {
  add(s1: Singable, s2: Singable) {
    const duplicated = this.value.filter(([t1, t2]) => { return t1 === s1 && t2 === s2 }).length > 0
    if (duplicated) {
      return false
    }
    else {
      connections.set([...this.get(), [s1, s2]])
      return true
    }
  }
}

export const connections = new Connections([])

connections.watch(() => {
  connections.get().forEach(([s1, s2]) => {
    const [x1, y1] = centerOf(s1.target.querySelector("button.out-connection"))
    const [x2, y2] = centerOf(s2.target.querySelector("button.in-connection"))
    const line = drawLine(`connection-line-${s1.debugName}-${s2.debugName}`, x1, y1, x2, y2)
    line.style.stroke = "blue"
    line.style.strokeWidth = "3"
  })
})

root.update()
editorSingable.watch(commonEditor)
eval("window.rootComp = root")