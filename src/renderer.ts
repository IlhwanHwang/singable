// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// const div = document.createElement("div")
// div.setAttribute("style", "width: 100px; height: 80px; border: solid 1px black;")
// document.querySelector("body").appendChild(div)

import SingablePanel from "./components/SingablePanel"
import Singable from "./components/Singable"
import Component from "./components/Component"
import EditorBase from "./components/editor/EditorBase"
import CommonEditor from "./components/editor/CommonEditor"
import { forEach, centerOf } from "./utils";
import {drawLine, drawClear} from "./utils/draw"


export class Watchable<T> {
  watchers = Array<Component | (() => void)>()
  value: T

  constructor(initial: T) {
    this.value = initial
  }

  set(value: T) {
    this.value = value
    this.update()
  }

  update() {
    this.watchers.forEach(c => {
      if (c instanceof Component) {
        c.update()
      }
      else {
        c()
      }
    })
  }
  
  get() {
    return this.value
  }

  watch(c: Component | (() => void)) {
    this.watchers.push(c)
  }
}


export const editorSingable = new Watchable<Singable>(null)
export const outConnectionFocus = new Watchable<Singable>(null)
export const connections = new Watchable<Array<[Singable, Singable]>>([])

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
    console.log("up!!")
    this.clickSet = true
  },
  click(e: Event) {
    if (this.clickSet) {
      console.log("click!!")
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