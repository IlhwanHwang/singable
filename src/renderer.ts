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
import { forEach } from "./utils";


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

const root = new Component()
new SingablePanel(root)
export const editorBase = new EditorBase(root)
const commonEditor = new CommonEditor(editorBase)

const outConnectionFocusActions = {
  clickSet: false,
  mousemove(e: Event) {
    console.log("move!!")
    let svg = document.querySelector("#out-connection-focus-line")
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.id = "out-connection-focus-line"
    }
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }
    svg.setAttribute("style", "position: fixed; left: 0; top: 0; width: 100%; height: 100%")
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    const me = e as MouseEvent
    const rect = outConnectionFocus.get().target.querySelector("button.out-connection").getClientRects()
    line.setAttribute("x1", rect[0].left.toString())
    line.setAttribute("y1", rect[0].top.toString())
    line.setAttribute("x2", me.x.toString())
    line.setAttribute("y2", me.y.toString())
    line.style.stroke = "rgb(255,0,0)"
    line.style.strokeWidth = "2"
    svg.appendChild(line)
    document.body.appendChild(svg)
  },
  mouseup(e: Event) {
    console.log("up!!")
    this.clickSet = true
  },
  click(e: Event) {
    if (this.clickSet) {
      console.log("click!!")
      outConnectionFocus.set(null)
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

root.update()
// addListenerEditorSingable(commonEditor)
editorSingable.watch(commonEditor)
eval("window.rootComp = root")